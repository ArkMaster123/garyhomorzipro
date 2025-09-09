'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

const GUEST_MESSAGE_LIMIT = 20
const STORAGE_KEY = 'guest_message_count'

export function useGuestLimit() {
  const { data: session, status } = useSession()
  const [messageCount, setMessageCount] = useState(0)
  const [showSignupPopup, setShowSignupPopup] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const isSignedIn = !!session?.user
  const isLoaded = status !== 'loading'

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !isLoaded) return

    // If user is signed in, no limits
    if (isSignedIn) {
      setMessageCount(0)
      setShowSignupPopup(false)
      return
    }

    // Load guest message count from localStorage
    const storedCount = localStorage.getItem(STORAGE_KEY)
    const count = storedCount ? parseInt(storedCount, 10) : 0
    setMessageCount(count)

    // Show popup if limit reached
    if (count >= GUEST_MESSAGE_LIMIT) {
      setShowSignupPopup(true)
    }
  }, [isSignedIn, isLoaded, isClient])

  const incrementMessageCount = () => {
    if (isSignedIn) return

    const newCount = messageCount + 1
    setMessageCount(newCount)
    localStorage.setItem(STORAGE_KEY, newCount.toString())

    // Show popup when limit reached
    if (newCount >= GUEST_MESSAGE_LIMIT) {
      setShowSignupPopup(true)
    }
  }

  const canSendMessage = isSignedIn || messageCount < GUEST_MESSAGE_LIMIT
  const remainingMessages = Math.max(0, GUEST_MESSAGE_LIMIT - messageCount)

  return {
    messageCount,
    remainingMessages,
    canSendMessage,
    showSignupPopup,
    setShowSignupPopup,
    incrementMessageCount,
    isGuest: !isSignedIn && isLoaded && isClient
  }
}
