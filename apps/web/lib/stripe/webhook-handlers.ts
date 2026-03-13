/**
 * Stripe Webhook Handler Functions
 *
 * Each exported function handles a single Stripe event type. All handlers:
 *   - Use createAdminClient() because no user session exists in webhook context
 *   - Guard against duplicate deliveries (idempotency)
 *   - Return void — errors are thrown and caught by the route handler,
 *     which returns 500 to trigger Stripe's retry mechanism
 *
 * Handler responsibilities:
 *   handleCheckoutCompleted — create order + convert inventory hold + send emails
 *   handleChargeRefunded    — cancel order + release inventory hold
 *   handlePaymentFailed     — release inventory hold (no order exists yet)
 */

import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createOrder,
  updateOrderStatus,
  getOrderByPaymentIntent,
} from '@/lib/dal/orders'
import {
  getHoldsByCheckoutSession,
  convertHold,
  releaseHold,
} from '@/lib/dal/inventory-holds'
import { getCart } from '@/lib/dal/cart'
import {
  sendConsumerOrderConfirmation,
  sendRetailerNewOrderNotification,
} from '@/lib/email/order-notifications'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Safely extract the string ID from a Stripe field that may be a string
 * or an expanded object (e.g. `session.payment_intent`).
 */
function extractStripeId(
  field: string | { id: string } | null | undefined
): string | null {
  if (!field) return null
  if (typeof field === 'string') return field
  return field.id
}

// ---------------------------------------------------------------------------
// handleCheckoutCompleted
// ---------------------------------------------------------------------------

/**
 * Handle `checkout.session.completed` events.
 *
 * Flow:
 *  1. Guard against duplicate delivery — if an order already exists for
 *     this payment intent, log and return early.
 *  2. Fetch the Medusa cart to extract line items and fulfillment metadata.
 *  3. Create the order (status: 'pending', awaiting retailer confirmation).
 *  4. Convert any active inventory hold for this checkout session.
 *  5. Send confirmation emails to both the consumer and the retailer.
 *
 * @throws if any database write fails — route handler returns 500 → Stripe retries
 */
export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const supabaseAdmin = createAdminClient()

  // --- Extract and validate metadata set during session creation ---
  const { userId, medusaCartId, retailerOrgId } = session.metadata ?? {}

  if (!userId || !medusaCartId || !retailerOrgId) {
    // This is a programming error, not a transient failure — do not throw
    // so Stripe doesn't retry indefinitely.
    console.error(
      '[handleCheckoutCompleted] Missing required session metadata',
      {
        sessionId: session.id,
        hasUserId: !!userId,
        hasMedusaCartId: !!medusaCartId,
        hasRetailerOrgId: !!retailerOrgId,
      }
    )
    return
  }

  const paymentIntentId = extractStripeId(session.payment_intent)

  if (!paymentIntentId) {
    console.error(
      '[handleCheckoutCompleted] Session has no payment_intent — cannot create order',
      { sessionId: session.id }
    )
    return
  }

  // --- Idempotency guard ---
  // If an order already exists for this payment intent a previous delivery
  // of this event already processed it. Return without writing again.
  const { data: existingOrder, error: lookupError } =
    await getOrderByPaymentIntent(supabaseAdmin, paymentIntentId)

  if (lookupError) {
    // Treat lookup failure as a transient error so Stripe retries
    throw new Error(
      `[handleCheckoutCompleted] DB lookup failed for paymentIntent ${paymentIntentId}: ${lookupError.message}`
    )
  }

  if (existingOrder) {
    console.log(
      '[handleCheckoutCompleted] Duplicate delivery detected — order already exists',
      { orderId: existingOrder.id, paymentIntentId, sessionId: session.id }
    )
    return
  }

  // --- Fetch Medusa cart to extract line items ---
  const { data: cart, error: cartError } = await getCart(medusaCartId)

  if (cartError || !cart) {
    throw new Error(
      `[handleCheckoutCompleted] Failed to fetch Medusa cart ${medusaCartId}: ${cartError ?? 'cart not found'}`
    )
  }

  // Map Medusa line items to the shape expected by createOrder.
  // The cart shape is loosely typed (MedusaCart = Record<string, any>), so
  // we defensively fall back to safe defaults on missing fields.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cartItems: Array<any> = Array.isArray(cart.items) ? cart.items : []

  const orderItems = cartItems.map((item) => ({
    wineId: (item.variant?.metadata?.wine_id ?? item.metadata?.wine_id ?? '') as string,
    quantity: (item.quantity ?? 1) as number,
    unitPrice: (item.unit_price ?? 0) as number,
    subtotal: ((item.quantity ?? 1) * (item.unit_price ?? 0)) as number,
    medusaLineItemId: (item.id ?? undefined) as string | undefined,
  }))

  // Derive fulfillment type from cart metadata (set by the storefront on cart creation)
  const fulfillmentType: 'pickup' | 'delivery' =
    cart.metadata?.fulfillment_type === 'delivery' ? 'delivery' : 'pickup'

  // Use Stripe's verified totals — session amounts are in cents
  const amountTotal = session.amount_total ?? 0

  // Derive subtotal by subtracting delivery fee from total.
  // If no fee metadata exists, treat the entire amount as the subtotal.
  const deliveryFeeRaw = parseInt(
    (session.metadata?.delivery_fee as string | undefined) ?? '0',
    10
  )
  const deliveryFee = isNaN(deliveryFeeRaw) ? 0 : deliveryFeeRaw
  const taxRaw = parseInt(
    (session.metadata?.tax as string | undefined) ?? '0',
    10
  )
  const tax = isNaN(taxRaw) ? 0 : taxRaw
  const subtotal = amountTotal - deliveryFee - tax

  // Delivery address is stored in cart shipping_address if present
  const deliveryAddress =
    fulfillmentType === 'delivery' && cart.shipping_address
      ? (cart.shipping_address as Record<string, unknown>)
      : null

  // --- Create the order ---
  const { data: order, error: createError } = await createOrder(supabaseAdmin, {
    orgId: retailerOrgId,
    userId,
    status: 'pending',
    fulfillmentType,
    deliveryAddress,
    deliveryFee,
    subtotal,
    tax,
    total: amountTotal,
    stripeCheckoutSessionId: session.id,
    stripePaymentIntentId: paymentIntentId,
    medusaCartId,
    ageVerified: cart.metadata?.age_verified === true,
    items: orderItems,
  })

  if (createError || !order) {
    throw new Error(
      `[handleCheckoutCompleted] Order creation failed for session ${session.id}: ${createError?.message ?? 'unknown error'}`
    )
  }

  console.log(
    '[handleCheckoutCompleted] Order created',
    { orderId: order.id, sessionId: session.id, paymentIntentId }
  )

  // --- Convert inventory holds ---
  // A checkout session can have multiple holds (one per cart item).
  const { data: holds, error: holdLookupError } = await getHoldsByCheckoutSession(
    supabaseAdmin,
    session.id
  )

  if (holdLookupError) {
    // Non-fatal: order is created; log but do not throw
    console.error(
      '[handleCheckoutCompleted] Failed to look up inventory holds',
      { sessionId: session.id, error: holdLookupError.message }
    )
  } else if (holds.length > 0) {
    for (const hold of holds) {
      const { error: convertError } = await convertHold(supabaseAdmin, hold.id)
      if (convertError) {
        console.error(
          '[handleCheckoutCompleted] convertHold failed',
          { holdId: hold.id, error: convertError.message }
        )
      } else {
        console.log('[handleCheckoutCompleted] Inventory hold converted', {
          holdId: hold.id,
        })
      }
    }
  }

  // --- Send confirmation emails (stubs in V1) ---
  const customerEmail = session.customer_details?.email ?? ''
  const customerName = session.customer_details?.name ?? 'Customer'

  await sendConsumerOrderConfirmation({
    email: customerEmail,
    orderId: order.id,
    orderTotal: amountTotal,
    retailerName: cart.metadata?.retailer_name ?? 'Your retailer',
    fulfillmentType,
    estimatedReadyAt: order.estimated_ready_at ?? undefined,
  })

  // Retailer contact details may be stored in session metadata or cart metadata
  const retailerEmail =
    (session.metadata?.retailer_email as string | undefined) ??
    (cart.metadata?.retailer_email as string | undefined) ??
    ''

  await sendRetailerNewOrderNotification({
    retailerEmail,
    orderId: order.id,
    orderTotal: amountTotal,
    consumerName: customerName,
    fulfillmentType,
    itemCount: orderItems.length,
  })
}

// ---------------------------------------------------------------------------
// handleChargeRefunded
// ---------------------------------------------------------------------------

/**
 * Handle `charge.refunded` events.
 *
 * Updates the associated order status to 'cancelled' and releases any
 * active inventory hold. If no order is found for the payment intent the
 * charge may not have originated from the platform — log and skip.
 *
 * @throws if the order status update fails — route handler returns 500 → Stripe retries
 */
export async function handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
  const supabaseAdmin = createAdminClient()

  const paymentIntentId = extractStripeId(charge.payment_intent)

  if (!paymentIntentId) {
    console.warn(
      '[handleChargeRefunded] Charge has no payment_intent — skipping',
      { chargeId: charge.id }
    )
    return
  }

  // --- Look up the order ---
  const { data: order, error: lookupError } = await getOrderByPaymentIntent(
    supabaseAdmin,
    paymentIntentId
  )

  if (lookupError) {
    throw new Error(
      `[handleChargeRefunded] DB lookup failed for paymentIntent ${paymentIntentId}: ${lookupError.message}`
    )
  }

  if (!order) {
    // Refund may be for a charge not associated with a platform order
    console.warn(
      '[handleChargeRefunded] No order found for payment intent — skipping',
      { paymentIntentId, chargeId: charge.id }
    )
    return
  }

  // Idempotency: if the order is already cancelled, a previous webhook
  // delivery already handled this refund.
  if (order.status === 'cancelled') {
    console.log(
      '[handleChargeRefunded] Order already cancelled — duplicate delivery',
      { orderId: order.id, paymentIntentId }
    )
    return
  }

  // --- Update order to cancelled ---
  const refundedAmountDollars = ((charge.amount_refunded ?? 0) / 100).toFixed(2)
  const { error: updateError } = await updateOrderStatus(
    supabaseAdmin,
    order.id,
    {
      status: 'cancelled',
      notes: `Refunded $${refundedAmountDollars} via Stripe charge ${charge.id}`,
    }
  )

  if (updateError) {
    throw new Error(
      `[handleChargeRefunded] updateOrderStatus failed for order ${order.id}: ${updateError.message}`
    )
  }

  console.log('[handleChargeRefunded] Order cancelled', {
    orderId: order.id,
    chargeId: charge.id,
    refundedAmount: refundedAmountDollars,
  })

  // --- Release inventory hold if one exists ---
  // Holds are keyed to the checkout session, which is not directly on the
  // charge. Look it up via the order's stripe_checkout_session_id.
  const checkoutSessionId = order.stripe_checkout_session_id

  if (!checkoutSessionId) {
    console.log(
      '[handleChargeRefunded] No checkout session ID on order — skipping hold release',
      { orderId: order.id }
    )
    return
  }

  const { data: holds, error: holdLookupError } = await getHoldsByCheckoutSession(
    supabaseAdmin,
    checkoutSessionId
  )

  if (holdLookupError) {
    // Non-fatal: order is already cancelled; log for ops visibility
    console.error(
      '[handleChargeRefunded] Failed to look up inventory holds',
      { checkoutSessionId, error: holdLookupError.message }
    )
    return
  }

  for (const hold of holds) {
    if (hold.status !== 'active') {
      continue
    }
    const { error: releaseError } = await releaseHold(supabaseAdmin, hold.id)
    if (releaseError) {
      console.error('[handleChargeRefunded] releaseHold failed', {
        holdId: hold.id,
        error: releaseError.message,
      })
    } else {
      console.log('[handleChargeRefunded] Inventory hold released', {
        holdId: hold.id,
      })
    }
  }
}

// ---------------------------------------------------------------------------
// handlePaymentFailed
// ---------------------------------------------------------------------------

/**
 * Handle `payment_intent.payment_failed` events.
 *
 * No order has been created at this point (orders are only created on
 * `checkout.session.completed`). We attempt to release any active inventory
 * holds to free reserved stock immediately rather than waiting for the
 * 10-minute TTL expiry.
 *
 * The payment intent metadata contains `userId`, `medusaCartId`, and
 * `retailerOrgId` (set via `payment_intent_data.metadata` during session
 * creation). However, the checkout session ID is not available on the
 * payment intent. We use Stripe's API to retrieve the session from the PI,
 * then look up holds by session ID.
 */
export async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const supabaseAdmin = createAdminClient()

  const lastError = paymentIntent.last_payment_error

  console.warn('[handlePaymentFailed] Payment intent failed', {
    paymentIntentId: paymentIntent.id,
    errorCode: lastError?.code,
    errorMessage: lastError?.message,
    declineCode: lastError?.decline_code,
  })

  // Retrieve the checkout session that created this payment intent.
  // Stripe associates sessions with PIs but the PI object doesn't carry
  // the session ID directly — we need to list sessions for this PI.
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia',
  })

  let checkoutSessionId: string | null = null
  try {
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    })
    checkoutSessionId = sessions.data[0]?.id ?? null
  } catch (err) {
    console.error(
      '[handlePaymentFailed] Failed to retrieve checkout session from Stripe',
      { paymentIntentId: paymentIntent.id, error: err }
    )
  }

  if (!checkoutSessionId) {
    // Cannot locate holds without a session ID. They will expire via TTL.
    console.log(
      '[handlePaymentFailed] No checkout session found — holds will expire via 10-min TTL',
      { paymentIntentId: paymentIntent.id }
    )
    return
  }

  // --- Release all active inventory holds for this session ---
  const { data: holds, error: holdLookupError } = await getHoldsByCheckoutSession(
    supabaseAdmin,
    checkoutSessionId
  )

  if (holdLookupError) {
    console.error(
      '[handlePaymentFailed] Failed to look up inventory holds',
      { checkoutSessionId, error: holdLookupError.message }
    )
    return
  }

  for (const hold of holds) {
    if (hold.status !== 'active') continue
    const { error: releaseError } = await releaseHold(supabaseAdmin, hold.id)
    if (releaseError) {
      console.error('[handlePaymentFailed] releaseHold failed', {
        holdId: hold.id,
        error: releaseError.message,
      })
    } else {
      console.log('[handlePaymentFailed] Inventory hold released', {
        holdId: hold.id,
        checkoutSessionId,
      })
    }
  }
}
