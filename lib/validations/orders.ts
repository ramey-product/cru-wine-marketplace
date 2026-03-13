import { z } from 'zod'

// ---------------------------------------------------------------------------
// Order validation schemas
// ---------------------------------------------------------------------------

/**
 * Delivery address sub-schema — required when fulfillment type is 'delivery'.
 */
export const deliveryAddressSchema = z.object({
  line1: z.string().min(1, 'Street address is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be a 2-letter abbreviation'),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
})

export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>

// ---------------------------------------------------------------------------
// initiateCheckoutSchema — input for the initiateCheckout server action
// ---------------------------------------------------------------------------

export const initiateCheckoutSchema = z.object({
  fulfillmentType: z.enum(['pickup', 'delivery']),
  deliveryAddress: deliveryAddressSchema.optional().nullable(),
  ageVerified: z.boolean(),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

export type InitiateCheckoutInput = z.infer<typeof initiateCheckoutSchema>

// ---------------------------------------------------------------------------
// updateOrderStatusSchema — input for retailer order status transitions
// ---------------------------------------------------------------------------

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  status: z.enum([
    'confirmed',
    'ready_for_pickup',
    'out_for_delivery',
    'completed',
    'cancelled',
  ]),
  notes: z.string().max(500, 'Notes must be 500 characters or fewer').optional(),
})

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

// ---------------------------------------------------------------------------
// cancelOrderSchema — input for order cancellation (consumer or retailer)
// ---------------------------------------------------------------------------

export const cancelOrderSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  reason: z.string().max(500, 'Reason must be 500 characters or fewer').optional(),
})

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>
