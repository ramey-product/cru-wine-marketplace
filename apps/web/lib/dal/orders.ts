import type { TypedClient, PaginatedResult } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Select constants
// ---------------------------------------------------------------------------

/** Basic order fields (no joins). */
const ORDER_SELECT = `
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
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  medusa_cart_id,
  medusa_order_id,
  estimated_ready_at,
  notes,
  age_verified,
  created_at,
  updated_at
` as const

/** Order with nested items (including wine details) and status history. */
const ORDER_WITH_DETAILS_SELECT = `
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
  stripe_checkout_session_id,
  stripe_payment_intent_id,
  medusa_cart_id,
  medusa_order_id,
  estimated_ready_at,
  notes,
  age_verified,
  created_at,
  updated_at,
  order_items(
    *,
    wine:wines(id, name, slug, image_url, varietal, vintage)
  ),
  order_status_history(*)
` as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderPaginationOptions {
  limit?: number
  offset?: number
  status?: string
}

interface CreateOrderInput {
  orgId: string
  userId: string
  status?: string
  fulfillmentType: 'pickup' | 'delivery'
  deliveryAddress?: Record<string, unknown> | null
  deliveryFee?: number
  subtotal: number
  tax: number
  total: number
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  medusaCartId?: string
  medusaOrderId?: string
  estimatedReadyAt?: string
  notes?: string
  ageVerified?: boolean
  items: Array<{
    wineId: string
    quantity: number
    unitPrice: number
    subtotal: number
    medusaLineItemId?: string
  }>
}

interface UpdateOrderStatusInput {
  status: string
  changedBy?: string
  notes?: string
}

// ---------------------------------------------------------------------------
// getOrdersByUser -- paginated orders for a specific consumer
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated orders for a specific user, sorted by most recent first.
 * Supports optional status filtering.
 */
export async function getOrdersByUser(
  client: TypedClient,
  userId: string,
  options: OrderPaginationOptions = {}
): Promise<PaginatedResult<unknown>> {
  const { limit = 20, offset = 0, status } = options
  const page = Math.floor(offset / limit) + 1
  const from = offset
  const to = from + limit - 1

  let query = client
    .from('orders')
    .select(ORDER_SELECT, { count: 'exact' })
    .eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getOrdersByUser query failed:', error)
    return { data: [], total: 0, page, per_page: limit }
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    per_page: limit,
  }
}

// ---------------------------------------------------------------------------
// getOrderById -- single order with items and status history
// ---------------------------------------------------------------------------

/**
 * Retrieve a single order by ID with nested order items (including wine
 * details) and the full status history ordered chronologically.
 */
export async function getOrderById(client: TypedClient, orderId: string) {
  const { data, error } = await client
    .from('orders')
    .select(ORDER_WITH_DETAILS_SELECT)
    .eq('id', orderId)
    .order('created_at', {
      ascending: true,
      referencedTable: 'order_status_history',
    })
    .single()

  if (error) {
    console.error('getOrderById query failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// getOrdersByOrg -- paginated orders for a retailer organization
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated orders for a specific organization (retailer view).
 * Supports optional status filtering. Sorted by most recent first.
 */
export async function getOrdersByOrg(
  client: TypedClient,
  orgId: string,
  options: OrderPaginationOptions = {}
): Promise<PaginatedResult<unknown>> {
  const { limit = 20, offset = 0, status } = options
  const page = Math.floor(offset / limit) + 1
  const from = offset
  const to = from + limit - 1

  let query = client
    .from('orders')
    .select(ORDER_SELECT, { count: 'exact' })
    .eq('org_id', orgId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('getOrdersByOrg query failed:', error)
    return { data: [], total: 0, page, per_page: limit }
  }

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    per_page: limit,
  }
}

// ---------------------------------------------------------------------------
// getOrderByPaymentIntent -- lookup by Stripe payment intent ID
// ---------------------------------------------------------------------------

/**
 * Look up an order by its Stripe payment intent ID.
 * Used in Stripe webhook handlers to correlate payment events with orders.
 * Returns null (not an error) when no order matches.
 */
export async function getOrderByPaymentIntent(
  client: TypedClient,
  paymentIntentId: string
) {
  const { data, error } = await client
    .from('orders')
    .select(ORDER_SELECT)
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (error) {
    console.error('getOrderByPaymentIntent query failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// createOrder -- insert order + items + initial status history
// ---------------------------------------------------------------------------

/**
 * Create a new order with its line items and an initial status history entry.
 *
 * Performs three sequential inserts:
 * 1. Insert the order row and get its ID
 * 2. Insert all order items with the order ID
 * 3. Insert the initial status history entry ('pending' / 'Order placed')
 *
 * Returns the complete order with nested items on success.
 */
export async function createOrder(client: TypedClient, input: CreateOrderInput) {
  // 1. Insert the order row
  const { data: order, error: orderError } = await client
    .from('orders')
    .insert({
      org_id: input.orgId,
      user_id: input.userId,
      status: input.status ?? 'pending',
      fulfillment_type: input.fulfillmentType,
      delivery_address: (input.deliveryAddress ?? null) as import('@/types/database').Json,
      delivery_fee: input.deliveryFee ?? 0,
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
      stripe_checkout_session_id: input.stripeCheckoutSessionId ?? null,
      stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
      medusa_cart_id: input.medusaCartId ?? null,
      medusa_order_id: input.medusaOrderId ?? null,
      estimated_ready_at: input.estimatedReadyAt ?? null,
      notes: input.notes ?? null,
      age_verified: input.ageVerified ?? false,
    })
    .select(ORDER_SELECT)
    .single()

  if (orderError) {
    console.error('createOrder: order insert failed:', orderError)
    return { data: null, error: orderError }
  }

  // 2. Insert order items
  const itemRows = input.items.map((item) => ({
    order_id: order.id,
    wine_id: item.wineId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    subtotal: item.subtotal,
    medusa_line_item_id: item.medusaLineItemId ?? null,
  }))

  const { data: items, error: itemsError } = await client
    .from('order_items')
    .insert(itemRows)
    .select('*')

  if (itemsError) {
    console.error('createOrder: order items insert failed:', itemsError)
    return { data: null, error: itemsError }
  }

  // 3. Insert initial status history entry
  const { error: historyError } = await client
    .from('order_status_history')
    .insert({
      order_id: order.id,
      status: input.status ?? 'pending',
      changed_by: input.userId,
      notes: 'Order placed',
    })

  if (historyError) {
    console.error('createOrder: status history insert failed:', historyError)
    // Non-fatal: order and items exist, history is supplementary
  }

  return {
    data: { ...order, order_items: items ?? [] },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// updateOrderStatus -- transition order status with audit trail
// ---------------------------------------------------------------------------

/**
 * Update an order's status and append an entry to the status history audit log.
 *
 * Performs two sequential operations:
 * 1. Update the order's status field
 * 2. Insert a new status history row
 *
 * Returns the updated order on success.
 */
export async function updateOrderStatus(
  client: TypedClient,
  orderId: string,
  input: UpdateOrderStatusInput
) {
  // 1. Update the order status
  const { data: order, error: updateError } = await client
    .from('orders')
    .update({ status: input.status })
    .eq('id', orderId)
    .select(ORDER_SELECT)
    .single()

  if (updateError) {
    console.error('updateOrderStatus: order update failed:', updateError)
    return { data: null, error: updateError }
  }

  // 2. Insert status history entry
  const { error: historyError } = await client
    .from('order_status_history')
    .insert({
      order_id: orderId,
      status: input.status,
      changed_by: input.changedBy ?? null,
      notes: input.notes ?? null,
    })

  if (historyError) {
    console.error('updateOrderStatus: status history insert failed:', historyError)
    // Non-fatal: the status update succeeded, history is supplementary
  }

  return { data: order, error: null }
}
