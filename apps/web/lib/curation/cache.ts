import { unstable_cache, revalidateTag } from 'next/cache'
import type { RecommendationResult } from '@/lib/actions/curation'

// ---------------------------------------------------------------------------
// Cache configuration
// ---------------------------------------------------------------------------

const CACHE_TTL = 3600 // 1 hour in seconds

// ---------------------------------------------------------------------------
// getCachedRecommendations — wraps the engine with Next.js cache
// ---------------------------------------------------------------------------

/**
 * Wrap a recommendation generator function with Next.js unstable_cache.
 * Uses per-user cache keys and tags for targeted invalidation.
 */
export function createCachedRecommendations(
  userId: string,
  generator: () => Promise<RecommendationResult[] | null>
) {
  return unstable_cache(
    generator,
    [`curation:recommendations:${userId}`],
    {
      revalidate: CACHE_TTL,
      tags: ['curation', `user:${userId}`],
    }
  )
}

// ---------------------------------------------------------------------------
// invalidateUserRecommendations — clear cache for a specific user
// ---------------------------------------------------------------------------

/**
 * Invalidate the recommendation cache for a specific user.
 * Call this after taste profile updates or order completions.
 */
export function invalidateUserRecommendations(userId: string) {
  revalidateTag(`user:${userId}`)
}

// ---------------------------------------------------------------------------
// invalidateAllRecommendations — clear all user caches
// ---------------------------------------------------------------------------

/**
 * Invalidate all recommendation caches.
 * Call this after admin wine catalog changes.
 */
export function invalidateAllRecommendations() {
  revalidateTag('curation')
}
