import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// getRetailerOrders — paginated orders for a retailer
// Orders are linked via org_id (orders.org_id matches the retailer's org_id).
// ---------------------------------------------------------------------------

export async function getRetailerOrders(
  client: TypedClient,
  retailerId: string,
  filters?: { status?: string; limit?: number; offset?: number }
) {
  // First get the retailer's org_id
  const { data: retailer, error: retailerError } = await client
    .from('retailers')
    .select('org_id')
    .eq('id', retailerId)
    .single()

  if (retailerError || !retailer) {
    return { data: null, error: retailerError ?? new Error('Retailer not found') }
  }

  let query = client
    .from('orders')
    .select('*, order_items(id), profiles!orders_user_id_fkey(display_name)', {
      count: 'exact',
    })
    .eq('org_id', retailer.org_id)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const limit = filters?.limit ?? 20
  const offset = filters?.offset ?? 0
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    return { data: null, error }
  }

  const orders = (data ?? []).map((order) => ({
    ...order,
    item_count: Array.isArray(order.order_items) ? order.order_items.length : 0,
    customer_display_name:
      (order.profiles as { display_name: string | null } | null)?.display_name ?? null,
  }))

  return { data: orders, count: count ?? 0, error: null }
}

// ---------------------------------------------------------------------------
// getRetailerOrderDetail — single order with items and customer info
// ---------------------------------------------------------------------------

export async function getRetailerOrderDetail(
  client: TypedClient,
  retailerId: string,
  orderId: string
) {
  // Verify the order belongs to this retailer's org
  const { data: retailer, error: retailerError } = await client
    .from('retailers')
    .select('org_id')
    .eq('id', retailerId)
    .single()

  if (retailerError || !retailer) {
    return { data: null, error: retailerError ?? new Error('Retailer not found') }
  }

  const { data, error } = await client
    .from('orders')
    .select(
      '*, order_items(*, wines(name)), profiles!orders_user_id_fkey(full_name)'
    )
    .eq('id', orderId)
    .eq('org_id', retailer.org_id)
    .single()

  if (error) {
    return { data: null, error }
  }

  // Format customer name as first name + last initial
  const fullName =
    (data.profiles as { full_name: string | null } | null)?.full_name ?? null
  let customerName: string | null = null
  if (fullName) {
    const parts = fullName.trim().split(/\s+/)
    customerName =
      parts.length > 1
        ? `${parts[0]} ${parts[parts.length - 1]![0]}.`
        : parts[0] ?? null
  }

  return {
    data: {
      ...data,
      customer_name: customerName,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// getRetailerOrderStats — count of orders by status for dashboard badges
// ---------------------------------------------------------------------------

export async function getRetailerOrderStats(
  client: TypedClient,
  retailerId: string
) {
  const { data: retailer, error: retailerError } = await client
    .from('retailers')
    .select('org_id')
    .eq('id', retailerId)
    .single()

  if (retailerError || !retailer) {
    return { data: null, error: retailerError ?? new Error('Retailer not found') }
  }

  const { data, error } = await client
    .from('orders')
    .select('status')
    .eq('org_id', retailer.org_id)

  if (error) {
    return { data: null, error }
  }

  const stats: Record<string, number> = {}
  for (const row of data ?? []) {
    stats[row.status] = (stats[row.status] ?? 0) + 1
  }

  return { data: stats, error: null }
}

// ---------------------------------------------------------------------------
// updateOrderStatus — update order status + insert into order_status_history
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  client: TypedClient,
  orderId: string,
  orgId: string,
  status: string,
  changedBy: string,
  notes?: string
) {
  // Update the order status — filter by both id and org_id for authorization safety
  const { data, error: updateError } = await client
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .eq('org_id', orgId)
    .select()
    .single()

  if (updateError) {
    return { data: null, error: updateError }
  }

  // Insert into order_status_history
  const { error: historyError } = await client
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status,
      changed_by: changedBy,
      notes: notes ?? null,
    })

  if (historyError) {
    // Log but don't fail the whole operation — the status update already succeeded
    console.error('Failed to insert order_status_history:', historyError)
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getOrderSlaStatus — pure function, no client needed
// pending < 60min = ok, 60-120min = warning, > 120min = critical
// ---------------------------------------------------------------------------

export function getOrderSlaStatus(
  createdAt: string
): 'ok' | 'warning' | 'critical' {
  const createdMs = new Date(createdAt).getTime()
  const nowMs = Date.now()
  const diffMinutes = (nowMs - createdMs) / (1000 * 60)

  if (diffMinutes < 60) return 'ok'
  if (diffMinutes < 120) return 'warning'
  return 'critical'
}
