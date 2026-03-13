import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// getRetailerSettings — fetch retailer row with all settings columns
// ---------------------------------------------------------------------------

export async function getRetailerSettings(
  client: TypedClient,
  retailerId: string
) {
  const { data, error } = await client
    .from('retailers')
    .select(
      'id, org_id, name, slug, address, city, state, zip, phone, email, website, pickup_enabled, delivery_enabled, delivery_fee_cents, estimated_delivery_minutes, delivery_radius_miles, hours_of_operation, commission_rate, is_active'
    )
    .eq('id', retailerId)
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// updateRetailerSettings — update retailer fulfillment & contact settings
// ---------------------------------------------------------------------------

export async function updateRetailerSettings(
  client: TypedClient,
  retailerId: string,
  data: {
    pickup_enabled?: boolean
    delivery_enabled?: boolean
    delivery_fee_cents?: number | null
    estimated_delivery_minutes?: number | null
    delivery_radius_miles?: number | null
    hours_of_operation?: Record<string, string> | null
    phone?: string | null
    email?: string | null
  }
) {
  const { data: updated, error } = await client
    .from('retailers')
    .update(data)
    .eq('id', retailerId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: updated, error: null }
}

// ---------------------------------------------------------------------------
// getNotificationPreferences — fetch notification prefs for a retailer member
// ---------------------------------------------------------------------------

export async function getNotificationPreferences(
  client: TypedClient,
  retailerMemberId: string
) {
  const { data, error } = await client
    .from('retailer_notification_preferences')
    .select('id, retailer_member_id, new_order_email, daily_summary_email')
    .eq('retailer_member_id', retailerMemberId)
    .single()

  // No prefs row yet is not an error — return defaults
  if (error && error.code === 'PGRST116') {
    return {
      data: {
        id: null,
        retailer_member_id: retailerMemberId,
        new_order_email: true,
        daily_summary_email: true,
      },
      error: null,
    }
  }

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// upsertNotificationPreferences — create or update notification preferences
// ---------------------------------------------------------------------------

export async function upsertNotificationPreferences(
  client: TypedClient,
  retailerMemberId: string,
  orgId: string,
  data: {
    new_order_email?: boolean
    daily_summary_email?: boolean
  }
) {
  const { data: upserted, error } = await client
    .from('retailer_notification_preferences')
    .upsert(
      {
        retailer_member_id: retailerMemberId,
        org_id: orgId,
        ...data,
      },
      { onConflict: 'retailer_member_id' }
    )
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: upserted, error: null }
}
