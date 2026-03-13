import { z } from 'zod'
import {
  FLAVOR_AFFINITIES,
  FLAVOR_AVERSIONS,
  DRINKING_CONTEXTS,
} from '@/lib/constants/taste-profile'

// ---------------------------------------------------------------------------
// Taste profile submission schema (used by onboarding + settings edit)
// ---------------------------------------------------------------------------

export const TasteProfileSchema = z.object({
  flavor_affinities: z
    .array(z.enum(FLAVOR_AFFINITIES as unknown as [string, ...string[]]))
    .min(0)
    .max(8, 'You can select up to 8 flavor preferences'),

  flavor_aversions: z
    .array(z.enum(FLAVOR_AVERSIONS as unknown as [string, ...string[]]))
    .min(0),

  drinking_contexts: z
    .array(z.enum(DRINKING_CONTEXTS as unknown as [string, ...string[]]))
    .min(1, 'Select at least one drinking context'),

  adventurousness_score: z
    .number()
    .int()
    .min(1, 'Adventurousness must be between 1 and 3')
    .max(3, 'Adventurousness must be between 1 and 3'),
})

export type TasteProfileInput = z.infer<typeof TasteProfileSchema>

// ---------------------------------------------------------------------------
// Add wine to taste profile schema
// ---------------------------------------------------------------------------

export const AddTasteProfileWineSchema = z.object({
  wine_id: z.string().uuid('Invalid wine ID'),
  source: z.enum(['onboarding', 'manual_add']).default('manual_add'),
})

export type AddTasteProfileWineInput = z.infer<typeof AddTasteProfileWineSchema>

// ---------------------------------------------------------------------------
// Remove wine from taste profile schema
// ---------------------------------------------------------------------------

export const RemoveTasteProfileWineSchema = z.object({
  wine_id: z.string().uuid('Invalid wine ID'),
})
