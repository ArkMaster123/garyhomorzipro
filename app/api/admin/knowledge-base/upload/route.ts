import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { knowledgeBase, knowledgeChunk, user } from '@/lib/db/schema';
import { embed, embedMany } from 'ai';
import { gateway } from '@/lib/ai/gateway';
import { put } from '@vercel/blob';
import { requireAdmin } from '@/lib/auth/admin';

// Interface for chunk metadata with page tracking
interface ChunkMetadata {
  text: string;
  pageNumber?: number;
  startChar: number;
  endChar: number;
  chunkIndex: number;
}

// Extract page numbers from PDF text (looks for patterns like "Page 1", "1", etc.)
function extractPageNumbers(text: string): { text: string; pageNumbers: number[] } {
  const pageNumbers: number[] = [];
  let processedText = text;
  
  // Common page number patterns
  const pagePatterns = [
    /Page\s+(\d+)/gi,
    /^\s*(\d+)\s*$/gm, // Standalone numbers that might be page numbers
    /\[(\d+)\]/g, // Numbers in brackets
    /\((\d+)\)/g, // Numbers in parentheses
  ];
  
  // For now, we'll use a simple approach - detect page breaks
  // In a real implementation, you'd use PDF parsing libraries to get actual page info
  const lines = text.split('\n');
  let currentPage = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Simple heuristic: if line contains only a number and is short, it might be a page number
    if (/^\d+$/.test(line) && line.length <= 3) {
      const pageNum = parseInt(line);
      if (pageNum > 0 && pageNum <= 1000) { // Reasonable page number range
        pageNumbers.push(pageNum);
        currentPage = pageNum;
      }
    }
  }
  
  return { text: processedText, pageNumbers };
}

// Chunk text into smaller pieces for better embedding with page tracking
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): ChunkMetadata[] {
  const chunks: ChunkMetadata[] = [];
  let start = 0;
  const safeOverlap = Math.min(overlap, chunkSize - 1);
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunkText = text.slice(start, end);
    
    chunks.push({
      text: chunkText.trim(),
      startChar: start,
      endChar: end,
      chunkIndex: chunkIndex++,
    });

    // Move start position with overlap, ensuring we make progress
    const nextStart = end - safeOverlap;
    if (nextStart <= start) {
      // Prevent infinite loop by moving at least one character forward
      start = start + 1;
    } else {
      start = nextStart;
    }
    
    if (start >= text.length) break;
  }

  return chunks.filter(chunk => chunk.text.length > 0);
}

// Chunk text by sentences with page tracking
function chunkTextBySentences(text: string, maxChunkSize: number, maxChunks: number): ChunkMetadata[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: ChunkMetadata[] = [];
  let currentChunk = '';
  let chunkStart = 0;
  let chunkIndex = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        startChar: chunkStart,
        endChar: chunkStart + currentChunk.length,
        chunkIndex: chunkIndex++,
      });
      currentChunk = trimmedSentence;
      chunkStart = text.indexOf(trimmedSentence, chunkStart);
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }
    
    if (chunks.length >= maxChunks) break;
  }

  if (currentChunk.trim() && chunks.length < maxChunks) {
    chunks.push({
      text: currentChunk.trim(),
      startChar: chunkStart,
      endChar: chunkStart + currentChunk.length,
      chunkIndex: chunkIndex++,
    });
  }

  return chunks;
}

// Chunk text by paragraphs with page tracking
function chunkTextByParagraphs(text: string, maxChunks: number): ChunkMetadata[] {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const chunks: ChunkMetadata[] = [];
  
  for (let i = 0; i < Math.min(paragraphs.length, maxChunks); i++) {
    const paragraph = paragraphs[i];
    const startChar = text.indexOf(paragraph);
    const endChar = startChar + paragraph.length;
    
    chunks.push({
      text: paragraph.trim(),
      startChar,
      endChar,
      chunkIndex: i,
    });
  }
  
  return chunks;
}

// Semantic chunking with page tracking
function chunkTextSemantic(text: string, maxChunks: number): ChunkMetadata[] {
  // For now, use paragraph-based chunking as a proxy for semantic chunking
  // In a real implementation, you'd use NLP libraries to detect semantic boundaries
  return chunkTextByParagraphs(text, maxChunks);
}

// Estimate tokens (rough approximation: 1 token ≈ 4 characters)
function estimateTokens(content: string, contentType: string): number {
  const baseTokens = Math.ceil(content.length / 4);
  
  switch (contentType) {
    case 'pdf':
      return Math.ceil(baseTokens * 1.2); // PDFs often have formatting overhead
    case 'markdown':
      return Math.ceil(baseTokens * 1.1); // Markdown has some formatting
    case 'text':
    default:
      return baseTokens;
  }
}

// Calculate estimated costs for different models
function calculateCosts(estimatedTokens: number) {
  const models = [
    { id: 'openai:text-embedding-3-small', name: 'OpenAI Small', costPerMillion: 0.02 },
    { id: 'openai:text-embedding-3-large', name: 'OpenAI Large', costPerMillion: 0.13 },
    { id: 'openai:text-embedding-ada-002', name: 'OpenAI Ada-002', costPerMillion: 0.10 },
    { id: 'google:text-embedding-004', name: 'Google Text', costPerMillion: 0.03 },
  ];

  return models.map(model => {
    const costPerToken = model.costPerMillion / 1000000;
    const estimatedCost = estimatedTokens * costPerToken;
    
    return {
      modelId: model.id,
      modelName: model.name,
      costPerToken,
      estimatedTokens,
      estimatedCost,
      processingTime: estimatedTokens < 10000 ? '~30 seconds' : 
                     estimatedTokens < 50000 ? '~2 minutes' : 
                     estimatedTokens < 100000 ? '~5 minutes' : '~10+ minutes'
    };
  });
}

// POST /api/admin/knowledge-base/upload - Handle file uploads and processing
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    await requireAdmin();

    // // Check if user is admin
    // const adminCheck = await db
    //   .select()
    //   .from(adminUser)
    //   .where(eq(adminUser.userId, session.user.id))
    //   .limit(1);

    // if (adminCheck.length === 0) {
    //   return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    // }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const personaId = formData.get('personaId') as string;
    const title = formData.get('title') as string;
    const embeddingModel = formData.get('embeddingModel') as string || 'openai:text-embedding-3-small';
    const textContent = formData.get('textContent') as string; // For direct text input
    const contentType = formData.get('contentType') as string; // 'pdf', 'text', 'markdown'
    const estimateOnly = formData.get('estimateOnly') === 'true'; // For cost estimation
    
    // Advanced settings
    const chunkingStrategy = formData.get('chunkingStrategy') as string || 'fixed-size';
    const chunkSize = parseInt(formData.get('chunkSize') as string) || 1000;
    const overlap = parseInt(formData.get('overlap') as string) || 200;
    const maxChunks = parseInt(formData.get('maxChunks') as string) || 50;
    const embeddingDimensions = formData.get('embeddingDimensions') as string;
    const encodingFormat = formData.get('encodingFormat') as string || 'float';
    const normalizeEmbeddings = formData.get('normalizeEmbeddings') === 'true';

    if (!personaId || !title) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: personaId, title' },
        { status: 400 }
      );
    }

    let content = '';
    let fileUrl = '';

    // Process file upload
    if (file) {
      if (file.type === 'application/pdf') {
        // Process PDF - dynamically import pdf-parse only when needed
        const PDFParse = (await import('pdf-parse')).default;
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await PDFParse(buffer);
        content = pdfData.text;
        
        // Upload PDF to Vercel Blob
        const blob = await put(file.name, file, {
          access: 'public',
        });
        fileUrl = blob.url;
      } else {
        // Handle text files
        content = await file.text();
      }
    } else if (textContent) {
      content = textContent;
    } else {
      return NextResponse.json(
        { success: false, error: 'Either file or textContent is required' },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { success: false, error: 'No content extracted from file' },
        { status: 400 }
      );
    }

    // Create a test user if one doesn't exist
    let testUserId = '00000000-0000-0000-0000-000000000000';
    try {
      const existingUsers = await db.select().from(user).limit(1);
      if (existingUsers.length > 0) {
        testUserId = existingUsers[0].id;
      } else {
        // Create a test user
        const [newUser] = await db
          .insert(user)
          .values({
            email: 'test@example.com',
            persona: 'default',
          })
          .returning();
        testUserId = newUser.id;
      }
    } catch (error) {
      console.error('Error creating/finding test user:', error);
      // Use a fallback UUID
      testUserId = '00000000-0000-0000-0000-000000000000';
    }

    // Calculate cost estimate
    const estimatedTokens = estimateTokens(content, contentType || 'text');
    const costEstimates = calculateCosts(estimatedTokens);

    if (estimateOnly) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          estimatedTokens,
          costEstimates,
          contentLength: content.length,
          chunkCount: chunkText(content).length
        } 
      });
    }

    // Extract page numbers if it's a PDF
    const { pageNumbers } = extractPageNumbers(content);
    
    // Chunk the content based on strategy
    let chunkMetadata: ChunkMetadata[] = [];
    
    switch (chunkingStrategy) {
      case 'semantic':
        chunkMetadata = chunkTextSemantic(content, maxChunks);
        break;
      case 'sentence':
        chunkMetadata = chunkTextBySentences(content, chunkSize, maxChunks);
        break;
      case 'paragraph':
        chunkMetadata = chunkTextByParagraphs(content, maxChunks);
        break;
      case 'fixed-size':
      default:
        chunkMetadata = chunkText(content, chunkSize, overlap);
        break;
    }
    
    // Limit chunks to maxChunks
    chunkMetadata = chunkMetadata.slice(0, maxChunks);
    
    // Extract just the text for embedding
    const chunks = chunkMetadata.map(chunk => chunk.text);
    
    // Convert model string to AI SDK model object using gateway
    const getEmbeddingModel = (modelString: string) => {
      switch (modelString) {
        case 'openai:text-embedding-3-small':
          return gateway.textEmbeddingModel('openai/text-embedding-3-small');
        case 'openai:text-embedding-3-large':
          return gateway.textEmbeddingModel('openai/text-embedding-3-large');
        case 'openai:text-embedding-ada-002':
          return gateway.textEmbeddingModel('openai/text-embedding-ada-002');
        default:
          return gateway.textEmbeddingModel('openai/text-embedding-3-small'); // fallback
      }
    };

    const embeddingModelObj = getEmbeddingModel(embeddingModel);

    // Generate embedding for the main content
    const { embedding: mainEmbedding } = await embed({
      model: embeddingModelObj,
      value: content,
    });

    // Generate embeddings for all chunks
    const { embeddings: chunkEmbeddings } = await embedMany({
      model: embeddingModelObj,
      values: chunks,
      maxParallelCalls: 3, // Optimize performance


    });

    // Start a transaction to create the knowledge base entry and chunks
    const [knowledgeBaseEntry] = await db
      .insert(knowledgeBase)
      .values({
        personaId,
        title,
        content,
        contentType: (contentType || (file?.type === 'application/pdf' ? 'pdf' : 'text')) as 'pdf' | 'text' | 'markdown',
        fileUrl,
        embedding: mainEmbedding,
        metadata: {
          embeddingModel,
          originalLength: content.length,
          chunkCount: chunks.length,
          estimatedTokens,
          actualCost: costEstimates.find(c => c.modelId === embeddingModel)?.estimatedCost || 0,
          chunkingStrategy,
          chunkSize,
          overlap,
          maxChunks,
          embeddingDimensions: embeddingDimensions ? parseInt(embeddingDimensions) : undefined,
          encodingFormat,
          normalizeEmbeddings,
        },
        createdBy: testUserId, // Use the test user ID
      })
      .returning();

    // Create chunks with page number metadata
    const chunkInserts = chunkMetadata.map((chunkMeta, index) => {
      // Try to determine page number based on character position
      let pageNumber: number | undefined;
      if (pageNumbers.length > 0) {
        // Simple heuristic: find the closest page number based on character position
        const charPosition = chunkMeta.startChar;
        const totalLength = content.length;
        const relativePosition = charPosition / totalLength;
        const estimatedPage = Math.ceil(relativePosition * pageNumbers.length);
        pageNumber = pageNumbers[Math.min(estimatedPage - 1, pageNumbers.length - 1)];
      }
      
      return {
        knowledgeBaseId: knowledgeBaseEntry.id,
        chunkIndex: chunkMeta.chunkIndex,
        content: chunkMeta.text,
        embedding: chunkEmbeddings[index],
        metadata: {
          startPosition: chunkMeta.startChar,
          endPosition: chunkMeta.endChar,
          length: chunkMeta.text.length,
          pageNumber,
          chunkIndex: chunkMeta.chunkIndex,
        }
      };
    });

    await db.insert(knowledgeChunk).values(chunkInserts);

    return NextResponse.json({ 
      success: true, 
      data: {
        knowledgeBase: knowledgeBaseEntry,
        chunksCreated: chunks.length,
        estimatedTokens,
        actualCost: costEstimates.find(c => c.modelId === embeddingModel)?.estimatedCost || 0
      }
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}