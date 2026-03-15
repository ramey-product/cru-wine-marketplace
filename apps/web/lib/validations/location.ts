import { z } from 'zod'

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  source: z.enum(['browser', 'ip', 'manual']),
  displayName: z.string().max(200).nullable(),
  zip: z.string().max(10).nullable(),
})

export type LocationInput = z.infer<typeof LocationSchema>

export const GeocodeQuerySchema = z.object({
  query: z.string().min(2).max(200),
})
