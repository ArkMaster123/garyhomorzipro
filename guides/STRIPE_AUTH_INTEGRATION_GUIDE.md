# Stripe Authentication Integration Guide

This guide shows how to integrate Stripe subscription authentication into Gary's chat app, replacing the Supabase-based approach with NextAuth + PostgreSQL.

## Overview

The integration includes:
- Stripe webhook handling for subscription events
- User subscription status tracking in PostgreSQL
- Message limits for free vs paid users
- Subscription management UI components

## Prerequisites

- Stripe account with API keys
- PostgreSQL database (already configured)
- NextAuth setup (already configured)

## 📋 Implementation Checklist

### Phase 1: Setup & Dependencies
- [ ] Install Stripe dependencies
- [ ] Add environment variables to `.env.local`
- [ ] Run database migration
- [ ] Update schema.ts file

### Phase 2: Core API Routes
- [ ] Create Stripe webhook handler
- [ ] Create checkout session API
- [ ] Create cancel subscription API
- [ ] Test API routes locally

### Phase 3: Database & Queries
- [ ] Create subscription queries
- [ ] Create message limit middleware
- [ ] Test database operations

### Phase 4: UI Components
- [ ] Create subscription status component
- [ ] Update limit reached popup
- [ ] Integrate components into chat

### Phase 5: Stripe Dashboard
- [ ] Create products and prices
- [ ] Configure webhooks
- [ ] Set up checkout links
- [ ] Test webhook events

### Phase 6: Testing & Deployment
- [ ] Test subscription flow end-to-end
- [ ] Deploy to production
- [ ] Update webhook URLs
- [ ] Monitor webhook events

---

## Step 1: Install Dependencies

```bash
pnpm add stripe @stripe/stripe-js
```

## Step 2: Environment Variables

### ✅ Checklist for Environment Setup:
- [ ] Copy `.env.example` to `.env.local`
- [ ] Get Stripe publishable key from dashboard
- [ ] Get Stripe secret key from dashboard  
- [ ] Create webhook endpoint in Stripe dashboard
- [ ] Copy webhook secret to environment
- [ ] Set up checkout and billing portal links
- [ ] Configure message limits (free: 10, paid: 1000)

Add these to your `.env.local`:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here

# Stripe Checkout URLs (configure in Stripe Dashboard)
NEXT_PUBLIC_BUY_SUBSCRIPTION_LINK=https://buy.stripe.com/your-checkout-link
NEXT_PUBLIC_MANAGE_SUBSCRIPTION_LINK=https://billing.stripe.com/p/login/your-portal-link

# Subscription Limits
FREE_USER_MESSAGE_LIMIT=10
PAID_USER_MESSAGE_LIMIT=1000
```

## Step 3: Database Schema Updates

### ✅ Checklist for Database Setup:
- [ ] Create migration file `0004_add_stripe_subscription_fields.sql`
- [ ] Run migration: `pnpm db:migrate`
- [ ] Update `lib/db/schema.ts` with new fields
- [ ] Verify new columns exist in database
- [ ] Test database connection

### Migration File
Create `lib/db/migrations/0004_add_stripe_subscription_fields.sql`:

```sql
-- Add Stripe subscription fields to User table
ALTER TABLE "User" ADD COLUMN "stripeCustomerId" varchar(128);
ALTER TABLE "User" ADD COLUMN "isSubscriber" boolean NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "subscriptionStatus" varchar(32) DEFAULT 'inactive';
ALTER TABLE "User" ADD COLUMN "subscriptionId" varchar(128);
ALTER TABLE "User" ADD COLUMN "subscriptionEndDate" timestamp;
ALTER TABLE "User" ADD COLUMN "dailyMessageCount" integer NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastMessageResetDate" timestamp DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX "User_stripeCustomerId_idx" ON "User"("stripeCustomerId");
CREATE INDEX "User_isSubscriber_idx" ON "User"("isSubscriber");
```

### Update Schema
Add to `lib/db/schema.ts` in the user table:

```typescript
export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
  persona: varchar('persona', { length: 32 }).default('default'),
  clerkId: varchar('clerkId', { length: 128 }),
  name: varchar('name', { length: 128 }),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  
  // Stripe subscription fields
  stripeCustomerId: varchar('stripeCustomerId', { length: 128 }),
  isSubscriber: boolean('isSubscriber').notNull().default(false),
  subscriptionStatus: varchar('subscriptionStatus', { length: 32 }).default('inactive'),
  subscriptionId: varchar('subscriptionId', { length: 128 }),
  subscriptionEndDate: timestamp('subscriptionEndDate'),
  dailyMessageCount: integer('dailyMessageCount').notNull().default(0),
  lastMessageResetDate: timestamp('lastMessageResetDate').defaultNow(),
});
```

## Step 4: Stripe Webhook Handler

### ✅ Checklist for Webhook Setup:
- [ ] Create `app/api/stripe-webhook/route.ts` file
- [ ] Copy webhook handler code
- [ ] Test webhook endpoint locally with Stripe CLI
- [ ] Verify webhook signature validation
- [ ] Test subscription events (created, updated, deleted)
- [ ] Check database updates from webhooks

Create `app/api/stripe-webhook/route.ts`:

```typescript
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
  const signature = headers().get('stripe-signature')!

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
```

## Step 5: Subscription Management API Routes

### ✅ Checklist for API Routes:
- [ ] Create `app/api/create-checkout-session/route.ts`
- [ ] Create `app/api/cancel-subscription/route.ts`
- [ ] Test checkout session creation
- [ ] Test subscription cancellation
- [ ] Verify authentication checks
- [ ] Test error handling

### Create Checkout Session
Create `app/api/create-checkout-session/route.ts`:

```typescript
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
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email,
      line_items: [
        {
          price: 'price_your_stripe_price_id', // Replace with your actual price ID
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/chat?canceled=true`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err) {
    console.error('Error creating checkout session:', err)
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
  }
}
```

### Cancel Subscription
Create `app/api/cancel-subscription/route.ts`:

```typescript
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

    // Cancel subscription in Stripe
    await stripe.subscriptions.cancel(userData.subscriptionId)

    // Update user status in database
    await db.update(user)
      .set({
        isSubscriber: false,
        subscriptionStatus: 'cancelled',
        subscriptionEndDate: null,
      })
      .where(eq(user.id, session.user.id))

    return NextResponse.json({ message: 'Subscription cancelled successfully' })
  } catch (err) {
    console.error('Error cancelling subscription:', err)
    return NextResponse.json({ error: 'Error cancelling subscription' }, { status: 500 })
  }
}
```

## Step 6: Database Queries

### ✅ Checklist for Database Queries:
- [ ] Create `lib/db/queries/subscription.ts` file
- [ ] Implement `getUserSubscriptionStatus()` function
- [ ] Implement `incrementMessageCount()` function
- [ ] Implement `resetDailyMessageCount()` function
- [ ] Implement `checkAndResetMessageCount()` function
- [ ] Test all query functions

Create `lib/db/queries/subscription.ts`:

```typescript
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
```

## Step 7: Subscription Components

### ✅ Checklist for UI Components:
- [ ] Create `components/subscription-status.tsx`
- [ ] Update `components/limit-reached-popup.tsx`
- [ ] Test subscription status display
- [ ] Test upgrade button functionality
- [ ] Test limit reached popup
- [ ] Integrate components into chat interface

### Subscription Status Component
Create `components/subscription-status.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, CreditCard, X } from 'lucide-react'

interface SubscriptionStatusProps {
  userId: string
}

export function SubscriptionStatus({ userId }: SubscriptionStatusProps) {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [userId])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/subscription-status?userId=${userId}`)
      const data = await response.json()
      setSubscription(data)
    } catch (error) {
      console.error('Error fetching subscription status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }

  const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await fetch('/api/cancel-subscription', {
          method: 'POST',
        })
        fetchSubscriptionStatus()
      } catch (error) {
        console.error('Error cancelling subscription:', error)
      }
    }
  }

  if (loading) {
    return <div>Loading subscription status...</div>
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {subscription?.isSubscriber ? (
            <>
              <Crown className="h-5 w-5 text-yellow-500" />
              Pro Subscription
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Free Plan
            </>
          )}
        </CardTitle>
        <CardDescription>
          {subscription?.isSubscriber 
            ? 'You have unlimited access to all features'
            : 'Upgrade to unlock unlimited messages and premium features'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge variant={subscription?.isSubscriber ? 'default' : 'secondary'}>
            {subscription?.isSubscriber ? 'Active' : 'Free'}
          </Badge>
        </div>
        
        {!subscription?.isSubscriber && (
          <div className="flex items-center justify-between">
            <span>Messages today:</span>
            <span>{subscription?.dailyMessageCount || 0} / {process.env.NEXT_PUBLIC_FREE_USER_MESSAGE_LIMIT || 10}</span>
          </div>
        )}

        <div className="flex gap-2">
          {!subscription?.isSubscriber ? (
            <Button onClick={handleUpgrade} className="flex-1">
              Upgrade to Pro
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => window.open(process.env.NEXT_PUBLIC_MANAGE_SUBSCRIPTION_LINK, '_blank')}
                className="flex-1"
              >
                Manage Subscription
              </Button>
              <Button variant="destructive" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Limit Reached Popup
Update `components/limit-reached-popup.tsx`:

```typescript
import React from 'react';
import { X, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LimitReachedPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentCount: number;
  limit: number;
}

const LimitReachedPopup: React.FC<LimitReachedPopupProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade,
  currentCount,
  limit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h2 className="text-2xl font-bold">Message Limit Reached</h2>
        </div>
        
        <p className="mb-4 text-gray-600">
          You've used {currentCount} of {limit} free messages today. 
          Upgrade to Pro for unlimited access!
        </p>
        
        <div className="space-y-3">
          <div className="bg-gray-100 p-3 rounded-lg">
            <h3 className="font-semibold mb-2">Pro Benefits:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited messages</li>
              <li>• Priority support</li>
              <li>• Advanced features</li>
              <li>• Voice responses</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Maybe Later
            </Button>
            <Button
              onClick={onUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedPopup;
```

## Step 8: Message Limit Middleware

### ✅ Checklist for Message Limits:
- [ ] Create `lib/message-limits.ts` file
- [ ] Implement `checkMessageLimit()` function
- [ ] Implement `recordMessage()` function
- [ ] Update chat API route to use limits
- [ ] Test message limit enforcement
- [ ] Test daily reset functionality

Create `lib/message-limits.ts`:

```typescript
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
```

## Step 9: Integration with Chat

Update your chat API route to check message limits:

```typescript
// In your chat API route (e.g., app/api/chat/route.ts)
import { checkMessageLimit, recordMessage } from '@/lib/message-limits'

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check message limit
  const limitCheck = await checkMessageLimit(session.user.id)
  
  if (!limitCheck.canSend) {
    return NextResponse.json({ 
      error: 'Message limit reached',
      limitReached: true,
      remainingMessages: limitCheck.remainingMessages,
      isSubscriber: limitCheck.isSubscriber
    }, { status: 429 })
  }

  // Process the message...
  // ... your existing chat logic ...

  // Record the message
  await recordMessage(session.user.id)

  return NextResponse.json({ /* your response */ })
}
```

## Step 10: Stripe Dashboard Configuration

### ✅ Checklist for Stripe Dashboard:
- [ ] Create product in Stripe Dashboard
- [ ] Set up recurring pricing (monthly/yearly)
- [ ] Configure webhook endpoint
- [ ] Select webhook events to listen for
- [ ] Copy webhook secret to environment
- [ ] Create payment links
- [ ] Test webhook events

1. **Create Products and Prices**:
   - Go to Stripe Dashboard > Products
   - Create a new product for "Gary Chat Pro"
   - Set up recurring pricing (monthly/yearly)

2. **Configure Webhooks**:
   - Go to Stripe Dashboard > Webhooks
   - Add endpoint: `https://yourdomain.com/api/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy the webhook secret to your environment variables

3. **Set up Checkout Links**:
   - Create payment links in Stripe Dashboard
   - Copy the URLs to your environment variables

## Step 11: Testing

### ✅ Checklist for Testing:
- [ ] Install Stripe CLI for local testing
- [ ] Test webhook endpoint locally
- [ ] Test subscription creation flow
- [ ] Test subscription cancellation
- [ ] Test message limit enforcement
- [ ] Test database updates
- [ ] Test UI components

1. **Test Webhook Locally**:
   ```bash
   # Install Stripe CLI
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

2. **Test Subscription Flow**:
   - Create a test customer
   - Complete a test checkout
   - Verify webhook events are received
   - Check database updates

## Step 12: Deployment

### ✅ Checklist for Deployment:
- [ ] Add environment variables to production
- [ ] Update webhook URL to production domain
- [ ] Run database migration on production
- [ ] Test webhook events in production
- [ ] Verify subscription flow works
- [ ] Monitor webhook logs
- [ ] Set up error monitoring

1. **Environment Variables**: Add all Stripe keys to your production environment
2. **Webhook URL**: Update webhook endpoint to your production domain
3. **Database Migration**: Run the migration on your production database

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**:
   - Check webhook URL is correct
   - Verify webhook secret matches
   - Check server logs for errors

2. **Database Updates Not Working**:
   - Verify database connection
   - Check user ID format (UUID)
   - Ensure migration was run

3. **Checkout Session Creation Fails**:
   - Verify Stripe secret key
   - Check price ID is correct
   - Ensure success/cancel URLs are valid

### Debug Commands

```bash
# Check Stripe webhook events
stripe events list --limit 10

# Test webhook endpoint
curl -X POST http://localhost:3000/api/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Check database connection
pnpm db:studio
```

## Security Considerations

1. **Never expose secret keys** in client-side code
2. **Validate webhook signatures** to ensure requests are from Stripe
3. **Use HTTPS** for all webhook endpoints
4. **Implement rate limiting** on API routes
5. **Log all subscription events** for audit trails

## Next Steps

1. **Analytics**: Track subscription metrics and user behavior
2. **Email Notifications**: Send welcome emails for new subscribers
3. **Usage Tracking**: Monitor API usage and costs
4. **A/B Testing**: Test different pricing strategies
5. **Customer Support**: Implement subscription management UI

This integration provides a complete Stripe subscription system that works with your existing NextAuth + PostgreSQL setup, giving you full control over user subscriptions and message limits.
