import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { createInvite, validateInvite, useInvite } from '@/lib/auth/invites'

// POST endpoint for creating invites (admin-protected)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { action, email, code, maxUses, expiresInDays } = await request.json()

    if (action === 'create') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      const invite = await createInvite({
        email,
        invitedBy: session.user.id,
        maxUses: maxUses || 1,
        expiresInDays: expiresInDays || 7,
      })

      return NextResponse.json({
        message: 'Invite created successfully',
        invite,
      })
    }

    if (action === 'validate') {
      if (!code) {
        return NextResponse.json(
          { error: 'Invite code is required' },
          { status: 400 }
        )
      }

      const validation = await validateInvite(code, email)

      return NextResponse.json(validation)
    }

    if (action === 'use') {
      if (!code) {
        return NextResponse.json(
          { error: 'Invite code is required' },
          { status: 400 }
        )
      }

      // First validate the invite
      const validation = await validateInvite(code)
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid invite code' },
          { status: 400 }
        )
      }

      // Mark the invite as used
      await useInvite(code)

      return NextResponse.json({
        message: 'Invite used successfully',
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Invite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
