'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, MessageSquare, Zap, Heart, Star, Sparkles, Gift, Crown } from 'lucide-react'
import Link from 'next/link'

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
      <Card className="w-full max-w-md relative overflow-hidden">
        {/* Cute decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full -translate-y-10 translate-x-10 opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-200 to-cyan-200 rounded-full translate-y-8 -translate-x-8 opacity-30"></div>
        
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 h-8 w-8 p-0 z-10"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader className="text-center pb-4 pt-6">
          {/* Cute animated icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4 shadow-lg animate-pulse">
            <div className="relative">
              <MessageSquare className="h-8 w-8 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
            </div>
          </div>
          
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Oops! 🫢 You're all out of messages!
          </CardTitle>
          
          <CardDescription className="text-gray-600 mt-2">
            <span className="font-medium text-pink-600">You've used all {20 - remainingMessages} of your free messages!</span>
            <br />
            Don't worry though - signing up is completely free and gives you unlimited chats! 🎉
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pb-6">
          {/* Cute benefits section */}
          <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 p-5 rounded-xl border border-pink-200 dark:border-pink-800 relative overflow-hidden">
            {/* Floating sparkles */}
            <div className="absolute top-2 right-2">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute bottom-2 left-2">
              <Star className="h-3 w-3 text-purple-400 animate-pulse delay-300" />
            </div>
            
            <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Gift className="h-5 w-5" />
              What you get with Gary Chat:
            </h3>
            
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Heart className="h-3 w-3 text-white" />
                </div>
                <span><strong>Unlimited messages</strong> - Chat as much as you want!</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-3 w-3 text-white" />
                </div>
                <span><strong>Chat history saved</strong> - Never lose your conversations</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <span><strong>Advanced AI features</strong> - Access to the latest models</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Crown className="h-3 w-3 text-white" />
                </div>
                <span><strong>Priority support</strong> - Get help when you need it</span>
              </li>
            </ul>
          </div>

          {/* Cute action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/sign-up">
              <Button 
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsSigningUp(true)}
              >
                {isSigningUp ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    Create Free Account! 🎁
                  </div>
                )}
              </Button>
            </Link>
            
            <Link href="/sign-in">
              <Button 
                variant="outline" 
                className="w-full border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Already have an account? Sign In 😊
              </Button>
            </Link>
          </div>

          {/* Cute footer message */}
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
            Takes less than 30 seconds • No credit card required • Join thousands of happy users! 💬✨
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
