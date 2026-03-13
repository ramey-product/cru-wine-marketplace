import { z } from 'zod'

// ---------------------------------------------------------------------------
// Cart validation schemas
// ---------------------------------------------------------------------------

export const AddToCartSchema = z.object({
  wineId: z.string().uuid('Invalid wine ID'),
  retailerOrgId: z.string().uuid('Invalid retailer org ID'),
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1').max(24, 'Maximum 24 bottles per item'),
})

export type AddToCartInput = z.infer<typeof AddToCartSchema>

export const UpdateCartItemSchema = z.object({
  lineItemId: z.string().min(1, 'Line item ID is required'),
  quantity: z.number().int('Quantity must be a whole number').min(1, 'Quantity must be at least 1').max(24, 'Maximum 24 bottles per item'),
})

export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>

export const RemoveFromCartSchema = z.object({
  lineItemId: z.string().min(1, 'Line item ID is required'),
})

export type RemoveFromCartInput = z.infer<typeof RemoveFromCartSchema>
