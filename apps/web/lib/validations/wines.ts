import { z } from 'zod'

// ---------------------------------------------------------------------------
// Filter & pagination schemas used by DAL and Server Actions
// ---------------------------------------------------------------------------

export const WineFiltersSchema = z.object({
  query: z.string().max(200).optional(),
  varietals: z.array(z.string().min(1)).optional(),
  regions: z.array(z.string().min(1)).optional(),
  sub_regions: z.array(z.string().min(1)).optional(),
  countries: z.array(z.string().min(1)).optional(),
  occasions: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  producer_id: z.string().uuid().optional(),
  is_active: z.boolean().optional(),
})

export type WineFilters = z.infer<typeof WineFiltersSchema>

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  per_page: z.number().int().min(1).max(100).default(24),
})

export type Pagination = z.infer<typeof PaginationSchema>

export const SlugParamSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
})

// ---------------------------------------------------------------------------
// Wine mutation schemas (for admin write operations)
// ---------------------------------------------------------------------------

export const CreateWineSchema = z.object({
  org_id: z.string().uuid(),
  producer_id: z.string().uuid(),
  name: z.string().min(1, 'Wine name is required').max(500),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  varietal: z.string().max(200).optional(),
  region: z.string().max(200).optional(),
  sub_region: z.string().max(200).optional(),
  appellation: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  vintage: z.number().int().min(1800).max(2100).optional(),
  description: z.string().optional(),
  tasting_description: z.string().optional(),
  food_pairings: z.array(z.string()).optional(),
  flavor_profile: z
    .object({
      body: z.number().min(1).max(5).optional(),
      sweetness: z.number().min(1).max(5).optional(),
      acidity: z.number().min(1).max(5).optional(),
      tannin: z.number().min(1).max(5).optional(),
      flavor_tags: z.array(z.string()).optional(),
    })
    .optional(),
  story_hook: z.string().max(120, 'Story hook must be 120 characters or less').optional(),
  image_url: z.string().url().optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  medusa_product_id: z.string().optional(),
  is_active: z.boolean().optional(),
})

export type CreateWineInput = z.infer<typeof CreateWineSchema>

export const UpdateWineSchema = CreateWineSchema.partial().omit({
  org_id: true,
  slug: true,
})

export type UpdateWineInput = z.infer<typeof UpdateWineSchema>
