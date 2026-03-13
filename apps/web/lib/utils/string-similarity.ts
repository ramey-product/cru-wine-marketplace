/**
 * String similarity utilities for wine name matching.
 *
 * Provides client-side scoring functions for pre-scoring and post-processing
 * of wine match candidates. The primary fuzzy search is done server-side via
 * PostgreSQL pg_trgm, but these functions are useful for:
 *
 * - Adjusting/re-weighting scores after the DB returns candidates
 * - Unit testing match logic without a database
 * - Client-side preview of match quality
 */

// ---------------------------------------------------------------------------
// Trigram similarity (mirrors pg_trgm behavior)
// ---------------------------------------------------------------------------

/**
 * Generate the set of trigrams for a given string.
 * Pads with two leading spaces and one trailing space, matching pg_trgm behavior.
 */
export function trigrams(input: string): Set<string> {
  const padded = `  ${input.toLowerCase()} `
  const result = new Set<string>()
  for (let i = 0; i <= padded.length - 3; i++) {
    result.add(padded.substring(i, i + 3))
  }
  return result
}

/**
 * Compute trigram similarity between two strings.
 * Returns a value between 0 and 1, where 1 is identical.
 * Mirrors PostgreSQL's similarity() function from pg_trgm.
 */
export function trigramSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (!a || !b) return 0

  const trigramsA = trigrams(a)
  const trigramsB = trigrams(b)

  let intersectionCount = 0
  for (const t of trigramsA) {
    if (trigramsB.has(t)) {
      intersectionCount++
    }
  }

  const unionCount = trigramsA.size + trigramsB.size - intersectionCount
  if (unionCount === 0) return 0

  return intersectionCount / unionCount
}

// ---------------------------------------------------------------------------
// Jaro-Winkler similarity (good for short strings like producer names)
// ---------------------------------------------------------------------------

/**
 * Compute Jaro similarity between two strings.
 * Returns a value between 0 and 1.
 */
function jaroSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1
  if (!s1.length || !s2.length) return 0

  const a = s1.toLowerCase()
  const b = s2.toLowerCase()

  const matchWindow = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1)

  const aMatches = new Array<boolean>(a.length).fill(false)
  const bMatches = new Array<boolean>(b.length).fill(false)

  let matches = 0
  let transpositions = 0

  // Find matches
  for (let i = 0; i < a.length; i++) {
    const start = Math.max(0, i - matchWindow)
    const end = Math.min(i + matchWindow + 1, b.length)

    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue
      aMatches[i] = true
      bMatches[j] = true
      matches++
      break
    }
  }

  if (matches === 0) return 0

  // Count transpositions
  let k = 0
  for (let i = 0; i < a.length; i++) {
    if (!aMatches[i]) continue
    while (!bMatches[k]) k++
    if (a[i] !== b[k]) transpositions++
    k++
  }

  return (
    (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3
  )
}

/**
 * Compute Jaro-Winkler similarity between two strings.
 * Gives extra weight to common prefixes (up to 4 characters).
 * Returns a value between 0 and 1, where 1 is identical.
 *
 * Particularly effective for wine producer names where common prefixes
 * (e.g., "Domaine", "Chateau") are frequent after normalization.
 */
export function jaroWinklerSimilarity(s1: string, s2: string): number {
  const jaro = jaroSimilarity(s1, s2)

  // Find common prefix length (max 4)
  const a = s1.toLowerCase()
  const b = s2.toLowerCase()
  let prefixLen = 0
  const maxPrefix = Math.min(4, Math.min(a.length, b.length))
  for (let i = 0; i < maxPrefix; i++) {
    if (a[i] === b[i]) {
      prefixLen++
    } else {
      break
    }
  }

  // Winkler modification: p = 0.1 (standard scaling factor)
  const p = 0.1
  return jaro + prefixLen * p * (1 - jaro)
}

// ---------------------------------------------------------------------------
// Combined / composite score
// ---------------------------------------------------------------------------

/** Weights for individual match components. */
export interface MatchWeights {
  producer: number // default 0.30
  wineName: number // default 0.35
  vintage: number  // default 0.20
  varietal: number // default 0.15
}

/** Individual component scores from a match evaluation. */
export interface ComponentScores {
  producer: number  // 0-1 score for producer name match
  wineName: number  // 0-1 score for wine name match
  vintage: number   // 0 or 1 for vintage exact match
  varietal: number  // 0-1 score for varietal match
}

/** Default weights per the matching algorithm spec. */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  producer: 0.30,
  wineName: 0.35,
  vintage: 0.20,
  varietal: 0.15,
}

/**
 * Compute a weighted composite match score from individual component scores.
 *
 * @param scores  - Individual component scores (each 0-1)
 * @param weights - Component weights (should sum to 1.0)
 * @returns Composite score between 0 and 1
 */
export function combinedScore(
  scores: ComponentScores,
  weights: MatchWeights = DEFAULT_MATCH_WEIGHTS
): number {
  return (
    weights.producer * scores.producer +
    weights.wineName * scores.wineName +
    weights.vintage * scores.vintage +
    weights.varietal * scores.varietal
  )
}

// ---------------------------------------------------------------------------
// Match thresholds
// ---------------------------------------------------------------------------

/** Confidence thresholds for match classification. */
export const MATCH_THRESHOLDS = {
  /** At or above this score: auto-match (no review needed) */
  AUTO_MATCH: 0.90,
  /** At or above this score (but below AUTO_MATCH): pending review */
  PENDING_REVIEW: 0.70,
  /** Below PENDING_REVIEW: unmatched (no suggested candidate) */
} as const

/**
 * Classify a composite match score into a match status.
 *
 * @param score - Composite score between 0 and 1
 * @returns Match status string compatible with wine_match_queue.match_status
 */
export function classifyMatchScore(
  score: number
): 'auto_matched' | 'pending' | 'unmatched' {
  if (score >= MATCH_THRESHOLDS.AUTO_MATCH) return 'auto_matched'
  if (score >= MATCH_THRESHOLDS.PENDING_REVIEW) return 'pending'
  return 'unmatched'
}
