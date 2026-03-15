'use client'

import { useState, useCallback, useEffect } from 'react'
import { Check, ShoppingCart } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// BuyButton — full-width primary CTA with check animation
// ---------------------------------------------------------------------------

interface BuyButtonProps {
  wineId: string
  displayName: string
  isUnavailable?: boolean
  onBuy: (wineId: string) => void
}

export function BuyButton({
  wineId,
  displayName,
  isUnavailable,
  onBuy,
}: BuyButtonProps) {
  const [showCheck, setShowCheck] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  // Reset showCheck after animation completes
  useEffect(() => {
    if (!showCheck) return
    const timer = setTimeout(() => setShowCheck(false), 600)
    return () => clearTimeout(timer)
  }, [showCheck])

  if (isUnavailable) {
    return (
      <span
        className={cn(
          'w-full min-h-[44px] inline-flex items-center justify-center',
          'rounded-md bg-muted text-muted-foreground',
          'text-sm font-medium cursor-not-allowed opacity-60'
        )}
        aria-disabled="true"
      >
        Not Available Nearby
      </span>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowCheck(true)
    onBuy(wineId)
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      className={cn(
        'w-full min-h-[44px] inline-flex items-center justify-center gap-2',
        'rounded-md bg-primary text-primary-foreground',
        'text-sm font-medium',
        'transition-colors duration-150',
        'hover:bg-primary/90',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      )}
      aria-label={`Add ${displayName} to cart`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showCheck ? (
          <motion.span
            key="check"
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={
              shouldReduceMotion
                ? { duration: 0 }
                : { type: 'spring', stiffness: 400, damping: 15 }
            }
            className="inline-flex items-center gap-2"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
            Added!
          </motion.span>
        ) : (
          <motion.span
            key="cart"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="inline-flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            Add to Cart
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
