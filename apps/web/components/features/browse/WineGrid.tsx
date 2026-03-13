import { WineCard } from '@/components/features/wines/WineCard'

interface WineGridWine {
  id: string
  name: string
  slug: string
  varietal: string | null
  region: string | null
  country: string | null
  vintage?: number | null
  image_url: string | null
  price_min: number | null
  price_max: number | null
  producer: { name: string; slug: string }
  description: string | null
}

interface WineGridProps {
  wines: WineGridWine[]
}

export function WineGrid({ wines }: WineGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wines.map((wine) => (
        <WineCard key={wine.id} wine={wine} />
      ))}
    </div>
  )
}
