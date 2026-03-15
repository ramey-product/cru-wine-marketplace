import { WineCard } from './WineCard'
import type { PlaceholderWine } from '@/app/(app)/wines/_lib/placeholder-wines'

interface RecommendedWinesProps {
  /** Wines to display as recommendations. */
  wines: PlaceholderWine[]
}

/**
 * "You Might Also Enjoy" section showing a responsive grid of wine cards.
 * Renders up to 6 wines in a 2-col (mobile) / 3-col (tablet) / 6-col (desktop) grid.
 */
export function RecommendedWines({ wines }: RecommendedWinesProps) {
  if (wines.length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {wines.map((wine) => (
        <WineCard
          key={wine.id}
          wine={wine}
          showAvailability={false}
          showStoryHook={false}
        />
      ))}
    </div>
  )
}
