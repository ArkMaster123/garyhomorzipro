import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { knowledgeBase, knowledgeChunk } from '@/lib/db/schema';
import { embed } from 'ai';
import { gateway, isGatewayAvailable } from '@/lib/ai/gateway';
import { eq, and, desc } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';

// POST /api/admin/knowledge-base/search - Vector similarity search
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    await requireAdmin();
    
    const body = await request.json();
    const { 
      query, 
      personaId, 
      limit = 5, 
      threshold = 0.7,
      searchType = 'chunks', // 'chunks' or 'documents'
      embeddingModel = 'openai:text-embedding-3-small',
      dimensions,
      encodingFormat = 'float'
    } = body;

    if (!query || !personaId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: query, personaId' },
        { status: 400 }
      );
    }

    // Check if gateway is available
    if (!isGatewayAvailable() || !gateway) {
      return NextResponse.json(
        { error: 'AI Gateway not configured. Cannot perform knowledge base search.' },
        { status: 503 }
      );
    }

    // Convert model string to AI SDK model object using gateway
    // Non-null assertion is safe here because we checked gateway above
    const getEmbeddingModel = (modelString: string) => {
      switch (modelString) {
        case 'openai:text-embedding-3-small':
          return gateway!.embeddingModel('openai/text-embedding-3-small');
        case 'openai:text-embedding-3-large':
          return gateway!.embeddingModel('openai/text-embedding-3-large');
        case 'openai:text-embedding-ada-002':
          return gateway!.embeddingModel('openai/text-embedding-ada-002');
        default:
          return gateway!.embeddingModel('openai/text-embedding-3-small'); // fallback
      }
    };

    const embeddingModelObj = getEmbeddingModel(embeddingModel);

    // Generate embedding for the search query
    const { embedding: queryEmbedding } = await embed({
      model: embeddingModelObj,
      value: query,
    });

    let results = [];

    if (searchType === 'chunks') {
      // Search through individual chunks
      const chunks = await db
        .select()
        .from(knowledgeChunk)
        .innerJoin(knowledgeBase, eq(knowledgeChunk.knowledgeBaseId, knowledgeBase.id))
        .where(eq(knowledgeBase.personaId, personaId));

      // Calculate cosine similarity for each chunk
      const chunkResults = chunks.map(chunk => {
        if (!chunk.KnowledgeChunk.embedding) {
          console.warn('Chunk missing embedding:', chunk.KnowledgeChunk.id);
          return null;
        }
        const similarity = calculateCosineSimilarity(queryEmbedding, chunk.KnowledgeChunk.embedding);
        return {
          ...chunk.KnowledgeChunk,
          similarity,
          sourceTitle: chunk.KnowledgeBase.title,
        };
      }).filter((result): result is NonNullable<typeof result> => result !== null); // Remove null entries

      // Filter by threshold and sort by similarity
      results = chunkResults
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

    } else {
      // Search through documents
      const documents = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.personaId, personaId));

      // Calculate cosine similarity for each document
      const documentResults = documents.map(doc => {
        if (!doc.embedding) {
          console.warn('Document missing embedding:', doc.id);
          return null;
        }
        const similarity = calculateCosineSimilarity(queryEmbedding, doc.embedding);
        return {
          ...doc,
          similarity,
        };
      }).filter((result): result is NonNullable<typeof result> => result !== null); // Remove null entries

      // Filter by threshold and sort by similarity
      results = documentResults
        .filter(result => result.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        results,
        query,
        searchType,
        embeddingModel,
        totalResults: results.length,
        threshold,
      }
    });

  } catch (error) {
    console.error('Error performing vector search:', error);
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

// Calculate cosine similarity between two vectors
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}