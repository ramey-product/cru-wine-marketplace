/**
 * WishlistSortSelect — client component
 *
 * A sort dropdown that reflects and updates the `?sort=` URL search param.
 * Keeping this as its own small client component avoids marking the entire
 * wishlist page as a client component.
 *
 * URL param values:
 *  - `date-added`  (default) — most recently saved first
 *  - `price-asc`             — price low to high
 *  - `price-desc`            — price high to low
 */
'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export type WishlistSortValue = 'date-added' | 'price-asc' | 'price-desc'

const SORT_OPTIONS: { value: WishlistSortValue; label: string }[] = [
  { value: 'date-added', label: 'Date Added' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
]

interface WishlistSortSelectProps {
  /** Currently active sort — derived from URL on the server and passed as a prop */
  currentSort: WishlistSortValue
}

export function WishlistSortSelect({ currentSort }: WishlistSortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value as WishlistSortValue
      const params = new URLSearchParams(searchParams.toString())

      if (value === 'date-added') {
        // Default — omit the param to keep URLs clean
        params.delete('sort')
      } else {
        params.set('sort', value)
      }

      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="wishlist-sort"
        className="text-sm text-muted-foreground whitespace-nowrap"
      >
        Sort by
      </label>
      <select
        id="wishlist-sort"
        value={currentSort}
        onChange={handleChange}
        className="
          rounded-md border border-input bg-background px-3 py-1.5
          text-sm text-foreground shadow-sm
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
          cursor-pointer
        "
        aria-label="Sort wishlist"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
