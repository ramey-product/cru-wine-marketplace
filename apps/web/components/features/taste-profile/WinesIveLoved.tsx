'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { WineSearchInput } from './WineSearchInput'
import { addWineToProfile, removeWineFromProfile } from '@/lib/actions/taste-profile'

interface LovedWine {
  id: string
  name: string
  varietal: string | null
  producer_name: string
}

interface WinesIveLovedProps {
  initialWines?: LovedWine[]
  source?: 'onboarding' | 'manual_add'
}

type WineAction =
  | { type: 'add'; wine: LovedWine }
  | { type: 'remove'; id: string }

export function WinesIveLoved({ initialWines = [], source = 'manual_add' }: WinesIveLovedProps) {
  const [wines, setWines] = useState<LovedWine[]>(initialWines)
  const [optimisticWines, addOptimistic] = useOptimistic<LovedWine[], WineAction>(
    wines,
    (state, action) => {
      if (action.type === 'add') return [...state, action.wine]
      if (action.type === 'remove') return state.filter((w) => w.id !== action.id)
      return state
    }
  )
  const [, startTransition] = useTransition()

  const handleAddWine = (wine: { id: string; name: string; varietal: string | null; producer: { name: string } }) => {
    const lovedWine: LovedWine = {
      id: wine.id,
      name: wine.name,
      varietal: wine.varietal,
      producer_name: wine.producer.name,
    }

    startTransition(async () => {
      addOptimistic({ type: 'add', wine: lovedWine })
      const result = await addWineToProfile(wine.id, source)
      if (result.error) {
        // Revert optimistic update
        setWines((prev) => prev.filter((w) => w.id !== wine.id))
      } else {
        setWines((prev) => [...prev, lovedWine])
      }
    })
  }

  const handleRemoveWine = (wineId: string) => {
    const removedWine = wines.find((w) => w.id === wineId)
    startTransition(async () => {
      addOptimistic({ type: 'remove', id: wineId })
      const result = await removeWineFromProfile(wineId)
      if (result.error) {
        // Revert by restoring the removed wine
        if (removedWine) {
          setWines((prev) => [...prev, removedWine])
        }
      } else {
        setWines((prev) => prev.filter((w) => w.id !== wineId))
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Wines I&apos;ve Loved</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add wines you&apos;ve enjoyed to help us refine your recommendations.
        </p>
      </div>

      <WineSearchInput
        onWineSelect={handleAddWine}
        excludeIds={optimisticWines.map((w) => w.id)}
      />

      {optimisticWines.length > 0 && (
        <ul className="space-y-2" aria-label="Wines you've loved">
          {optimisticWines.map((wine) => (
            <li
              key={wine.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">{wine.name}</p>
                <p className="text-xs text-muted-foreground">
                  {wine.varietal && <>{wine.varietal} &middot; </>}
                  {wine.producer_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveWine(wine.id)}
                aria-label={`Remove ${wine.name}`}
                className="ml-4 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {optimisticWines.length === 0 && (
        <p className="text-sm text-muted-foreground italic">
          No wines added yet. Search above to get started.
        </p>
      )}
    </div>
  )
}
