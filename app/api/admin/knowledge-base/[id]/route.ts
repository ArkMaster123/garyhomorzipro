import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { knowledgeBase, knowledgeChunk } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';
import { embed } from 'ai';
import { gateway, isGatewayAvailable } from '@/lib/ai/gateway';

// GET /api/admin/knowledge-base/[id] - Get specific knowledge base entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    await requireAdmin();
    
    const { id } = await params;
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    // // Check if user is admin
    // const adminCheck = await db
    //   .select()
    //   .from(adminUser)
    //   .where(eq(adminUser.userId, session.user.id))
    //   .limit(1);

    // if (adminCheck.length === 0) {
    //   return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    // }

    const entry = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.id, id))
      .limit(1);

    if (entry.length === 0) {
      return NextResponse.json({ success: false, error: 'Knowledge base entry not found' }, { status: 404 });
    }

    // Get associated chunks
    const chunks = await db
      .select()
      .from(knowledgeChunk)
      .where(eq(knowledgeChunk.knowledgeBaseId, id))
      .orderBy(knowledgeChunk.chunkIndex);

    return NextResponse.json({ 
      success: true, 
      data: { 
        ...entry[0], 
        chunks: chunks 
      } 
    });
  } catch (error) {
    console.error('Error fetching knowledge base entry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/knowledge-base/[id] - Update knowledge base entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Temporarily remove admin check for development
    // const session = await auth();
    // if (!session?.user?.id) {
    //   return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    // }

    // // Check if user is admin
    // const adminCheck = await db
    //   .select()
    //   .from(adminUser)
    //   .where(eq(adminUser.userId, session.user.id))
    //   .limit(1);

    // if (adminCheck.length === 0) {
    //   return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    // }

    const body = await request.json();
    const { title, content, embeddingModel = 'openai:text-embedding-3-small' } = body;

    // Check if entry exists
    const existingEntry = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.id, id))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json({ success: false, error: 'Knowledge base entry not found' }, { status: 404 });
    }

    // Generate new embedding if content changed
    let updateData: any = { updatedAt: new Date() };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;

      // Check if gateway is available before regenerating embedding
      if (!isGatewayAvailable() || !gateway) {
        return NextResponse.json(
          { success: false, error: 'AI Gateway not configured. Cannot update content with embedding.' },
          { status: 503 }
        );
      }

      // Regenerate embedding using gateway
      const { embedding } = await embed({
        model: gateway.textEmbeddingModel(embeddingModel),
        value: content,
      });
      updateData.embedding = embedding;
      updateData.metadata = { 
        ...(existingEntry[0].metadata || {}),
        embeddingModel, 
        originalLength: content.length,
        lastUpdated: new Date().toISOString()
      };
    }

    const [updatedEntry] = await db
      .update(knowledgeBase)
      .set(updateData)
      .where(eq(knowledgeBase.id, id))
      .returning();

    return NextResponse.json({ success: true, data: updatedEntry });
  } catch (error) {
    console.error('Error updating knowledge base entry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/knowledge-base/[id] - Delete knowledge base entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin permissions
    await requireAdmin();
    
    const { id } = await params;

    // // Check if user is admin
    // const adminCheck = await db
    //   .select()
    //   .from(adminUser)
    //   .where(eq(adminUser.userId, session.user.id))
    //   .limit(1);

    // if (adminCheck.length === 0) {
    //   return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    // }

    // Delete the entry (chunks will be cascade deleted)
    const deletedEntry = await db
      .delete(knowledgeBase)
      .where(eq(knowledgeBase.id, id))
      .returning();

    if (deletedEntry.length === 0) {
      return NextResponse.json({ success: false, error: 'Knowledge base entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Knowledge base entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting knowledge base entry:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}