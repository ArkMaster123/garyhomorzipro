import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq, and, gte } from 'drizzle-orm'

export async function getUserSubscriptionStatus(userId: string) {
  const [userData] = await db.select({
    isSubscriber: user.isSubscriber,
    subscriptionStatus: user.subscriptionStatus,
    dailyMessageCount: user.dailyMessageCount,
    lastMessageResetDate: user.lastMessageResetDate,
  })
    .from(user)
    .where(eq(user.id, userId))

  return userData
}

export async function incrementMessageCount(userId: string) {
  await db.update(user)
    .set({
      dailyMessageCount: user.dailyMessageCount + 1,
    })
    .where(eq(user.id, userId))
}

export async function resetDailyMessageCount(userId: string) {
  await db.update(user)
    .set({
      dailyMessageCount: 0,
      lastMessageResetDate: new Date(),
    })
    .where(eq(user.id, userId))
}

export async function checkAndResetMessageCount(userId: string) {
  const [userData] = await db.select({
    dailyMessageCount: user.dailyMessageCount,
    lastMessageResetDate: user.lastMessageResetDate,
    isSubscriber: user.isSubscriber,
  })
    .from(user)
    .where(eq(user.id, userId))

  if (!userData) return false

  const now = new Date()
  const lastReset = new Date(userData.lastMessageResetDate)
  const isNewDay = now.toDateString() !== lastReset.toDateString()

  if (isNewDay) {
    await resetDailyMessageCount(userId)
    return true
  }

  return false
}
