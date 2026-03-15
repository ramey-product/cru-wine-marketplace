import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Select constants
// ---------------------------------------------------------------------------

/** Order with items (including wine details), status history, and org info. */
const ORDER_WITH_TRACKING_SELECT = `
  id,
  org_id,
  user_id,
  status,
  fulfillment_type,
  delivery_address,
  delivery_fee,
  subtotal,
  tax,
  total,
  estimated_ready_at,
  notes,
  age_verified,
  created_at,
  updated_at,
  order_items(
    id,
    wine_id,
    quantity,
    unit_price,
    subtotal,
    wine:wines(id, name, slug, image_url, producer, varietal, vintage)
  ),
  order_status_history(
    id,
    status,
    changed_by,
    notes,
    created_at
  ),
  organization:organizations(
    id,
    name,
    slug,
    phone,
    email
  )
` as const

/** Lightweight select for polling fallback. */
const ORDER_STATUS_SELECT = `
  id,
  status,
  updated_at
` as const

/** Active order select — enough for list views and nav wing. */
const ACTIVE_ORDER_SELECT = `
  id,
  org_id,
  status,
  fulfillment_type,
  subtotal,
  total,
  estimated_ready_at,
  created_at,
  updated_at,
  order_items(id),
  organization:organizations(id, name)
` as const

// ---------------------------------------------------------------------------
// getOrderWithTracking — full order detail for tracking screen
// ---------------------------------------------------------------------------

/**
 * Retrieve a single order with items (including wine details), full status
 * history, and organization (retailer) info for the tracking screen.
 */
export async function getOrderWithTracking(
  client: TypedClient,
  orderId: string
) {
  const { data, error } = await client
    .from('orders')
    .select(ORDER_WITH_TRACKING_SELECT)
    .eq('id', orderId)
    .order('created_at', {
      ascending: false,
      referencedTable: 'order_status_history',
    })
    .single()

  if (error) {
    console.error('getOrderWithTracking query failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getActiveOrdersByUser — non-terminal orders for list views and nav
// ---------------------------------------------------------------------------

/**
 * Retrieve all active (non-completed, non-cancelled) orders for a user,
 * sorted by most recently updated. Used for the orders list, Commerce Hub,
 * and the nav island order wing.
 */
export async function getActiveOrdersByUser(
  client: TypedClient,
  userId: string
) {
  const { data, error } = await client
    .from('orders')
    .select(ACTIVE_ORDER_SELECT)
    .eq('user_id', userId)
    .not('status', 'in', '("completed","cancelled")')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('getActiveOrdersByUser query failed:', error)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// getOrderStatusHistory — chronological status events
// ---------------------------------------------------------------------------

/**
 * Retrieve the full status history for an order, most recent first.
 */
export async function getOrderStatusHistory(
  client: TypedClient,
  orderId: string
) {
  const { data, error } = await client
    .from('order_status_history')
    .select('id, status, changed_by, notes, created_at')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getOrderStatusHistory query failed:', error)
    return { data: [], error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// getOrderCurrentStatus — lightweight query for polling fallback
// ---------------------------------------------------------------------------

/**
 * Lightweight query returning just the current status and updated_at.
 * Used by the useOrderStatus hook's polling fallback.
 */
export async function getOrderCurrentStatus(
  client: TypedClient,
  orderId: string
) {
  const { data, error } = await client
    .from('orders')
    .select(ORDER_STATUS_SELECT)
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('getOrderCurrentStatus query failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}
