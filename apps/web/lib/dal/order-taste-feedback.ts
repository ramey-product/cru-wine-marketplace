import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedClient = SupabaseClient<Database>

// ---------------------------------------------------------------------------
// getFeedbackByOrder — check if feedback exists for an order
// ---------------------------------------------------------------------------

export async function getFeedbackByOrder(
  client: TypedClient,
  orderId: string
) {
  // Table added by migration 20260315000002 — not yet in generated types
  const { data, error } = await (client as any)
    .from('order_taste_feedback')
    .select('id, order_item_id, wine_id, sentiment, note, created_at')
    .eq('order_id', orderId)

  if (error) {
    console.error('getFeedbackByOrder query failed:', error)
    return { data: null, error }
  }

  return { data: (data ?? []) as Array<{
    id: string
    order_item_id: string
    wine_id: string
    sentiment: 'positive' | 'negative'
    note: string | null
    created_at: string
  }>, error: null }
}

// ---------------------------------------------------------------------------
// createFeedback — insert taste feedback records
// ---------------------------------------------------------------------------

interface CreateFeedbackInput {
  orderId: string
  orderItemId: string
  wineId: string
  userId: string
  orgId: string
  sentiment: 'positive' | 'negative'
  note?: string
}

export async function createFeedback(
  client: TypedClient,
  items: CreateFeedbackInput[]
) {
  const rows = items.map((item) => ({
    order_id: item.orderId,
    order_item_id: item.orderItemId,
    wine_id: item.wineId,
    user_id: item.userId,
    org_id: item.orgId,
    sentiment: item.sentiment,
    note: item.note ?? null,
  }))

  // Table added by migration 20260315000002 — not yet in generated types
  const { data, error } = await (client as any)
    .from('order_taste_feedback')
    .insert(rows)
    .select()

  if (error) {
    console.error('createFeedback insert failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
