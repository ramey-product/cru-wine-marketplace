import {
  PLACEHOLDER_WINES,
  MOCK_AVAILABILITY,
} from '@/app/(app)/wines/_lib/placeholder-wines'
import { WineGridClient } from '@/components/features/wines/WineGridClient'

// TODO: Replace with real DAL call for popular wines nearby
const POPULAR_WINES = PLACEHOLDER_WINES.slice(0, 6)

export function PopularNearYou() {
  return (
    <section aria-label="Popular near you">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Popular Near You</h2>
        <p className="mt-1 text-sm text-muted-foreground">Trending at shops nearby</p>
      </div>

      <WineGridClient
        wines={POPULAR_WINES}
        showBuyButton
        showAvailability
        availabilityMap={MOCK_AVAILABILITY}
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      />
    </section>
  )
}
