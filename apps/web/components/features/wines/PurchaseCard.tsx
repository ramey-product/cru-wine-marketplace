'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Heart, Share2, ShoppingCart, Link as LinkIcon, Check } from 'lucide-react'
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
  const [wishlisted, setWishlisted] = useState(false)
  const [heartAnimating, setHeartAnimating] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = async (_retailerOrgId: string) => {
    // TODO: Call addToCart server action
  }

  const handleBuy = () => {
    setSheetOpen(true)
  }

  const handleWishlist = () => {
    setWishlisted((prev) => !prev)
    setHeartAnimating(true)
    // Remove animation class after it completes so it can re-trigger
    setTimeout(() => setHeartAnimating(false), 300)
  }

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: wineName,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed
      })
    } else {
      setShareOpen((prev) => !prev)
      setCopied(false)
    }
  }

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShareOpen(false)
      }, 1500)
    } catch {
      // Clipboard API not available
    }
  }, [])

  // Close share popover when clicking outside
  useEffect(() => {
    if (!shareOpen) return

    function handleClickOutside(event: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShareOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [shareOpen])

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
              aria-label={wishlisted ? `Remove ${wineName} from wishlist` : `Add ${wineName} to wishlist`}
              className={cn(
                'flex-1 h-10 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center justify-center gap-2',
                wishlisted
                  ? 'border-primary/30 bg-primary/5 text-primary hover:bg-primary/10'
                  : 'border-border bg-card text-foreground hover:bg-muted'
              )}
            >
              <Heart
                className={cn(
                  'h-4 w-4',
                  wishlisted && 'fill-primary text-primary',
                  heartAnimating && 'animate-scale-pop'
                )}
                aria-hidden="true"
              />
              {wishlisted ? 'Saved' : 'Save'}
            </button>
            <div className="relative flex-1" ref={shareRef}>
              <button
                onClick={handleShare}
                aria-label={`Share ${wineName}`}
                aria-expanded={shareOpen}
                className="w-full h-10 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share
              </button>
              {/* Desktop share popover */}
              {shareOpen && (
                <div
                  role="dialog"
                  aria-label="Share options"
                  className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-popover text-popover-foreground shadow-md p-2 z-50"
                >
                  <button
                    onClick={handleCopyLink}
                    aria-label="Copy link to clipboard"
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors duration-fast"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-cru-success" aria-hidden="true" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4" aria-hidden="true" />
                        Copy Link
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
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
            aria-label={wishlisted ? `Remove ${wineName} from wishlist` : `Add ${wineName} to wishlist`}
            className={cn(
              'h-10 w-10 rounded-lg border flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150',
              wishlisted
                ? 'border-primary/30 bg-primary/5'
                : 'border-border hover:bg-muted'
            )}
          >
            <Heart
              className={cn(
                'h-4 w-4',
                wishlisted && 'fill-primary text-primary',
                heartAnimating && 'animate-scale-pop'
              )}
              aria-hidden="true"
            />
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
