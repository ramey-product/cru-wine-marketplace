'use client'

import { MapPin, ShoppingCart, Clock } from 'lucide-react'
import { useTransition } from 'react'
import { cn } from '@/lib/utils'
import type { RetailerBadge } from './RetailerSelectionSheet'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RetailerCardProps {
  retailer: {
    id: string
    orgId: string
    name: string
    distanceMiles: number
    price: number
    fulfillment: ('pickup' | 'delivery')[]
    inStock: boolean
    prepTimeMinutes?: number
    deliveryWindowEnd?: string
    isOpen?: boolean
    closingSoon?: boolean
    nextOpenAt?: string
  }
  wineId: string
  onAddToCart: (retailerOrgId: string) => Promise<void>
  badge?: RetailerBadge
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi'
  return `${miles.toFixed(1)} mi`
}

function getTimeEstimate(retailer: RetailerCardProps['retailer']): string {
  if (retailer.fulfillment.includes('pickup')) {
    const prep = retailer.prepTimeMinutes ?? 30
    return `Ready in ~${prep} min`
  }
  if (retailer.deliveryWindowEnd) {
    return `Delivery by ${retailer.deliveryWindowEnd}`
  }
  return `~${retailer.prepTimeMinutes ?? 30} min`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RetailerCard({
  retailer,
  wineId,
  onAddToCart,
  badge,
}: RetailerCardProps) {
  const [isPending, startTransition] = useTransition()
  const isClosed = retailer.isOpen === false
  const isDisabled = isPending || !retailer.inStock || isClosed

  const handleAdd = () => {
    startTransition(async () => {
      await onAddToCart(retailer.orgId)
    })
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-lg border border-border p-4 min-h-[44px]',
        isClosed && retailer.inStock && 'opacity-60'
      )}
    >
      <div className="min-w-0 flex-1">
        {/* Name + badge */}
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{retailer.name}</p>
          {badge && (
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap',
                badge.className
              )}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Time-first display: "Ready in ~30 min · 1.2 mi" */}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>{getTimeEstimate(retailer)}</span>
          <span aria-hidden="true">&middot;</span>
          <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>{formatDistance(retailer.distanceMiles)}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-mono">${retailer.price.toFixed(2)}</span>
        </div>

        {/* Fulfillment badges + status indicators */}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {retailer.fulfillment.map((method) => (
            <span
              key={method}
              className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize"
            >
              {method}
            </span>
          ))}

          {/* Store hours indicator */}
          {retailer.isOpen === true && !retailer.closingSoon && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
              Open
            </span>
          )}
          {retailer.closingSoon && (
            <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
              <span
                className="h-1.5 w-1.5 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              Closes soon
            </span>
          )}
          {isClosed && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
                aria-hidden="true"
              />
              Closed
              {retailer.nextOpenAt ? ` · Opens ${retailer.nextOpenAt}` : ''}
            </span>
          )}

          {!retailer.inStock && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
              Out of stock
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={isDisabled}
        aria-label={`Add to cart from ${retailer.name}`}
        className="ml-3 flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Adding...' : 'Add'}
      </button>
    </div>
  )
}
