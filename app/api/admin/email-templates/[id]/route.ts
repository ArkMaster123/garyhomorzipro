import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { emailTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/admin/email-templates/[id] - Get specific email template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const template = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .limit(1);

    if (!template.length) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: template[0],
    });
  } catch (error) {
    console.error('Error fetching email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email template' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/email-templates/[id] - Update specific email template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, subject, htmlContent, dayNumber, isActive } = body;

    const updatedTemplate = await db
      .update(emailTemplates)
      .set({
        name,
        type,
        subject,
        htmlContent,
        dayNumber,
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(emailTemplates.id, id))
      .returning();

    if (!updatedTemplate.length) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedTemplate[0],
      message: 'Email template updated successfully',
    });
  } catch (error) {
    console.error('Error updating email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/email-templates/[id] - Delete specific email template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deletedTemplate = await db
      .delete(emailTemplates)
      .where(eq(emailTemplates.id, id))
      .returning();

    if (!deletedTemplate.length) {
      return NextResponse.json(
        { success: false, error: 'Email template not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting email template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}
