'use client'

import { useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { addWineToWishlist, removeWineFromWishlistAction } from '@/lib/actions/wishlists'

interface WishlistToggleButtonProps {
  wineId: string
  isWishlisted: boolean
  /** Compact variant for use inside wine cards */
  variant?: 'default' | 'compact'
}

export function WishlistToggleButton({
  wineId,
  isWishlisted,
  variant = 'default',
}: WishlistToggleButtonProps) {
  const [optimisticWishlisted, setOptimisticWishlisted] = useOptimistic(isWishlisted)
  const [isPending, startTransition] = useTransition()

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      setOptimisticWishlisted(!optimisticWishlisted)
      if (optimisticWishlisted) {
        const result = await removeWineFromWishlistAction(wineId)
        if (result.error) {
          setOptimisticWishlisted(true)
        }
      } else {
        const result = await addWineToWishlist(wineId)
        if (result.error) {
          setOptimisticWishlisted(false)
        }
      }
    })
  }

  const isCompact = variant === 'compact'

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={optimisticWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={optimisticWishlisted}
      className={`transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full ${
        isCompact ? 'p-1.5' : 'p-2'
      } ${
        optimisticWishlisted
          ? 'text-red-500 hover:text-red-600'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      <Heart
        className={isCompact ? 'h-4 w-4' : 'h-5 w-5'}
        fill={optimisticWishlisted ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
    </button>
  )
}
