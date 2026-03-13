import { describe, it, expect } from 'vitest'
import {
  buildFilterParams,
  parseFilterParams,
  emptyFilterState,
  toggleFilterValue,
  type FilterState,
} from '../filter-utils'

// ---------------------------------------------------------------------------
// buildFilterParams
// ---------------------------------------------------------------------------
describe('buildFilterParams', () => {
  it('returns an empty string when no filters are active', () => {
    expect(buildFilterParams({})).toBe('')
    expect(buildFilterParams({ regions: [], varietals: [] })).toBe('')
  })

  it('encodes a single region', () => {
    const result = buildFilterParams({ regions: ['France'] })
    expect(result).toBe('region=France')
  })

  it('encodes multiple regions as separate params', () => {
    const result = buildFilterParams({ regions: ['France', 'Italy'] })
    const params = new URLSearchParams(result)
    expect(params.getAll('region')).toEqual(['France', 'Italy'])
  })

  it('encodes a single varietal', () => {
    const result = buildFilterParams({ varietals: ['Merlot'] })
    expect(result).toBe('varietal=Merlot')
  })

  it('encodes multiple varietals as separate params', () => {
    const result = buildFilterParams({
      varietals: ['Merlot', 'Pinot Noir'],
    })
    const params = new URLSearchParams(result)
    expect(params.getAll('varietal')).toEqual(['Merlot', 'Pinot Noir'])
  })

  it('encodes price_min only', () => {
    const result = buildFilterParams({ priceMin: 20 })
    expect(result).toBe('price_min=20')
  })

  it('encodes price_max only', () => {
    const result = buildFilterParams({ priceMax: 50 })
    expect(result).toBe('price_max=50')
  })

  it('encodes a full price range', () => {
    const result = buildFilterParams({ priceMin: 20, priceMax: 50 })
    const params = new URLSearchParams(result)
    expect(params.get('price_min')).toBe('20')
    expect(params.get('price_max')).toBe('50')
  })

  it('encodes combined filters correctly', () => {
    const result = buildFilterParams({
      regions: ['France', 'Italy'],
      varietals: ['Merlot'],
      priceMin: 20,
      priceMax: 100,
    })

    const params = new URLSearchParams(result)
    expect(params.getAll('region')).toEqual(['France', 'Italy'])
    expect(params.getAll('varietal')).toEqual(['Merlot'])
    expect(params.get('price_min')).toBe('20')
    expect(params.get('price_max')).toBe('100')
  })

  it('omits null price values', () => {
    const result = buildFilterParams({ priceMin: null, priceMax: null })
    expect(result).toBe('')
  })

  it('handles zero as a valid price', () => {
    const result = buildFilterParams({ priceMin: 0 })
    expect(result).toBe('price_min=0')
  })

  it('URL-encodes special characters in region names', () => {
    const result = buildFilterParams({ regions: ['Côtes du Rhône'] })
    const params = new URLSearchParams(result)
    expect(params.getAll('region')).toEqual(['Côtes du Rhône'])
  })
})

// ---------------------------------------------------------------------------
// parseFilterParams
// ---------------------------------------------------------------------------
describe('parseFilterParams', () => {
  it('returns empty state for an empty query string', () => {
    expect(parseFilterParams('')).toEqual(emptyFilterState())
  })

  it('parses a single region', () => {
    const state = parseFilterParams('region=France')
    expect(state.regions).toEqual(['France'])
  })

  it('parses multiple regions', () => {
    const state = parseFilterParams('region=France&region=Italy')
    expect(state.regions).toEqual(['France', 'Italy'])
  })

  it('parses varietals', () => {
    const state = parseFilterParams('varietal=Merlot&varietal=Pinot+Noir')
    expect(state.varietals).toEqual(['Merlot', 'Pinot Noir'])
  })

  it('parses price_min', () => {
    const state = parseFilterParams('price_min=20')
    expect(state.priceMin).toBe(20)
  })

  it('parses price_max', () => {
    const state = parseFilterParams('price_max=50')
    expect(state.priceMax).toBe(50)
  })

  it('parses a full price range', () => {
    const state = parseFilterParams('price_min=20&price_max=50')
    expect(state.priceMin).toBe(20)
    expect(state.priceMax).toBe(50)
  })

  it('returns null for non-numeric price values', () => {
    const state = parseFilterParams('price_min=abc&price_max=xyz')
    expect(state.priceMin).toBeNull()
    expect(state.priceMax).toBeNull()
  })

  it('parses combined filters', () => {
    const state = parseFilterParams(
      'region=France&region=Italy&varietal=Merlot&price_min=20&price_max=100'
    )
    expect(state).toEqual({
      regions: ['France', 'Italy'],
      varietals: ['Merlot'],
      priceMin: 20,
      priceMax: 100,
    })
  })

  it('ignores unrecognized params', () => {
    const state = parseFilterParams('region=France&sort=name&page=2')
    expect(state.regions).toEqual(['France'])
    expect(state.varietals).toEqual([])
    expect(state.priceMin).toBeNull()
    expect(state.priceMax).toBeNull()
  })

  it('accepts a URLSearchParams object directly', () => {
    const params = new URLSearchParams()
    params.append('region', 'Napa Valley')
    params.set('price_min', '50')

    const state = parseFilterParams(params)
    expect(state.regions).toEqual(['Napa Valley'])
    expect(state.priceMin).toBe(50)
  })

  it('handles zero as a valid price', () => {
    const state = parseFilterParams('price_min=0')
    expect(state.priceMin).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Round-trip: buildFilterParams → parseFilterParams
// ---------------------------------------------------------------------------
describe('round-trip serialization', () => {
  it('parses back to the original filter state', () => {
    const original: FilterState = {
      regions: ['France', 'Italy'],
      varietals: ['Merlot', 'Pinot Noir'],
      priceMin: 20,
      priceMax: 100,
    }

    const serialized = buildFilterParams(original)
    const parsed = parseFilterParams(serialized)

    expect(parsed).toEqual(original)
  })

  it('round-trips an empty filter state', () => {
    const original = emptyFilterState()
    const serialized = buildFilterParams(original)
    const parsed = parseFilterParams(serialized)
    expect(parsed).toEqual(original)
  })

  it('round-trips filters with only price range', () => {
    const original: FilterState = {
      regions: [],
      varietals: [],
      priceMin: 10,
      priceMax: 500,
    }
    const serialized = buildFilterParams(original)
    const parsed = parseFilterParams(serialized)
    expect(parsed).toEqual(original)
  })
})

// ---------------------------------------------------------------------------
// toggleFilterValue
// ---------------------------------------------------------------------------
describe('toggleFilterValue', () => {
  it('adds a value that is not present', () => {
    expect(toggleFilterValue([], 'France')).toEqual(['France'])
  })

  it('removes a value that is already present', () => {
    expect(toggleFilterValue(['France', 'Italy'], 'France')).toEqual([
      'Italy',
    ])
  })

  it('does not mutate the original array', () => {
    const original = ['France']
    toggleFilterValue(original, 'Italy')
    expect(original).toEqual(['France'])
  })

  it('preserves order of remaining values after removal', () => {
    const result = toggleFilterValue(['France', 'Italy', 'Spain'], 'Italy')
    expect(result).toEqual(['France', 'Spain'])
  })
})

// ---------------------------------------------------------------------------
// emptyFilterState
// ---------------------------------------------------------------------------
describe('emptyFilterState', () => {
  it('returns a state with no active filters', () => {
    const state = emptyFilterState()
    expect(state.regions).toEqual([])
    expect(state.varietals).toEqual([])
    expect(state.priceMin).toBeNull()
    expect(state.priceMax).toBeNull()
  })

  it('returns a new object on each call (no shared references)', () => {
    const a = emptyFilterState()
    const b = emptyFilterState()
    expect(a).not.toBe(b)
    expect(a.regions).not.toBe(b.regions)
  })
})
