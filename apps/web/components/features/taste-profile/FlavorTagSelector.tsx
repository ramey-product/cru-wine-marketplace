'use client'

import {
  FLAVOR_AFFINITY_CATEGORIES,
  FLAVOR_AFFINITY_LABELS,
  type FlavorAffinity,
} from '@/lib/constants/taste-profile'

interface FlavorTagSelectorProps {
  selected: string[]
  onToggle: (tag: string) => void
}

export function FlavorTagSelector({ selected, onToggle }: FlavorTagSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">What flavors do you gravitate toward?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick as many as feel right.</p>
      </div>

      {Object.entries(FLAVOR_AFFINITY_CATEGORIES).map(([category, tags]) => (
        <div key={category}>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">{category}</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isSelected = selected.includes(tag)
              const label = FLAVOR_AFFINITY_LABELS[tag as FlavorAffinity]

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
      ))}
    </div>
  )
}
