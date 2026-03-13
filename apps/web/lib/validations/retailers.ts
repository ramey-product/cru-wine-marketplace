import { z } from 'zod'

// Re-export shared pagination schema from wines
export { PaginationSchema, type Pagination } from '@/lib/validations/wines'

// ---------------------------------------------------------------------------
// Retailer mutation schemas
// ---------------------------------------------------------------------------

const SlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Validation for US state codes (2-letter uppercase). */
const StateSchema = z
  .string()
  .length(2, 'State must be a 2-letter code')
  .regex(/^[A-Z]{2}$/, 'State must be uppercase letters')

/** Allowed POS integration types. */
export const PosTypeEnum = z.enum([
  'square',
  'lightspeed',
  'shopify',
  'clover',
  'csv_only',
  'other',
])

export type PosType = z.infer<typeof PosTypeEnum>

/** Allowed fulfillment capabilities stored as JSONB array. */
export const FulfillmentCapabilityEnum = z.enum([
  'pickup',
  'delivery',
  'shipping',
])

export type FulfillmentCapability = z.infer<typeof FulfillmentCapabilityEnum>

export const CreateRetailerSchema = z.object({
  org_id: z.string().uuid(),
  name: z.string().min(1, 'Retailer name is required').max(255),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(SlugRegex, 'Slug must be lowercase with hyphens'),
  address: z.string().min(1, 'Address is required').max(500),
  city: z.string().min(1, 'City is required').max(200),
  state: StateSchema.default('CA'),
  zip: z
    .string()
    .min(5, 'ZIP code must be at least 5 characters')
    .max(10)
    .regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  website: z.string().url().max(500).optional(),
  pos_type: PosTypeEnum.optional(),
  fulfillment_capabilities: z
    .array(FulfillmentCapabilityEnum)
    .min(1, 'At least one fulfillment capability is required')
    .default(['pickup']),
  delivery_radius_miles: z.number().int().min(0).optional(),
  commission_rate: z.number().min(0).max(1).optional(),
})

export type CreateRetailerInput = z.infer<typeof CreateRetailerSchema>

export const UpdateRetailerSchema = CreateRetailerSchema.partial().omit({
  org_id: true,
  slug: true,
})

export type UpdateRetailerInput = z.infer<typeof UpdateRetailerSchema>

// ---------------------------------------------------------------------------
// Retailer filter schemas
// ---------------------------------------------------------------------------

export const RetailerFiltersSchema = z.object({
  is_active: z.boolean().optional(),
  city: z.string().max(200).optional(),
  state: z.string().max(2).optional(),
  query: z.string().max(200).optional(),
})

export type RetailerFilters = z.infer<typeof RetailerFiltersSchema>
