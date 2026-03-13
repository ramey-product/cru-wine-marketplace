import { describe, it, expect } from 'vitest'
import {
  getCategoryLabel,
  groupResultsByType,
  buildResultUrl,
  buildSearchUrl,
  type SearchResult,
} from '../search-utils'

// ---------------------------------------------------------------------------
// getCategoryLabel
// ---------------------------------------------------------------------------
describe('getCategoryLabel', () => {
  it('returns "Wines" for wine type', () => {
    expect(getCategoryLabel('wine')).toBe('Wines')
  })

  it('returns "Producers" for producer type', () => {
    expect(getCategoryLabel('producer')).toBe('Producers')
  })

  it('returns "Varietals" for varietal type', () => {
    expect(getCategoryLabel('varietal')).toBe('Varietals')
  })
})

// ---------------------------------------------------------------------------
// groupResultsByType
// ---------------------------------------------------------------------------
describe('groupResultsByType', () => {
  it('returns an empty object for an empty array', () => {
    expect(groupResultsByType([])).toEqual({})
  })

  it('groups results by their type', () => {
    const results: SearchResult[] = [
      { type: 'wine', label: 'Reserve Cabernet', slug: 'reserve-cabernet' },
      { type: 'producer', label: 'Opus One', slug: 'opus-one' },
      { type: 'wine', label: 'Estate Blend', slug: 'estate-blend' },
      { type: 'varietal', label: 'Merlot' },
    ]

    const grouped = groupResultsByType(results)

    expect(Object.keys(grouped)).toEqual(['wine', 'producer', 'varietal'])
    expect(grouped.wine).toHaveLength(2)
    expect(grouped.producer).toHaveLength(1)
    expect(grouped.varietal).toHaveLength(1)
  })

  it('preserves order within each group', () => {
    const results: SearchResult[] = [
      { type: 'wine', label: 'Alpha', slug: 'alpha' },
      { type: 'wine', label: 'Beta', slug: 'beta' },
      { type: 'wine', label: 'Gamma', slug: 'gamma' },
    ]

    const grouped = groupResultsByType(results)
    expect(grouped.wine?.map((r) => r.label)).toEqual([
      'Alpha',
      'Beta',
      'Gamma',
    ])
  })

  it('handles a single result type', () => {
    const results: SearchResult[] = [
      { type: 'varietal', label: 'Pinot Noir' },
      { type: 'varietal', label: 'Chardonnay' },
    ]

    const grouped = groupResultsByType(results)
    expect(Object.keys(grouped)).toEqual(['varietal'])
    expect(grouped.varietal).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// buildResultUrl
// ---------------------------------------------------------------------------
describe('buildResultUrl', () => {
  it('builds a wine URL from slug', () => {
    const result: SearchResult = {
      type: 'wine',
      label: 'Reserve Cabernet',
      slug: 'reserve-cabernet',
    }
    expect(buildResultUrl(result)).toBe('/wines/reserve-cabernet')
  })

  it('returns null for a wine without a slug', () => {
    const result: SearchResult = { type: 'wine', label: 'Mystery Wine' }
    expect(buildResultUrl(result)).toBeNull()
  })

  it('builds a producer URL from slug', () => {
    const result: SearchResult = {
      type: 'producer',
      label: 'Opus One',
      slug: 'opus-one',
    }
    expect(buildResultUrl(result)).toBe('/producers/opus-one')
  })

  it('returns null for a producer without a slug', () => {
    const result: SearchResult = { type: 'producer', label: 'Unknown' }
    expect(buildResultUrl(result)).toBeNull()
  })

  it('builds a varietal URL from label (URI-encoded)', () => {
    const result: SearchResult = { type: 'varietal', label: 'Pinot Noir' }
    expect(buildResultUrl(result)).toBe('/wines/varietal/Pinot%20Noir')
  })

  it('encodes special characters in varietal labels', () => {
    const result: SearchResult = {
      type: 'varietal',
      label: 'Grüner Veltliner',
    }
    expect(buildResultUrl(result)).toBe(
      `/wines/varietal/${encodeURIComponent('Grüner Veltliner')}`
    )
  })

  it('varietal URL does not require a slug', () => {
    const result: SearchResult = {
      type: 'varietal',
      label: 'Merlot',
    }
    expect(buildResultUrl(result)).toBe('/wines/varietal/Merlot')
  })
})

// ---------------------------------------------------------------------------
// buildSearchUrl
// ---------------------------------------------------------------------------
describe('buildSearchUrl', () => {
  it('builds a search URL from a query', () => {
    expect(buildSearchUrl('cabernet')).toBe(
      '/wines/search?q=cabernet'
    )
  })

  it('trims whitespace before encoding', () => {
    expect(buildSearchUrl('  cabernet  ')).toBe(
      '/wines/search?q=cabernet'
    )
  })

  it('encodes special characters', () => {
    expect(buildSearchUrl('côtes du rhône')).toBe(
      `/wines/search?q=${encodeURIComponent('côtes du rhône')}`
    )
  })

  it('returns null for an empty string', () => {
    expect(buildSearchUrl('')).toBeNull()
  })

  it('returns null for whitespace-only input', () => {
    expect(buildSearchUrl('   ')).toBeNull()
  })

  it('encodes ampersands and other query-unsafe chars', () => {
    expect(buildSearchUrl('red & white')).toBe(
      `/wines/search?q=${encodeURIComponent('red & white')}`
    )
  })
})
