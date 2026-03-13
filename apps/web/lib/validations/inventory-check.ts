import { z } from 'zod'

// ---------------------------------------------------------------------------
// Availability check query params — public API endpoint
// ---------------------------------------------------------------------------

/**
 * Validation schema for the GET /api/v1/inventory/check endpoint.
 *
 * Query params arrive as strings, so we use `z.coerce.number()` to parse
 * numeric values from the URL search params.
 */
export const InventoryCheckSchema = z.object({
  wine_id: z.string().uuid('wine_id must be a valid UUID'),

  lat: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional(),

  lng: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional(),

  radius: z.coerce
    .number()
    .min(1, 'Radius must be between 1 and 100 miles')
    .max(100, 'Radius must be between 1 and 100 miles')
    .optional()
    .default(15),
})

export type InventoryCheckParams = z.infer<typeof InventoryCheckSchema>
