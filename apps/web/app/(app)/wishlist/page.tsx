import Link from 'next/link'
import { Heart } from 'lucide-react'
import { WishlistCard } from '@/components/features/wishlist/WishlistCard'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

export const metadata = {
  title: 'Wishlist | Cru',
  description: 'Your saved wines — everything you want to try next.',
}

// TODO: Replace with real DAL call via fetchWishlistItems
// URL search params will control sort: ?sort=added_at|price|name
const MOCK_WISHLIST = PLACEHOLDER_WINES.slice(0, 4).map((wine, i) => ({
  wine,
  addedAt: new Date(Date.now() - i * 86400000).toISOString(),
}))

export default function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  // TODO: const params = await searchParams; const sort = params.sort
  const items = MOCK_WISHLIST

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'wine' : 'wines'} saved
          </p>
        </div>

        {/* TODO: Sort select using URL search params */}
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {items.map((item) => (
            <WishlistCard
              key={item.wine.id}
              wine={item.wine}
              addedAt={item.addedAt}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/50 mb-4" aria-hidden="true" />
          <h2 className="text-lg font-medium">Nothing here yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you find a wine that catches your eye, tap the heart to save it here.
          </p>
          <Link
            href="/wines"
            className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Browse wines
          </Link>
        </div>
      )}
    </div>
  )
}
