import { NextResponse } from 'next/server'
import { auth } from '@/app/(auth)/auth'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // First, find or create a customer
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })
    
    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
      })
    }

    // Create a Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Error creating portal session:', err)
    return NextResponse.json({ error: 'Error creating portal session' }, { status: 500 })
  }
}
