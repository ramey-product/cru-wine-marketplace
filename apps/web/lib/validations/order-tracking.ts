import { z } from 'zod'

export const tasteFeedbackItemSchema = z.object({
  orderItemId: z.string().uuid(),
  wineId: z.string().uuid(),
  sentiment: z.enum(['positive', 'negative']),
  note: z.string().max(500).optional(),
})

export const submitTasteFeedbackSchema = z.object({
  orderId: z.string().uuid(),
  items: z.array(tasteFeedbackItemSchema).min(1),
})

export type SubmitTasteFeedbackInput = z.infer<typeof submitTasteFeedbackSchema>
