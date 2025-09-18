import { NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Manually update subscription status for testing
    await db.update(user)
      .set({
        isSubscriber: true,
        subscriptionStatus: 'active',
        stripeCustomerId: 'test_customer_123',
        subscriptionId: 'test_subscription_123',
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      })
      .where(eq(user.id, session.user.id))

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription status updated to Pro for testing' 
    })
  } catch (err) {
    console.error('Error updating subscription status:', err)
    return NextResponse.json({ error: 'Error updating subscription status' }, { status: 500 })
  }
}
