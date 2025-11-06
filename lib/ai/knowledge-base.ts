import { embed } from 'ai';
import { db } from '@/lib/db';
import { knowledgeBase, knowledgeChunk } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { gateway, isGatewayAvailable } from './gateway';
import type { PersonaType } from './personas';

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  content: string;
  similarity: number;
  metadata: any;
  source: 'knowledge_base' | 'chunk';
  personaId: string;
}

export interface KnowledgeContext {
  results: KnowledgeSearchResult[];
  totalResults: number;
  searchQuery: string;
  personaId: string;
}

/**
 * Search for relevant knowledge base entries for a given persona
 */
export async function searchKnowledgeBase(
  query: string,
  personaId: PersonaType,
  options: {
    limit?: number;
    threshold?: number;
    embeddingModel?: string;
  } = {}
): Promise<KnowledgeContext> {
  const {
    limit = 5,
    threshold = 0.7,
    embeddingModel = 'openai:text-embedding-3-small'
  } = options;

  try {
    // Convert persona format to match database
    const dbPersonaId = personaId === 'gary-hormozi' ? 'gary_hormozi' : 
                       personaId === 'rory-sutherland' ? 'rory_sutherland' : 
                       null;

    if (!dbPersonaId) {
      return {
        results: [],
        totalResults: 0,
        searchQuery: query,
        personaId,
      };
    }

    // Check if gateway is available
    if (!isGatewayAvailable() || !gateway) {
      throw new Error('AI Gateway not configured. Cannot perform knowledge base search.');
    }

    // Generate embedding for the search query using gateway
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
    const { embedding: queryEmbedding } = await embed({
      model: embeddingModelObj,
      value: query,
    });

    // Search through knowledge base entries - use same approach as admin API
    const documents = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.personaId, dbPersonaId));

    console.log('🔍 searchKnowledgeBase debug:', {
      dbPersonaId,
      documentsFound: documents.length,
      queryEmbeddingLength: queryEmbedding.length,
      threshold,
      embeddingModel
    });

    // Calculate cosine similarity for each document (same as admin API)
    const knowledgeResults = documents.map(doc => {
      if (!doc.embedding) {
        console.warn('Document missing embedding:', doc.id);
        return null;
      }
      const similarity = calculateCosineSimilarity(queryEmbedding, doc.embedding);
      console.log(`📊 Document "${doc.title}" similarity: ${similarity}`);
      return {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        personaId: doc.personaId,
        contentType: doc.contentType,
        metadata: doc.metadata,
        similarity,
      };
    }).filter((result): result is NonNullable<typeof result> => result !== null) // Remove null entries
      .filter(result => {
        const passes = result.similarity >= threshold;
        console.log(`✅ Document "${result.title}" passes threshold (${result.similarity} >= ${threshold}): ${passes}`);
        return passes;
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    console.log('📋 Final knowledgeResults:', knowledgeResults.length);

    // Search through knowledge chunks for more granular results
    const chunks = await db
      .select()
      .from(knowledgeChunk)
      .leftJoin(knowledgeBase, eq(knowledgeChunk.knowledgeBaseId, knowledgeBase.id))
      .where(eq(knowledgeBase.personaId, dbPersonaId));

    const chunkResults = chunks.map(chunk => {
      if (!chunk.KnowledgeChunk?.embedding) {
        console.warn('Chunk missing embedding:', chunk.KnowledgeChunk?.id);
        return null;
      }
      const similarity = calculateCosineSimilarity(queryEmbedding, chunk.KnowledgeChunk.embedding);
      return {
        id: chunk.KnowledgeChunk.id,
        title: `${chunk.KnowledgeBase?.title} (Chunk ${chunk.KnowledgeChunk.chunkIndex + 1})`,
        content: chunk.KnowledgeChunk.content,
        similarity,
        metadata: chunk.KnowledgeChunk.metadata,
        source: 'chunk' as const,
        personaId: chunk.KnowledgeBase?.personaId || '',
      };
    }).filter((result): result is NonNullable<typeof result> => result !== null) // Remove null entries
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit * 2); // Get more chunks since they're more granular

    // Combine and format results
    const formattedKnowledgeResults: KnowledgeSearchResult[] = knowledgeResults.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
      source: 'knowledge_base' as const,
      personaId: result.personaId,
    }));

    const formattedChunkResults: KnowledgeSearchResult[] = chunkResults.map(result => ({
      id: result.id,
      title: result.title,
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
      source: result.source,
      personaId: result.personaId,
    }));

    // Combine and sort all results by similarity
    const allResults = [...formattedKnowledgeResults, ...formattedChunkResults]
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return {
      results: allResults,
      totalResults: allResults.length,
      searchQuery: query,
      personaId,
    };
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return {
      results: [],
      totalResults: 0,
      searchQuery: query,
      personaId,
    };
  }
}

/**
 * Generate enhanced persona prompt with knowledge base context
 */
export function enhancePersonaPromptWithKnowledge(
  originalPrompt: string,
  knowledgeContext: KnowledgeContext
): string {
  if (knowledgeContext.results.length === 0) {
    return originalPrompt;
  }

  const knowledgeSection = knowledgeContext.results
    .map((result, index) => {
      return `
**Source ${index + 1}: ${result.title}** (Similarity: ${(result.similarity * 100).toFixed(1)}%)
${result.content.substring(0, 500)}${result.content.length > 500 ? '...' : ''}
`;
    })
    .join('\n');

  return `${originalPrompt}

RELEVANT KNOWLEDGE CONTEXT:
The following information is from my knowledge base and is highly relevant to the user's query. Use this information to provide more accurate, detailed, and personalized responses. Always draw from this knowledge when it's relevant, but integrate it naturally into your response without explicitly mentioning "according to my knowledge base."

${knowledgeSection}

Remember to:
- Use this knowledge to enhance your responses with specific details and insights
- Maintain your persona's voice and style while incorporating this information  
- Don't explicitly reference that this came from a "knowledge base" - present it as your natural knowledge
- Prioritize the most relevant information based on similarity scores`;
}

/**
 * Extract search terms from user message for knowledge base lookup
 */
export function extractSearchTermsFromMessage(message: string): string {
  // Remove common stop words and short words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'how', 'what', 'when', 'where', 'why', 'who', 'which', 'can', 'could', 'would', 'should',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did'
  ]);

  const words = message
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Take up to the first 10 meaningful words to create a focused search query
  return words.slice(0, 10).join(' ');
}

/**
 * Calculate cosine similarity between two vectors (same as admin API)
 */
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