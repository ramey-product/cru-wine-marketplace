/**
 * Stripe Webhook Route Handler
 *
 * Receives and verifies Stripe webhook events, then dispatches to the
 * appropriate handler function.
 *
 * Security: Signature verification is performed before any payload
 * processing. An invalid or missing signature results in an immediate
 * 400 response and no further processing.
 *
 * Idempotency: Individual handler functions guard against duplicate
 * deliveries by checking for pre-existing records before writing.
 *
 * Retries: Returning 5xx causes Stripe to retry the event. Returning
 * 2xx (even for skipped/unhandled events) tells Stripe not to retry.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  handleCheckoutCompleted,
  handleChargeRefunded,
  handlePaymentFailed,
} from '@/lib/stripe/webhook-handlers'

// ---------------------------------------------------------------------------
// Stripe client — used only for signature verification in this file.
// All business logic lives in webhook-handlers.ts.
// ---------------------------------------------------------------------------

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// ---------------------------------------------------------------------------
// POST /api/webhooks/stripe
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  // 1. Read the raw body as text — required for signature verification.
  //    Parsing as JSON first invalidates the signature check.
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.warn('Stripe webhook received without stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  // 2. Verify HMAC signature against the raw body.
  //    constructEvent throws if the signature is invalid or the body was tampered.
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Stripe webhook signature verification failed:', message)
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  // 3. Dispatch to the correct handler.
  //    Unknown event types are acknowledged (200) but not processed —
  //    this avoids spurious retries for events we intentionally ignore.
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      default:
        // Log but do not error — return 200 so Stripe stops retrying
        console.log(`[stripe-webhook] Unhandled event type ignored: ${event.type}`)
    }
  } catch (err) {
    // Returning 500 signals Stripe to retry. We intentionally propagate
    // unexpected handler errors so transient failures are retried.
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[stripe-webhook] Handler failed for event ${event.id} (${event.type}):`, message)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  // 4. Acknowledge receipt. Stripe considers 2xx a successful delivery.
  return NextResponse.json({ received: true })
}
