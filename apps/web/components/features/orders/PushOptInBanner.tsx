'use client'

import { useState, useCallback } from 'react'
import { Bell, X } from 'lucide-react'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
} from '@/lib/push/register'
import { savePushSubscription } from '@/lib/actions/push'

const DISMISSED_KEY = 'cru-push-opt-in-dismissed'

export function PushOptInBanner() {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(DISMISSED_KEY) === 'true'
  })
  const [subscribing, setSubscribing] = useState(false)

  const handleDismiss = useCallback(() => {
    setDismissed(true)
    localStorage.setItem(DISMISSED_KEY, 'true')
  }, [])

  const handleEnable = useCallback(async () => {
    setSubscribing(true)
    try {
      const subscription = await subscribeToPush()
      if (!subscription) {
        // Permission denied or not supported
        handleDismiss()
        return
      }

      const keys = subscription.toJSON().keys
      if (keys?.p256dh && keys?.auth) {
        await savePushSubscription({
          endpoint: subscription.endpoint,
          p256dhKey: keys.p256dh,
          authKey: keys.auth,
        })
      }
      handleDismiss()
    } catch (error) {
      console.error('[Push] Opt-in failed:', error)
    } finally {
      setSubscribing(false)
    }
  }, [handleDismiss])

  // Don't show if dismissed, not supported, or already granted
  if (dismissed) return null
  if (!isPushSupported()) return null
  if (getNotificationPermission() === 'granted') return null
  if (getNotificationPermission() === 'denied') return null

  return (
    <div className="relative rounded-lg border border-primary/20 bg-primary/5 p-4">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
          <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Get order updates</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enable push notifications to know when your order status changes.
          </p>
          <button
            type="button"
            onClick={handleEnable}
            disabled={subscribing}
            className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {subscribing ? 'Enabling...' : 'Enable Notifications'}
          </button>
        </div>
      </div>
    </div>
  )
}
