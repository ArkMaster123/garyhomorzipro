import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import * as bcrypt from 'bcrypt-ts'
import { eq } from 'drizzle-orm'
import { sendRegistrationWelcomeEmail } from '@/lib/email/welcome-email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Note: Invite code validation removed for now
    // Can be re-implemented when invite system is set up

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await db
      .insert(user)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning()

    // Note: Invite code usage tracking removed for now

    // Send welcome email (asynchronously, don't wait for it)
    sendRegistrationWelcomeEmail(email, name).catch(error => {
      console.warn('⚠️ Welcome email failed to send:', error);
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
