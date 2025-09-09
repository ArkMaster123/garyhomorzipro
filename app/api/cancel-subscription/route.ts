import { NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get user's subscription info
    const [userData] = await db.select()
      .from(user)
      .where(eq(user.id, session.user.id))

    if (!userData?.subscriptionId) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 400 })
    }

    // Check if this is a test/fake subscription ID
    const isTestSubscription = userData.subscriptionId.startsWith('sub_test_')
    
    if (isTestSubscription) {
      // For test subscriptions, just update the database without calling Stripe
      console.log('Cancelling test subscription:', userData.subscriptionId)
    } else {
      // For real subscriptions, cancel in Stripe
      try {
        await stripe.subscriptions.cancel(userData.subscriptionId)
      } catch (stripeError: any) {
        // If Stripe subscription doesn't exist, just update the database
        if (stripeError.code === 'resource_missing') {
          console.log('Stripe subscription not found, updating database only:', userData.subscriptionId)
        } else {
          throw stripeError
        }
      }
    }

    // Update user status in database
    await db.update(user)
      .set({
        isSubscriber: false,
        subscriptionStatus: 'cancelled',
        subscriptionEndDate: null,
      })
      .where(eq(user.id, session.user.id))

    return NextResponse.json({ 
      message: 'Subscription cancelled successfully',
      isTestSubscription 
    })
  } catch (err) {
    console.error('Error cancelling subscription:', err)
    return NextResponse.json({ error: 'Error cancelling subscription' }, { status: 500 })
  }
}
