'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCart } from '@/lib/cart/CartContext'
import { formatCartPrice } from '@/lib/cart/cart-store'
import { cn } from '@/lib/utils'

/** Pages where the sticky cart bar should be hidden. */
const HIDDEN_PATHS = ['/cart', '/checkout']

/**
 * Persistent sticky bottom bar on mobile showing cart summary.
 * Positioned above the MobileTabBar (bottom-14) with z-40.
 */
export function StickyCartBar() {
  const { cart } = useCart()
  const pathname = usePathname()
  const prevCountRef = useRef(cart.itemCount)
  const [pulse, setPulse] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const hasItems = cart.itemCount > 0
  const isHiddenPage = HIDDEN_PATHS.some((p) => pathname.startsWith(p))
  const isVisible = hasItems && !isHiddenPage

  // Pulse animation on item count change
  useEffect(() => {
    if (cart.itemCount !== prevCountRef.current && cart.itemCount > 0) {
      setPulse(true)
      const timer = setTimeout(() => setPulse(false), 200)
      prevCountRef.current = cart.itemCount
      return () => clearTimeout(timer)
    }
    prevCountRef.current = cart.itemCount
  }, [cart.itemCount])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={
        hasItems
          ? `Cart: ${cart.itemCount} ${cart.itemCount === 1 ? 'item' : 'items'}, ${formatCartPrice(cart.subtotal)}`
          : undefined
      }
      className={cn(
        'fixed bottom-14 left-0 right-0 z-40 lg:hidden',
        'h-14 bg-primary/95 text-primary-foreground backdrop-blur-md',
        'transition-transform duration-200 ease-out',
        'motion-reduce:transition-none',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Left: item count + total */}
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />

          {/* Animated item count badge */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={cart.itemCount}
              initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { scale: 0.8, opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 400, damping: 20 }
              }
              className={cn(
                'text-sm font-semibold tabular-nums',
                'motion-reduce:transform-none',
                pulse && 'animate-[pulse-scale_200ms_ease-out]'
              )}
            >
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
            </motion.span>
          </AnimatePresence>

          <span className="text-primary-foreground/60" aria-hidden="true">
            ·
          </span>

          {/* Animated price total */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={cart.subtotal}
              initial={shouldReduceMotion ? false : { y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { y: 8, opacity: 0 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.15 }
              }
              className="text-sm font-semibold tabular-nums"
            >
              {formatCartPrice(cart.subtotal)}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right: View Cart CTA */}
        <Link
          href="/cart"
          className="flex min-h-[36px] items-center rounded-full bg-primary-foreground/20 px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/30"
          aria-label="View cart"
        >
          View Cart
        </Link>
      </div>
    </div>
  )
}
