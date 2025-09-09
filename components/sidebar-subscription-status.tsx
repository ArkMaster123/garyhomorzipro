'use client';

import { Crown, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface SubscriptionStatus {
  isSubscriber: boolean;
  subscriptionStatus: string;
  dailyMessageCount: number;
  remainingMessages: number;
}

export function SidebarSubscriptionStatus() {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/subscription-status');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="px-3 py-2">
        <div className="h-6 bg-zinc-500/30 rounded animate-pulse" />
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="px-3 py-2 border-t border-sidebar-border">
      {status.isSubscriber ? (
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-yellow-500" />
          <Badge variant="secondary" className="text-xs">
            Gary Chat Pro
          </Badge>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-500" />
          <Badge variant="outline" className="text-xs">
            Free Plan
          </Badge>
          <span className="text-xs text-muted-foreground">
            {status.remainingMessages} left today
          </span>
        </div>
      )}
    </div>
  );
}
