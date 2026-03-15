'use client'

/**
 * Client-side push notification registration utilities.
 * Handles service worker registration, push subscription, and unsubscription.
 */

// ---------------------------------------------------------------------------
// Service worker registration
// ---------------------------------------------------------------------------

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('[Push] Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    return registration
  } catch (error) {
    console.error('[Push] Service worker registration failed:', error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Push subscription
// ---------------------------------------------------------------------------

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidKey) {
    console.warn('[Push] VAPID public key not configured')
    return null
  }

  const registration = await registerServiceWorker()
  if (!registration) return null

  try {
    // Check if already subscribed
    const existing = await registration.pushManager.getSubscription()
    if (existing) return existing

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.info('[Push] Notification permission denied')
      return null
    }

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
    })

    return subscription
  } catch (error) {
    console.error('[Push] Subscription failed:', error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Unsubscribe
// ---------------------------------------------------------------------------

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (!subscription) return true

    return await subscription.unsubscribe()
  } catch (error) {
    console.error('[Push] Unsubscribe failed:', error)
    return false
  }
}

// ---------------------------------------------------------------------------
// Check if push is supported and permission state
// ---------------------------------------------------------------------------

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
