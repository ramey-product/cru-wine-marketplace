/**
 * Order Email Notifications
 *
 * These functions handle all order lifecycle email notifications via Resend.
 * Each function is non-blocking — errors are logged, never thrown, so the
 * calling operation (status change, checkout, etc.) always succeeds.
 *
 * When RESEND_API_KEY is not set (local dev), emails are logged to console.
 */

import { sendEmail, OPS_ALERT_ADDRESS } from './resend'
import {
  orderConfirmationHtml,
  retailerNewOrderHtml,
  orderStatusChangeHtml,
  orderDelayNotificationHtml,
  opsDelayAlertHtml,
} from './templates/order-emails'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsumerOrderConfirmationParams {
  email: string
  orderId: string
  orderTotal: number
  retailerName: string
  fulfillmentType: 'pickup' | 'delivery'
  estimatedReadyAt?: string
}

export interface RetailerNewOrderNotificationParams {
  retailerEmail: string
  orderId: string
  orderTotal: number
  consumerName: string
  fulfillmentType: 'pickup' | 'delivery'
  itemCount: number
}

export interface OrderStatusChangeParams {
  email: string
  orderId: string
  orderNumber: string
  newStatus: 'confirmed' | 'ready_for_pickup' | 'out_for_delivery' | 'completed' | 'cancelled'
  retailerName: string
  fulfillmentType: 'pickup' | 'delivery'
  retailerAddress?: string
  retailerHours?: string
  estimatedDeliveryTime?: string
  cancellationReason?: string
}

export interface DelayNotificationParams {
  email: string
  orderId: string
  retailerName: string
}

export interface OpsAlertParams {
  orderId: string
  retailerName: string
  consumerEmail: string
  pendingMinutes: number
}

// ---------------------------------------------------------------------------
// Email subject lines
// ---------------------------------------------------------------------------

const STATUS_SUBJECTS: Record<OrderStatusChangeParams['newStatus'], string> = {
  confirmed: 'Your Cru order is confirmed',
  ready_for_pickup: 'Your wine is ready for pickup',
  out_for_delivery: 'Your wine is on its way',
  completed: 'Order complete — enjoy your wine!',
  cancelled: 'Your order has been cancelled',
}

// ---------------------------------------------------------------------------
// sendConsumerOrderConfirmation
// ---------------------------------------------------------------------------

export async function sendConsumerOrderConfirmation(
  params: ConsumerOrderConfirmationParams
): Promise<void> {
  try {
    await sendEmail({
      to: params.email,
      subject: 'Your Cru order has been placed',
      html: orderConfirmationHtml(params),
    })
  } catch (error) {
    console.error('[EMAIL ERROR] Consumer order confirmation failed', {
      orderId: params.orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// ---------------------------------------------------------------------------
// sendRetailerNewOrderNotification
// ---------------------------------------------------------------------------

export async function sendRetailerNewOrderNotification(
  params: RetailerNewOrderNotificationParams
): Promise<void> {
  try {
    await sendEmail({
      to: params.retailerEmail,
      subject: `New order from ${params.consumerName}`,
      html: retailerNewOrderHtml(params),
    })
  } catch (error) {
    console.error('[EMAIL ERROR] Retailer new order notification failed', {
      orderId: params.orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// ---------------------------------------------------------------------------
// sendOrderStatusChangeEmail
// ---------------------------------------------------------------------------

export async function sendOrderStatusChangeEmail(
  params: OrderStatusChangeParams
): Promise<void> {
  try {
    const subject = STATUS_SUBJECTS[params.newStatus]
    await sendEmail({
      to: params.email,
      subject,
      html: orderStatusChangeHtml(params),
    })
  } catch (error) {
    console.error('[EMAIL ERROR] Order status change email failed', {
      orderId: params.orderId,
      newStatus: params.newStatus,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// ---------------------------------------------------------------------------
// sendDelayNotificationEmail
// ---------------------------------------------------------------------------

export async function sendDelayNotificationEmail(
  params: DelayNotificationParams
): Promise<void> {
  try {
    await sendEmail({
      to: params.email,
      subject: "We're checking on your order",
      html: orderDelayNotificationHtml(params),
    })
  } catch (error) {
    console.error('[EMAIL ERROR] Delay notification failed', {
      orderId: params.orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

// ---------------------------------------------------------------------------
// sendOpsAlertEmail
// ---------------------------------------------------------------------------

export async function sendOpsAlertEmail(
  params: OpsAlertParams
): Promise<void> {
  try {
    await sendEmail({
      to: OPS_ALERT_ADDRESS,
      subject: `Pending order alert: ${params.retailerName} (${params.pendingMinutes}min)`,
      html: opsDelayAlertHtml(params),
    })
  } catch (error) {
    console.error('[EMAIL ERROR] Ops alert failed', {
      orderId: params.orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
