import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatWinePrice, formatVarietalRegion } from './utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WineAvailability {
  nearbyRetailerCount: number
  lowestPrice: number
  closestRetailer?: {
    name: string
    distanceMiles: number
  }
}

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
  /** Show availability line below price. */
  showAvailability?: boolean
  /** Show wine description story hook. */
  showStoryHook?: boolean
  /** Rich availability data (replaces simple isAvailable boolean). */
  availability?: WineAvailability
  /** Called when buy button is tapped. Omit to hide the button. */
  onBuy?: (wineId: string) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WineCard({
  wine,
  showAvailability = true,
  showStoryHook = true,
  availability,
  onBuy,
}: WineCardProps) {
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)
  const price = formatWinePrice(wine.price_min, wine.price_max)
  const displayName = wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name

  const availabilityText = getAvailabilityLabel(availability)

  return (
    <Link
      href={`/wines/${wine.slug}`}
      aria-label={`Wine: ${displayName}, by ${wine.producer.name}, ${price}${showAvailability && availabilityText ? `, ${availabilityText}` : ''}`}
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

        {/* Price row with optional buy button */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold font-mono" aria-label={`Price: ${price}`}>
            {price}
          </p>

          {onBuy && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onBuy(wine.id)
              }}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                'text-muted-foreground hover:text-primary hover:bg-primary/10',
                'transition-all duration-150',
                'active:scale-95 motion-reduce:transform-none',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                // 44px touch target via padding
                'p-0 -m-1.5 min-w-[44px] min-h-[44px]'
              )}
              aria-label={`Add ${displayName} to cart`}
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {showStoryHook && wine.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {wine.description}
          </p>
        )}

        {showAvailability && (
          <AvailabilityLine availability={availability} />
        )}
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// AvailabilityLine — inline availability display
// ---------------------------------------------------------------------------

function AvailabilityLine({
  availability,
}: {
  availability?: WineAvailability
}) {
  if (!availability) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>Check availability</span>
      </div>
    )
  }

  if (availability.nearbyRetailerCount === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
        <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
        <span>Not available nearby</span>
      </div>
    )
  }

  const priceStr = formatPrice(availability.lowestPrice)

  if (
    availability.nearbyRetailerCount === 1 &&
    availability.closestRetailer
  ) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 flex-shrink-0 text-cru-success" aria-hidden="true" />
        <span>
          From {priceStr} at {availability.closestRetailer.name}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <MapPin className="h-3 w-3 flex-shrink-0 text-cru-success" aria-hidden="true" />
      <span>
        Available at {availability.nearbyRetailerCount}{' '}
        {availability.nearbyRetailerCount === 1 ? 'store' : 'stores'}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAvailabilityLabel(
  availability?: WineAvailability
): string | null {
  if (!availability) return null
  if (availability.nearbyRetailerCount === 0) return 'not available nearby'
  return `available at ${availability.nearbyRetailerCount} stores`
}

function formatPrice(cents: number): string {
  const dollars = cents / 100
  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`
}
