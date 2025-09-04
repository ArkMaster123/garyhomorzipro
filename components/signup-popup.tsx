'use client'

import { useState } from 'react'
import { SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, MessageSquare, Zap } from 'lucide-react'

interface SignupPopupProps {
  isOpen: boolean
  onClose: () => void
  remainingMessages: number
}

export function SignupPopup({ isOpen, onClose, remainingMessages }: SignupPopupProps) {
  const [isSigningUp, setIsSigningUp] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl">You've reached your limit!</CardTitle>
          <CardDescription>
            You've used {20 - remainingMessages} of your 20 free messages. 
            Sign up to continue chatting with unlimited access.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>What you get with an account:</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Unlimited messages
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Chat history saved
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Advanced AI features
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                Priority support
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <SignUpButton mode="modal">
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={() => setIsSigningUp(true)}
              >
                Create Free Account
              </Button>
            </SignUpButton>
            
            <SignInButton mode="modal">
              <Button variant="outline" className="w-full">
                Already have an account? Sign In
              </Button>
            </SignInButton>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Takes less than 30 seconds • No credit card required
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
