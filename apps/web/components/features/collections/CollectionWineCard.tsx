import Link from 'next/link'
import Image from 'next/image'
import { formatWinePrice, formatVarietalRegion } from '@/components/features/wines/utils'

interface CollectionWineCardProps {
  wine: {
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
  curatorNote?: string | null
}

export function CollectionWineCard({ wine, curatorNote }: CollectionWineCardProps) {
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)
  const price = formatWinePrice(wine.price_min, wine.price_max)
  const displayName = wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name

  return (
    <Link
      href={`/wines/${wine.slug}`}
      aria-label={`${displayName}, by ${wine.producer.name}, ${price}`}
      className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        {wine.image_url ? (
          <Image
            src={wine.image_url}
            alt={displayName}
            width={400}
            height={533}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M8 22h8" />
              <path d="M7 10h10" />
              <path d="M12 15v7" />
              <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {wine.producer.name}
        </p>
        <h3 className="text-lg font-medium leading-tight">{displayName}</h3>
        {varietalRegion && (
          <p className="text-sm text-muted-foreground">{varietalRegion}</p>
        )}
        <p className="text-lg font-semibold font-mono">{price}</p>
        {wine.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{wine.description}</p>
        )}
        {curatorNote && (
          <p className="text-sm text-muted-foreground italic">
            &mdash; {curatorNote}
          </p>
        )}
      </div>
    </Link>
  )
}
