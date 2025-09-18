import { db } from '@/lib/db'
import { user, invite } from '@/lib/db/migrations/schema'
import { eq, and, isNull, or, gt, sql } from 'drizzle-orm'
import { randomBytes } from 'crypto'

export interface InviteData {
  id: string
  code: string
  email: string
  invitedBy: string
  used: boolean
  usedAt?: string
  expiresAt: string
  maxUses: number
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateInviteOptions {
  email: string
  invitedBy: string
  maxUses?: number
  expiresInDays?: number
}

/**
 * Generate a cryptographically secure invite code
 */
export function generateInviteCode(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Create a new invite
 */
export async function createInvite(options: CreateInviteOptions): Promise<InviteData> {
  const {
    email,
    invitedBy,
    maxUses = 1,
    expiresInDays = 7
  } = options

  const code = generateInviteCode()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const [newInvite] = await db
    .insert(invite)
    .values({
      code,
      email,
      invitedBy,
      maxUses,
      expiresAt: expiresAt.toISOString(),
    })
    .returning()

  return newInvite as InviteData
}

/**
 * Validate an invite code
 */
export async function validateInvite(code: string, email?: string): Promise<{
  valid: boolean
  invite?: InviteData
  error?: string
}> {
  const [foundInvite] = await db
    .select()
    .from(invite)
    .where(eq(invite.code, code))
    .limit(1)

  if (!foundInvite) {
    return { valid: false, error: 'Invite code not found' }
  }

  // Check if invite is expired
  if (new Date(foundInvite.expiresAt) < new Date()) {
    return { valid: false, error: 'Invite code has expired' }
  }

  // Check if invite is already used up
  if (foundInvite.used && foundInvite.usageCount >= foundInvite.maxUses) {
    return { valid: false, error: 'Invite code has been fully used' }
  }

  // Check if email matches (if provided)
  if (email && foundInvite.email.toLowerCase() !== email.toLowerCase()) {
    return { valid: false, error: 'Invite code is not valid for this email address' }
  }

  return { valid: true, invite: foundInvite as InviteData }
}

/**
 * Mark an invite as used
 */
export async function useInvite(code: string): Promise<void> {
  await db
    .update(invite)
    .set({
      usageCount: sql`${invite.usageCount} + 1`,
      used: sql`CASE WHEN ${invite.usageCount} + 1 >= ${invite.maxUses} THEN true ELSE ${invite.used} END`,
      usedAt: sql`CASE WHEN ${invite.usageCount} + 1 >= ${invite.maxUses} THEN NOW() ELSE ${invite.usedAt} END`,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(invite.code, code))
}

/**
 * Get invites created by a user
 */
export async function getInvitesByUser(userId: string): Promise<InviteData[]> {
  const invites = await db
    .select()
    .from(invite)
    .where(eq(invite.invitedBy, userId))
    .orderBy(invite.createdAt, 'desc')

  return invites as InviteData[]
}

/**
 * Clean up expired and fully used invites
 */
export async function cleanupExpiredInvites(): Promise<number> {
  const result = await db
    .delete(invite)
    .where(
      or(
        // Expired invites
        sql`${invite.expiresAt} < NOW()`,
        // Fully used invites
        and(
          eq(invite.used, true),
          sql`${invite.usageCount} >= ${invite.maxUses}`
        )
      )
    )

  return result.rowCount || 0
}
