import { describe, it, expect } from 'vitest'
import {
  UpdateRetailerSettingsSchema,
  UpdateNotificationPreferencesSchema,
} from '../retailer-settings'

describe('UpdateRetailerSettingsSchema', () => {
  it('accepts all valid settings', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      pickup_enabled: true,
      delivery_enabled: false,
      delivery_fee_cents: 500,
      estimated_delivery_minutes: 45,
      delivery_radius_miles: 10.5,
      hours_of_operation: { monday: '9:00-17:00', tuesday: '9:00-17:00' },
      phone: '555-123-4567',
      email: 'store@example.com',
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      pickup_enabled: true,
      delivery_enabled: false,
      delivery_fee_cents: 500,
      estimated_delivery_minutes: 45,
      delivery_radius_miles: 10.5,
      hours_of_operation: { monday: '9:00-17:00', tuesday: '9:00-17:00' },
      phone: '555-123-4567',
      email: 'store@example.com',
    })
  })

  it('accepts partial updates with only pickup_enabled', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      pickup_enabled: true,
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ pickup_enabled: true })
  })

  it('accepts partial updates with only delivery_enabled', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      delivery_enabled: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('accepts nullable fields set to null', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      delivery_fee_cents: null,
      estimated_delivery_minutes: null,
      delivery_radius_miles: null,
      hours_of_operation: null,
      phone: null,
      email: null,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email format', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('email')
    }
  })

  it('rejects negative delivery_radius_miles', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      delivery_radius_miles: -5,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('delivery_radius_miles')
    }
  })

  it('rejects zero delivery_radius_miles', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      delivery_radius_miles: 0,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('delivery_radius_miles')
    }
  })

  it('rejects negative delivery_fee_cents', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      delivery_fee_cents: -100,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('delivery_fee_cents')
    }
  })

  it('rejects non-integer delivery_fee_cents', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      delivery_fee_cents: 4.99,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('delivery_fee_cents')
    }
  })

  it('rejects non-positive estimated_delivery_minutes', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      estimated_delivery_minutes: 0,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('estimated_delivery_minutes')
    }
  })

  it('accepts valid hours_of_operation record', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      hours_of_operation: {
        monday: '9:00-17:00',
        tuesday: '10:00-18:00',
        wednesday: 'closed',
      },
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty phone string', () => {
    const result = UpdateRetailerSettingsSchema.safeParse({
      phone: '',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('phone')
    }
  })
})

describe('UpdateNotificationPreferencesSchema', () => {
  it('accepts valid boolean preferences', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({
      new_order_email: true,
      daily_summary_email: false,
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({
      new_order_email: true,
      daily_summary_email: false,
    })
  })

  it('accepts partial update with only new_order_email', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({
      new_order_email: false,
    })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ new_order_email: false })
  })

  it('accepts partial update with only daily_summary_email', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({
      daily_summary_email: true,
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty object (all fields optional)', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects non-boolean new_order_email', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({
      new_order_email: 'yes',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('new_order_email')
    }
  })

  it('rejects non-boolean daily_summary_email', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({
      daily_summary_email: 1,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]!.path).toContain('daily_summary_email')
    }
  })

  it('rejects numeric values that look truthy', () => {
    const result = UpdateNotificationPreferencesSchema.safeParse({
      new_order_email: 0,
      daily_summary_email: 1,
    })
    expect(result.success).toBe(false)
  })
})
