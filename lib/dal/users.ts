import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedClient = SupabaseClient<Database>

export async function getProfile(client: TypedClient, userId: string) {
  return client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
}

export async function updateProfile(
  client: TypedClient,
  userId: string,
  data: {
    full_name?: string
    display_name?: string
    avatar_url?: string
  }
) {
  return client
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single()
}

export async function confirmAge(client: TypedClient, userId: string) {
  return client
    .from('profiles')
    .update({ age_confirmed_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
}

// --- Account Deletion (CCPA) ---

export async function initiateDeletion(client: TypedClient, userId: string) {
  const now = new Date()
  const scheduledAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  // Only set deletion timestamps if not already pending (idempotency).
  // Prevents re-calling from resetting the 30-day countdown.
  return client
    .from('profiles')
    .update({
      deletion_requested_at: now.toISOString(),
      deletion_scheduled_at: scheduledAt.toISOString(),
    })
    .eq('id', userId)
    .is('deletion_scheduled_at', null)
    .select()
    .single()
}

export async function cancelDeletion(client: TypedClient, userId: string) {
  return client
    .from('profiles')
    .update({
      deletion_requested_at: null,
      deletion_scheduled_at: null,
    })
    .eq('id', userId)
    .select()
    .single()
}

export async function getProfilesPendingDeletion(client: TypedClient) {
  return client
    .from('profiles')
    .select('id, email')
    .not('deletion_scheduled_at', 'is', null)
    .lte('deletion_scheduled_at', new Date().toISOString())
}

export async function anonymizeProfile(client: TypedClient, userId: string) {
  return client
    .from('profiles')
    .update({
      email: `deleted-${userId}@deleted.cru`,
      full_name: 'Deleted User',
      display_name: null,
      avatar_url: null,
      deletion_requested_at: null,
      deletion_scheduled_at: null,
    })
    .eq('id', userId)
    .select()
    .single()
}
