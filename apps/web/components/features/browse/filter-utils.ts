/**
 * Pure utility functions for building and parsing wine filter URL parameters.
 *
 * Extracted from FilterPanel so the serialization logic is testable
 * without rendering a React component.
 */

export interface FilterState {
  regions: string[]
  varietals: string[]
  priceMin: number | null
  priceMax: number | null
}

const EMPTY_FILTER_STATE: FilterState = {
  regions: [],
  varietals: [],
  priceMin: null,
  priceMax: null,
}

/**
 * Serialize a FilterState into a URLSearchParams string.
 *
 * - Each selected region becomes a separate `region=` param
 * - Each selected varietal becomes a separate `varietal=` param
 * - price_min / price_max are set only when non-null
 *
 * Returns the query string **without** a leading `?`.
 * Returns an empty string when no filters are active.
 */
export function buildFilterParams(filters: Partial<FilterState>): string {
  const params = new URLSearchParams()

  const regions = filters.regions ?? []
  for (const r of regions) {
    params.append('region', r)
  }

  const varietals = filters.varietals ?? []
  for (const v of varietals) {
    params.append('varietal', v)
  }

  if (filters.priceMin != null) {
    params.set('price_min', String(filters.priceMin))
  }

  if (filters.priceMax != null) {
    params.set('price_max', String(filters.priceMax))
  }

  return params.toString()
}

/**
 * Parse URLSearchParams (or a raw query string) back into a FilterState.
 *
 * Unrecognized params are silently ignored so the function stays
 * forward-compatible when new filter keys are added later.
 */
export function parseFilterParams(
  input: URLSearchParams | string
): FilterState {
  const params =
    typeof input === 'string' ? new URLSearchParams(input) : input

  const regions = params.getAll('region').filter(Boolean)
  const varietals = params.getAll('varietal').filter(Boolean)

  const rawMin = params.get('price_min')
  const rawMax = params.get('price_max')

  const priceMin = rawMin !== null ? Number(rawMin) : null
  const priceMax = rawMax !== null ? Number(rawMax) : null

  return {
    regions,
    varietals,
    priceMin: priceMin !== null && !Number.isNaN(priceMin) ? priceMin : null,
    priceMax: priceMax !== null && !Number.isNaN(priceMax) ? priceMax : null,
  }
}

/**
 * Return a clean default FilterState (no filters active).
 */
export function emptyFilterState(): FilterState {
  return {
    regions: [],
    varietals: [],
    priceMin: null,
    priceMax: null,
  }
}

/**
 * Toggle a value in a multi-select filter list (regions or varietals).
 * Returns a new array — does not mutate the input.
 */
export function toggleFilterValue(
  current: string[],
  value: string
): string[] {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value]
}
