'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { submitTasteFeedbackSchema } from '@/lib/validations/order-tracking'
import { getOrderById } from '@/lib/dal/orders'
import { getFeedbackByOrder, createFeedback } from '@/lib/dal/order-taste-feedback'

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
