'use client'

import { Minus, Plus, Trash2 } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuantityStepperProps {
  quantity: number
  onQuantityChange: (newQty: number) => void
  onRemove: () => void
  /** Wine name for aria-labels. */
  wineName: string
  /** Disable all controls during pending state. */
  disabled?: boolean
  /** Maximum quantity (default 24). */
  max?: number
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function QuantityStepper({
  quantity,
  onQuantityChange,
  onRemove,
  wineName,
  disabled = false,
  max = 24,
}: QuantityStepperProps) {
  const shouldReduceMotion = useReducedMotion()
  const isAtMin = quantity <= 1
  const isAtMax = quantity >= max

  const handleDecrement = () => {
    if (isAtMin) {
      onRemove()
    } else {
      onQuantityChange(quantity - 1)
    }
  }

  const handleIncrement = () => {
    if (!isAtMax) {
      onQuantityChange(quantity + 1)
    }
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-muted',
        disabled && 'opacity-50 pointer-events-none'
      )}
      role="group"
      aria-label={`Quantity controls for ${wineName}`}
    >
      {/* Minus / Trash button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled}
        aria-label={
          isAtMin
            ? `Remove ${wineName} from cart`
            : `Decrease quantity of ${wineName}`
        }
        className={cn(
          'flex items-center justify-center rounded-full',
          'min-w-[44px] min-h-[44px] w-9 h-9',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          isAtMin
            ? 'text-destructive hover:bg-destructive/10'
            : 'text-foreground hover:bg-muted-foreground/10'
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isAtMin ? (
            <motion.span
              key="trash"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          ) : (
            <motion.span
              key="minus"
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Quantity display */}
      <div className="w-8 text-center select-none" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={quantity}
            initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="inline-block text-sm font-semibold tabular-nums"
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Plus button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || isAtMax}
        aria-label={`Increase quantity of ${wineName}`}
        className={cn(
          'flex items-center justify-center rounded-full',
          'min-w-[44px] min-h-[44px] w-9 h-9',
          'text-foreground hover:bg-muted-foreground/10',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:pointer-events-none'
        )}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  )
}
