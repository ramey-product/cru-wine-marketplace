import { z } from 'zod'

// ---------------------------------------------------------------------------
// Valid order statuses and transitions
// ---------------------------------------------------------------------------

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'ready_for_pickup',
  'out_for_delivery',
  'completed',
  'cancelled',
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

/**
 * Map of valid status transitions.
 * Key = current status, Value = array of allowed next statuses.
 */
export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['completed', 'cancelled'],
  out_for_delivery: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

// ---------------------------------------------------------------------------
// UpdateOrderStatusSchema
// ---------------------------------------------------------------------------

export const UpdateOrderStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  status: z.enum(ORDER_STATUSES, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
  reason: z.string().max(500).optional(),
})

export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>
