import { describe, it, expect } from 'vitest'
import {
  formatWinePrice,
  formatVarietalRegion,
  getAvailabilityText,
} from '../utils'

describe('formatWinePrice', () => {
  it('returns "Check availability" when both min and max are null', () => {
    expect(formatWinePrice(null, null)).toBe('Check availability')
  })

  it('returns a single price when min equals max (whole dollar)', () => {
    expect(formatWinePrice(28, 28)).toBe('$28')
  })

  it('returns a single price when min equals max (fractional)', () => {
    expect(formatWinePrice(28.5, 28.5)).toBe('$28.50')
  })

  it('returns a range when min differs from max', () => {
    expect(formatWinePrice(20, 28)).toBe('$20\u2013$28')
  })

  it('returns a range with fractional prices', () => {
    expect(formatWinePrice(19.99, 29.99)).toBe('$19.99\u2013$29.99')
  })

  it('returns "From $X" when only min is provided', () => {
    expect(formatWinePrice(20, null)).toBe('From $20')
  })

  it('returns "From $X" with fractional min', () => {
    expect(formatWinePrice(19.99, null)).toBe('From $19.99')
  })

  it('returns "Up to $X" when only max is provided', () => {
    expect(formatWinePrice(null, 28)).toBe('Up to $28')
  })

  it('returns "Up to $X" with fractional max', () => {
    expect(formatWinePrice(null, 28.5)).toBe('Up to $28.50')
  })

  it('handles zero as a valid price', () => {
    expect(formatWinePrice(0, 0)).toBe('$0')
  })

  it('handles zero min with non-zero max', () => {
    expect(formatWinePrice(0, 50)).toBe('$0\u2013$50')
  })
})

describe('formatVarietalRegion', () => {
  it('returns null when all inputs are null', () => {
    expect(formatVarietalRegion(null, null, null)).toBeNull()
  })

  it('returns varietal only when region and country are null', () => {
    expect(formatVarietalRegion('Pinot Noir', null, null)).toBe('Pinot Noir')
  })

  it('returns region and country when varietal is null', () => {
    expect(formatVarietalRegion(null, 'Burgundy', 'France')).toBe(
      'Burgundy, France'
    )
  })

  it('returns country only when varietal and region are null', () => {
    expect(formatVarietalRegion(null, null, 'France')).toBe('France')
  })

  it('returns region only when varietal and country are null', () => {
    expect(formatVarietalRegion(null, 'Burgundy', null)).toBe('Burgundy')
  })

  it('returns full string with varietal, region, and country', () => {
    expect(formatVarietalRegion('Pinot Noir', 'Burgundy', 'France')).toBe(
      'Pinot Noir \u2014 Burgundy, France'
    )
  })

  it('returns varietal and country with em-dash when region is null', () => {
    expect(formatVarietalRegion('Malbec', null, 'Argentina')).toBe(
      'Malbec \u2014 Argentina'
    )
  })

  it('returns varietal and region with em-dash when country is null', () => {
    expect(formatVarietalRegion('Syrah', 'Barossa Valley', null)).toBe(
      'Syrah \u2014 Barossa Valley'
    )
  })

  it('treats empty strings as falsy', () => {
    expect(formatVarietalRegion('', '', '')).toBeNull()
  })
})

describe('getAvailabilityText', () => {
  it('returns "In stock nearby" when available', () => {
    expect(getAvailabilityText(true)).toBe('In stock nearby')
  })

  it('returns "Check availability" when not available', () => {
    expect(getAvailabilityText(false)).toBe('Check availability')
  })
})
