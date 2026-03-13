'use client'

import { useState, useCallback } from 'react'
import { RecommendationCard } from './RecommendationCard'
import { DismissButton } from './DismissButton'
import { useRecommendationTracking } from '@/lib/hooks/useRecommendationTracking'

interface RecommendationCardInteractiveProps {
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
    producer: { name: string; slug: string }
  }
  matchReasons: string[]
  matchScore: number
}

export function RecommendationCardInteractive({
  wine,
  matchReasons,
  matchScore,
}: RecommendationCardInteractiveProps) {
  const [dismissState, setDismissState] = useState<'visible' | 'animating' | 'dismissed'>('visible')
  const [showToast, setShowToast] = useState(false)
  const { cardRef, trackClick } = useRecommendationTracking(wine.id, matchScore)

  const handleDismissed = useCallback(() => {
    setDismissState('animating')
    setShowToast(true)
    setTimeout(() => {
      setDismissState('dismissed')
    }, 200)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }, [])

  if (dismissState === 'dismissed' && !showToast) return null

  return (
    <>
      {dismissState !== 'dismissed' && (
        <div
          ref={cardRef}
          onClick={trackClick}
          className={`relative transition-all duration-200 ${
            dismissState === 'animating' ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <RecommendationCard
            wine={wine}
            matchReasons={matchReasons}
            matchScore={matchScore}
          />
          <div className="mt-1 flex justify-end px-1">
            <DismissButton wineId={wine.id} onDismissed={handleDismissed} />
          </div>
        </div>
      )}
      {showToast && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-lg border border-border bg-muted px-4 py-2 text-sm text-muted-foreground"
        >
          Got it — we&apos;ll show you less like this.
        </div>
      )}
    </>
  )
}
