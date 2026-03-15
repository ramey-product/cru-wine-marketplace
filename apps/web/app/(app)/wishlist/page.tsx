/**
 * WishlistPage — server component
 *
 * Reads the `?sort=` search param, applies the sort to the mock data, then
 * hands the sorted list to the client-side `WishlistGrid` which owns
 * optimistic-removal and undo-toast state.
 *
 * TODO: Replace MOCK_WISHLIST with a real DAL call via fetchWishlistItems once
 *       the database layer is connected (see lib/actions/wishlists.ts).
 */

import { Suspense } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { WishlistGrid } from '@/components/features/wishlist/WishlistGrid'
import { WishlistSortSelect, type WishlistSortValue } from '@/components/features/wishlist/WishlistSortSelect'
import { PLACEHOLDER_WINES } from '@/app/(app)/wines/_lib/placeholder-wines'

export const metadata = {
  title: 'Wishlist | Cru',
  description: 'Your saved wines — everything you want to try next.',
}

// ---------------------------------------------------------------------------
// Mock data — replace with DAL call
// ---------------------------------------------------------------------------

const MOCK_WISHLIST = PLACEHOLDER_WINES.slice(0, 8).map((wine, i) => ({
  wine,
  addedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseSort(raw: string | undefined): WishlistSortValue {
  if (raw === 'price-asc' || raw === 'price-desc') return raw
  return 'date-added'
}

function sortItems(
  items: typeof MOCK_WISHLIST,
  sort: WishlistSortValue
): typeof MOCK_WISHLIST {
  const copy = [...items]

  if (sort === 'price-asc') {
    copy.sort((a, b) => {
      const aPrice = a.wine.price_min ?? a.wine.price_max ?? 0
      const bPrice = b.wine.price_min ?? b.wine.price_max ?? 0
      return aPrice - bPrice
    })
  } else if (sort === 'price-desc') {
    copy.sort((a, b) => {
      const aPrice = a.wine.price_min ?? a.wine.price_max ?? 0
      const bPrice = b.wine.price_min ?? b.wine.price_max ?? 0
      return bPrice - aPrice
    })
  }
  // 'date-added' — default mock order (already newest-first by index)

  return copy
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

interface WishlistPageProps {
  searchParams: Promise<{ sort?: string }>
}

export default async function WishlistPage({ searchParams }: WishlistPageProps) {
  const params = await searchParams
  const sort = parseSort(params.sort)
  const items = sortItems(MOCK_WISHLIST, sort)

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Wishlist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? 'wine' : 'wines'} saved
          </p>
        </div>

        {/* Sort dropdown — wrapped in Suspense because WishlistSortSelect uses useSearchParams */}
        {items.length > 0 && (
          <Suspense fallback={null}>
            <WishlistSortSelect currentSort={sort} />
          </Suspense>
        )}
      </div>

      {/* Grid or empty state */}
      {items.length > 0 ? (
        <WishlistGrid items={items} />
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
