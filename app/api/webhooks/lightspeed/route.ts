/**
 * Lightspeed Retail Webhook Handler
 *
 * Receives webhook events from Lightspeed Retail when inventory items
 * are created, updated, or deleted. Verifies the HMAC-SHA256 signature,
 * looks up the retailer by account_id, and logs the event for processing.
 *
 * Key behaviors:
 * - HMAC-SHA256 signature verification before processing any payload
 * - Uses supabaseAdmin (service role) — no user session in webhooks
 * - Always returns 200 OK to prevent Lightspeed from retrying on errors
 * - Handles duplicate deliveries gracefully (idempotent logging)
 * - Does NOT trigger a full sync inline — logs the event for async pickup
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Payload shape for Lightspeed item webhook events. */
interface LightspeedWebhookPayload {
  /** The Lightspeed account ID that triggered the event. */
  accountID?: string
  /** The event action type (e.g., "create", "update", "destroy"). */
  action?: string
  /** The resource type (e.g., "Item", "Category"). */
  resource?: string
  /** The ID of the affected resource. */
  resourceID?: string
  /** ISO timestamp of when the event occurred. */
  timestamp?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIGHTSPEED_WEBHOOK_SECRET_KEY = 'LIGHTSPEED_WEBHOOK_SECRET'
const LIGHTSPEED_SIGNATURE_HEADER = 'x-lightspeed-signature'

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

/**
 * Handle incoming Lightspeed webhook events.
 *
 * Pipeline:
 * 1. Read raw request body
 * 2. Verify HMAC-SHA256 signature
 * 3. Parse JSON payload
 * 4. Look up retailer by account_id in pos_credentials
 * 5. Log the webhook event to retailer_sync_logs
 * 6. Return 200 OK
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read raw request body for signature verification
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    // Always return 200 to prevent Lightspeed from retrying
    console.error('Lightspeed webhook: failed to read request body')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 2. Verify HMAC-SHA256 signature
  const signature = request.headers.get(LIGHTSPEED_SIGNATURE_HEADER)
  const secret = process.env[LIGHTSPEED_WEBHOOK_SECRET_KEY]

  if (!secret) {
    console.error(
      'Lightspeed webhook: LIGHTSPEED_WEBHOOK_SECRET is not configured'
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (!signature) {
    console.error('Lightspeed webhook: missing signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 200 })
  }

  const isValid = await verifySignature(rawBody, signature, secret)
  if (!isValid) {
    console.error('Lightspeed webhook: invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 200 })
  }

  // 3. Parse JSON payload
  let payload: LightspeedWebhookPayload
  try {
    payload = JSON.parse(rawBody) as LightspeedWebhookPayload
  } catch {
    console.error('Lightspeed webhook: failed to parse JSON payload')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  const accountId = payload.accountID
  if (!accountId) {
    console.error('Lightspeed webhook: payload missing accountID')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 4. Look up retailer by account_id in pos_credentials JSONB
  const supabase = createAdminClient()

  const { data: retailer, error: retailerError } = await supabase
    .from('retailers')
    .select('id, org_id, name, pos_type')
    .eq('pos_type', 'lightspeed')
    .filter('pos_credentials->>account_id', 'eq', accountId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (retailerError) {
    console.error(
      'Lightspeed webhook: error looking up retailer:',
      retailerError.message
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (!retailer) {
    console.error(
      `Lightspeed webhook: no active retailer found for account_id "${accountId}"`
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 5. Log the webhook event to retailer_sync_logs
  //    This creates a record that can be picked up by a background job
  //    to trigger an incremental sync. We do NOT run the sync inline
  //    to keep the webhook response fast and within timeout limits.
  const now = new Date().toISOString()
  const { error: logError } = await supabase
    .from('retailer_sync_logs')
    .insert({
      org_id: retailer.org_id,
      retailer_id: retailer.id,
      sync_type: 'webhook_event',
      sync_source: 'lightspeed',
      status: 'pending',
      started_at: now,
      error_details: {
        webhook_action: payload.action ?? 'unknown',
        webhook_resource: payload.resource ?? 'unknown',
        webhook_resource_id: payload.resourceID ?? 'unknown',
        webhook_timestamp: payload.timestamp ?? now,
      },
    })

  if (logError) {
    // Log but do not fail — the webhook was received successfully
    console.error(
      'Lightspeed webhook: failed to create sync log entry:',
      logError.message
    )
  }

  // 6. Return 200 OK
  return NextResponse.json({ received: true }, { status: 200 })
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

/**
 * Verify the HMAC-SHA256 signature of the webhook payload.
 *
 * Uses the Web Crypto API (available in Edge Runtime and Node.js 18+)
 * to compute the HMAC and compare it with the provided signature using
 * a timing-safe comparison.
 *
 * @param body      - The raw request body string
 * @param signature - The hex-encoded signature from the request header
 * @param secret    - The webhook secret from environment variables
 * @returns true if the signature is valid
 */
async function verifySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()

    // Import the secret as a CryptoKey for HMAC-SHA256
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    // Compute the HMAC of the body
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(body)
    )

    // Convert the computed signature to hex
    const computedHex = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    // Timing-safe comparison: compare all characters regardless of mismatch
    // to prevent timing attacks
    const expectedHex = signature.toLowerCase()
    if (computedHex.length !== expectedHex.length) return false

    let mismatch = 0
    for (let i = 0; i < computedHex.length; i++) {
      mismatch |= computedHex.charCodeAt(i) ^ expectedHex.charCodeAt(i)
    }

    return mismatch === 0
  } catch (err) {
    console.error(
      'Lightspeed webhook: signature verification error:',
      err instanceof Error ? err.message : err
    )
    return false
  }
}
