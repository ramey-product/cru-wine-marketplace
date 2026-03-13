import { z } from 'zod'

export const TrackShareSchema = z.object({
  shareableType: z.enum(['wine', 'producer']),
  shareableId: z.string().uuid('Invalid shareable ID'),
  platform: z.enum(['native_share', 'clipboard', 'twitter', 'facebook', 'email']),
})

export type TrackShareInput = z.infer<typeof TrackShareSchema>
