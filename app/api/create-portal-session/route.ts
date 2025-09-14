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
    // Create a Stripe customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer_email: session.user.email,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (err) {
    console.error('Error creating portal session:', err)
    return NextResponse.json({ error: 'Error creating portal session' }, { status: 500 })
  }
}
