import { embed } from 'ai';
import { db } from '@/lib/db';
import { knowledgeBase, knowledgeChunk } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
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

    // Generate embedding for the search query
    const { embedding: queryEmbedding } = await embed({
      model: embeddingModel,
      value: query,
    });

    // Search through knowledge base entries
    const knowledgeResults = await db
      .select({
        id: knowledgeBase.id,
        title: knowledgeBase.title,
        content: knowledgeBase.content,
        personaId: knowledgeBase.personaId,
        contentType: knowledgeBase.contentType,
        metadata: knowledgeBase.metadata,
        // Calculate cosine similarity using PostgreSQL vector operations
        similarity: sql<number>`1 - (${knowledgeBase.embedding} <=> ${queryEmbedding}::vector)`,
      })
      .from(knowledgeBase)
      .where(eq(knowledgeBase.personaId, dbPersonaId))
      .having(sql`1 - (${knowledgeBase.embedding} <=> ${queryEmbedding}::vector) > ${threshold}`)
      .orderBy(sql`1 - (${knowledgeBase.embedding} <=> ${queryEmbedding}::vector) DESC`)
      .limit(limit);

    // Search through knowledge chunks for more granular results
    const chunkResults = await db
      .select({
        id: knowledgeChunk.id,
        knowledgeBaseId: knowledgeChunk.knowledgeBaseId,
        content: knowledgeChunk.content,
        chunkIndex: knowledgeChunk.chunkIndex,
        metadata: knowledgeChunk.metadata,
        // Join with knowledge base for persona filtering and titles
        personaId: knowledgeBase.personaId,
        title: knowledgeBase.title,
        contentType: knowledgeBase.contentType,
        // Calculate cosine similarity
        similarity: sql<number>`1 - (${knowledgeChunk.embedding} <=> ${queryEmbedding}::vector)`,
      })
      .from(knowledgeChunk)
      .leftJoin(knowledgeBase, eq(knowledgeChunk.knowledgeBaseId, knowledgeBase.id))
      .where(eq(knowledgeBase.personaId, dbPersonaId))
      .having(sql`1 - (${knowledgeChunk.embedding} <=> ${queryEmbedding}::vector) > ${threshold}`)
      .orderBy(sql`1 - (${knowledgeChunk.embedding} <=> ${queryEmbedding}::vector) DESC`)
      .limit(limit * 2); // Get more chunks since they're more granular

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
      title: `${result.title} (Chunk ${result.chunkIndex + 1})`,
      content: result.content,
      similarity: result.similarity,
      metadata: result.metadata,
      source: 'chunk' as const,
      personaId: result.personaId || '',
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