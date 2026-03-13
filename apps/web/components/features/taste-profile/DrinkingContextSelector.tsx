'use client'

import {
  DRINKING_CONTEXTS,
  DRINKING_CONTEXT_LABELS,
  type DrinkingContext,
} from '@/lib/constants/taste-profile'

interface DrinkingContextSelectorProps {
  selected: string[]
  onToggle: (context: string) => void
}

export function DrinkingContextSelector({ selected, onToggle }: DrinkingContextSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">How do you usually drink wine?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DRINKING_CONTEXTS.map((context) => {
          const isSelected = selected.includes(context)
          const label = DRINKING_CONTEXT_LABELS[context as DrinkingContext]

          return (
            <button
              key={context}
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              aria-label={label}
              onClick={() => onToggle(context)}
              className={`rounded-lg border p-4 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-primary bg-primary/5 text-foreground'
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
