import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcrypt-ts';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/app/(auth)/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get user from database
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id));

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!userData.password) {
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(currentPassword, userData.password);
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await hash(newPassword, 12);

    // Update password in database
    await db
      .update(user)
      .set({ password: hashedNewPassword })
      .where(eq(user.id, session.user.id));

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
