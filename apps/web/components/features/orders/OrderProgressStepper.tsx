'use client'

import { CheckCircle2, Clock, Package, Truck, Circle } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { OrderStatus, FulfillmentType } from '@/lib/order-tracking/types'
import { getCompletionLabel } from '@/lib/order-tracking/types'

// ---------------------------------------------------------------------------
// Step configuration
// ---------------------------------------------------------------------------

interface Step {
  label: string
  icon: typeof Clock
  color: string
  bgColor: string
}

function getSteps(fulfillmentType: FulfillmentType): Step[] {
  if (fulfillmentType === 'delivery') {
    return [
      { label: 'Placed', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-600' },
      { label: 'Confirmed', icon: CheckCircle2, color: 'text-primary', bgColor: 'bg-primary' },
      { label: 'Out for Delivery', icon: Truck, color: 'text-blue-600', bgColor: 'bg-blue-600' },
      { label: 'Delivered', icon: CheckCircle2, color: 'text-muted-foreground', bgColor: 'bg-muted-foreground' },
    ]
  }
  return [
    { label: 'Placed', icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-600' },
    { label: 'Confirmed', icon: CheckCircle2, color: 'text-primary', bgColor: 'bg-primary' },
    { label: 'Ready for Pickup', icon: Package, color: 'text-emerald-600', bgColor: 'bg-emerald-600' },
    { label: 'Picked Up', icon: CheckCircle2, color: 'text-muted-foreground', bgColor: 'bg-muted-foreground' },
  ]
}

/** Map DB status to step index (0-3). */
function getStepIndex(status: OrderStatus, fulfillmentType: FulfillmentType): number {
  if (status === 'cancelled') return -1

  if (fulfillmentType === 'delivery') {
    const map: Record<string, number> = {
      pending: 0,
      confirmed: 1,
      out_for_delivery: 2,
      completed: 3,
    }
    return map[status] ?? 0
  }

  const map: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    ready_for_pickup: 2,
    completed: 3,
  }
  return map[status] ?? 0
}

// ---------------------------------------------------------------------------
// OrderProgressStepper
// ---------------------------------------------------------------------------

interface OrderProgressStepperProps {
  currentStatus: OrderStatus
  fulfillmentType: FulfillmentType
}

export function OrderProgressStepper({
  currentStatus,
  fulfillmentType,
}: OrderProgressStepperProps) {
  const shouldReduceMotion = useReducedMotion()
  const steps = getSteps(fulfillmentType)
  const currentIndex = getStepIndex(currentStatus, fulfillmentType)
  const isCancelled = currentStatus === 'cancelled'

  if (isCancelled) {
    return (
      <div
        className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-center"
        role="status"
        aria-label="Order cancelled"
      >
        <p className="text-sm font-medium text-destructive">Order Cancelled</p>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg border border-border bg-card p-6"
      role="status"
      aria-live="polite"
      aria-label={`Order progress: ${steps[currentIndex]?.label ?? 'Unknown'}`}
    >
      <div className="flex items-center justify-between">
        {steps.map((step, i) => {
          const isCompleted = i < currentIndex
          const isActive = i === currentIndex
          const isFuture = i > currentIndex
          const Icon = step.icon

          return (
            <div key={step.label} className="flex flex-1 items-center">
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative">
                  {isCompleted && (
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-full', step.bgColor)}>
                      <CheckCircle2 className="h-4 w-4 text-white" aria-hidden="true" />
                    </div>
                  )}
                  {isActive && (
                    <motion.div
                      className={cn('flex h-8 w-8 items-center justify-center rounded-full', step.bgColor)}
                      animate={
                        shouldReduceMotion
                          ? {}
                          : { scale: [1, 1.15, 1] }
                      }
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }
                    >
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </motion.div>
                  )}
                  {isFuture && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/30">
                      <Circle className="h-4 w-4 text-muted-foreground/30" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[10px] font-medium text-center max-w-[72px] leading-tight sm:text-xs',
                    isCompleted && step.color,
                    isActive && step.color,
                    isFuture && 'text-muted-foreground/50'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line (not after last step) */}
              {i < steps.length - 1 && (
                <div className="relative mx-1 h-0.5 flex-1 bg-muted-foreground/20 sm:mx-2">
                  <div
                    className={cn(
                      'absolute inset-y-0 left-0 rounded-full transition-all duration-300 ease-out',
                      i < currentIndex ? (steps[i + 1]?.bgColor ?? 'bg-primary') : 'bg-transparent'
                    )}
                    style={{ width: i < currentIndex ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
