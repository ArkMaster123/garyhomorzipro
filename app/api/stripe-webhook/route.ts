import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret: string = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    console.log(`❌ Error message: ${errorMessage}`)
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const email = session.customer_email || (await getEmailFromCustomer(session.customer as string))
      
      if (email) {
        await handleSubscriptionChange(email, true, customerId, session.subscription as string)
      } else {
        console.error("Unable to retrieve customer email for subscription change.")
      }
      break

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription
      const customerIdToDelete = deletedSubscription.customer as string
      
      if (customerIdToDelete) {
        await handleCustomerDeletion(customerIdToDelete)
      } else {
        console.error("Unable to retrieve customer email for subscription deletion.")
      }
      break

    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription
      const customerIdToUpdate = updatedSubscription.customer as string
      
      if (customerIdToUpdate) {
        await handleSubscriptionUpdate(customerIdToUpdate, updatedSubscription)
      }
      break

    default:
      console.log(`Unhandled event type ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

async function getEmailFromCustomer(customerId: string): Promise<string | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    return (customer as Stripe.Customer).email || null
  } catch (error) {
    console.error("Error retrieving customer data:", error)
    return null
  }
}

async function handleSubscriptionChange(email: string, isSubscribed: boolean, customerId: string, subscriptionId: string) {
  try {
    await db.update(user)
      .set({
        isSubscriber: isSubscribed,
        stripeCustomerId: customerId,
        subscriptionStatus: 'active',
        subscriptionId: subscriptionId,
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      })
      .where(eq(user.email, email))

    console.log(`User ${email} subscription status updated to ${isSubscribed}`)
  } catch (error) {
    console.error('Error updating user subscription status:', error)
  }
}

async function handleCustomerDeletion(customerId: string) {
  try {
    await db.update(user)
      .set({
        isSubscriber: false,
        subscriptionStatus: 'cancelled',
        subscriptionId: null,
        subscriptionEndDate: null,
      })
      .where(eq(user.stripeCustomerId, customerId))

    console.log(`User with customerId ${customerId} subscription cancelled`)
  } catch (error) {
    console.error('Error updating user subscription status on deletion:', error)
  }
}

async function handleSubscriptionUpdate(customerId: string, subscription: Stripe.Subscription) {
  try {
    await db.update(user)
      .set({
        subscriptionStatus: subscription.status,
        subscriptionEndDate: new Date(subscription.current_period_end * 1000),
      })
      .where(eq(user.stripeCustomerId, customerId))

    console.log(`User with customerId ${customerId} subscription updated to ${subscription.status}`)
  } catch (error) {
    console.error('Error updating subscription:', error)
  }
}
