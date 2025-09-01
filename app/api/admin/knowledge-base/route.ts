import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { knowledgeBase } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { embed, embedMany } from 'ai';
import { gateway } from '@/lib/ai/gateway';

// POST /api/admin/knowledge-base - Create new knowledge base entry
export async function POST(request: NextRequest) {
  try {
    // Temporarily remove admin check for development

    const body = await request.json();
    const { personaId, title, content, contentType, fileUrl, embeddingModel = 'openai:text-embedding-3-small' } = body;

    if (!personaId || !title || !content || !contentType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: personaId, title, content, contentType' },
        { status: 400 }
      );
    }

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
    const { embedding } = await embed({
      model: embeddingModelObj,
      value: content,
    });

    // Create knowledge base entry
    const [newEntry] = await db
      .insert(knowledgeBase)
      .values({
        personaId,
        title,
        content,
        contentType,
        fileUrl,
        embedding,
        metadata: { embeddingModel, originalLength: content.length },
        createdBy: '00000000-0000-0000-0000-000000000000', // Temporary user ID until auth is set up
      })
      .returning();

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error('Error creating knowledge base entry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/knowledge-base - List knowledge base entries
export async function GET(request: NextRequest) {
  try {
    // Temporarily remove admin check for development

    const { searchParams } = new URL(request.url);
    const personaId = searchParams.get('personaId');

    let query = db.select().from(knowledgeBase);
    
    if (personaId) {
      query = query.where(eq(knowledgeBase.personaId, personaId));
    }

    const entries = await query.orderBy(knowledgeBase.createdAt);

    return NextResponse.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error fetching knowledge base entries:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}