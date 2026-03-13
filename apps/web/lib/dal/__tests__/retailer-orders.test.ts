import { describe, it, expect, vi, afterEach } from 'vitest'
import { getOrderSlaStatus } from '../retailer-orders'

describe('getOrderSlaStatus', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns ok for order created 30 minutes ago', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 30 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('ok')
  })

  it('returns ok for order created 1 minute ago', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 1 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('ok')
  })

  it('returns warning for order created 90 minutes ago', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 90 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('warning')
  })

  it('returns warning for order created 61 minutes ago', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 61 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('warning')
  })

  it('returns critical for order created 150 minutes ago', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 150 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('critical')
  })

  it('returns critical for order created 121 minutes ago', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 121 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('critical')
  })

  it('returns ok at exactly 59 minutes', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 59 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('ok')
  })

  it('returns warning at exactly 60 minutes', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 60 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('warning')
  })

  it('returns warning at exactly 119 minutes', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 119 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('warning')
  })

  it('returns critical at exactly 120 minutes', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 120 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('critical')
  })

  it('returns ok for order created just now', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('ok')
  })

  it('returns critical for very old order (24 hours)', () => {
    const now = Date.now()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const createdAt = new Date(now - 24 * 60 * 60 * 1000).toISOString()

    expect(getOrderSlaStatus(createdAt)).toBe('critical')
  })
})
