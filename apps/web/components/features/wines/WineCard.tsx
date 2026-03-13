import Link from 'next/link'
import Image from 'next/image'
import { AvailabilityIndicator } from './AvailabilityIndicator'

interface WineCardProps {
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
  showAvailability?: boolean
  showStoryHook?: boolean
  isAvailable?: boolean
}

function formatPrice(priceMin: number | null, priceMax: number | null): string {
  if (priceMin === null && priceMax === null) {
    return 'Check availability'
  }

  const fmt = (n: number) =>
    n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`

  if (priceMin !== null && priceMax !== null) {
    if (priceMin === priceMax) {
      return fmt(priceMin)
    }
    return `${fmt(priceMin)}–${fmt(priceMax)}`
  }

  return fmt(priceMin ?? priceMax!)
}

function formatVarietalRegion(
  varietal: string | null,
  region: string | null,
  country: string | null
): string | null {
  const parts: string[] = []
  if (varietal) parts.push(varietal)

  const location = [region, country].filter(Boolean).join(', ')
  if (location) parts.push(location)

  return parts.length > 0 ? parts.join(' \u2014 ') : null
}

export function WineCard({
  wine,
  showAvailability = true,
  showStoryHook = true,
  isAvailable = false,
}: WineCardProps) {
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)
  const price = formatPrice(wine.price_min, wine.price_max)
  const displayName = wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name

  return (
    <Link
      href={`/wines/${wine.slug}`}
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

        {showStoryHook && wine.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {wine.description}
          </p>
        )}

        {showAvailability && (
          <AvailabilityIndicator isAvailable={isAvailable} />
        )}
      </div>
    </Link>
  )
}
