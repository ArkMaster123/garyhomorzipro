import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { adminUser } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is already an admin
    const existingAdmin = await db
      .select()
      .from(adminUser)
      .where(eq(adminUser.userId, session.user.id))
      .limit(1);

    if (existingAdmin.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'User is already an admin',
        userId: session.user.id 
      });
    }

    // Add user as admin
    const [newAdmin] = await db
      .insert(adminUser)
      .values({
        userId: session.user.id,
        role: 'admin',
        permissions: { canManageKnowledgeBase: true, canManageEmails: true }
      })
      .returning();

    return NextResponse.json({ 
      success: true, 
      message: 'User added as admin successfully',
      admin: newAdmin,
      userId: session.user.id 
    });

  } catch (error) {
    console.error('Error setting up admin:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
