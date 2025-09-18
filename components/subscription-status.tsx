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

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Failed to create portal session');
        alert('Failed to open subscription management. Please try again.');
      }
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open subscription management. Please try again.');
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
            ? 'You have unlimited access to all features - Unlimited projects, AI interactions, all phases including Launch & Market, premium tools & resources, priority support'
            : 'Upgrade to Gary Chat Pro for unlimited access to all features'
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
                onClick={handleManageSubscription}
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
