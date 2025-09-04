'use client'

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function UnifiedAuthButton() {
  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8'
            }
          }}
        />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="sm">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </SignedOut>
    </div>
  )
}
