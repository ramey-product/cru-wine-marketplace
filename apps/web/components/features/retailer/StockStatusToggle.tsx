'use client'

import { cn } from '@/lib/utils'

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'

interface StockStatusToggleProps {
  wineId: string
  currentStatus: StockStatus
  onToggle: (wineId: string, newStatus: StockStatus) => void
  /** When true, all buttons are disabled (e.g., during a useTransition). */
  disabled?: boolean
}

interface StatusOption {
  value: StockStatus
  label: string
  shortLabel: string
  activeClass: string
  activeTextClass: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'in_stock',
    label: 'In stock',
    shortLabel: 'In',
    activeClass: 'bg-emerald-100 border-emerald-400 dark:bg-emerald-950/50 dark:border-emerald-600',
    activeTextClass: 'text-emerald-700 font-semibold dark:text-emerald-400',
  },
  {
    value: 'low_stock',
    label: 'Low stock',
    shortLabel: 'Low',
    activeClass: 'bg-amber-100 border-amber-400 dark:bg-amber-950/50 dark:border-amber-600',
    activeTextClass: 'text-amber-700 font-semibold dark:text-amber-400',
  },
  {
    value: 'out_of_stock',
    label: 'Out of stock',
    shortLabel: 'Out',
    activeClass: 'bg-destructive/10 border-destructive/50 dark:bg-destructive/20',
    activeTextClass: 'text-destructive font-semibold',
  },
]

/**
 * StockStatusToggle — Client Component.
 *
 * Segmented control with three mutually-exclusive stock states.
 * The active state is highlighted with a semantic color; inactive states
 * are rendered muted so the selection is immediately apparent.
 *
 * Calls `onToggle(wineId, newStatus)` whenever the user clicks a different state.
 * Setting the same state that is already active is a no-op.
 *
 * TODO: Wire onToggle to overrideStockStatus server action.
 */
export function StockStatusToggle({ wineId, currentStatus, onToggle, disabled }: StockStatusToggleProps) {
  return (
    <div
      role="group"
      aria-label={`Stock status for wine ${wineId}`}
      className="inline-flex rounded-lg border border-border overflow-hidden"
    >
      {STATUS_OPTIONS.map((option, index) => {
        const isActive = currentStatus === option.value
        const isFirst = index === 0
        const isLast = index === STATUS_OPTIONS.length - 1

        return (
          <button
            key={option.value}
            type="button"
            aria-label={`Set status to ${option.label}`}
            aria-pressed={isActive}
            disabled={disabled || isActive}
            onClick={() => {
              if (!isActive) onToggle(wineId, option.value)
            }}
            className={cn(
              // Base layout and typography
              'relative px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
              // Divider borders between options (skip left border on first, right on last)
              !isFirst && 'border-l border-border',
              isFirst && 'rounded-l-md',
              isLast && 'rounded-r-md',
              // Active vs inactive state
              isActive
                ? cn(option.activeClass, option.activeTextClass)
                : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none'
            )}
          >
            {/* Full label on wider contexts; abbreviated on small screens */}
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}
