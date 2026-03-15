'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, MapPin } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrderItem {
  wineName: string
  quantity: number
  price: number
}

interface OrderConfirmationData {
  id: string
  orderNumber: string
  retailerName: string
  retailerAddress: string
  fulfillmentType: 'pickup' | 'delivery'
  estimatedReady: string
  total: number
  items: OrderItem[]
}

interface OrderConfirmationClientProps {
  order: OrderConfirmationData
  orderId: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Seconds before auto-redirect to order tracking. */
const REDIRECT_DELAY = 8

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OrderConfirmationClient({
  order,
  orderId,
}: OrderConfirmationClientProps) {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [paused, setPaused] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const startTimeRef = useRef(Date.now())
  const rafRef = useRef<number>(null)

  const trackingUrl = `/orders/${orderId}`

  // Countdown timer + progress tracking
  useEffect(() => {
    if (paused) return

    const tick = () => {
      const now = Date.now()
      const seconds = (now - startTimeRef.current) / 1000
      setElapsed(seconds)

      if (seconds >= REDIRECT_DELAY) {
        router.push(trackingUrl)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [paused, trackingUrl, router])

  // Skip: go to tracking immediately
  const handleSkip = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
    router.push(trackingUrl)
  }

  // Pause/cancel the auto-redirect
  const handlePause = () => {
    setPaused(true)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  const progress = Math.min(elapsed / REDIRECT_DELAY, 1)

  // Animation helpers
  const instant = { duration: 0 }
  const fadeSlide = (delay: number) =>
    shouldReduceMotion
      ? { initial: false as const, animate: {}, transition: instant }
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, delay, ease: 'easeOut' as const },
        }

  return (
    <div
      className="mx-auto max-w-lg py-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={shouldReduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={
          shouldReduceMotion
            ? instant
            : { type: 'spring', stiffness: 200, damping: 15, delay: 0 }
        }
        className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cru-success/10"
      >
        <motion.div
          initial={shouldReduceMotion ? false : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={
            shouldReduceMotion
              ? instant
              : { type: 'spring', stiffness: 250, damping: 12, delay: 0.1 }
          }
        >
          <CheckCircle2
            className="h-12 w-12 text-cru-success"
            aria-hidden="true"
          />
        </motion.div>
      </motion.div>

      {/* "Order Confirmed" heading */}
      <motion.h1
        {...fadeSlide(0.2)}
        className="text-2xl font-semibold"
      >
        Order Confirmed!
      </motion.h1>

      {/* Order number */}
      <motion.p
        {...fadeSlide(0.3)}
        className="mt-2 text-sm text-muted-foreground"
      >
        Order #{order.orderNumber}
      </motion.p>

      {/* Fulfillment details card */}
      <motion.div
        {...fadeSlide(0.4)}
        className="mt-8 rounded-lg border border-border bg-card p-6 text-left space-y-4"
      >
        <div className="flex items-start gap-3">
          <MapPin
            className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-medium">
              {order.fulfillmentType === 'pickup'
                ? 'Pickup from'
                : 'Delivery from'}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.retailerName}
            </p>
            <p className="text-sm text-muted-foreground">
              {order.retailerAddress}
            </p>
            <p className="mt-1 text-sm font-medium text-primary">
              Ready in {order.estimatedReady}
            </p>
          </div>
        </div>

        <hr className="border-border" />

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {item.quantity}x {item.wineName}
              </span>
              <span className="font-mono">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <hr className="border-border" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="font-mono">${order.total.toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Countdown redirect bar */}
      <motion.div {...fadeSlide(0.6)} className="mt-6">
        {paused ? (
          <p className="text-sm text-muted-foreground">
            Auto-redirect paused.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleSkip}
            className={cn(
              'group relative w-full overflow-hidden rounded-full',
              'h-10 bg-muted',
              'flex items-center justify-center',
              'text-sm font-medium text-muted-foreground',
              'transition-colors hover:text-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            )}
            aria-label="Skip to order tracking"
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 bg-primary/10 transition-none"
              style={{ width: `${progress * 100}%` }}
            />
            <span className="relative z-10 inline-flex items-center gap-1.5">
              View Order Tracking
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </button>
        )}
      </motion.div>

      {/* Action links */}
      <motion.div
        {...fadeSlide(0.7)}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <Link
          href={trackingUrl}
          onClick={handlePause}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View Order Details
        </Link>
        <Link
          href="/wines"
          onClick={handlePause}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Continue Exploring
        </Link>
      </motion.div>
    </div>
  )
}
