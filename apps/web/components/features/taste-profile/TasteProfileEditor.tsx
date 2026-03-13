'use client'

import { useState, useTransition } from 'react'
import { FlavorTagSelector } from './FlavorTagSelector'
import { AversionSelector } from './AversionSelector'
import { DrinkingContextSelector } from './DrinkingContextSelector'
import { AdventurenessSelector } from './AdventurenessSelector'
import { WinesIveLoved } from './WinesIveLoved'
import { generateProfileSummary } from '@/lib/taste-profile/profile-summary'
import { saveTasteProfile } from '@/lib/actions/taste-profile'
import {
  FLAVOR_AFFINITY_LABELS,
  FLAVOR_AVERSION_LABELS,
  DRINKING_CONTEXT_LABELS,
  ADVENTUROUSNESS_LEVELS,
  type FlavorAffinity,
  type FlavorAversion,
  type DrinkingContext,
  type AdventurousnessScore,
} from '@/lib/constants/taste-profile'
import type { TasteProfileInput } from '@/lib/validations/taste-profile'

interface LovedWine {
  id: string
  name: string
  varietal: string | null
  producer_name: string
}

interface TasteProfileEditorProps {
  profile: TasteProfileInput
  lovedWines?: LovedWine[]
}

type EditingSection = 'affinities' | 'aversions' | 'contexts' | 'adventurousness' | null

export function TasteProfileEditor({ profile, lovedWines = [] }: TasteProfileEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<EditingSection>(null)
  const [flavorAffinities, setFlavorAffinities] = useState<string[]>(profile.flavor_affinities)
  const [flavorAversions, setFlavorAversions] = useState<string[]>(profile.flavor_aversions)
  const [drinkingContexts, setDrinkingContexts] = useState<string[]>(profile.drinking_contexts)
  const [adventurenessScore, setAdventurenessScore] = useState<number>(profile.adventurousness_score)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const toggleInArray = (arr: string[], item: string): string[] => {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]
  }

  const handleSave = () => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const input: TasteProfileInput = {
        flavor_affinities: flavorAffinities,
        flavor_aversions: flavorAversions,
        drinking_contexts: drinkingContexts,
        adventurousness_score: adventurenessScore,
      }
      const result = await saveTasteProfile(input)
      if (result.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setEditing(null)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  const summary = generateProfileSummary({
    flavor_affinities: flavorAffinities,
    flavor_aversions: flavorAversions,
    drinking_contexts: drinkingContexts,
    adventurousness_score: adventurenessScore,
  })

  return (
    <div className="space-y-8">
      <blockquote className="rounded-lg border border-border bg-muted/50 p-6 text-base leading-relaxed italic">
        {summary}
      </blockquote>

      {/* Flavor Affinities */}
      <Section
        title="Flavor Preferences"
        isEditing={editing === 'affinities'}
        onEdit={() => setEditing(editing === 'affinities' ? null : 'affinities')}
      >
        {editing === 'affinities' ? (
          <FlavorTagSelector
            selected={flavorAffinities}
            onToggle={(tag) => setFlavorAffinities((prev) => toggleInArray(prev, tag))}
          />
        ) : (
          <TagList
            items={flavorAffinities}
            labelMap={FLAVOR_AFFINITY_LABELS as Record<string, string>}
          />
        )}
      </Section>

      {/* Aversions */}
      <Section
        title="Things to Avoid"
        isEditing={editing === 'aversions'}
        onEdit={() => setEditing(editing === 'aversions' ? null : 'aversions')}
      >
        {editing === 'aversions' ? (
          <AversionSelector
            selected={flavorAversions}
            onToggle={(tag) => setFlavorAversions((prev) => toggleInArray(prev, tag))}
          />
        ) : (
          <TagList
            items={flavorAversions}
            labelMap={FLAVOR_AVERSION_LABELS as Record<string, string>}
            emptyMessage="None selected"
          />
        )}
      </Section>

      {/* Drinking Contexts */}
      <Section
        title="Drinking Contexts"
        isEditing={editing === 'contexts'}
        onEdit={() => setEditing(editing === 'contexts' ? null : 'contexts')}
      >
        {editing === 'contexts' ? (
          <DrinkingContextSelector
            selected={drinkingContexts}
            onToggle={(ctx) => setDrinkingContexts((prev) => toggleInArray(prev, ctx))}
          />
        ) : (
          <TagList
            items={drinkingContexts}
            labelMap={DRINKING_CONTEXT_LABELS as Record<string, string>}
          />
        )}
      </Section>

      {/* Adventurousness */}
      <Section
        title="Adventurousness"
        isEditing={editing === 'adventurousness'}
        onEdit={() => setEditing(editing === 'adventurousness' ? null : 'adventurousness')}
      >
        {editing === 'adventurousness' ? (
          <AdventurenessSelector
            selected={adventurenessScore}
            onSelect={setAdventurenessScore}
          />
        ) : (
          <p className="text-sm">
            {ADVENTUROUSNESS_LEVELS[adventurenessScore as AdventurousnessScore]}
          </p>
        )}
      </Section>

      {/* Save button shown when editing */}
      {editing !== null && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {saved && <p className="text-sm text-cru-success" role="status">Profile updated!</p>}

      {/* Wines I've Loved */}
      <div className="border-t border-border pt-8">
        <WinesIveLoved initialWines={lovedWines} source="manual_add" />
      </div>
    </div>
  )
}

function Section({
  title,
  isEditing,
  onEdit,
  children,
}: {
  title: string
  isEditing: boolean
  onEdit: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          aria-label={isEditing ? `Done editing ${title}` : `Edit ${title}`}
          className="text-xs text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          {isEditing ? 'Done' : 'Edit'}
        </button>
      </div>
      {children}
    </div>
  )
}

function TagList({
  items,
  labelMap,
  emptyMessage = 'None selected',
}: {
  items: string[]
  labelMap: Record<string, string>
  emptyMessage?: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground italic">{emptyMessage}</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
        >
          {labelMap[item] ?? item}
        </span>
      ))}
    </div>
  )
}
