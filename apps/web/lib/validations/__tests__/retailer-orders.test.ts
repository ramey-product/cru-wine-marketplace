import { describe, it, expect } from 'vitest'
import {
  UpdateOrderStatusSchema,
  VALID_STATUS_TRANSITIONS,
  ORDER_STATUSES,
} from '../retailer-orders'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'

describe('UpdateOrderStatusSchema', () => {
  it('accepts valid orderId + pending status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'pending',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      orderId: VALID_UUID,
      status: 'pending',
    })
  })

  it('accepts valid orderId + confirmed status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'confirmed',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid orderId + ready_for_pickup status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'ready_for_pickup',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid orderId + out_for_delivery status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'out_for_delivery',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid orderId + completed status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'completed',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid orderId + cancelled status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'cancelled',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional reason string', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'cancelled',
      reason: 'Customer requested cancellation',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      orderId: VALID_UUID,
      status: 'cancelled',
      reason: 'Customer requested cancellation',
    })
  })

  it('accepts missing reason (optional)', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'confirmed',
    })
    expect(result.success).toBe(true)
    expect(result.data?.reason).toBeUndefined()
  })

  it('rejects invalid status value', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'shipped',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid order status')
    }
  })

  it('rejects non-UUID orderId', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: 'not-a-uuid',
      status: 'pending',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.message).toBe('Invalid order ID')
    }
  })

  it('rejects missing orderId', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      status: 'pending',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('orderId')
    }
  })

  it('rejects missing status', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('status')
    }
  })

  it('rejects empty object', () => {
    const result = UpdateOrderStatusSchema.safeParse({})
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('rejects reason longer than 500 characters', () => {
    const result = UpdateOrderStatusSchema.safeParse({
      orderId: VALID_UUID,
      status: 'cancelled',
      reason: 'x'.repeat(501),
    })
    expect(result.success).toBe(false)
  })
})

describe('VALID_STATUS_TRANSITIONS', () => {
  it('allows pending to transition to confirmed', () => {
    expect(VALID_STATUS_TRANSITIONS.pending).toContain('confirmed')
  })

  it('allows pending to transition to cancelled', () => {
    expect(VALID_STATUS_TRANSITIONS.pending).toContain('cancelled')
  })

  it('allows confirmed to transition to ready_for_pickup', () => {
    expect(VALID_STATUS_TRANSITIONS.confirmed).toContain('ready_for_pickup')
  })

  it('allows confirmed to transition to out_for_delivery', () => {
    expect(VALID_STATUS_TRANSITIONS.confirmed).toContain('out_for_delivery')
  })

  it('allows confirmed to transition to cancelled', () => {
    expect(VALID_STATUS_TRANSITIONS.confirmed).toContain('cancelled')
  })

  it('allows ready_for_pickup to transition to completed', () => {
    expect(VALID_STATUS_TRANSITIONS.ready_for_pickup).toContain('completed')
  })

  it('allows out_for_delivery to transition to completed', () => {
    expect(VALID_STATUS_TRANSITIONS.out_for_delivery).toContain('completed')
  })

  it('does not allow completed to transition to any status', () => {
    expect(VALID_STATUS_TRANSITIONS.completed).toHaveLength(0)
  })

  it('does not allow cancelled to transition to any status', () => {
    expect(VALID_STATUS_TRANSITIONS.cancelled).toHaveLength(0)
  })

  it('does not allow pending to transition directly to completed', () => {
    expect(VALID_STATUS_TRANSITIONS.pending).not.toContain('completed')
  })

  it('has entries for every defined ORDER_STATUS', () => {
    for (const status of ORDER_STATUSES) {
      expect(VALID_STATUS_TRANSITIONS).toHaveProperty(status)
    }
  })
})
