import Link from 'next/link'
import Image from 'next/image'
import { formatWinePrice, formatVarietalRegion } from '@/components/features/wines/utils'

interface RecommendationCardProps {
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

export function RecommendationCard({ wine, matchReasons }: RecommendationCardProps) {
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)
  const price = formatWinePrice(wine.price_min, wine.price_max)
  const reasonText = matchReasons.slice(0, 2).join(' \u00B7 ')

  return (
    <Link
      href={`/wines/${wine.slug}`}
      aria-label={`Recommended wine: ${wine.name}, by ${wine.producer.name}, ${price}`}
      className="group cursor-pointer rounded-lg border border-border bg-card overflow-hidden
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block"
    >
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        {wine.image_url ? (
          <Image
            src={wine.image_url}
            alt={wine.name}
            width={280}
            height={373}
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
        <h3 className="text-lg font-medium leading-tight">{wine.name}</h3>
        {varietalRegion && (
          <p className="text-sm text-muted-foreground">{varietalRegion}</p>
        )}
        <p className="text-lg font-semibold font-mono">{price}</p>
        {reasonText && (
          <p className="text-xs text-muted-foreground italic">{reasonText}</p>
        )}
      </div>
    </Link>
  )
}
