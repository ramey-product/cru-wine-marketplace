import { z } from 'zod'

// ---------------------------------------------------------------------------
// Producer filter & mutation schemas
// ---------------------------------------------------------------------------

export const ProducerFiltersSchema = z.object({
  region: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
})

export type ProducerFilters = z.infer<typeof ProducerFiltersSchema>

export const CreateProducerSchema = z.object({
  org_id: z.string().uuid(),
  name: z.string().min(1, 'Producer name is required').max(500),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens'),
  region: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  tagline: z.string().max(150, 'Tagline must be 150 characters or less').optional(),
  story_content: z.string().optional(),
  farming_practices: z.array(z.string()).optional(),
  vineyard_size: z.string().max(100).optional(),
  year_established: z.number().int().min(1000).max(2100).optional(),
  annual_production: z.string().max(200).optional(),
  hero_image_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
})

export type CreateProducerInput = z.infer<typeof CreateProducerSchema>

export const UpdateProducerSchema = CreateProducerSchema.partial().omit({
  org_id: true,
  slug: true,
})

export type UpdateProducerInput = z.infer<typeof UpdateProducerSchema>
