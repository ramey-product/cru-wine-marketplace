/**
 * Server-side PostHog client for recommendation analytics.
 *
 * Used from Server Actions (not the browser). Initializes the PostHog Node
 * client lazily as a singleton. Gracefully handles missing env vars so dev
 * environments without PostHog configured continue to work.
 */

import { PostHog } from 'posthog-node'

const RECOMMENDATION_EVENTS = {
  IMPRESSION: 'recommendation_impression',
  CLICK: 'recommendation_click',
  DISMISS: 'recommendation_dismiss',
  WISHLIST: 'recommendation_wishlist',
  PURCHASE: 'recommendation_purchase',
} as const

type RecommendationEventType =
  (typeof RECOMMENDATION_EVENTS)[keyof typeof RECOMMENDATION_EVENTS]

interface RecommendationEventProperties {
  wine_id: string
  recommendation_source: 'engine' | 'curated_collection'
  match_score?: number
  collection_id?: string
}

// Lazy singleton
let client: PostHog | null = null

function getPostHogClient(): PostHog | null {
  if (client) return client

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

  if (!apiKey) {
    console.warn(
      'PostHog API key not configured — analytics events will be skipped'
    )
    return null
  }

  client = new PostHog(apiKey, {
    host: host || 'https://us.i.posthog.com',
  })
  return client
}

export function captureRecommendationEvent(
  userId: string,
  eventName: RecommendationEventType,
  properties: RecommendationEventProperties
) {
  const ph = getPostHogClient()
  if (!ph) return

  ph.capture({
    distinctId: userId,
    event: eventName,
    properties,
  })
}

export { RECOMMENDATION_EVENTS }
export type { RecommendationEventType, RecommendationEventProperties }
