'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  initiateCheckoutSchema,
  updateOrderStatusSchema,
  cancelOrderSchema,
} from '@/lib/validations/orders'
import { getCart } from '@/lib/dal/cart'
import { getOrderById, updateOrderStatus as dalUpdateOrderStatus } from '@/lib/dal/orders'
import { createHold, releaseHold } from '@/lib/dal/inventory-holds'
import {
  createCheckoutSession,
  createRefund,
} from '@/lib/stripe/checkout'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CART_COOKIE_NAME = 'medusa_cart_id'

/** Fixed delivery fee in cents ($9.99) */
const DELIVERY_FEE_CENTS = 999

/** Combined CA + LA County tax rate (9.5%) */
const TAX_RATE = 0.095

/**
 * Valid status transitions — keys are current status, values are the allowed
 * next statuses. Used by both updateOrderStatus and cancelOrder.
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
}

/** Statuses from which an order can still be cancelled. */
const CANCELLABLE_STATUSES = [
  'pending',
  'confirmed',
  'ready_for_pickup',
  'out_for_delivery',
]

// ---------------------------------------------------------------------------
// initiateCheckout — validate cart, create holds, create Stripe session
// ---------------------------------------------------------------------------

/**
 * Initiate the checkout flow for the current user's cart.
 *
 * Steps:
 * 1. Validate input (fulfillment type, address, age verification)
 * 2. Authenticate user
 * 3. Read cart from Medusa via cookie
 * 4. Calculate totals (subtotal, delivery fee, tax, total)
 * 5. Create inventory holds (admin client — holds table denies auth users)
 * 6. Create Stripe Checkout Session
 * 7. Return session ID and URL for client-side redirect
 */
export async function initiateCheckout(
  input: {
    fulfillmentType: 'pickup' | 'delivery'
    deliveryAddress?: {
      line1: string
      line2?: string
      city: string
      state: string
      zip: string
    } | null
    ageVerified: boolean
    notes?: string
  }
) {
  // 1. Zod validate
  const parsed = initiateCheckoutSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Business rules: delivery requires address, age must be verified
  if (parsed.data.fulfillmentType === 'delivery' && !parsed.data.deliveryAddress) {
    return { error: 'Delivery address is required for delivery orders' }
  }

  if (!parsed.data.ageVerified) {
    return {
      error:
        'Age verification required. You must be 21+ to purchase alcohol.',
    }
  }

  // 3. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 4. Read cart from cookie
  const cookieStore = await cookies()
  const cartId = cookieStore.get(CART_COOKIE_NAME)?.value
  if (!cartId) {
    return { error: 'No items in cart' }
  }

  // 5. Fetch cart from Medusa
  const { data: cart, error: cartError } = await getCart(cartId)
  if (cartError || !cart) {
    return { error: 'Failed to load cart. Please try again.' }
  }

  // Extract line items from the Medusa cart
  const cartItems = (cart.items ?? cart.line_items ?? []) as Array<{
    id?: string
    variant_id?: string
    title?: string
    unit_price?: number
    quantity?: number
    metadata?: Record<string, unknown>
  }>

  if (cartItems.length === 0) {
    return { error: 'Your cart is empty' }
  }

  // 6. Calculate totals (all in cents)
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.unit_price ?? 0
    const qty = item.quantity ?? 1
    return sum + price * qty
  }, 0)

  const deliveryFee =
    parsed.data.fulfillmentType === 'delivery' ? DELIVERY_FEE_CENTS : 0
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + deliveryFee + tax

  // 7. Determine retailer org ID from cart metadata or sales channel
  const retailerOrgId = (
    cart.metadata?.retailer_org_id ??
    cart.sales_channel_id ??
    cart.sales_channel?.id ??
    null
  ) as string | null

  if (!retailerOrgId) {
    return { error: 'Unable to determine retailer for this cart' }
  }

  // 8. Create inventory holds (admin client — holds table blocks auth users)
  const adminClient = createAdminClient()
  const holdIds: string[] = []

  for (const item of cartItems) {
    const wineId = (item.variant_id ?? item.metadata?.wine_id ?? '') as string
    const quantity = item.quantity ?? 1

    if (!wineId) {
      // Release any holds we already created before returning error
      for (const holdId of holdIds) {
        await releaseHold(adminClient, holdId)
      }
      return { error: 'Cart item is missing wine reference' }
    }

    const { data: hold, error: holdError } = await createHold(adminClient, {
      wineId,
      retailerOrgId,
      userId: user.id,
      quantity,
    })

    if (holdError || !hold) {
      // Release any holds we already created before returning error
      for (const holdId of holdIds) {
        await releaseHold(adminClient, holdId)
      }
      return { error: 'Failed to reserve inventory. Please try again.' }
    }

    holdIds.push(hold.id)
  }

  // 9. Build line items for Stripe
  const stripeLineItems = cartItems.map((item) => ({
    name: (item.title ?? 'Wine') as string,
    unitPrice: item.unit_price ?? 0,
    quantity: item.quantity ?? 1,
    wineId: (item.variant_id ?? item.metadata?.wine_id ?? '') as string,
  }))

  // Fetch user email for Stripe (best-effort)
  const customerEmail = user.email ?? undefined

  // Build success/cancel URLs
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const successUrl = `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  const cancelUrl = `${appUrl}/checkout/cancelled?session_id={CHECKOUT_SESSION_ID}`

  // 10. Create Stripe Checkout Session
  const { data: session, error: stripeError } = await createCheckoutSession({
    lineItems: stripeLineItems,
    deliveryFee,
    tax,
    successUrl,
    cancelUrl,
    metadata: {
      userId: user.id,
      medusaCartId: cartId,
      retailerOrgId,
    },
    customerEmail,
  })

  if (stripeError || !session) {
    // Release holds on Stripe failure
    for (const holdId of holdIds) {
      await releaseHold(adminClient, holdId)
    }
    console.error('initiateCheckout: Stripe session creation failed:', stripeError)
    return { error: 'Failed to create checkout session. Please try again.' }
  }

  // Update holds with the Stripe checkout session ID for webhook correlation
  for (const holdId of holdIds) {
    await adminClient
      .from('inventory_holds')
      .update({ stripe_checkout_session_id: session.sessionId })
      .eq('id', holdId)
  }

  return {
    data: {
      sessionId: session.sessionId,
      sessionUrl: session.sessionUrl,
    },
  }
}

// ---------------------------------------------------------------------------
// updateOrderStatusAction — transition order status (retailer action)
// ---------------------------------------------------------------------------

/**
 * Update an order's status. Only available to members of the retailer
 * organization that the order belongs to. Validates the status transition
 * against VALID_TRANSITIONS.
 */
export async function updateOrderStatusAction(
  input: {
    orderId: string
    status: 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'
    notes?: string
  }
) {
  // 1. Zod validate
  const parsed = updateOrderStatusSchema.safeParse(input)
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

  // 3. Fetch the order
  const { data: order, error: orderError } = await getOrderById(
    supabase,
    parsed.data.orderId
  )
  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // 4. Check user is a member of the order's organization
  const { data: membership, error: membershipError } = await supabase
    .from('memberships')
    .select('id, role')
    .eq('org_id', order.org_id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (membershipError || !membership) {
    return { error: 'You do not have permission to manage this order' }
  }

  // 5. Validate the status transition
  const currentStatus = order.status
  const allowedTransitions = VALID_TRANSITIONS[currentStatus]

  if (!allowedTransitions || !allowedTransitions.includes(parsed.data.status)) {
    return {
      error: `Cannot transition order from "${currentStatus}" to "${parsed.data.status}"`,
    }
  }

  // 6. Update via DAL
  const { data: updatedOrder, error: updateError } = await dalUpdateOrderStatus(
    supabase,
    parsed.data.orderId,
    {
      status: parsed.data.status,
      changedBy: user.id,
      notes: parsed.data.notes,
    }
  )

  if (updateError || !updatedOrder) {
    console.error('updateOrderStatusAction failed:', updateError)
    return { error: 'Failed to update order status' }
  }

  // 7. Revalidate
  revalidatePath('/(app)/[orgSlug]', 'layout')
  return { data: updatedOrder }
}

// ---------------------------------------------------------------------------
// cancelOrder — cancel an order with refund + hold release
// ---------------------------------------------------------------------------

/**
 * Cancel an order. Accessible to both the consumer who placed the order and
 * members of the retailer organization.
 *
 * If the order has been paid (stripe_payment_intent_id exists), a full refund
 * is issued. Any active inventory holds for this order's checkout session are
 * released.
 */
export async function cancelOrder(
  input: {
    orderId: string
    reason?: string
  }
) {
  // 1. Zod validate
  const parsed = cancelOrderSchema.safeParse(input)
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

  // 3. Fetch the order
  const { data: order, error: orderError } = await getOrderById(
    supabase,
    parsed.data.orderId
  )
  if (orderError || !order) {
    return { error: 'Order not found' }
  }

  // 4. Verify the user has permission to cancel
  //    Either the consumer who placed the order or an org member
  const isConsumer = order.user_id === user.id

  let isOrgMember = false
  if (!isConsumer) {
    const { data: membership } = await supabase
      .from('memberships')
      .select('id')
      .eq('org_id', order.org_id)
      .eq('user_id', user.id)
      .maybeSingle()

    isOrgMember = !!membership
  }

  if (!isConsumer && !isOrgMember) {
    return { error: 'You do not have permission to cancel this order' }
  }

  // 5. Check the order is in a cancellable state
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return {
      error: `Cannot cancel an order with status "${order.status}"`,
    }
  }

  // 6. If payment was captured, issue a Stripe refund
  if (order.stripe_payment_intent_id) {
    const { error: refundError } = await createRefund(
      order.stripe_payment_intent_id,
      parsed.data.reason
    )

    if (refundError) {
      console.error('cancelOrder: refund failed:', refundError)
      return {
        error: 'Failed to process refund. Please contact support.',
      }
    }
  }

  // 7. Release any active inventory holds for this order's checkout session
  if (order.stripe_checkout_session_id) {
    const adminClient = createAdminClient()

    // Query all active holds tied to this checkout session
    const { data: activeHolds } = await adminClient
      .from('inventory_holds')
      .select('id')
      .eq('stripe_checkout_session_id', order.stripe_checkout_session_id)
      .eq('status', 'active')

    if (activeHolds && activeHolds.length > 0) {
      for (const hold of activeHolds) {
        await releaseHold(adminClient, hold.id)
      }
    }
  }

  // 8. Transition the order to cancelled
  const cancelNotes = parsed.data.reason
    ? `Cancelled: ${parsed.data.reason}`
    : 'Order cancelled'

  const { data: cancelledOrder, error: updateError } = await dalUpdateOrderStatus(
    supabase,
    parsed.data.orderId,
    {
      status: 'cancelled',
      changedBy: user.id,
      notes: cancelNotes,
    }
  )

  if (updateError || !cancelledOrder) {
    console.error('cancelOrder: status update failed:', updateError)
    return { error: 'Failed to cancel order' }
  }

  // 9. Revalidate
  revalidatePath('/(app)/[orgSlug]', 'layout')
  return { data: { success: true } }
}
