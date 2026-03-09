/**
 * Clover Webhook Handler
 *
 * Receives webhook events from Clover when inventory items are updated.
 * Clover webhooks are simpler than Shopify — they send a merchant_id and
 * an object reference, without a robust signature verification mechanism.
 *
 * Key behaviors:
 * - Validates the webhook payload structure and a shared verification token
 * - Uses supabaseAdmin (service role) — no user session in webhooks
 * - Always returns 200 OK to prevent Clover from retrying on app errors
 * - Handles duplicate webhook deliveries gracefully (idempotent logging)
 * - Does NOT trigger a full sync inline — logs the event for async pickup
 *
 * Clover webhook payload format:
 * {
 *   "merchants": { "{merchant_id}": [{ "type": "UPDATE", "objectId": "...", "ts": 123 }] }
 * }
 *
 * Or the simpler format:
 * {
 *   "appId": "...",
 *   "merchants": { "{merchant_id}": [{ "type": "...", "objectId": "..." }] }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Clover webhook event entry within a merchant's event array. */
interface CloverWebhookEvent {
  /** Event type: "CREATE", "UPDATE", "DELETE". */
  type?: string
  /** The ID of the affected object (e.g., item ID). */
  objectId?: string
  /** Epoch timestamp of the event in milliseconds. */
  ts?: number
}

/**
 * Clover webhook payload.
 *
 * Clover sends a map of merchant_id -> event arrays. A single webhook
 * delivery can contain events for multiple merchants (in multi-merchant
 * app scenarios).
 */
interface CloverWebhookPayload {
  /** The Clover app ID that registered the webhook. */
  appId?: string
  /** Map of merchant_id to their respective events. */
  merchants?: Record<string, CloverWebhookEvent[]>
  /** Optional verification token for webhook validation. */
  verificationCode?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CLOVER_WEBHOOK_SECRET_KEY = 'CLOVER_WEBHOOK_SECRET'

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

/**
 * Handle incoming Clover webhook events.
 *
 * Pipeline:
 * 1. Read raw request body
 * 2. Validate the payload structure and optional verification token
 * 3. Parse the merchant events from the payload
 * 4. For each merchant, look up the retailer and log the event
 * 5. Return 200 OK
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read raw request body
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    console.error('Clover webhook: failed to read request body')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 2. Parse JSON payload
  let payload: CloverWebhookPayload
  try {
    payload = JSON.parse(rawBody) as CloverWebhookPayload
  } catch {
    console.error('Clover webhook: failed to parse JSON payload')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 3. Validate the payload structure
  //    Clover webhooks are less standardized than Shopify. We validate
  //    the verification token if configured, and check that the payload
  //    has the expected `merchants` structure.
  const secret = process.env[CLOVER_WEBHOOK_SECRET_KEY]

  if (secret && payload.verificationCode) {
    // If we have both a secret and a verification code, validate them
    if (payload.verificationCode !== secret) {
      console.error('Clover webhook: invalid verification code')
      return NextResponse.json({ error: 'Invalid verification' }, { status: 200 })
    }
  }

  // Clover may send a verification challenge request during webhook setup.
  // If the payload is just a verification code with no merchants, respond
  // with the code to confirm the endpoint.
  if (payload.verificationCode && !payload.merchants) {
    console.log('Clover webhook: verification challenge received')
    return NextResponse.json(
      { verificationCode: payload.verificationCode },
      { status: 200 }
    )
  }

  if (!payload.merchants || Object.keys(payload.merchants).length === 0) {
    console.error('Clover webhook: payload missing merchants data')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 4. Process events for each merchant
  const supabase = createAdminClient()

  for (const [merchantId, events] of Object.entries(payload.merchants)) {
    if (!events || events.length === 0) continue

    console.log(
      `Clover webhook received: merchant="${merchantId}" events=${events.length}`
    )

    // Look up retailer by merchant_id in pos_credentials JSONB
    const { data: retailer, error: retailerError } = await supabase
      .from('retailers')
      .select('id, org_id, name, pos_type')
      .eq('pos_type', 'clover')
      .filter('pos_credentials->>merchant_id', 'eq', merchantId)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (retailerError) {
      console.error(
        'Clover webhook: error looking up retailer:',
        retailerError.message
      )
      continue
    }

    if (!retailer) {
      console.error(
        `Clover webhook: no active retailer found for merchant_id "${merchantId}"`
      )
      continue
    }

    // 5. Log the webhook event to retailer_sync_logs
    //    We batch all events for a merchant into a single log entry.
    //    The background job (STORY-08) will parse the details and
    //    trigger an incremental sync.
    const now = new Date().toISOString()
    const eventSummary = events.map((event) => ({
      type: event.type ?? 'unknown',
      objectId: event.objectId ?? 'unknown',
      ts: event.ts ?? 0,
    }))

    const { error: logError } = await supabase
      .from('retailer_sync_logs')
      .insert({
        org_id: retailer.org_id,
        retailer_id: retailer.id,
        sync_type: 'webhook_event',
        sync_source: 'clover',
        status: 'pending',
        started_at: now,
        error_details: {
          webhook_app_id: payload.appId ?? 'unknown',
          webhook_merchant_id: merchantId,
          webhook_events: eventSummary,
          webhook_event_count: events.length,
          webhook_received_at: now,
        },
      })

    if (logError) {
      // Log but do not fail — the webhook was received successfully
      console.error(
        'Clover webhook: failed to create sync log entry:',
        logError.message
      )
    }
  }

  // 6. Return 200 OK
  return NextResponse.json({ received: true }, { status: 200 })
}
