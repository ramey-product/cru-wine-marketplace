'use client'

import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for tracking recommendation card impressions and clicks.
 * Uses IntersectionObserver for viewport-based impression tracking.
 * Deduplicates impressions per card per page session.
 */
export function useRecommendationTracking(wineId: string, matchScore: number) {
  const impressionTracked = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const wineIdRef = useRef(wineId)
  const matchScoreRef = useRef(matchScore)

  wineIdRef.current = wineId
  matchScoreRef.current = matchScore

  // Track impression when card enters viewport
  useEffect(() => {
    const element = cardRef.current
    if (!element || impressionTracked.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !impressionTracked.current) {
          impressionTracked.current = true
          // TODO: Replace with PostHog capture when SDK is integrated
          // posthog.capture('recommendation_impression', { wine_id: wineIdRef.current, match_score: matchScoreRef.current })
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // Track click
  const trackClick = useCallback(() => {
    // TODO: Replace with PostHog capture when SDK is integrated
    // posthog.capture('recommendation_click', { wine_id: wineIdRef.current, match_score: matchScoreRef.current })
  }, [])

  return { cardRef, trackClick }
}
