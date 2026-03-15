'use client'

import { RecommendationCard } from './RecommendationCard'

interface ProfileSummaryProps {
  summary: string
  onConfirm: () => void
  onAdjust: () => void
  isSubmitting?: boolean
}

/**
 * Mock wine recommendations shown on the onboarding summary screen (Step 5).
 *
 * These are static placeholder wines. In the full curation engine (PRD-07)
 * this list will be replaced by a real-time personalised recommendation API
 * call using the freshly-saved taste profile. For now, the mock data provides
 * a realistic preview of what the feed will look like.
 */
const MOCK_RECOMMENDATIONS = [
  {
    name: 'Pinot Noir Reserve 2021',
    producer: 'Domaine Drouhin',
    region: 'Willamette Valley, OR',
    varietal: 'Pinot Noir',
    price: '$42',
  },
  {
    name: 'Côtes du Rhône 2022',
    producer: 'Château Rayas',
    region: 'Rhône Valley, France',
    varietal: 'Grenache Blend',
    price: '$28',
  },
  {
    name: 'Barbera d\'Asti Superiore 2020',
    producer: 'Braida',
    region: 'Piedmont, Italy',
    varietal: 'Barbera',
    price: '$35',
  },
  {
    name: 'Sauvignon Blanc 2023',
    producer: 'Cloudy Bay',
    region: 'Marlborough, NZ',
    varietal: 'Sauvignon Blanc',
    price: '$24',
  },
  {
    name: 'Ribera del Duero Crianza 2019',
    producer: 'Vega Sicilia',
    region: 'Ribera del Duero, Spain',
    varietal: 'Tempranillo',
    price: '$55',
  },
  {
    name: 'Chardonnay 2022',
    producer: 'Rombauer Vineyards',
    region: 'Carneros, CA',
    varietal: 'Chardonnay',
    price: '$38',
  },
  {
    name: 'Côte de Beaune 2020',
    producer: 'Louis Jadot',
    region: 'Burgundy, France',
    varietal: 'Pinot Noir',
    price: '$62',
  },
  {
    name: 'Malbec 2021',
    producer: 'Catena Zapata',
    region: 'Mendoza, Argentina',
    varietal: 'Malbec',
    price: '$32',
  },
] as const

export function ProfileSummary({
  summary,
  onConfirm,
  onAdjust,
  isSubmitting = false,
}: ProfileSummaryProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Here&apos;s what we think you&apos;ll love.</h2>
      </div>

      <blockquote className="rounded-lg border border-border bg-muted/50 p-6 text-base leading-relaxed text-foreground italic">
        {summary}
      </blockquote>

      {/* Primary action buttons per Design Bible section 9.5 */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-label="Confirm taste profile and continue"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {isSubmitting ? 'Saving...' : 'Looks right!'}
        </button>
        <button
          type="button"
          onClick={onAdjust}
          aria-label="Go back and adjust your taste preferences"
          className="rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Not quite
        </button>
      </div>

      {/* First 8 wine picks — Design Bible 9.5: "The first 8 wine recommendations appear immediately below" */}
      <section aria-label="Your first wine picks">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Your first picks
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MOCK_RECOMMENDATIONS.map((wine) => (
            <RecommendationCard key={wine.name} wine={wine} />
          ))}
        </div>
      </section>
    </div>
  )
}
