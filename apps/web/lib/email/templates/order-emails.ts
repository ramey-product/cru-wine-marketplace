/**
 * HTML email templates for order lifecycle events.
 * All functions return raw HTML strings wrapped in the Cru email layout.
 */

import { emailLayout } from './layout'

const BRAND_COLOR = '#722F37'
const MUTED_COLOR = '#6b7280'

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// ---------------------------------------------------------------------------
// Order Confirmation (consumer)
// ---------------------------------------------------------------------------

export function orderConfirmationHtml(params: {
  orderId: string
  orderTotal: number
  retailerName: string
  fulfillmentType: 'pickup' | 'delivery'
  estimatedReadyAt?: string
}): string {
  const fulfillmentLabel = params.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'
  const estimateBlock = params.estimatedReadyAt
    ? `<p style="margin:8px 0 0;font-size:14px;color:${MUTED_COLOR};">Estimated ready: ${new Date(params.estimatedReadyAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>`
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#111;">Your order has been placed</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED_COLOR};">
      Thank you for your order! We've sent it to ${params.retailerName} for ${fulfillmentLabel.toLowerCase()}.
    </p>
    <div style="padding:16px;background-color:#faf9f7;border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0;font-size:14px;font-weight:600;">Order Total: ${formatCents(params.orderTotal)}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">From: ${params.retailerName}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">Fulfillment: ${fulfillmentLabel}</p>
      ${estimateBlock}
    </div>
    <div style="margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/orders/${params.orderId}" style="display:inline-block;padding:10px 24px;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
        Track Your Order
      </a>
    </div>
  `, `Your order with ${params.retailerName} has been placed.`)
}

// ---------------------------------------------------------------------------
// New Order (retailer)
// ---------------------------------------------------------------------------

export function retailerNewOrderHtml(params: {
  orderId: string
  orderTotal: number
  consumerName: string
  fulfillmentType: 'pickup' | 'delivery'
  itemCount: number
}): string {
  const fulfillmentLabel = params.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'

  return emailLayout(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#111;">New order received</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED_COLOR};">
      You have a new ${fulfillmentLabel.toLowerCase()} order from ${params.consumerName}.
    </p>
    <div style="padding:16px;background-color:#faf9f7;border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0;font-size:14px;font-weight:600;">Total: ${formatCents(params.orderTotal)}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">${params.itemCount} item${params.itemCount !== 1 ? 's' : ''} &middot; ${fulfillmentLabel}</p>
    </div>
    <div style="margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/orders/${params.orderId}" style="display:inline-block;padding:10px 24px;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
        View Order Details
      </a>
    </div>
  `, `New order from ${params.consumerName}`)
}

// ---------------------------------------------------------------------------
// Status Change (consumer)
// ---------------------------------------------------------------------------

const STATUS_HEADINGS: Record<string, string> = {
  confirmed: 'Your order is confirmed',
  ready_for_pickup: 'Your wine is ready for pickup',
  out_for_delivery: 'Your wine is on its way',
  completed: 'Order complete — enjoy your wine!',
  cancelled: 'Your order has been cancelled',
}

const STATUS_DESCRIPTIONS: Record<string, (retailer: string) => string> = {
  confirmed: (r) => `${r} has confirmed your order and is preparing it now.`,
  ready_for_pickup: (r) => `Head to ${r} — your wine is waiting for you.`,
  out_for_delivery: (r) => `${r} has dispatched your order. It's on its way!`,
  completed: () => 'Your order has been fulfilled. We hope you enjoy every sip.',
  cancelled: () => 'Your order has been cancelled. If you were charged, a refund will be processed.',
}

export function orderStatusChangeHtml(params: {
  orderId: string
  orderNumber: string
  newStatus: string
  retailerName: string
  fulfillmentType: 'pickup' | 'delivery'
  retailerAddress?: string
  cancellationReason?: string
}): string {
  const heading = STATUS_HEADINGS[params.newStatus] ?? 'Order update'
  const descFn = STATUS_DESCRIPTIONS[params.newStatus]
  const description = descFn ? descFn(params.retailerName) : `Your order status has been updated to ${params.newStatus}.`

  const addressBlock = params.newStatus === 'ready_for_pickup' && params.retailerAddress
    ? `<p style="margin:12px 0 0;font-size:13px;color:${MUTED_COLOR};">Address: ${params.retailerAddress}</p>`
    : ''

  const cancelBlock = params.newStatus === 'cancelled' && params.cancellationReason
    ? `<p style="margin:12px 0 0;font-size:13px;color:${MUTED_COLOR};">Reason: ${params.cancellationReason}</p>`
    : ''

  return emailLayout(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#111;">${heading}</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED_COLOR};">
      ${description}
    </p>
    <div style="padding:16px;background-color:#faf9f7;border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0;font-size:13px;color:${MUTED_COLOR};">Order #${params.orderNumber}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">From: ${params.retailerName}</p>
      ${addressBlock}
      ${cancelBlock}
    </div>
    <div style="margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/orders/${params.orderId}" style="display:inline-block;padding:10px 24px;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
        View Order
      </a>
    </div>
  `, heading)
}

// ---------------------------------------------------------------------------
// Delay Notification (consumer)
// ---------------------------------------------------------------------------

export function orderDelayNotificationHtml(params: {
  orderId: string
  retailerName: string
}): string {
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#111;">We're checking on your order</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED_COLOR};">
      Your order with ${params.retailerName} is taking a bit longer than expected. We've reached out to them and will update you shortly.
    </p>
    <div style="margin-top:24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/orders/${params.orderId}" style="display:inline-block;padding:10px 24px;background-color:${BRAND_COLOR};color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">
        Track Your Order
      </a>
    </div>
  `, `Your order with ${params.retailerName} is taking longer than expected.`)
}

// ---------------------------------------------------------------------------
// Ops Alert (internal)
// ---------------------------------------------------------------------------

export function opsDelayAlertHtml(params: {
  orderId: string
  retailerName: string
  consumerEmail: string
  pendingMinutes: number
}): string {
  return emailLayout(`
    <h1 style="margin:0 0 8px;font-size:20px;font-weight:600;color:#111;">Pending order alert</h1>
    <p style="margin:0 0 24px;font-size:14px;color:${MUTED_COLOR};">
      An order has been pending for ${params.pendingMinutes} minutes without retailer confirmation.
    </p>
    <div style="padding:16px;background-color:#faf9f7;border-radius:8px;border:1px solid #e5e7eb;">
      <p style="margin:0;font-size:14px;font-weight:600;">Order: ${params.orderId}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">Retailer: ${params.retailerName}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">Customer: ${params.consumerEmail}</p>
      <p style="margin:4px 0 0;font-size:13px;color:${MUTED_COLOR};">Pending: ${params.pendingMinutes} minutes</p>
    </div>
  `)
}
