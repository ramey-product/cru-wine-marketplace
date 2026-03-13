import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Wine candidate select — fields needed by the scoring engine
// ---------------------------------------------------------------------------

const WINE_CANDIDATE_SELECT = `
  id,
  name,
  slug,
  varietal,
  region,
  country,
  image_url,
  price_min,
  price_max,
  flavor_profile,
  producer:producers!inner(id, name, slug)
` as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecommendationCandidate {
  id: string
  name: string
  slug: string
  varietal: string | null
  region: string | null
  country: string | null
  image_url: string | null
  price_min: number | null
  price_max: number | null
  flavor_profile: unknown
  producer: { id: string; name: string; slug: string }
}

export interface RecommendationCandidateData {
  tasteProfile: {
    flavor_affinities: string[]
    flavor_aversions: string[]
    adventurousness_score: number
  }
  candidates: RecommendationCandidate[]
  excludedWineIds: Set<string>
  availableWineIds: Set<string>
}

// ---------------------------------------------------------------------------
// getRecommendationCandidates — fetch all data the scoring engine needs
// ---------------------------------------------------------------------------

/**
 * Fetches all data required for recommendation scoring in parallel:
 * 1. User's taste profile (affinities, aversions, adventurousness)
 * 2. All active wines with flavor profiles (candidates)
 * 3. User's dismissed wine IDs (exclusion set)
 * 4. User's purchased wine IDs (exclusion set)
 * 5. User's wishlisted wine IDs (exclusion set)
 * 6. Wine IDs available in any retailer inventory
 *
 * Returns null data when the user has no taste profile (no personalized recs).
 */
export async function getRecommendationCandidates(
  client: TypedClient,
  userId: string
): Promise<{
  data: RecommendationCandidateData | null
  error: { message: string; code?: string } | null
}> {
  // Step 1: Fetch order IDs and wishlist IDs for the user first,
  // since PostgREST nested filtering on related tables can be fragile
  // with generated types.
  const [orderIdsResult, wishlistIdsResult] = await Promise.all([
    client.from('orders').select('id').eq('user_id', userId),
    client.from('wishlists').select('id').eq('user_id', userId),
  ])

  const orderIds = (orderIdsResult.data ?? []).map((row) => row.id)
  const wishlistIds = (wishlistIdsResult.data ?? []).map((row) => row.id)

  // Step 2: Fetch everything else in parallel
  const [
    tasteProfileResult,
    winesResult,
    dismissedResult,
    purchasedResult,
    wishlistedResult,
    availableResult,
  ] = await Promise.all([
    // 1. Taste profile
    client
      .from('taste_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),

    // 2. Active wines with flavor_profile and producer join
    client
      .from('wines')
      .select(WINE_CANDIDATE_SELECT)
      .eq('is_active', true),

    // 3. Dismissed wines
    client
      .from('user_wine_dismissals')
      .select('wine_id')
      .eq('user_id', userId),

    // 4. Purchased wines — wine_ids from order_items for the user's orders
    orderIds.length > 0
      ? client
          .from('order_items')
          .select('wine_id')
          .in('order_id', orderIds)
      : Promise.resolve({ data: [] as { wine_id: string }[], error: null }),

    // 5. Wishlisted wines — wine_ids from wishlist_items for the user's wishlists
    wishlistIds.length > 0
      ? client
          .from('wishlist_items')
          .select('wine_id')
          .in('wishlist_id', wishlistIds)
      : Promise.resolve({ data: [] as { wine_id: string }[], error: null }),

    // 6. Wines in any retailer's inventory with quantity > 0
    client
      .from('retailer_inventory')
      .select('wine_id')
      .gt('quantity', 0),
  ])

  // Handle errors — if any critical fetch fails, return an error
  if (tasteProfileResult.error) {
    return {
      data: null,
      error: {
        message: `Taste profile fetch failed: ${tasteProfileResult.error.message}`,
        code: tasteProfileResult.error.code,
      },
    }
  }

  if (winesResult.error) {
    return {
      data: null,
      error: {
        message: `Wines fetch failed: ${winesResult.error.message}`,
        code: winesResult.error.code,
      },
    }
  }

  // No taste profile means no personalized recommendations
  if (!tasteProfileResult.data) {
    return { data: null, error: null }
  }

  // Build exclusion set: union of dismissed + purchased + wishlisted
  const excludedWineIds = new Set<string>()

  for (const row of dismissedResult.data ?? []) {
    excludedWineIds.add(row.wine_id)
  }
  for (const row of purchasedResult.data ?? []) {
    excludedWineIds.add(row.wine_id)
  }
  for (const row of wishlistedResult.data ?? []) {
    excludedWineIds.add(row.wine_id)
  }

  // Build availability set
  const availableWineIds = new Set<string>()
  for (const row of availableResult.data ?? []) {
    availableWineIds.add(row.wine_id)
  }

  // Parse taste profile JSON fields safely
  const rawAffinities = tasteProfileResult.data.flavor_affinities
  const rawAversions = tasteProfileResult.data.flavor_aversions
  const affinities = Array.isArray(rawAffinities)
    ? (rawAffinities as string[])
    : []
  const aversions = Array.isArray(rawAversions)
    ? (rawAversions as string[])
    : []

  // Normalize wine candidates — the producer join via !inner returns an
  // object (single FK relation), not an array.
  const candidates: RecommendationCandidate[] = (winesResult.data ?? []).map(
    (wine) => ({
      id: wine.id,
      name: wine.name,
      slug: wine.slug,
      varietal: wine.varietal,
      region: wine.region,
      country: wine.country,
      image_url: wine.image_url,
      price_min: wine.price_min,
      price_max: wine.price_max,
      flavor_profile: wine.flavor_profile,
      // producers!inner on a many-to-one FK returns a single object,
      // but the generated types may represent it as an array.
      producer: Array.isArray(wine.producer) ? wine.producer[0] : wine.producer,
    })
  )

  return {
    data: {
      tasteProfile: {
        flavor_affinities: affinities,
        flavor_aversions: aversions,
        adventurousness_score: tasteProfileResult.data.adventurousness_score,
      },
      candidates,
      excludedWineIds,
      availableWineIds,
    },
    error: null,
  }
}
