'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'

export function UnifiedAuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
      </div>
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {session.user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-1"
        >
          <LogOut className="w-3 h-3" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="outline" size="sm">
          Sign In
        </Button>
      </Link>
      <Link href="/register">
        <Button size="sm">
          Sign Up
        </Button>
      </Link>
    </div>
  )
}
