'use client'

import { MapPin, ShoppingCart } from 'lucide-react'
import { useTransition } from 'react'

interface RetailerCardProps {
  retailer: {
    id: string
    orgId: string
    name: string
    distanceMiles: number
    price: number
    fulfillment: ('pickup' | 'delivery')[]
    inStock: boolean
  }
  wineId: string
  onAddToCart: (retailerOrgId: string) => Promise<void>
}

export function RetailerCard({ retailer, wineId, onAddToCart }: RetailerCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleAdd = () => {
    startTransition(async () => {
      await onAddToCart(retailer.orgId)
    })
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{retailer.name}</p>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
          <span>{retailer.distanceMiles} mi</span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-mono">${retailer.price.toFixed(2)}</span>
        </div>
        <div className="mt-1.5 flex gap-1.5">
          {retailer.fulfillment.map((method) => (
            <span
              key={method}
              className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize"
            >
              {method}
            </span>
          ))}
          {!retailer.inStock && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
              Out of stock
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={isPending || !retailer.inStock}
        aria-label={`Add to cart from ${retailer.name}`}
        className="ml-3 flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        {isPending ? 'Adding...' : 'Add'}
      </button>
    </div>
  )
}
