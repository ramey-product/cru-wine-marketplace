import { RecommendationCardInteractive } from './RecommendationCardInteractive'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

// TODO: Replace with real getRecommendations() call
const MOCK_RECOMMENDATIONS = PLACEHOLDER_WINES.slice(0, 8).map((wine) => ({
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
    producer: { name: wine.producer.name, slug: wine.producer.slug },
  },
  matchReasons: ['Matches your favorite flavors', 'Available near you'],
  matchScore: 12.5,
}))

export function PickedForYou() {
  return (
    <section aria-label="Picked for you">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Picked for You</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Wines we think you&apos;ll love based on your taste profile
        </p>
      </div>

      <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 -mx-4 px-4">
        {MOCK_RECOMMENDATIONS.map((rec) => (
          <div key={rec.wine.id} className="snap-start flex-shrink-0 w-[280px]">
            <RecommendationCardInteractive
              wine={rec.wine}
              matchReasons={rec.matchReasons}
              matchScore={rec.matchScore}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
