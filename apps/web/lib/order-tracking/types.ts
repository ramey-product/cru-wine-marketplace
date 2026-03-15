// ---------------------------------------------------------------------------
// Order Tracking Types — aligned with DB enum in orders table
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled'

export type FulfillmentType = 'pickup' | 'delivery'

export interface OrderTrackingState {
  orderId: string
  status: OrderStatus
  fulfillmentType: FulfillmentType
  retailerName: string
  /** Short display name for the order (e.g. "3 items from Wine House LA") */
  displayName: string
  /** Number of items in the order */
  itemCount: number
  /** ISO timestamp of when the order was placed */
  placedAt: string
  /** ISO timestamp of last status update */
  updatedAt: string
  /** Estimated completion time (e.g. "3:30 PM") */
  estimatedTime?: string
}

/** Terminal statuses — order tracking is no longer "active" */
export const TERMINAL_STATUSES: OrderStatus[] = ['completed', 'cancelled']

/** Human-readable labels for each status */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Order confirmed',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

/**
 * Returns a fulfillment-aware label for the completed status.
 * e.g. "Delivered" for delivery, "Picked up" for pickup.
 */
export function getCompletionLabel(fulfillmentType: FulfillmentType): string {
  return fulfillmentType === 'delivery' ? 'Delivered' : 'Picked up'
}
