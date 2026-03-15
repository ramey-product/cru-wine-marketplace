import { WineGridClient } from '@/components/features/wines/WineGridClient'

interface ProducerWine {
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
  description: string | null
  producer: { name: string; slug: string }
}

interface ProducerWineGridProps {
  producerName: string
  wines: ProducerWine[]
}

export function ProducerWineGrid({ producerName, wines }: ProducerWineGridProps) {
  if (wines.length === 0) {
    return (
      <section aria-labelledby="producer-wines-heading">
        <h2
          id="producer-wines-heading"
          className="text-2xl font-semibold text-foreground mb-6"
        >
          Wines by {producerName}
        </h2>
        <p className="text-sm text-muted-foreground">
          No wines currently available. Check back soon.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="producer-wines-heading">
      <h2
        id="producer-wines-heading"
        className="text-2xl font-semibold text-foreground mb-6"
      >
        Wines by {producerName}
      </h2>
      <WineGridClient
        wines={wines}
        showAvailability={false}
        gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      />
    </section>
  )
}
