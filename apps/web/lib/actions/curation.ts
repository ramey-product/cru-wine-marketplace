'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getRecommendationCandidates } from '@/lib/dal/curation'
import { dismissWine, undismissWine } from '@/lib/dal/wine-dismissals'
import { generateMatchReasons } from '@/lib/curation/explanation-templates'
import { createCachedRecommendations } from '@/lib/curation/cache'
import { DismissWineSchema } from '@/lib/validations/curation'
import {
  captureRecommendationEvent,
  RECOMMENDATION_EVENTS,
} from '@/lib/analytics/posthog'

// ---------------------------------------------------------------------------
// Scoring weights — configurable, not hardcoded in scoring logic
// ---------------------------------------------------------------------------

const SCORING_WEIGHTS = {
  /** Points per matching flavor affinity */
  flavorAffinity: 3.0,
  /** Binary bonus: awarded if no user-aversion flavors are violated */
  noAversion: 5.0,
  /** V1: disabled (taste_profiles has no budget range field) */
  priceRange: 0.0,
  /** Bonus for wines available in at least one retailer's inventory */
  localAvailability: 4.0,
  /** Base diversity bonus multiplied by adventurousness_score (1-3) */
  adventurenessBase: 1.5,
} as const

const MAX_RECOMMENDATIONS = 8

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationResult {
  wine_id: string
  wine: {
    id: string
    name: string
    slug: string
    varietal: string | null
    region: string | null
    country: string | null
    image_url: string | null
    price_min: number | null
    price_max: number | null
    producer: { id: string; name: string; slug: string }
  }
  match_score: number
  /** Plain-language explanation fragments for why this wine was recommended */
  match_reasons: string[]
}

interface MatchFactors {
  affinityMatches: number
  matchedFlavors: string[]
  hasAversion: boolean
  isAvailable: boolean
  isAdventureBonus: boolean
}

// ---------------------------------------------------------------------------
// scoreWine — score a single wine against the user's taste profile
// ---------------------------------------------------------------------------

/**
 * Calculates a numeric score for a wine based on:
 * 1. Flavor affinity matches (wine flavor_profile keys that appear in user affinities)
 * 2. Aversion violations (binary penalty if any user-aversion flavor is prominent)
 * 3. Local availability (bonus if wine is in any retailer inventory)
 * 4. Adventureness diversity bonus (rewards non-affinity wines for adventurous users)
 *
 * Thresholds:
 * - Affinity match: wine flavor value > 0.3
 * - Aversion violation: wine flavor value > 0.5
 */
function scoreWine(
  wine: {
    id: string
    flavor_profile: unknown
    price_min: number | null
    price_max: number | null
  },
  tasteProfile: {
    flavor_affinities: string[]
    flavor_aversions: string[]
    adventurousness_score: number
  },
  availableWineIds: Set<string>
): { score: number; matchFactors: MatchFactors } {
  const flavorProfile = (wine.flavor_profile ?? {}) as Record<string, number>
  const profileFlavors = Object.keys(flavorProfile)

  // 1. Flavor affinity matches — find affinities present in the wine's profile
  //    above the 0.3 threshold (avoids weak/trace flavors)
  const matchedFlavors = tasteProfile.flavor_affinities.filter(
    (aff) => profileFlavors.includes(aff) && (flavorProfile[aff] ?? 0) > 0.3
  )
  const affinityMatches = matchedFlavors.length

  // 2. Aversion violation check — binary flag, true if ANY user-aversion flavor
  //    is present in the wine above the 0.5 threshold (strong presence)
  const hasAversion = tasteProfile.flavor_aversions.some(
    (av) => profileFlavors.includes(av) && (flavorProfile[av] ?? 0) > 0.5
  )

  // 3. Price range matching (V1: disabled — weight is 0)
  // Future: compare wine price range against user's budget preferences

  // 4. Local availability — wine exists in at least one retailer's inventory
  const isAvailable = availableWineIds.has(wine.id)

  // 5. Adventureness diversity bonus — for high-adventurousness users,
  //    give a bonus to wines that DON'T match their affinities.
  //    This pushes diversity into the recommendation results.
  const isAdventureBonus = affinityMatches === 0
  const adventurenessBonus = isAdventureBonus ? 1 : 0

  // Calculate total score
  const score =
    affinityMatches * SCORING_WEIGHTS.flavorAffinity +
    (hasAversion ? 0 : SCORING_WEIGHTS.noAversion) +
    // priceRange disabled in V1
    (isAvailable ? SCORING_WEIGHTS.localAvailability : 0) +
    adventurenessBonus *
      SCORING_WEIGHTS.adventurenessBase *
      tasteProfile.adventurousness_score

  return {
    score,
    matchFactors: { affinityMatches, matchedFlavors, hasAversion, isAvailable, isAdventureBonus },
  }
}

// ---------------------------------------------------------------------------
// generateRecommendations — main Server Action
// ---------------------------------------------------------------------------

/**
 * Generate personalized wine recommendations for the authenticated user.
 *
 * Pipeline:
 * 1. Auth check (uses session from cookies)
 * 2. Fetch all candidate data via DAL (taste profile, wines, exclusions, availability)
 * 3. Filter out excluded wines (dismissed, purchased, wishlisted)
 * 4. Score remaining candidates against the user's taste profile
 * 5. Sort by score descending, take top N
 * 6. Return scored results
 *
 * Returns:
 * - `{ data: RecommendationResult[] }` on success with recommendations
 * - `{ data: null }` when the user has no taste profile (caller falls back to popular wines)
 * - `{ error: string }` on failure
 */
export async function generateRecommendations(): Promise<
  | { data: RecommendationResult[] | null; error?: undefined }
  | { error: string; data?: undefined }
> {
  const supabase = await createClient()

  // 1. Auth check
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 2. Fetch all candidate data
  const { data: candidateData, error: fetchError } =
    await getRecommendationCandidates(supabase, user.id)

  if (fetchError) {
    console.error('generateRecommendations: fetch failed:', fetchError)
    return { error: 'Failed to fetch recommendation data' }
  }

  // No taste profile — caller should fall back to popular/trending wines
  if (!candidateData || !candidateData.tasteProfile) {
    return { data: null }
  }

  const { tasteProfile, candidates, excludedWineIds, availableWineIds } =
    candidateData

  // 3. Filter out excluded wines, then score remaining
  const scoredWines = candidates
    .filter((wine) => !excludedWineIds.has(wine.id))
    .map((wine) => {
      const { score, matchFactors } = scoreWine(
        wine,
        tasteProfile,
        availableWineIds
      )
      return { wine, score, matchFactors }
    })
    .sort((a, b) => b.score - a.score)

  // 4. Take top results
  const topWines = scoredWines.slice(0, MAX_RECOMMENDATIONS)

  // 5. Build result
  const results: RecommendationResult[] = topWines.map(({ wine, score, matchFactors }) => ({
    wine_id: wine.id,
    wine: {
      id: wine.id,
      name: wine.name,
      slug: wine.slug,
      varietal: wine.varietal,
      region: wine.region,
      country: wine.country,
      image_url: wine.image_url,
      price_min: wine.price_min,
      price_max: wine.price_max,
      producer: wine.producer,
    },
    match_score: Math.round(score * 100) / 100,
    match_reasons: generateMatchReasons(matchFactors, {
      varietal: wine.varietal,
      region: wine.region,
      producerName: wine.producer.name,
    }),
  }))

  return { data: results }
}

// ---------------------------------------------------------------------------
// dismissRecommendation — record that a user dismissed a wine recommendation
// ---------------------------------------------------------------------------

export async function dismissRecommendation(wineId: string) {
  // 1. Zod validate
  const parsed = DismissWineSchema.safeParse({ wine_id: wineId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. DAL call — dismissWine
  const { error } = await dismissWine(supabase, user.id, parsed.data.wine_id)
  if (error) {
    console.error('dismissRecommendation failed:', error)
    return { error: 'Failed to dismiss wine' }
  }

  // 4. PostHog capture (fire-and-forget — non-blocking)
  captureRecommendationEvent(user.id, RECOMMENDATION_EVENTS.DISMISS, {
    wine_id: parsed.data.wine_id,
    recommendation_source: 'engine',
  })

  // 5. Revalidate — recommendations may change
  revalidatePath('/', 'layout')

  return { data: { dismissed: true } }
}

// ---------------------------------------------------------------------------
// undismissRecommendation — remove a dismissal so the wine can reappear
// ---------------------------------------------------------------------------

export async function undismissRecommendation(wineId: string) {
  // 1. Zod validate
  const parsed = DismissWineSchema.safeParse({ wine_id: wineId })
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. DAL call — undismissWine
  const { error } = await undismissWine(supabase, user.id, parsed.data.wine_id)
  if (error) {
    console.error('undismissRecommendation failed:', error)
    return { error: 'Failed to undismiss wine' }
  }

  // 4. Revalidate — recommendations may change
  revalidatePath('/', 'layout')

  return { data: { undismissed: true } }
}

// ---------------------------------------------------------------------------
// getRecommendations — cached wrapper for the home screen
// ---------------------------------------------------------------------------

/**
 * Get cached recommendations for the authenticated user.
 * Falls back to generating fresh recommendations on cache miss.
 *
 * Uses Next.js `unstable_cache` with per-user tags so invalidation
 * (after taste-profile updates, order completions, or catalog changes)
 * only evicts the affected user's cache entry.
 */
export async function getRecommendations(): Promise<
  | { data: RecommendationResult[] | null; error?: undefined }
  | { error: string; data?: undefined }
> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  const getCached = createCachedRecommendations(user.id, async () => {
    // Must create a fresh Supabase client inside the cached function —
    // the outer `supabase` is request-scoped and cannot be closed over.
    const client = await createClient()
    const { data: candidateData, error: fetchError } =
      await getRecommendationCandidates(client, user.id)

    if (fetchError || !candidateData || !candidateData.tasteProfile) {
      return null
    }

    const { tasteProfile, candidates, excludedWineIds, availableWineIds } =
      candidateData

    const scoredWines = candidates
      .filter((wine) => !excludedWineIds.has(wine.id))
      .map((wine) => {
        const { score, matchFactors } = scoreWine(
          wine,
          tasteProfile,
          availableWineIds
        )
        return { wine, score, matchFactors }
      })
      .sort((a, b) => b.score - a.score)

    const topWines = scoredWines.slice(0, MAX_RECOMMENDATIONS)

    return topWines.map(({ wine, score, matchFactors }) => ({
      wine_id: wine.id,
      wine: {
        id: wine.id,
        name: wine.name,
        slug: wine.slug,
        varietal: wine.varietal,
        region: wine.region,
        country: wine.country,
        image_url: wine.image_url,
        price_min: wine.price_min,
        price_max: wine.price_max,
        producer: wine.producer,
      },
      match_score: Math.round(score * 100) / 100,
      match_reasons: generateMatchReasons(matchFactors, {
        varietal: wine.varietal,
        region: wine.region,
        producerName: wine.producer.name,
      }),
    }))
  })

  const results = await getCached()
  return { data: results }
}
