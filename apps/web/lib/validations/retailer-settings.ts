import { z } from 'zod'

export const UpdateRetailerSettingsSchema = z.object({
  pickup_enabled: z.boolean().optional(),
  delivery_enabled: z.boolean().optional(),
  delivery_fee_cents: z.number().int().min(0).optional().nullable(),
  estimated_delivery_minutes: z.number().int().positive().optional().nullable(),
  delivery_radius_miles: z.number().positive().optional().nullable(),
  hours_of_operation: z
    .record(z.string(), z.string())
    .optional()
    .nullable(),
  phone: z.string().min(1).optional().nullable(),
  email: z.string().email().optional().nullable(),
})

export type UpdateRetailerSettingsInput = z.infer<typeof UpdateRetailerSettingsSchema>

export const UpdateNotificationPreferencesSchema = z.object({
  new_order_email: z.boolean().optional(),
  daily_summary_email: z.boolean().optional(),
})

export type UpdateNotificationPreferencesInput = z.infer<
  typeof UpdateNotificationPreferencesSchema
>
