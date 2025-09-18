import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { emailTemplates } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '@/lib/auth/admin';

// GET /api/admin/email-templates - Get all email templates
export async function GET() {
  try {
    // Check admin permissions
    await requireAdmin();
    
    const templates = await db.select().from(emailTemplates).orderBy(emailTemplates.createdAt);
    
    return NextResponse.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

// POST /api/admin/email-templates - Create or update email template
export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    await requireAdmin();
    
    const body = await request.json();
    const { id, name, type, subject, htmlContent, dayNumber, isActive } = body;

    if (id) {
      // Update existing template
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

      return NextResponse.json({
        success: true,
        data: updatedTemplate[0],
        message: 'Email template updated successfully',
      });
    } else {
      // Create new template
      const newTemplate = await db
        .insert(emailTemplates)
        .values({
          name,
          type,
          subject,
          htmlContent,
          dayNumber,
          isActive,
        })
        .returning();

      return NextResponse.json({
        success: true,
        data: newTemplate[0],
        message: 'Email template created successfully',
      });
    }
  } catch (error) {
    console.error('Error saving email template:', error);
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to save email template' },
      { status: 500 }
    );
  }
}
