import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcrypt-ts';
import { db } from '@/lib/db';
import { user } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify the token (check if it exists in a password_reset_tokens table)
    // 2. Check if the token is not expired
    // 3. Get the user ID from the token
    
    // For now, we'll use a simple approach where the token contains the user ID
    // In production, you should use a proper JWT token or store tokens in the database
    let userId: string;
    
    try {
      // Simple base64 decode for demo purposes
      // In production, use proper JWT verification
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const tokenData = JSON.parse(decoded);
      
      if (!tokenData.userId || !tokenData.expires || Date.now() > tokenData.expires) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 400 }
        );
      }
      
      userId = tokenData.userId;
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hash(password, 12);

    // Update the user's password
    await db
      .update(user)
      .set({ password: hashedPassword })
      .where(eq(user.id, userId));

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
