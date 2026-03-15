'use client'

import { useState, useCallback, useEffect } from 'react'
import { Check } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Retailer, RetailerBadge } from './RetailerSelectionSheet'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RetailerCardProps {
  retailer: Retailer
  onAddToCart: (retailerOrgId: string) => Promise<void>
  badge?: RetailerBadge
  index?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDistance(miles: number): string {
  if (miles < 0.1) return '< 0.1 mi'
  return `${miles.toFixed(1)} mi`
}

function getTimeEstimate(retailer: Retailer): string {
  if (retailer.fulfillment.includes('pickup')) {
    const prep = retailer.prepTimeMinutes ?? 30
    return `Ready in ~${prep} min`
  }
  if (retailer.deliveryWindowEnd) {
    return `Delivery by ${retailer.deliveryWindowEnd}`
  }
  return `~${retailer.prepTimeMinutes ?? 30} min`
}

function formatFulfillment(methods: ('pickup' | 'delivery')[]): string {
  return methods.map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RetailerCard({
  retailer,
  onAddToCart,
  badge,
  index = 0,
}: RetailerCardProps) {
  const [showCheck, setShowCheck] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const isClosed = retailer.isOpen === false
  const isDisabled = isPending || !retailer.inStock || isClosed

  // Reset check icon after animation
  useEffect(() => {
    if (!showCheck) return
    const timer = setTimeout(() => setShowCheck(false), 600)
    return () => clearTimeout(timer)
  }, [showCheck])

  const handleAdd = useCallback(async () => {
    setIsPending(true)
    setShowCheck(true)
    try {
      await onAddToCart(retailer.orgId)
    } finally {
      setIsPending(false)
    }
  }, [onAddToCart, retailer.orgId])

  const isBestValue = badge?.label === 'Best Value'

  return (
    <motion.div
      role="listitem"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delay: index * 0.05, duration: 0.2, ease: 'easeOut' }
      }
      className={cn(
        'rounded-lg border border-border p-4',
        isBestValue && 'border-l-2 border-l-primary',
        isClosed && retailer.inStock && 'opacity-60',
        !retailer.inStock && 'opacity-50'
      )}
    >
      {/* Row 1: Identity — Name + Badge */}
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

      {/* Row 2: Logistics — Distance · Time · Fulfillment */}
      <p className="mt-1 text-xs text-muted-foreground">
        {formatDistance(retailer.distanceMiles)}
        {' \u00B7 '}
        {getTimeEstimate(retailer)}
        {' \u00B7 '}
        {formatFulfillment(retailer.fulfillment)}
        {/* Status — only when abnormal */}
        {retailer.closingSoon && (
          <>
            {' \u00B7 '}
            <span className="text-amber-600 dark:text-amber-400">
              Closes soon
            </span>
          </>
        )}
        {isClosed && (
          <>
            {' \u00B7 '}
            <span>
              Closed{retailer.nextOpenAt ? ` \u00B7 Opens ${retailer.nextOpenAt}` : ''}
            </span>
          </>
        )}
      </p>

      {/* Row 3: Decision — Price + Action */}
      <div className="mt-2 flex items-center justify-between">
        <span
          className="text-lg font-semibold"
          aria-label={`Price: $${retailer.price.toFixed(2)}`}
        >
          ${retailer.price.toFixed(2)}
        </span>

        {retailer.inStock ? (
          <Button
            onClick={handleAdd}
            disabled={isDisabled}
            aria-label={`Add to cart from ${retailer.name}`}
            size="default"
            className="min-h-[44px] min-w-[72px] px-5"
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
                  className="inline-flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Out of stock</span>
        )}
      </div>
    </motion.div>
  )
}
