'use client'

import { Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useGuestLimit } from '@/hooks/use-guest-limit'

export function SidebarGuestLimit() {
  const { remainingMessages, isGuest } = useGuestLimit()

  if (!isGuest) return null

  return (
    <div className="px-3 py-2 border-t border-sidebar-border">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-blue-500" />
        <Badge variant="outline" className="text-xs">
          Guest
        </Badge>
        <span className="text-xs text-muted-foreground">
          {remainingMessages} messages left today
        </span>
      </div>
    </div>
  )
}
