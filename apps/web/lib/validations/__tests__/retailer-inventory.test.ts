import { describe, it, expect } from 'vitest'
import { StockOverrideSchema, ClearStockOverrideSchema } from '../retailer-inventory'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const VALID_UUID_2 = '660e8400-e29b-41d4-a716-446655440000'

describe('StockOverrideSchema', () => {
  it('accepts valid retailerId + wineId + in_stock', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
      overrideStatus: 'in_stock',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
      overrideStatus: 'in_stock',
    })
  })

  it('accepts valid low_stock override', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
      overrideStatus: 'low_stock',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid out_of_stock override', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
      overrideStatus: 'out_of_stock',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid overrideStatus', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
      overrideStatus: 'available',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid stock status')
    }
  })

  it('rejects non-UUID retailerId', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: 'not-a-uuid',
      wineId: VALID_UUID_2,
      overrideStatus: 'in_stock',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid retailer ID')
    }
  })

  it('rejects non-UUID wineId', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: 'bad-wine-id',
      overrideStatus: 'in_stock',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid wine ID')
    }
  })

  it('rejects missing retailerId', () => {
    const result = StockOverrideSchema.safeParse({
      wineId: VALID_UUID_2,
      overrideStatus: 'in_stock',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('retailerId')
    }
  })

  it('rejects missing wineId', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      overrideStatus: 'in_stock',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('wineId')
    }
  })

  it('rejects missing overrideStatus', () => {
    const result = StockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('overrideStatus')
    }
  })

  it('rejects empty object', () => {
    const result = StockOverrideSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('ClearStockOverrideSchema', () => {
  it('accepts valid retailerId + wineId', () => {
    const result = ClearStockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      retailerId: VALID_UUID,
      wineId: VALID_UUID_2,
    })
  })

  it('rejects non-UUID retailerId', () => {
    const result = ClearStockOverrideSchema.safeParse({
      retailerId: 'not-valid',
      wineId: VALID_UUID_2,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid retailer ID')
    }
  })

  it('rejects non-UUID wineId', () => {
    const result = ClearStockOverrideSchema.safeParse({
      retailerId: VALID_UUID,
      wineId: 'not-valid',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid wine ID')
    }
  })

  it('rejects missing fields', () => {
    const result = ClearStockOverrideSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
    }
  })
})
