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

/**
 * Generate a plain-English profile summary paragraph from taste profile data.
 * No AI — pure template logic.
 */
export function generateProfileSummary(input: TasteProfileInput): string {
  const parts: string[] = []

  // Flavor affinities
  if (input.flavor_affinities.length > 0) {
    const labels = input.flavor_affinities
      .slice(0, 4)
      .map((f) => FLAVOR_AFFINITY_LABELS[f as FlavorAffinity]?.toLowerCase())
      .filter(Boolean)
    if (labels.length === 1) {
      parts.push(`you enjoy wines with ${labels[0]} character`)
    } else if (labels.length === 2) {
      parts.push(`you enjoy wines with ${labels[0]} and ${labels[1]} notes`)
    } else {
      const last = labels.pop()
      parts.push(`you enjoy wines with ${labels.join(', ')}, and ${last} notes`)
    }
  } else {
    parts.push("you're still exploring what you like")
  }

  // Aversions
  if (input.flavor_aversions.length > 0) {
    const labels = input.flavor_aversions
      .slice(0, 3)
      .map((a) => FLAVOR_AVERSION_LABELS[a as FlavorAversion]?.toLowerCase())
      .filter(Boolean)
    if (labels.length === 1) {
      parts.push(`and prefer to avoid anything ${labels[0]}`)
    } else {
      const last = labels.pop()
      parts.push(`and prefer to avoid wines that are ${labels.join(', ')}, or ${last}`)
    }
  }

  // Drinking context
  if (input.drinking_contexts.length > 0) {
    const labels = input.drinking_contexts
      .slice(0, 2)
      .map((c) => DRINKING_CONTEXT_LABELS[c as DrinkingContext]?.toLowerCase())
      .filter(Boolean)
    if (labels.length === 1) {
      parts.push(`You usually drink wine ${formatContext(labels[0] as string)}`)
    } else {
      parts.push(`You usually drink wine ${formatContext(labels[0] as string)} and ${formatContext(labels[1] as string)}`)
    }
  }

  // Adventurousness
  const advLevel = input.adventurousness_score as AdventurousnessScore
  if (advLevel === 1) {
    parts.push("You like to stick with what you know — we'll keep things familiar.")
  } else if (advLevel === 2) {
    parts.push("You're open to suggestions, so we'll mix in some new discoveries alongside your favorites.")
  } else if (advLevel === 3) {
    parts.push("You love surprises — expect us to push your boundaries with wines you'd never pick on your own.")
  }

  // Capitalize first letter of first part
  const summary = parts.join('. ').replace(/^./, (c) => c.toUpperCase())
  return summary.endsWith('.') ? summary : summary + '.'
}

function formatContext(label: string): string {
  // "dinner at home" → "at dinner at home" doesn't read well
  // Just use "for" prefix for most contexts
  if (label.startsWith('at ') || label.startsWith('for ')) return label
  return `for ${label}`
}
