// ---------------------------------------------------------------------------
// Flavor affinities — organized by category
// ---------------------------------------------------------------------------

export const FLAVOR_AFFINITY_CATEGORIES = {
  Fruit: ['berry', 'citrus', 'tropical', 'stone_fruit'],
  Earth: ['mushroom', 'mineral', 'herbal'],
  Spice: ['pepper', 'cinnamon', 'vanilla'],
  Other: ['chocolate', 'coffee', 'floral', 'smoky'],
} as const

/** Flat list of all valid affinity tags */
export const FLAVOR_AFFINITIES = Object.values(FLAVOR_AFFINITY_CATEGORIES).flat()

export type FlavorAffinity = (typeof FLAVOR_AFFINITIES)[number]

// ---------------------------------------------------------------------------
// Flavor aversions — things users want to avoid
// ---------------------------------------------------------------------------

export const FLAVOR_AVERSIONS = [
  'very_sweet',
  'very_dry_tannic',
  'very_acidic_sour',
  'oaky_buttery',
  'bitter',
  'fizzy_sparkling',
] as const

export type FlavorAversion = (typeof FLAVOR_AVERSIONS)[number]

/** Human-readable labels for aversion tags */
export const FLAVOR_AVERSION_LABELS: Record<FlavorAversion, string> = {
  very_sweet: 'Very sweet',
  very_dry_tannic: 'Very dry / tannic',
  very_acidic_sour: 'Very acidic / sour',
  oaky_buttery: 'Oaky / buttery',
  bitter: 'Bitter',
  fizzy_sparkling: 'Fizzy / sparkling',
}

// ---------------------------------------------------------------------------
// Drinking contexts — when/how users enjoy wine
// ---------------------------------------------------------------------------

export const DRINKING_CONTEXTS = [
  'dinner_at_home',
  'at_restaurants',
  'parties_gatherings',
  'solo_relaxation',
  'as_a_gift',
  'learn_and_explore',
] as const

export type DrinkingContext = (typeof DRINKING_CONTEXTS)[number]

/** Human-readable labels for drinking contexts */
export const DRINKING_CONTEXT_LABELS: Record<DrinkingContext, string> = {
  dinner_at_home: 'Dinner at home',
  at_restaurants: 'At restaurants',
  parties_gatherings: 'Parties & gatherings',
  solo_relaxation: 'Solo relaxation',
  as_a_gift: 'As a gift',
  learn_and_explore: 'Learn & explore',
}

// ---------------------------------------------------------------------------
// Adventurousness levels — how open the user is to new wines
// ---------------------------------------------------------------------------

export const ADVENTUROUSNESS_LEVELS = {
  1: 'Stick with what I know',
  2: 'Open to suggestions',
  3: 'Surprise me',
} as const

export type AdventurousnessScore = keyof typeof ADVENTUROUSNESS_LEVELS

/** Human-readable labels for affinity tags */
export const FLAVOR_AFFINITY_LABELS: Record<FlavorAffinity, string> = {
  berry: 'Berry',
  citrus: 'Citrus',
  tropical: 'Tropical',
  stone_fruit: 'Stone fruit',
  mushroom: 'Mushroom',
  mineral: 'Mineral',
  herbal: 'Herbal',
  pepper: 'Pepper',
  cinnamon: 'Cinnamon',
  vanilla: 'Vanilla',
  chocolate: 'Chocolate',
  coffee: 'Coffee',
  floral: 'Floral',
  smoky: 'Smoky',
}
