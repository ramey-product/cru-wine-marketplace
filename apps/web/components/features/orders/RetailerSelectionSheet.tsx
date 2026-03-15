'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { RetailerCard } from './RetailerCard'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Retailer {
  id: string
  orgId: string
  name: string
  distanceMiles: number
  /** Price in dollars. */
  price: number
  fulfillment: ('pickup' | 'delivery')[]
  inStock: boolean
  /** Estimated prep time in minutes (default 30). */
  prepTimeMinutes?: number
  /** Delivery window end time (e.g. "4:00 PM"). */
  deliveryWindowEnd?: string
  /** Whether the store is currently open. */
  isOpen?: boolean
  /** Whether the store is closing within 1 hour. */
  closingSoon?: boolean
  /** Next opening time when closed (e.g. "10:00 AM"). */
  nextOpenAt?: string
}

export interface RetailerBadge {
  label: string
  className: string
}

interface RetailerSelectionSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  wineName: string
  wineId: string
  onAddToCart: (retailerOrgId: string) => Promise<void>
  /** Retailers to display. Falls back to mock data for development. */
  retailers?: Retailer[]
}

// ---------------------------------------------------------------------------
// Mock data (development fallback)
// ---------------------------------------------------------------------------

const MOCK_RETAILERS: Retailer[] = [
  {
    id: 'r1',
    orgId: 'org-1',
    name: 'Wine House Los Angeles',
    distanceMiles: 1.2,
    price: 28.0,
    fulfillment: ['pickup', 'delivery'],
    inStock: true,
    prepTimeMinutes: 25,
    deliveryWindowEnd: '4:00 PM',
    isOpen: true,
  },
  {
    id: 'r2',
    orgId: 'org-2',
    name: 'The Cork & Bottle',
    distanceMiles: 2.8,
    price: 30.0,
    fulfillment: ['pickup'],
    inStock: true,
    prepTimeMinutes: 30,
    isOpen: true,
    closingSoon: true,
  },
  {
    id: 'r3',
    orgId: 'org-3',
    name: 'Vino Locale',
    distanceMiles: 4.5,
    price: 27.5,
    fulfillment: ['delivery'],
    inStock: false,
    isOpen: false,
    nextOpenAt: '10:00 AM',
  },
]

// ---------------------------------------------------------------------------
// Badge computation
// ---------------------------------------------------------------------------

function computeBadges(retailers: Retailer[]): Map<string, RetailerBadge> {
  const inStock = retailers.filter((r) => r.inStock)
  if (inStock.length === 0) return new Map()

  const badges = new Map<string, RetailerBadge>()

  // Find best price and closest
  let bestPriceId: string | null = null
  let bestPrice = Infinity
  let closestId: string | null = null
  let closestDist = Infinity

  for (const r of inStock) {
    if (r.price < bestPrice) {
      bestPrice = r.price
      bestPriceId = r.id
    }
    if (r.distanceMiles < closestDist) {
      closestDist = r.distanceMiles
      closestId = r.id
    }
  }

  // Best Value = first in sorted list (already sorted by composite score)
  const bestValueId = inStock[0]?.id
  if (bestValueId) {
    badges.set(bestValueId, {
      label: 'Best Value',
      className: 'bg-primary/10 text-primary',
    })
  }

  // Best Price — only if different from best value
  if (bestPriceId && !badges.has(bestPriceId)) {
    badges.set(bestPriceId, {
      label: 'Best Price',
      className:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    })
  }

  // Closest — only if not already badged
  if (closestId && !badges.has(closestId)) {
    badges.set(closestId, {
      label: 'Closest',
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    })
  }

  return badges
}

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

function sortByBestValue(retailers: Retailer[]): Retailer[] {
  const inStock = retailers.filter((r) => r.inStock)
  const outOfStock = retailers.filter((r) => !r.inStock)

  if (inStock.length === 0) return [...outOfStock]

  const maxPrice = Math.max(...inStock.map((r) => r.price))
  const maxDist = Math.max(...inStock.map((r) => r.distanceMiles))

  // Composite score: 60% price, 40% distance (lower = better)
  const scored = inStock.map((r) => ({
    retailer: r,
    score:
      (maxPrice > 0 ? (r.price / maxPrice) * 0.6 : 0) +
      (maxDist > 0 ? (r.distanceMiles / maxDist) * 0.4 : 0),
  }))

  scored.sort((a, b) => a.score - b.score)

  // Open stores first within in-stock, closed at bottom
  const openRetailers = scored.filter(
    (s) => s.retailer.isOpen !== false
  )
  const closedRetailers = scored.filter(
    (s) => s.retailer.isOpen === false
  )

  return [
    ...openRetailers.map((s) => s.retailer),
    ...closedRetailers.map((s) => s.retailer),
    ...outOfStock,
  ]
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RetailerSelectionSheet({
  open,
  onOpenChange,
  wineName,
  wineId,
  onAddToCart,
  retailers = MOCK_RETAILERS,
}: RetailerSelectionSheetProps) {
  const sorted = sortByBestValue(retailers)
  const inStockCount = sorted.filter((r) => r.inStock).length
  const badges = computeBadges(sorted.filter((r) => r.inStock))

  const handleAddToCart = async (retailerOrgId: string) => {
    await onAddToCart(retailerOrgId)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[85vh] overflow-y-auto rounded-t-xl sm:rounded-t-none sm:max-w-lg sm:data-[side=bottom]:inset-x-auto sm:data-[side=bottom]:right-0 sm:data-[side=bottom]:left-auto"
      >
        <SheetHeader>
          <SheetTitle>Buy {wineName}</SheetTitle>
          <SheetDescription>
            {inStockCount}{' '}
            {inStockCount === 1 ? 'retailer' : 'retailers'} nearby
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">
          {sorted.map((retailer) => (
            <RetailerCard
              key={retailer.id}
              retailer={retailer}
              wineId={wineId}
              onAddToCart={handleAddToCart}
              badge={badges.get(retailer.id)}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
