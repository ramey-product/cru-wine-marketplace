'use client'

const ADVENTURENESS_OPTIONS = [
  {
    score: 1,
    title: 'Stick with what I know',
    description: 'I know what I like. Show me more of the same.',
  },
  {
    score: 2,
    title: 'Open to suggestions',
    description: 'Surprise me sometimes, but keep it in my comfort zone.',
  },
  {
    score: 3,
    title: 'Surprise me',
    description: "I want to try things I'd never pick on my own.",
  },
] as const

interface AdventurenessSelectorProps {
  selected: number | null
  onSelect: (score: number) => void
}

export function AdventurenessSelector({ selected, onSelect }: AdventurenessSelectorProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">How adventurous are you?</h2>

      <div className="space-y-3" role="radiogroup" aria-label="Adventurousness level">
        {ADVENTURENESS_OPTIONS.map((option) => {
          const isSelected = selected === option.score

          return (
            <button
              key={option.score}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.title}
              onClick={() => onSelect(option.score)}
              className={`w-full rounded-lg border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:bg-muted'
              }`}
            >
              <p className="font-medium">{option.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
