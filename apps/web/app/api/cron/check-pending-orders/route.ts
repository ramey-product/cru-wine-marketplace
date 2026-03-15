import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendDelayNotificationEmail,
  sendOpsAlertEmail,
} from '@/lib/email/order-notifications'

/**
 * Cron endpoint: Check for pending orders older than 15 minutes.
 * Runs every 5 minutes via Vercel Cron.
 *
 * For each stale pending order:
 *   1. Mark proactive_notification_sent = true (idempotent)
 *   2. Send delay notification email to the consumer
 *   3. Send ops alert email to the internal team
 */

const DELAY_THRESHOLD_MINUTES = 15

export async function GET(request: Request) {
  // Verify cron secret to prevent unauthorized invocation
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()
    const thresholdTime = new Date(
      Date.now() - DELAY_THRESHOLD_MINUTES * 60 * 1000
    ).toISOString()

    // Query pending orders older than threshold that haven't been notified
    // proactive_notification_sent column added by migration 20260315000001 — not yet in generated types
    const { data: stalePendingOrders, error: queryError } = await (adminClient as any)
      .from('orders')
      .select(`
        id,
        created_at,
        user_id,
        org_id,
        profiles!orders_user_id_fkey ( email ),
        organizations!orders_org_id_fkey ( name )
      `)
      .eq('status', 'pending')
      .eq('proactive_notification_sent', false)
      .lt('created_at', thresholdTime)
      .limit(50)

    if (queryError) {
      console.error('[CRON] check-pending-orders query failed:', queryError)
      return NextResponse.json(
        { error: 'Query failed', details: queryError.message },
        { status: 500 }
      )
    }

    if (!stalePendingOrders || stalePendingOrders.length === 0) {
      return NextResponse.json({ processed: 0 })
    }

    let processed = 0

    for (const order of stalePendingOrders) {
      // Mark as notified first (idempotent — prevents duplicate sends on retry)
      const { error: updateError } = await (adminClient as any)
        .from('orders')
        .update({ proactive_notification_sent: true })
        .eq('id', order.id)
        .eq('proactive_notification_sent', false) // Extra guard against races

      if (updateError) {
        console.error(`[CRON] Failed to mark order ${order.id} as notified:`, updateError)
        continue
      }

      // Extract email and retailer name from joined data
      const profile = order.profiles as unknown as { email: string } | null
      const org = order.organizations as unknown as { name: string } | null
      const consumerEmail = profile?.email
      const retailerName = org?.name ?? 'the retailer'

      const pendingMinutes = Math.round(
        (Date.now() - new Date(order.created_at).getTime()) / 60000
      )

      // Send consumer delay notification (fire-and-forget)
      if (consumerEmail) {
        sendDelayNotificationEmail({
          email: consumerEmail,
          orderId: order.id,
          retailerName,
        }).catch((err) => {
          console.error(`[CRON] Delay email failed for order ${order.id}:`, err)
        })
      }

      // Send ops alert (fire-and-forget)
      sendOpsAlertEmail({
        orderId: order.id,
        retailerName,
        consumerEmail: consumerEmail ?? 'unknown',
        pendingMinutes,
      }).catch((err) => {
        console.error(`[CRON] Ops alert failed for order ${order.id}:`, err)
      })

      processed++
    }

    return NextResponse.json({ processed })
  } catch (error) {
    console.error('[CRON] check-pending-orders unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
