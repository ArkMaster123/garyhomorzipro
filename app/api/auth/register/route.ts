import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { user, invite } from '@/lib/db/migrations/schema'
import * as bcrypt from 'bcrypt-ts'
import { eq, and, isNull, or, gt, sql } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, inviteCode } = await request.json()

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

    // Validate invite code if provided
    if (inviteCode) {
      const [validInvite] = await db
        .select()
        .from(invite)
        .where(
          and(
            eq(invite.code, inviteCode),
            or(
              isNull(invite.used),
              and(
                eq(invite.used, false),
                gt(invite.maxUses, invite.usageCount)
              )
            ),
            gt(invite.expiresAt, new Date().toISOString())
          )
        )
        .limit(1)

      if (!validInvite) {
        return NextResponse.json(
          { error: 'Invalid or expired invite code' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await db
      .insert(user)
      .values({
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date().toISOString(), // Auto-verify for now, can be changed to require email verification
      })
      .returning()

    // Update invite usage if invite code was used
    if (inviteCode) {
      await db
        .update(invite)
        .set({
          usageCount: sql`${invite.usageCount} + 1`,
          used: sql`CASE WHEN ${invite.usageCount} + 1 >= ${invite.maxUses} THEN true ELSE ${invite.used} END`,
          usedAt: sql`CASE WHEN ${invite.usageCount} + 1 >= ${invite.maxUses} THEN NOW() ELSE ${invite.usedAt} END`,
        })
        .where(eq(invite.code, inviteCode))
    }

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
