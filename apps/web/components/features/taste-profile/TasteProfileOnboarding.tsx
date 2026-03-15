'use client'

import { useState, useTransition, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingProgress } from './OnboardingProgress'
import { FlavorTagSelector } from './FlavorTagSelector'
import { AversionSelector } from './AversionSelector'
import { DrinkingContextSelector } from './DrinkingContextSelector'
import { AdventurenessSelector } from './AdventurenessSelector'
import { ProfileSummary } from './ProfileSummary'
import { generateProfileSummary } from '@/lib/taste-profile/profile-summary'
import { saveTasteProfile } from '@/lib/actions/taste-profile'
import type { TasteProfileInput } from '@/lib/validations/taste-profile'

const TOTAL_STEPS = 5

/**
 * Direction controls the slide-in animation:
 *  - 'forward'  → new screen slides in from the right
 *  - 'back'     → new screen slides in from the left
 *  - 'none'     → initial render, no animation
 */
type SlideDirection = 'forward' | 'back' | 'none'

interface TasteProfileOnboardingProps {
  /** Pre-fill data when redoing the onboarding from settings */
  initialData?: TasteProfileInput
}

/**
 * Maps a SlideDirection to the set of CSS classes that animate the step
 * container.  A `translate-x-full` → `translate-x-0` transition creates the
 * "slide in from right" effect; `-translate-x-full` → `translate-x-0` creates
 * the "slide in from left" effect.
 *
 * `motion-reduce` variants are included so the animation collapses to an
 * instant opacity swap for users who have requested reduced motion.
 */
function getSlideClasses(direction: SlideDirection): string {
  switch (direction) {
    case 'forward':
      return 'animate-slide-in-right'
    case 'back':
      return 'animate-slide-in-left'
    default:
      return ''
  }
}

export function TasteProfileOnboarding({ initialData }: TasteProfileOnboardingProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [currentStep, setCurrentStep] = useState(1)
  const [slideDirection, setSlideDirection] = useState<SlideDirection>('none')
  const [flavorAffinities, setFlavorAffinities] = useState<string[]>(
    initialData?.flavor_affinities ?? []
  )
  const [flavorAversions, setFlavorAversions] = useState<string[]>(
    initialData?.flavor_aversions ?? []
  )
  const [drinkingContexts, setDrinkingContexts] = useState<string[]>(
    initialData?.drinking_contexts ?? []
  )
  const [adventurenessScore, setAdventurenessScore] = useState<number | null>(
    initialData?.adventurousness_score ?? null
  )
  const [error, setError] = useState<string | null>(null)

  // Track previous step to determine slide direction when a progress dot is
  // clicked (which can jump multiple steps in either direction).
  const prevStepRef = useRef(currentStep)

  // Reset the animation class after the transition completes so re-entering
  // the same direction later still triggers the animation.
  useEffect(() => {
    if (slideDirection === 'none') return
    const timer = setTimeout(() => setSlideDirection('none'), 310)
    return () => clearTimeout(timer)
  }, [slideDirection, currentStep])

  const toggleInArray = useCallback((arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
  }, [])

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 3: // drinking context requires min 1
        return drinkingContexts.length >= 1
      case 4: // adventurousness requires selection
        return adventurenessScore !== null
      default:
        return true
    }
  }

  const goToStep = useCallback((targetStep: number) => {
    const prev = prevStepRef.current
    setSlideDirection(targetStep > prev ? 'forward' : 'back')
    prevStepRef.current = targetStep
    setCurrentStep(targetStep)
  }, [])

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS && canAdvance()) {
      goToStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    router.push('/wines')
  }

  const handleConfirm = () => {
    setError(null)
    startTransition(async () => {
      const input: TasteProfileInput = {
        flavor_affinities: flavorAffinities,
        flavor_aversions: flavorAversions,
        drinking_contexts: drinkingContexts,
        adventurousness_score: adventurenessScore ?? 2,
      }

      const result = await saveTasteProfile(input)
      if (result.error) {
        setError(result.error)
        return
      }

      router.push('/home')
    })
  }

  const profileInput: TasteProfileInput = {
    flavor_affinities: flavorAffinities,
    flavor_aversions: flavorAversions,
    drinking_contexts: drinkingContexts,
    adventurousness_score: adventurenessScore ?? 2,
  }

  const summary = currentStep === 5 ? generateProfileSummary(profileInput) : ''

  const slideClasses = getSlideClasses(slideDirection)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <OnboardingProgress
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onStepClick={goToStep}
        />
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Skip for now
        </button>
      </div>

      {/*
        Overflow is hidden on this wrapper so that during the 300ms slide
        animation the off-screen content is clipped and not visible.
      */}
      <div className="overflow-hidden min-h-[400px]">
        <div
          key={currentStep}
          className={slideClasses}
        >
          {currentStep === 1 && (
            <FlavorTagSelector
              selected={flavorAffinities}
              onToggle={(tag) => setFlavorAffinities((prev) => toggleInArray(prev, tag))}
            />
          )}

          {currentStep === 2 && (
            <AversionSelector
              selected={flavorAversions}
              onToggle={(tag) => setFlavorAversions((prev) => toggleInArray(prev, tag))}
            />
          )}

          {currentStep === 3 && (
            <DrinkingContextSelector
              selected={drinkingContexts}
              onToggle={(ctx) => setDrinkingContexts((prev) => toggleInArray(prev, ctx))}
            />
          )}

          {currentStep === 4 && (
            <AdventurenessSelector
              selected={adventurenessScore}
              onSelect={setAdventurenessScore}
            />
          )}

          {currentStep === 5 && (
            <ProfileSummary
              summary={summary}
              onConfirm={handleConfirm}
              onAdjust={handleBack}
              isSubmitting={isPending}
            />
          )}
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>
      )}

      {currentStep < 5 && (
        <div className="mt-8 flex items-center justify-between">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                &larr; Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {(currentStep === 1 || currentStep === 2) && (
              <button
                type="button"
                onClick={handleNext}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                {currentStep === 1 ? 'Not sure? Skip' : 'Skip'} &rarr;
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance()}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
