import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { formatWinePrice, formatVarietalRegion } from '@/components/features/wines/utils'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

// Mock: first 3 wines as the user's public wishlist
const MOCK_PUBLIC_WISHLIST = PLACEHOLDER_WINES.slice(0, 3).map((wine, i) => ({
  wine,
  addedAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

interface PublicWishlistCardProps {
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

function PublicWishlistCard({ wine, addedAt }: PublicWishlistCardProps) {
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
    </div>
  )
}

export function ProfileWishlistTab() {
  const items = MOCK_PUBLIC_WISHLIST

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
        <h2 className="text-lg font-medium">No wines saved yet</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          This user hasn&apos;t added any wines to their wishlist.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? 'wine' : 'wines'} saved
      </p>
      <div className="grid grid-cols-1 gap-3">
        {items.map((item) => (
          <PublicWishlistCard
            key={item.wine.id}
            wine={item.wine}
            addedAt={item.addedAt}
          />
        ))}
      </div>
    </div>
  )
}
