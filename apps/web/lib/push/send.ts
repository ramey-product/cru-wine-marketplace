import webpush from 'web-push'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:support@cru.wine'

let vapidConfigured = false

function ensureVapidConfig() {
  if (vapidConfigured) return true
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('[Push] VAPID keys not configured — skipping push notifications')
    return false
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  vapidConfigured = true
  return true
}

// ---------------------------------------------------------------------------
// Send push notification to a user
// ---------------------------------------------------------------------------

export interface PushPayload {
  title: string
  body: string
  icon?: string
  tag?: string
  data?: Record<string, string>
}

export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ sent: number; failed: number }> {
  if (!ensureVapidConfig()) {
    return { sent: 0, failed: 0 }
  }

  const adminClient = createAdminClient()

  // Fetch all push subscriptions for this user
  const { data: subscriptions, error } = await (adminClient as any)
    .from('push_subscriptions')
    .select('id, endpoint, p256dh_key, auth_key')
    .eq('user_id', userId)

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 }
  }

  let sent = 0
  let failed = 0
  const expiredIds: string[] = []

  for (const sub of subscriptions as Array<{
    id: string
    endpoint: string
    p256dh_key: string
    auth_key: string
  }>) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 } // 1 hour TTL
      )
      sent++
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number })?.statusCode
      if (statusCode === 410 || statusCode === 404) {
        // Subscription expired or no longer valid — clean it up
        expiredIds.push(sub.id)
      }
      failed++
    }
  }

  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    await (adminClient as any)
      .from('push_subscriptions')
      .delete()
      .in('id', expiredIds)
  }

  return { sent, failed }
}

// ---------------------------------------------------------------------------
// Send push for order status change
// ---------------------------------------------------------------------------

const STATUS_PUSH_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed: {
    title: 'Order Confirmed',
    body: 'Your order has been confirmed by the retailer.',
  },
  ready_for_pickup: {
    title: 'Ready for Pickup',
    body: 'Your wine is ready! Head to the store to pick it up.',
  },
  out_for_delivery: {
    title: 'Out for Delivery',
    body: 'Your wine is on its way to you.',
  },
  completed: {
    title: 'Order Complete',
    body: 'Your order is complete. Enjoy your wine!',
  },
  cancelled: {
    title: 'Order Cancelled',
    body: 'Your order has been cancelled.',
  },
}

export async function sendOrderStatusPush(
  userId: string,
  orderId: string,
  newStatus: string
): Promise<void> {
  const message = STATUS_PUSH_MESSAGES[newStatus]
  if (!message) return

  try {
    await sendPushNotification(userId, {
      title: message.title,
      body: message.body,
      tag: `order-${orderId}-${newStatus}`,
      data: {
        url: `/orders/${orderId}`,
        orderId,
        status: newStatus,
      },
    })
  } catch (error) {
    console.error('[Push] Failed to send order status push:', error)
  }
}
