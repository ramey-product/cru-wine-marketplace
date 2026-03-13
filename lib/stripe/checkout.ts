import Stripe from 'stripe'

// ---------------------------------------------------------------------------
// Stripe client singleton
// ---------------------------------------------------------------------------

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CheckoutLineItem {
  name: string
  unitPrice: number // cents
  quantity: number
  wineId: string
}

interface CreateCheckoutSessionParams {
  lineItems: CheckoutLineItem[]
  deliveryFee: number // cents
  tax: number // cents
  successUrl: string
  cancelUrl: string
  metadata: {
    userId: string
    medusaCartId: string
    retailerOrgId: string
  }
  customerEmail?: string
}

interface CheckoutSessionResult {
  sessionId: string
  sessionUrl: string
}

interface RefundResult {
  data: Stripe.Refund | null
  error: string | null
}

// ---------------------------------------------------------------------------
// createCheckoutSession — build a Stripe Checkout Session for payment
// ---------------------------------------------------------------------------

/**
 * Create a Stripe Checkout Session in payment mode.
 *
 * Maps wine line items to `price_data` entries, optionally adds a delivery fee
 * and tax as separate line items (V1 approach -- not using Stripe Tax).
 *
 * Metadata is attached to both the session and the payment intent for
 * webhook correlation.
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ data: CheckoutSessionResult | null; error: string | null }> {
  try {
    // Build the line items array from wine items
    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      params.lineItems.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            metadata: { wine_id: item.wineId },
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      }))

    // Add delivery fee as a separate line item if applicable
    if (params.deliveryFee > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Delivery Fee' },
          unit_amount: params.deliveryFee,
        },
        quantity: 1,
      })
    }

    // Add tax as a fixed line item (V1 -- not using Stripe Tax)
    if (params.tax > 0) {
      stripeLineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Tax' },
          unit_amount: params.tax,
        },
        quantity: 1,
      })
    }

    // Inject the {CHECKOUT_SESSION_ID} placeholder into URLs
    const successUrl = params.successUrl.includes('{CHECKOUT_SESSION_ID}')
      ? params.successUrl
      : `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`

    const cancelUrl = params.cancelUrl.includes('{CHECKOUT_SESSION_ID}')
      ? params.cancelUrl
      : `${params.cancelUrl}?session_id={CHECKOUT_SESSION_ID}`

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: stripeLineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: params.metadata,
      payment_intent_data: {
        metadata: { ...params.metadata },
      },
      ...(params.customerEmail && { customer_email: params.customerEmail }),
    })

    if (!session.url) {
      return { data: null, error: 'Stripe did not return a session URL' }
    }

    return {
      data: {
        sessionId: session.id,
        sessionUrl: session.url,
      },
      error: null,
    }
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Unknown Stripe error'
    console.error('createCheckoutSession failed:', message)
    return { data: null, error: message }
  }
}

// ---------------------------------------------------------------------------
// createRefund — issue a full refund against a payment intent
// ---------------------------------------------------------------------------

/**
 * Create a full refund for a Stripe payment intent.
 * Used when an order is cancelled after payment has been captured.
 */
export async function createRefund(
  paymentIntentId: string,
  reason?: string
): Promise<RefundResult> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      ...(reason && {
        metadata: { cancellation_reason: reason },
      }),
    })

    return { data: refund, error: null }
  } catch (err) {
    const message =
      err instanceof Stripe.errors.StripeError
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Unknown Stripe refund error'
    console.error('createRefund failed:', message)
    return { data: null, error: message }
  }
}
