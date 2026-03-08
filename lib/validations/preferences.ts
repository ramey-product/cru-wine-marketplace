import { z } from 'zod'

export const OCCASION_CATEGORIES = [
  'weeknight dinner',
  'date night',
  'dinner party',
  'celebration',
  'outdoor gathering',
  'gift',
  'solo unwinding',
  'learning & exploring',
  'food pairing',
  'business entertaining',
  'holiday & seasonal',
  'just because',
] as const

export type OccasionCategory = (typeof OCCASION_CATEGORIES)[number]

export const PreferencesSchema = z
  .object({
    location_zip: z
      .string()
      .transform((v) => (v === '' ? undefined : v))
      .pipe(
        z
          .string()
          .regex(/^\d{5}$/, 'Zip code must be exactly 5 digits')
          .optional()
      ),
    price_range_min: z
      .number()
      .int()
      .min(0, 'Minimum price cannot be negative')
      .optional(),
    price_range_max: z
      .number()
      .int()
      .min(0, 'Maximum price cannot be negative')
      .optional(),
    occasion_tags: z
      .array(z.enum(OCCASION_CATEGORIES))
      .optional()
      .default([]),
    notification_email_frequency: z
      .enum(['daily', 'weekly', 'off'])
      .optional(),
  })
  .refine(
    (data) => {
      if (data.price_range_min != null && data.price_range_max != null) {
        return data.price_range_min <= data.price_range_max
      }
      return true
    },
    { message: 'Minimum price must not exceed maximum price', path: ['price_range_min'] }
  )

export type PreferencesInput = z.infer<typeof PreferencesSchema>
