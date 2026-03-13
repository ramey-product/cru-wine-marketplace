'use client'

import { useState } from 'react'
import { Heart, Share2, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RetailerSelectionSheet } from '@/components/features/orders/RetailerSelectionSheet'

interface PurchaseCardProps {
  price: string
  isAvailable: boolean
  wineName: string
  wineId?: string
}

export function PurchaseCard({ price, isAvailable, wineName, wineId = '' }: PurchaseCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleAddToCart = async (_retailerOrgId: string) => {
    // TODO: Call addToCart server action
  }

  const handleBuy = () => {
    setSheetOpen(true)
  }

  const handleWishlist = () => {
    // TODO: Toggle wishlist with scale-pop animation
  }

  const handleShare = () => {
    // TODO: Use Web Share API on mobile, clipboard + social on desktop
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: wineName,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed — no-op
      })
    }
  }

  return (
    <>
      {/* Desktop: Sticky sidebar card */}
      <div className="hidden lg:block">
        <div className="sticky top-20 rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
          <p className="text-2xl font-semibold font-mono text-foreground" aria-label={`Price: ${price}`}>
            {price}
          </p>

          <div className="flex items-center gap-1.5 text-sm">
            <span
              className={cn(
                'h-2 w-2 rounded-full',
                isAvailable ? 'bg-cru-success' : 'bg-muted-foreground'
              )}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">
              {isAvailable ? 'In stock nearby' : 'Check availability'}
            </span>
          </div>

          <button
            onClick={handleBuy}
            aria-label={`Buy ${wineName}`}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Buy Now
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleWishlist}
              aria-label={`Add ${wineName} to wishlist`}
              className="flex-1 h-10 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Heart className="h-4 w-4" aria-hidden="true" />
              Save
            </button>
            <button
              onClick={handleShare}
              aria-label={`Share ${wineName}`}
              className="flex-1 h-10 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center justify-center gap-2"
            >
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold font-mono text-foreground">{price}</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isAvailable ? 'bg-cru-success' : 'bg-muted-foreground'
                )}
                aria-hidden="true"
              />
              <span className="text-muted-foreground">
                {isAvailable ? 'In stock nearby' : 'Check availability'}
              </span>
            </div>
          </div>

          <button
            onClick={handleWishlist}
            aria-label={`Add ${wineName} to wishlist`}
            className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150"
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            onClick={handleBuy}
            aria-label={`Buy ${wineName}`}
            className="h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150"
          >
            Buy Now
          </button>
        </div>
      </div>
      {/* Retailer Selection Sheet */}
      <RetailerSelectionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        wineName={wineName}
        wineId={wineId}
        onAddToCart={handleAddToCart}
      />
    </>
  )
}
