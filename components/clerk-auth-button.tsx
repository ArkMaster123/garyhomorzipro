'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function ClerkAuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {session.user?.email || session.user?.name || 'User'}
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => signOut()}
          >
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/sign-in">
        <Button variant="outline">Sign In</Button>
      </Link>
      <Link href="/sign-up">
        <Button>Sign Up</Button>
      </Link>
    </div>
  )
}
