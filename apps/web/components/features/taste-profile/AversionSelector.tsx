'use client'

import {
  FLAVOR_AVERSIONS,
  FLAVOR_AVERSION_LABELS,
  type FlavorAversion,
} from '@/lib/constants/taste-profile'

interface AversionSelectorProps {
  selected: string[]
  onToggle: (tag: string) => void
}

export function AversionSelector({ selected, onToggle }: AversionSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Anything you know you DON&apos;T like?</h2>
        <p className="mt-1 text-sm text-muted-foreground">It&apos;s okay if nothing stands out.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FLAVOR_AVERSIONS.map((tag) => {
          const isSelected = selected.includes(tag)
          const label = FLAVOR_AVERSION_LABELS[tag as FlavorAversion]

          return (
            <button
              key={tag}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => onToggle(tag)}
              className={`rounded-full px-4 py-2 text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
