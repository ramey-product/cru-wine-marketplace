// ---------------------------------------------------------------------------
// Order Tracking Types
// ---------------------------------------------------------------------------

export type OrderStatus =
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled'

export interface OrderTrackingState {
  orderId: string
  status: OrderStatus
  retailerName: string
  /** Short display name for the wine/order (e.g. "Estate Reserve 2021") */
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
export const TERMINAL_STATUSES: OrderStatus[] = [
  'delivered',
  'picked_up',
  'cancelled',
]

/** Human-readable labels for each status */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Order confirmed',
  preparing: 'Being prepared',
  ready_for_pickup: 'Ready for pickup',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
}
