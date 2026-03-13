import { z } from 'zod'

// ---------------------------------------------------------------------------
// generateRecommendations — no input needed, uses auth context
// ---------------------------------------------------------------------------

export const GenerateRecommendationsSchema = z.object({}).optional()

// ---------------------------------------------------------------------------
// dismissWine / undismissWine — record or remove a wine dismissal
// ---------------------------------------------------------------------------

export const DismissWineSchema = z.object({
  wine_id: z.string().uuid('Invalid wine ID'),
})

export type DismissWineInput = z.infer<typeof DismissWineSchema>
