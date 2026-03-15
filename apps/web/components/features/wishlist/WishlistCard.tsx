/**
 * WishlistCard — vertical wine card with a remove button.
 *
 * Matches the standard WineCard grid layout. The parent (`WishlistGrid`) owns
 * the undo-toast state and passes `onRemove` so the card itself stays simple.
 */

import Link from 'next/link'
import Image from 'next/image'
import { X } from 'lucide-react'
import { formatWinePrice, formatVarietalRegion } from '@/components/features/wines/utils'

export interface WishlistCardWine {
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

interface WishlistCardProps {
  wine: WishlistCardWine
  addedAt: string
  /** Called when the user clicks the remove button */
  onRemove: (wineId: string, wineName: string) => void
}

export function WishlistCard({ wine, onRemove }: WishlistCardProps) {
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)
  const price = formatWinePrice(wine.price_min, wine.price_max)
  const displayName = wine.vintage ? `${wine.name} ${wine.vintage}` : wine.name

  return (
    <div className="group relative rounded-lg border border-border bg-card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Remove button — top-right corner, visible on hover or focus */}
      <button
        type="button"
        onClick={() => onRemove(wine.id, displayName)}
        aria-label={`Remove ${displayName} from wishlist`}
        className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>

      {/* Wine image */}
      <Link
        href={`/wines/${wine.slug}`}
        aria-label={`View ${displayName} by ${wine.producer.name}`}
        tabIndex={-1}
        className="block aspect-[3/4] overflow-hidden bg-muted"
      >
        {wine.image_url ? (
          <Image
            src={wine.image_url}
            alt={displayName}
            width={400}
            height={533}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
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
      </Link>

      {/* Card body */}
      <div className="p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {wine.producer.name}
        </p>

        <Link href={`/wines/${wine.slug}`} className="hover:underline">
          <h3 className="text-base font-medium leading-tight">{displayName}</h3>
        </Link>

        {varietalRegion && (
          <p className="text-sm text-muted-foreground">{varietalRegion}</p>
        )}

        <p className="text-base font-semibold font-mono" aria-label={`Price: ${price}`}>
          {price}
        </p>
      </div>
    </div>
  )
}
