'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { submitTasteFeedbackSchema } from '@/lib/validations/order-tracking'
import { getOrderById } from '@/lib/dal/orders'
import { getFeedbackByOrder, createFeedback } from '@/lib/dal/order-taste-feedback'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// submitTasteFeedback — submit taste ratings for wines in a completed order
// ---------------------------------------------------------------------------

export async function submitTasteFeedback(
  input: {
    orderId: string
    items: Array<{
      orderItemId: string
      wineId: string
      sentiment: 'positive' | 'negative'
      note?: string
    }>
  }
) {
  // 1. Zod validate
  const parsed = submitTasteFeedbackSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch the order and verify ownership + status
  const { data: order, error: orderError } = await getOrderById(
    supabase,
    parsed.data.orderId
  )
  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  if (order.user_id !== user.id) {
    return { error: 'You can only rate wines from your own orders' }
  }

  if (order.status !== 'completed') {
    return { error: 'You can only rate wines from completed orders' }
  }

  // 4. Check if feedback already submitted
  const { data: existing } = await getFeedbackByOrder(supabase, parsed.data.orderId)
  if (existing && existing.length > 0) {
    return { error: 'You have already submitted feedback for this order' }
  }

  // 5. Create feedback records
  const feedbackItems = parsed.data.items.map((item) => ({
    orderId: parsed.data.orderId,
    orderItemId: item.orderItemId,
    wineId: item.wineId,
    userId: user.id,
    orgId: order.org_id,
    sentiment: item.sentiment,
    note: item.note,
  }))

  const { error: createError } = await createFeedback(supabase, feedbackItems)
  if (createError) {
    return { error: 'Failed to submit feedback. Please try again.' }
  }

  // 6. Revalidate
  revalidatePath(`/orders/${parsed.data.orderId}`)
  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// reorderFromHistory — check availability and return items for reordering
// ---------------------------------------------------------------------------

export async function reorderFromHistory(orderId: string) {
  // 1. Validate
  const parsed = z.string().uuid().safeParse(orderId)
  if (!parsed.success) {
    return { status: 'error' as const, message: 'Invalid order ID' }
  }

  // 2. Auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { status: 'error' as const, message: 'Not authenticated' }
  }

  // 3. Fetch order with items + wine details
  const { data: order, error: orderError } = await getOrderById(supabase, parsed.data)
  if (orderError || !order) {
    return { status: 'error' as const, message: 'Order not found' }
  }

  if (order.user_id !== user.id) {
    return { status: 'error' as const, message: 'You can only reorder your own orders' }
  }

  // 4. Check retailer is still active
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('id, name')
    .eq('id', order.org_id)
    .single()

  if (orgError || !org) {
    return {
      status: 'retailer_unavailable' as const,
      retailerName: 'this retailer',
    }
  }

  // 5. Check inventory availability for each wine
  const orderItems = (order.order_items ?? []) as Array<{
    id: string
    wine_id: string
    quantity: number
    unit_price: number
    wine?: {
      id: string
      name: string
      slug: string
      image_url: string | null
      varietal: string | null
      vintage: string | null
    } | null
  }>

  if (orderItems.length === 0) {
    return { status: 'error' as const, message: 'Order has no items' }
  }

  // Get wine IDs from order items
  const wineIds = orderItems.map((item) => item.wine_id)

  // Check retailer_inventory for current availability
  const { data: inventoryItems } = await supabase
    .from('retailer_inventory')
    .select('wine_id, stock_status, price')
    .eq('org_id', order.org_id)
    .in('wine_id', wineIds)

  const inventoryMap = new Map(
    (inventoryItems ?? []).map((inv) => [inv.wine_id, inv])
  )

  // 6. Build result items
  const items = orderItems.map((item) => {
    const inv = inventoryMap.get(item.wine_id)
    const wine = item.wine as {
      id: string
      name: string
      slug: string
      image_url: string | null
    } | null

    return {
      wineId: item.wine_id,
      wineName: wine?.name ?? 'Unknown Wine',
      wineSlug: wine?.slug ?? '',
      wineImage: wine?.image_url ?? null,
      producerName: '', // Producer name not in the select — client can fill
      price: inv?.price ?? item.unit_price,
      quantity: item.quantity,
      available: !!inv && inv.stock_status === 'in_stock',
    }
  })

  const availableCount = items.filter((i) => i.available).length

  if (availableCount === 0) {
    // All items unavailable but retailer exists — show partial with nothing available
    return {
      status: 'partial' as const,
      items,
      retailerOrgId: order.org_id,
      retailerName: org.name,
    }
  }

  return {
    status: availableCount === items.length ? 'all_available' as const : 'partial' as const,
    items,
    retailerOrgId: order.org_id,
    retailerName: org.name,
  }
}
