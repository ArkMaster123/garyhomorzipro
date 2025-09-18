import { getUserSubscriptionStatus, incrementMessageCount, checkAndResetMessageCount } from '@/lib/db/queries/subscription'

export async function checkMessageLimit(userId: string): Promise<{
  canSend: boolean
  remainingMessages: number
  isSubscriber: boolean
}> {
  // Check and reset daily count if needed
  await checkAndResetMessageCount(userId)
  
  const subscription = await getUserSubscriptionStatus(userId)
  
  if (!subscription) {
    return { canSend: false, remainingMessages: 0, isSubscriber: false }
  }

  const freeLimit = parseInt(process.env.FREE_USER_MESSAGE_LIMIT || '10')
  const paidLimit = parseInt(process.env.PAID_USER_MESSAGE_LIMIT || '1000')
  
  const limit = subscription.isSubscriber ? paidLimit : freeLimit
  const remainingMessages = Math.max(0, limit - subscription.dailyMessageCount)
  
  return {
    canSend: subscription.dailyMessageCount < limit,
    remainingMessages,
    isSubscriber: subscription.isSubscriber
  }
}

export async function recordMessage(userId: string): Promise<void> {
  await incrementMessageCount(userId)
}
