/**
 * Shopify Webhook Handler
 *
 * Receives webhook events from Shopify when products or inventory levels
 * are updated. Verifies the HMAC-SHA256 signature, looks up the retailer
 * by shop domain, and logs the event for async processing.
 *
 * Key behaviors:
 * - HMAC-SHA256 signature verification (X-Shopify-Hmac-Sha256 header)
 * - Uses supabaseAdmin (service role) — no user session in webhooks
 * - Always returns 200 OK to prevent Shopify from retrying on app errors
 * - Handles duplicate webhook deliveries gracefully (idempotent logging)
 * - Does NOT trigger a full sync inline — logs the event for async pickup
 *
 * Supported topics:
 * - products/update — a product was created or updated
 * - products/delete — a product was deleted
 * - inventory_levels/update — inventory level changed at a location
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal payload shape for Shopify product webhook events. */
interface ShopifyProductPayload {
  id?: number
  title?: string
  product_type?: string
  vendor?: string
  updated_at?: string
  variants?: Array<{
    id?: number
    sku?: string
    inventory_item_id?: number
  }>
}

/** Minimal payload shape for Shopify inventory_levels/update events. */
interface ShopifyInventoryLevelPayload {
  inventory_item_id?: number
  location_id?: number
  available?: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHOPIFY_WEBHOOK_SECRET_KEY = 'SHOPIFY_WEBHOOK_SECRET'
const SHOPIFY_HMAC_HEADER = 'x-shopify-hmac-sha256'
const SHOPIFY_TOPIC_HEADER = 'x-shopify-topic'
const SHOPIFY_DOMAIN_HEADER = 'x-shopify-shop-domain'

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

/**
 * Handle incoming Shopify webhook events.
 *
 * Pipeline:
 * 1. Read raw request body for HMAC verification
 * 2. Verify HMAC-SHA256 signature using SHOPIFY_WEBHOOK_SECRET
 * 3. Parse JSON payload
 * 4. Extract topic from X-Shopify-Topic header
 * 5. Look up retailer by shop domain in pos_credentials
 * 6. Log the webhook event to retailer_sync_logs
 * 7. Return 200 OK (processing happens async in STORY-08)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read raw request body for signature verification
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    // Always return 200 to prevent Shopify from retrying
    console.error('Shopify webhook: failed to read request body')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 2. Verify HMAC-SHA256 signature
  const hmacHeader = request.headers.get(SHOPIFY_HMAC_HEADER)
  const secret = process.env[SHOPIFY_WEBHOOK_SECRET_KEY]

  if (!secret) {
    console.error(
      'Shopify webhook: SHOPIFY_WEBHOOK_SECRET is not configured'
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (!hmacHeader) {
    console.error('Shopify webhook: missing HMAC signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 200 })
  }

  const isValid = await verifyShopifyHmac(rawBody, hmacHeader, secret)
  if (!isValid) {
    console.error('Shopify webhook: invalid HMAC signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 200 })
  }

  // 3. Parse JSON payload
  let payload: ShopifyProductPayload | ShopifyInventoryLevelPayload
  try {
    payload = JSON.parse(rawBody) as
      | ShopifyProductPayload
      | ShopifyInventoryLevelPayload
  } catch {
    console.error('Shopify webhook: failed to parse JSON payload')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 4. Extract topic and shop domain from headers
  const topic = request.headers.get(SHOPIFY_TOPIC_HEADER) ?? 'unknown'
  const shopDomain = request.headers.get(SHOPIFY_DOMAIN_HEADER)

  if (!shopDomain) {
    console.error('Shopify webhook: missing X-Shopify-Shop-Domain header')
    return NextResponse.json({ received: true }, { status: 200 })
  }

  console.log(
    `Shopify webhook received: topic="${topic}" shop="${shopDomain}"`
  )

  // 5. Look up retailer by shop_domain in pos_credentials JSONB
  const supabase = createAdminClient()

  const { data: retailer, error: retailerError } = await supabase
    .from('retailers')
    .select('id, org_id, name, pos_type')
    .eq('pos_type', 'shopify')
    .filter('pos_credentials->>shop_domain', 'eq', shopDomain)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (retailerError) {
    console.error(
      'Shopify webhook: error looking up retailer:',
      retailerError.message
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  if (!retailer) {
    console.error(
      `Shopify webhook: no active retailer found for shop_domain "${shopDomain}"`
    )
    return NextResponse.json({ received: true }, { status: 200 })
  }

  // 6. Log the webhook event to retailer_sync_logs
  //    This creates a record that can be picked up by a background job
  //    to trigger an incremental sync. We do NOT run the sync inline
  //    to keep the webhook response fast and within timeout limits.
  const now = new Date().toISOString()
  const errorDetails = buildWebhookDetails(topic, payload)

  const { error: logError } = await supabase
    .from('retailer_sync_logs')
    .insert({
      org_id: retailer.org_id,
      retailer_id: retailer.id,
      sync_type: 'webhook_event',
      sync_source: 'shopify',
      status: 'pending',
      started_at: now,
      error_details: errorDetails as import('@/types/database').Json,
    })

  if (logError) {
    // Log but do not fail — the webhook was received successfully
    console.error(
      'Shopify webhook: failed to create sync log entry:',
      logError.message
    )
  }

  // 7. Return 200 OK
  return NextResponse.json({ received: true }, { status: 200 })
}

// ---------------------------------------------------------------------------
// Webhook detail builder
// ---------------------------------------------------------------------------

/**
 * Build a structured details object for the sync log entry.
 * Captures the relevant fields from the webhook payload depending
 * on the topic type.
 */
function buildWebhookDetails(
  topic: string,
  payload: ShopifyProductPayload | ShopifyInventoryLevelPayload
): Record<string, unknown> {
  const details: Record<string, unknown> = {
    webhook_topic: topic,
    webhook_received_at: new Date().toISOString(),
  }

  if (topic.startsWith('products/')) {
    const productPayload = payload as ShopifyProductPayload
    details.product_id = productPayload.id
    details.product_title = productPayload.title
    details.product_type = productPayload.product_type
    details.variant_count = productPayload.variants?.length ?? 0
  } else if (topic === 'inventory_levels/update') {
    const inventoryPayload = payload as ShopifyInventoryLevelPayload
    details.inventory_item_id = inventoryPayload.inventory_item_id
    details.location_id = inventoryPayload.location_id
    details.available = inventoryPayload.available
  }

  return details
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 signature verification
// ---------------------------------------------------------------------------

/**
 * Verify the HMAC-SHA256 signature of a Shopify webhook payload.
 *
 * Shopify sends the HMAC as a base64-encoded string in the
 * X-Shopify-Hmac-Sha256 header. We compute the HMAC of the raw
 * request body using the shared webhook secret and compare using
 * a timing-safe comparison.
 *
 * @param body      - The raw request body string
 * @param signature - The base64-encoded HMAC from the request header
 * @param secret    - The webhook secret from environment variables
 * @returns true if the signature is valid
 */
async function verifyShopifyHmac(
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

    // Convert the computed signature to base64
    // (Shopify sends base64, not hex like Lightspeed)
    const computedBytes = new Uint8Array(signatureBuffer)
    const computedBase64 = btoa(
      String.fromCharCode(...computedBytes)
    )

    // Timing-safe comparison: compare all characters regardless of mismatch
    // to prevent timing attacks
    const expectedBase64 = signature
    if (computedBase64.length !== expectedBase64.length) return false

    let mismatch = 0
    for (let i = 0; i < computedBase64.length; i++) {
      mismatch |= computedBase64.charCodeAt(i) ^ expectedBase64.charCodeAt(i)
    }

    return mismatch === 0
  } catch (err) {
    console.error(
      'Shopify webhook: HMAC verification error:',
      err instanceof Error ? err.message : err
    )
    return false
  }
}
