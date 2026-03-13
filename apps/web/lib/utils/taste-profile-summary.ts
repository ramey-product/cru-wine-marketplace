import type { FlavorAffinity } from '@/lib/constants/taste-profile'
import { FLAVOR_AFFINITY_CATEGORIES } from '@/lib/constants/taste-profile'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TasteProfileSummaryInput {
  flavor_affinities: string[]
  flavor_aversions: string[]
  drinking_contexts: string[]
  adventurousness_score: number
}

// ---------------------------------------------------------------------------
// Category detection helpers
// ---------------------------------------------------------------------------

const FRUIT_SET = new Set<string>(FLAVOR_AFFINITY_CATEGORIES.Fruit)
const EARTH_SET = new Set<string>(FLAVOR_AFFINITY_CATEGORIES.Earth)
const SPICE_SET = new Set<string>(FLAVOR_AFFINITY_CATEGORIES.Spice)
const OTHER_SET = new Set<string>(FLAVOR_AFFINITY_CATEGORIES.Other)

function categorize(affinities: string[]) {
  const fruit: string[] = []
  const earth: string[] = []
  const spice: string[] = []
  const other: string[] = []

  for (const a of affinities) {
    if (FRUIT_SET.has(a)) fruit.push(a)
    else if (EARTH_SET.has(a)) earth.push(a)
    else if (SPICE_SET.has(a)) spice.push(a)
    else if (OTHER_SET.has(a)) other.push(a)
  }

  return { fruit, earth, spice, other }
}

// ---------------------------------------------------------------------------
// Style descriptor fragments — maps category presence to style phrases
// ---------------------------------------------------------------------------

function buildStyleDescriptor(cats: ReturnType<typeof categorize>): string {
  const phrases: string[] = []

  if (cats.fruit.length > 0 && cats.earth.length > 0) {
    phrases.push('bold, earthy wines with fruit-forward character')
  } else if (cats.fruit.length > 0) {
    phrases.push('bright, fruit-driven wines')
  } else if (cats.earth.length > 0) {
    phrases.push('earthy, terroir-driven wines')
  }

  if (cats.spice.length > 0 && phrases.length === 0) {
    phrases.push('wines with warm spice notes')
  } else if (cats.spice.length > 0) {
    phrases.push('warm spice')
  }

  if (cats.other.length > 0) {
    const otherDescriptors = buildOtherDescriptor(cats.other)
    if (otherDescriptors) {
      phrases.push(otherDescriptors)
    }
  }

  if (phrases.length === 0) {
    return 'a wide range of wines'
  }

  return phrases.join(' with ')
}

function buildOtherDescriptor(others: string[]): string {
  const descriptors: string[] = []
  if (others.includes('chocolate') || others.includes('coffee')) {
    descriptors.push('rich, dark flavors')
  }
  if (others.includes('floral')) {
    descriptors.push('floral aromatics')
  }
  if (others.includes('smoky')) {
    descriptors.push('smoky depth')
  }
  return descriptors.join(' and ')
}

// ---------------------------------------------------------------------------
// Affinity detail fragments — adds specificity from individual tags
// ---------------------------------------------------------------------------

const AFFINITY_DETAIL: Record<string, string> = {
  berry: 'berry fruit',
  citrus: 'citrus brightness',
  tropical: 'tropical notes',
  stone_fruit: 'stone fruit',
  mushroom: 'earthy mushroom tones',
  mineral: 'mineral edge',
  herbal: 'herbal complexity',
  pepper: 'a peppery edge',
  cinnamon: 'cinnamon warmth',
  vanilla: 'vanilla undertones',
}

function buildAffinityDetails(affinities: string[]): string | null {
  // Pick up to 2 specific detail phrases to keep summary concise
  const details: string[] = []
  for (const a of affinities) {
    if (AFFINITY_DETAIL[a] && details.length < 2) {
      details.push(AFFINITY_DETAIL[a])
    }
  }
  if (details.length === 0) return null
  return details.join(' and ')
}

// ---------------------------------------------------------------------------
// Aversion clause — what the user wants to avoid
// ---------------------------------------------------------------------------

const AVERSION_PHRASES: Record<string, string> = {
  very_sweet: 'sweeter styles',
  very_dry_tannic: 'heavily tannic wines',
  very_acidic_sour: 'sharp, high-acid wines',
  oaky_buttery: 'oaky or buttery wines',
  bitter: 'bitter finishes',
  fizzy_sparkling: 'sparkling wines',
}

function buildAversionClause(aversions: string[]): string | null {
  if (aversions.length === 0) return null

  const phrases = aversions
    .map((a) => AVERSION_PHRASES[a])
    .filter(Boolean)

  if (phrases.length === 0) return null
  if (phrases.length === 1) return `You prefer to avoid ${phrases[0]}.`
  if (phrases.length === 2) {
    return `You prefer to avoid ${phrases[0]} and ${phrases[1]}.`
  }
  // 3+ aversions: comma-separated with oxford comma
  const last = phrases.pop()!
  return `You prefer to avoid ${phrases.join(', ')}, and ${last}.`
}

// ---------------------------------------------------------------------------
// Adventurousness tone modifier
// ---------------------------------------------------------------------------

function getAdventurousnessPhrase(score: number): string | null {
  switch (score) {
    case 1:
      return "You like to stick with what you know — we'll recommend tried-and-true favorites."
    case 3:
      return "You love surprises — we'll mix in unexpected discoveries for you."
    default:
      // Score 2 is the default, no special modifier needed
      return null
  }
}

// ---------------------------------------------------------------------------
// generateTasteProfileSummary — main export
// ---------------------------------------------------------------------------

export function generateTasteProfileSummary(
  input: TasteProfileSummaryInput
): string {
  const { flavor_affinities, flavor_aversions, adventurousness_score } = input

  // Edge case: no affinities selected — graceful fallback
  if (flavor_affinities.length === 0) {
    const fallback =
      "You're keeping an open mind — we'll start with crowd favorites and learn your taste as you explore."

    const adventurousness = getAdventurousnessPhrase(adventurousness_score)
    if (adventurousness) {
      return truncate(`${fallback} ${adventurousness}`)
    }
    return fallback
  }

  // Build the core style sentence
  const cats = categorize(flavor_affinities)
  const styleDescriptor = buildStyleDescriptor(cats)
  const affinityDetails = buildAffinityDetails(flavor_affinities)

  let core: string
  if (affinityDetails) {
    core = `You enjoy ${styleDescriptor} with ${affinityDetails}.`
  } else {
    core = `You enjoy ${styleDescriptor}.`
  }

  // Build the full summary by composing fragments
  const parts: string[] = [core]

  const aversionClause = buildAversionClause(flavor_aversions)
  if (aversionClause) {
    parts.push(aversionClause)
  }

  const adventurousnessPhrase = getAdventurousnessPhrase(adventurousness_score)
  if (adventurousnessPhrase) {
    parts.push(adventurousnessPhrase)
  }

  return truncate(parts.join(' '))
}

// ---------------------------------------------------------------------------
// Truncate to 300 chars (hard limit from spec)
// ---------------------------------------------------------------------------

function truncate(text: string, maxLength: number = 300): string {
  if (text.length <= maxLength) return text
  // Truncate at last space before limit, append ellipsis
  const truncated = text.slice(0, maxLength - 1)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + '\u2026'
  }
  return truncated + '\u2026'
}
