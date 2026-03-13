import { describe, it, expect } from 'vitest'
import { FollowUserSchema } from '../follows'

describe('FollowUserSchema', () => {
  it('accepts a valid UUID targetUserId', () => {
    const result = FollowUserSchema.safeParse({
      targetUserId: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      targetUserId: '550e8400-e29b-41d4-a716-446655440000',
    })
  })

  it('rejects a non-UUID string', () => {
    const result = FollowUserSchema.safeParse({
      targetUserId: 'not-a-uuid',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid user ID')
    }
  })

  it('rejects an empty string', () => {
    const result = FollowUserSchema.safeParse({
      targetUserId: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing targetUserId', () => {
    const result = FollowUserSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('targetUserId')
    }
  })
})
