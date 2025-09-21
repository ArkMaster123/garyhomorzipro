import { NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { getUserSubscriptionStatus } from '@/lib/db/queries/subscription'

export async function GET(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const subscription = await getUserSubscriptionStatus(session.user.id)
    
    if (!subscription) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate remaining messages
    const freeLimit = parseInt(process.env.FREE_USER_MESSAGE_LIMIT || '10')
    const paidLimit = parseInt(process.env.PAID_USER_MESSAGE_LIMIT || '1000')
    
    const limit = subscription.isSubscriber ? paidLimit : freeLimit
    const remainingMessages = Math.max(0, limit - subscription.dailyMessageCount)

    return NextResponse.json({
      ...subscription,
      remainingMessages
    })
  } catch (err) {
    console.error('Error fetching subscription status:', err)
    return NextResponse.json({ error: 'Error fetching subscription status' }, { status: 500 })
  }
}
