import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncWineToMedusa, type WineWebhookRow } from '@/lib/medusa/sync'

// ---------------------------------------------------------------------------
// Types for Supabase Database Webhook payload
// ---------------------------------------------------------------------------

interface SupabaseWebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  schema: string
  record: WineWebhookRow | null
  old_record: WineWebhookRow | null
}

// ---------------------------------------------------------------------------
// Webhook secret verification
// ---------------------------------------------------------------------------

function verifyWebhookSecret(req: NextRequest): boolean {
  const secret = process.env.SUPABASE_WEBHOOK_SECRET
  if (!secret) {
    // Fail closed: reject requests when secret is not configured.
    // In local development, set SUPABASE_WEBHOOK_SECRET in .env.local.
    console.error('SUPABASE_WEBHOOK_SECRET not set — rejecting webhook request')
    return false
  }

  const headerSecret = req.headers.get('x-webhook-secret')
  if (!headerSecret) {
    return false
  }

  // Timing-safe comparison to prevent timing attacks
  try {
    const a = Buffer.from(secret, 'utf-8')
    const b = Buffer.from(headerSecret, 'utf-8')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  // 1. Verify webhook authenticity
  if (!verifyWebhookSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse payload
  let payload: SupabaseWebhookPayload
  try {
    payload = (await req.json()) as SupabaseWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 3. Validate it's a wines table event with a record
  if (payload.table !== 'wines') {
    return NextResponse.json({ error: 'Unexpected table' }, { status: 400 })
  }

  if (payload.type === 'DELETE' || !payload.record) {
    // We don't sync deletes (Medusa product lifecycle managed separately)
    return NextResponse.json({ ok: true, skipped: true })
  }

  const wine = payload.record

  // 4. Sync to Medusa
  try {
    const result = await syncWineToMedusa(wine)

    // 5. Store medusa_product_id back on the wine row if it was just created
    if (result.action === 'created') {
      const supabase = createAdminClient()
      // TODO: Remove `as never` once Supabase types are regenerated with
      // the medusa_product_id column included in the Database type.
      const { error: updateError } = await supabase
        .from('wines')
        .update({ medusa_product_id: result.medusa_product_id } as never)
        .eq('id', wine.id)
        .eq('org_id', wine.org_id)

      if (updateError) {
        console.error(
          `Failed to store medusa_product_id on wine ${wine.id}:`,
          updateError
        )
        // The Medusa Product was created successfully, but we couldn't
        // store the back-reference. Log but still return success so the
        // webhook doesn't retry and create a duplicate Medusa Product.
        // A reconciliation job can fix orphaned references later.
      }
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('Wine sync to Medusa failed:', error)

    // Return 500 so Supabase can retry the webhook delivery.
    // Don't leak internal error details to the caller.
    return NextResponse.json(
      { error: 'Medusa sync failed' },
      { status: 500 }
    )
  }
}
