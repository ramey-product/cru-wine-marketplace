'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  updateRetailerSettings as dalUpdateSettings,
  upsertNotificationPreferences as dalUpsertNotificationPrefs,
} from '@/lib/dal/retailer-settings'
import {
  UpdateRetailerSettingsSchema,
  UpdateNotificationPreferencesSchema,
} from '@/lib/validations/retailer-settings'

// ---------------------------------------------------------------------------
// updateRetailerSettings — update retailer fulfillment & contact settings
// Only retailer owners can update settings.
// ---------------------------------------------------------------------------

export async function updateRetailerSettings(
  retailerId: string,
  input: Record<string, unknown>
) {
  // 1. Zod validate
  const parsed = UpdateRetailerSettingsSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 3. Role check — must be owner of this retailer
  const { data: membership, error: memberError } = await supabase
    .from('retailer_members')
    .select('id, role')
    .eq('retailer_id', retailerId)
    .eq('user_id', user.id)
    .single()

  if (memberError || !membership) {
    return { error: 'Not a member of this retailer' }
  }

  if (membership.role !== 'owner') {
    return { error: 'Only owners can update retailer settings' }
  }

  // 4. DAL call
  const { error } = await dalUpdateSettings(supabase, retailerId, parsed.data)
  if (error) {
    console.error('updateRetailerSettings failed:', error)
    return { error: 'Failed to update retailer settings' }
  }

  // 5. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// updateNotificationPreferences — update a member's notification preferences
// Members can only update their own preferences.
// ---------------------------------------------------------------------------

export async function updateNotificationPreferences(
  retailerMemberId: string,
  input: Record<string, unknown>
) {
  // 1. Zod validate
  const parsed = UpdateNotificationPreferencesSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Authentication required' }
  }

  // 3. Member check — verify this retailer_member belongs to the authenticated user
  const { data: member, error: memberError } = await supabase
    .from('retailer_members')
    .select('id, org_id, user_id')
    .eq('id', retailerMemberId)
    .single()

  if (memberError || !member) {
    return { error: 'Retailer membership not found' }
  }

  if (member.user_id !== user.id) {
    return { error: 'You can only update your own notification preferences' }
  }

  // 4. DAL call
  const { error } = await dalUpsertNotificationPrefs(
    supabase,
    retailerMemberId,
    member.org_id,
    parsed.data
  )
  if (error) {
    console.error('updateNotificationPreferences failed:', error)
    return { error: 'Failed to update notification preferences' }
  }

  // 5. Revalidate
  revalidatePath('/', 'layout')

  return { data: { success: true } }
}
