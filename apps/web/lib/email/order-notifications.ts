/**
 * Order Email Notifications — V1 Stubs
 *
 * These functions define the notification interface for order lifecycle events.
 * In V1 they are stub implementations that log to the console so the webhook
 * handlers compile and run without an email service configured.
 *
 * TODO (Phase 2): Replace console.log stubs with a real email service.
 *   Candidates: SendGrid, Resend, Postmark.
 *   The function signatures and param shapes are the integration contract —
 *   do not change param names without updating all callers.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Parameters for the consumer-facing order confirmation email. */
export interface ConsumerOrderConfirmationParams {
  /** Recipient email address. */
  email: string
  /** Platform order ID (UUID). */
  orderId: string
  /** Order grand total in cents. */
  orderTotal: number
  /** Display name of the retailer fulfilling the order. */
  retailerName: string
  /** Whether the consumer collects in store or receives a delivery. */
  fulfillmentType: 'pickup' | 'delivery'
  /** ISO 8601 datetime string; omitted when not yet determined. */
  estimatedReadyAt?: string
}

/** Parameters for the retailer-facing new order notification email. */
export interface RetailerNewOrderNotificationParams {
  /** Recipient email address (retailer contact). */
  retailerEmail: string
  /** Platform order ID (UUID). */
  orderId: string
  /** Order grand total in cents. */
  orderTotal: number
  /** Display name of the consumer who placed the order. */
  consumerName: string
  /** Whether the consumer will pick up or expects delivery. */
  fulfillmentType: 'pickup' | 'delivery'
  /** Number of distinct line items in the order. */
  itemCount: number
}

// ---------------------------------------------------------------------------
// sendConsumerOrderConfirmation
// ---------------------------------------------------------------------------

/**
 * Send an order confirmation email to the consumer.
 *
 * Called after `checkout.session.completed` is successfully processed and
 * the order row has been created in the database.
 *
 * TODO: Integrate with email service (SendGrid / Resend) in Phase 2.
 */
export async function sendConsumerOrderConfirmation(
  params: ConsumerOrderConfirmationParams
): Promise<void> {
  // TODO: Replace with actual email sending in Phase 2
  console.log('[EMAIL STUB] Consumer order confirmation', {
    to: params.email,
    orderId: params.orderId,
    total: `$${(params.orderTotal / 100).toFixed(2)}`,
    retailerName: params.retailerName,
    fulfillmentType: params.fulfillmentType,
    ...(params.estimatedReadyAt && { estimatedReadyAt: params.estimatedReadyAt }),
  })
}

// ---------------------------------------------------------------------------
// sendRetailerNewOrderNotification
// ---------------------------------------------------------------------------

/**
 * Send a new order notification to the retailer.
 *
 * Called after `checkout.session.completed` is successfully processed.
 * Alerts the retailer that they have an order to fulfill.
 *
 * TODO: Integrate with email service (SendGrid / Resend) in Phase 2.
 */
export async function sendRetailerNewOrderNotification(
  params: RetailerNewOrderNotificationParams
): Promise<void> {
  // TODO: Replace with actual email sending in Phase 2
  console.log('[EMAIL STUB] Retailer new order notification', {
    to: params.retailerEmail,
    orderId: params.orderId,
    total: `$${(params.orderTotal / 100).toFixed(2)}`,
    consumerName: params.consumerName,
    fulfillmentType: params.fulfillmentType,
    itemCount: params.itemCount,
  })
}

// ---------------------------------------------------------------------------
// Order Status Change Notifications (EPIC-09/STORY-10)
// ---------------------------------------------------------------------------

/** Parameters for consumer-facing order status change emails. */
export interface OrderStatusChangeParams {
  /** Recipient email address. */
  email: string
  /** Platform order ID (UUID). */
  orderId: string
  /** Human-readable order number (e.g. "CRU-2024-001"). */
  orderNumber: string
  /** New order status. */
  newStatus: 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'
  /** Display name of the retailer fulfilling the order. */
  retailerName: string
  /** Whether the consumer collects in store or receives a delivery. */
  fulfillmentType: 'pickup' | 'delivery'
  /** Retailer address (for pickup notifications). */
  retailerAddress?: string
  /** Retailer hours of operation (for pickup notifications). */
  retailerHours?: string
  /** Estimated delivery time (for delivery notifications). */
  estimatedDeliveryTime?: string
  /** Cancellation reason (required when newStatus is 'cancelled'). */
  cancellationReason?: string
}

/** Email subject lines per status. */
const STATUS_SUBJECTS: Record<OrderStatusChangeParams['newStatus'], string> = {
  confirmed: 'Your Cru order is confirmed',
  ready_for_pickup: 'Your wine is ready for pickup',
  out_for_delivery: 'Your wine is on its way',
  completed: 'Order complete — enjoy your wine!',
  cancelled: 'Your order has been cancelled',
}

/**
 * Send an order status change notification to the consumer.
 *
 * Called after a retailer changes order status via the dashboard.
 * Non-blocking — errors are logged, never thrown, so the status
 * change itself always succeeds.
 *
 * TODO: Integrate with email service (Resend + React Email) in Phase 2.
 */
export async function sendOrderStatusChangeEmail(
  params: OrderStatusChangeParams
): Promise<void> {
  try {
    const subject = STATUS_SUBJECTS[params.newStatus]

    // TODO: Replace with actual email sending via Resend in Phase 2
    // import { Resend } from 'resend'
    // const resend = new Resend(process.env.RESEND_API_KEY)
    // await resend.emails.send({
    //   from: 'Cru <orders@cru.wine>',
    //   to: params.email,
    //   subject,
    //   react: OrderStatusEmailTemplate(params),
    // })
    console.log('[EMAIL STUB] Order status change notification', {
      to: params.email,
      subject,
      orderId: params.orderId,
      orderNumber: params.orderNumber,
      newStatus: params.newStatus,
      retailerName: params.retailerName,
      fulfillmentType: params.fulfillmentType,
      ...(params.retailerAddress && { retailerAddress: params.retailerAddress }),
      ...(params.cancellationReason && { cancellationReason: params.cancellationReason }),
    })
  } catch (error) {
    // Non-blocking: log error but don't throw so status change still succeeds
    console.error('[EMAIL ERROR] Failed to send order status change email', {
      orderId: params.orderId,
      newStatus: params.newStatus,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
