import Link from 'next/link'
import Image from 'next/image'
import { formatWinePrice, formatVarietalRegion } from '@/components/features/wines/utils'
import { WishlistToggleButton } from './WishlistToggleButton'

interface WishlistCardProps {
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
  addedAt: string
}

export function WishlistCard({ wine, addedAt }: WishlistCardProps) {
  const varietalRegion = formatVarietalRegion(wine.varietal, wine.region, wine.country)
  const price = formatWinePrice(wine.price_min, wine.price_max)
  const addedDate = new Date(addedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="flex items-start gap-4 rounded-lg border border-border bg-card p-4">
      <Link
        href={`/wines/${wine.slug}`}
        className="flex-shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <div className="h-24 w-16">
          {wine.image_url ? (
            <Image
              src={wine.image_url}
              alt={wine.name}
              width={64}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
      </Link>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {wine.producer.name}
        </p>
        <Link href={`/wines/${wine.slug}`} className="hover:underline">
          <h3 className="text-sm font-medium leading-tight mt-0.5">{wine.name}</h3>
        </Link>
        {varietalRegion && (
          <p className="text-xs text-muted-foreground mt-0.5">{varietalRegion}</p>
        )}
        <p className="text-sm font-semibold font-mono mt-1">{price}</p>
        <p className="text-xs text-muted-foreground mt-1">Added {addedDate}</p>
      </div>

      <WishlistToggleButton wineId={wine.id} isWishlisted={true} variant="compact" />
    </div>
  )
}
