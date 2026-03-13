import { describe, it, expect } from 'vitest'
import { TrackShareSchema } from '../shares'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('TrackShareSchema', () => {
  it('accepts valid wine + native_share combination', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      shareableId: VALID_UUID,
      platform: 'native_share',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      shareableType: 'wine',
      shareableId: VALID_UUID,
      platform: 'native_share',
    })
  })

  it('accepts valid producer + clipboard combination', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'producer',
      shareableId: VALID_UUID,
      platform: 'clipboard',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid wine + twitter combination', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      shareableId: VALID_UUID,
      platform: 'twitter',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid producer + facebook combination', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'producer',
      shareableId: VALID_UUID,
      platform: 'facebook',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid wine + email combination', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      shareableId: VALID_UUID,
      platform: 'email',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid shareableType', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'collection',
      shareableId: VALID_UUID,
      platform: 'clipboard',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('shareableType')
    }
  })

  it('rejects invalid platform', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      shareableId: VALID_UUID,
      platform: 'instagram',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('platform')
    }
  })

  it('rejects non-UUID shareableId', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      shareableId: 'not-a-uuid',
      platform: 'clipboard',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid shareable ID')
    }
  })

  it('rejects missing shareableType', () => {
    const result = TrackShareSchema.safeParse({
      shareableId: VALID_UUID,
      platform: 'clipboard',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('shareableType')
    }
  })

  it('rejects missing shareableId', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      platform: 'clipboard',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('shareableId')
    }
  })

  it('rejects missing platform', () => {
    const result = TrackShareSchema.safeParse({
      shareableType: 'wine',
      shareableId: VALID_UUID,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('platform')
    }
  })

  it('rejects empty object', () => {
    const result = TrackShareSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3)
    }
  })
})
