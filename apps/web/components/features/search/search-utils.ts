/**
 * Pure utility functions for the search command palette.
 *
 * Extracted from SearchCommand so categorization, URL building, and
 * grouping logic can be tested without rendering a React component.
 */

export interface SearchResult {
  type: 'wine' | 'producer' | 'varietal'
  label: string
  slug?: string
}

/**
 * Map a SearchResult type to its user-facing category heading.
 */
export function getCategoryLabel(type: SearchResult['type']): string {
  switch (type) {
    case 'wine':
      return 'Wines'
    case 'producer':
      return 'Producers'
    case 'varietal':
      return 'Varietals'
  }
}

/**
 * Group a flat list of search results by their type.
 *
 * Preserves the insertion order of types (the first occurrence of each
 * type determines its position in the record).
 */
export function groupResultsByType(
  results: SearchResult[]
): Record<string, SearchResult[]> {
  return results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    const key = result.type
    if (!acc[key]) acc[key] = []
    acc[key].push(result)
    return acc
  }, {})
}

/**
 * Build the navigation URL for a given search result.
 *
 * - wine      → /wines/{slug}
 * - producer  → /producers/{slug}
 * - varietal  → /wines/varietal/{label}   (URI-encoded)
 *
 * Returns null when a slug is required but missing.
 */
export function buildResultUrl(result: SearchResult): string | null {
  switch (result.type) {
    case 'wine':
      return result.slug ? `/wines/${result.slug}` : null
    case 'producer':
      return result.slug ? `/producers/${result.slug}` : null
    case 'varietal':
      return `/wines/varietal/${encodeURIComponent(result.label)}`
  }
}

/**
 * Build the full-text search URL for a query string.
 * Returns null for blank/whitespace-only input.
 */
export function buildSearchUrl(query: string): string | null {
  const trimmed = query.trim()
  if (!trimmed) return null
  return `/wines/search?q=${encodeURIComponent(trimmed)}`
}
