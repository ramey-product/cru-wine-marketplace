import { z } from 'zod'

export const FollowUserSchema = z.object({
  targetUserId: z.string().uuid('Invalid user ID'),
})

export type FollowUserInput = z.infer<typeof FollowUserSchema>
