// ---------------------------------------------------------------------------
// Match factor templates — plain-language fragments for each scoring factor
// V1 placeholder copy — marketing-writer refines in Story 11
// ---------------------------------------------------------------------------

const TEMPLATES = {
  flavor_affinity: (matchCount: number, flavors: string[]) => {
    if (matchCount >= 3) return `Matches ${matchCount} of your favorite flavors`
    if (matchCount === 2)
      return `Has the ${flavors.slice(0, 2).join(' and ')} notes you love`
    if (matchCount === 1) return `Has the ${flavors[0]} character you enjoy`
    return null
  },

  no_aversion: () => null, // Not displayed — it's a filter, not a feature

  local_availability: (isAvailable: boolean) => {
    if (isAvailable) return 'Available near you'
    return null
  },

  adventureness: (
    isAdventurous: boolean,
    varietal: string | null,
    region: string | null
  ) => {
    if (!isAdventurous) return null
    if (varietal && region) return `Something new: a ${varietal} from ${region}`
    if (varietal) return `Something new: a ${varietal} to explore`
    if (region) return `Discover something from ${region}`
    return 'A new discovery for your palate'
  },

  fallback: (varietal: string | null) => {
    if (varietal) return `A ${varietal} we think you'll enjoy`
    return 'Picked for your taste profile'
  },
} as const

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MatchFactors {
  affinityMatches: number
  matchedFlavors: string[] // which specific flavors matched
  hasAversion: boolean
  isAvailable: boolean
  isAdventureBonus: boolean // true if wine got diversity bonus
}

export interface WineContext {
  varietal: string | null
  region: string | null
  producerName: string
}

// ---------------------------------------------------------------------------
// generateMatchReasons — build explanation from match factors
// ---------------------------------------------------------------------------

export function generateMatchReasons(
  matchFactors: MatchFactors,
  wineContext: WineContext
): string[] {
  const reasons: string[] = []

  // 1. Flavor affinity reason
  const flavorReason = TEMPLATES.flavor_affinity(
    matchFactors.affinityMatches,
    matchFactors.matchedFlavors
  )
  if (flavorReason) reasons.push(flavorReason)

  // 2. Adventure/discovery reason (only if this wine got the diversity bonus)
  const adventureReason = TEMPLATES.adventureness(
    matchFactors.isAdventureBonus,
    wineContext.varietal,
    wineContext.region
  )
  if (adventureReason) reasons.push(adventureReason)

  // 3. Availability reason
  const availReason = TEMPLATES.local_availability(matchFactors.isAvailable)
  if (availReason) reasons.push(availReason)

  // 4. If no strong reasons, use fallback
  if (reasons.length === 0) {
    reasons.push(TEMPLATES.fallback(wineContext.varietal))
  }

  // Limit to 3 reasons max
  return reasons.slice(0, 3)
}
