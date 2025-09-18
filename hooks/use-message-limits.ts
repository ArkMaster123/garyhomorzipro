import { useState, useCallback } from 'react'

interface MessageLimitError {
  limitReached: boolean
  remainingMessages: number
  isSubscriber: boolean
}

export function useMessageLimits() {
  const [showLimitPopup, setShowLimitPopup] = useState(false)
  const [limitError, setLimitError] = useState<MessageLimitError | null>(null)

  const handleLimitError = useCallback((error: any) => {
    if (error?.limitReached) {
      setLimitError({
        limitReached: error.limitReached,
        remainingMessages: error.remainingMessages || 0,
        isSubscriber: error.isSubscriber || false
      })
      setShowLimitPopup(true)
    }
  }, [])

  const handleUpgrade = useCallback(async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
      })
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
    }
  }, [])

  const closeLimitPopup = useCallback(() => {
    setShowLimitPopup(false)
    setLimitError(null)
  }, [])

  return {
    showLimitPopup,
    limitError,
    handleLimitError,
    handleUpgrade,
    closeLimitPopup
  }
}
