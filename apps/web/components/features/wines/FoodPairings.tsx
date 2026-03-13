import { UtensilsCrossed } from 'lucide-react'

interface FoodPairingsProps {
  pairings: string[] | null
}

export function FoodPairings({ pairings }: FoodPairingsProps) {
  if (!pairings || pairings.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="food-pairings-heading">
      <h2
        id="food-pairings-heading"
        className="text-lg font-semibold text-foreground mb-3"
      >
        Food Pairings
      </h2>
      <ul className="space-y-2">
        {pairings.map((pairing, index) => (
          <li key={index} className="flex items-center gap-2 text-muted-foreground">
            <UtensilsCrossed className="h-4 w-4 flex-shrink-0 text-secondary" aria-hidden="true" />
            <span>{pairing}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
