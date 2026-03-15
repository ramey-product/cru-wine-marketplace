import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type TypedClient = SupabaseClient<Database>

// ---------------------------------------------------------------------------
// getSubscriptionsByUser
// ---------------------------------------------------------------------------

export async function getSubscriptionsByUser(
  client: TypedClient,
  userId: string
) {
  // Table added by migration 20260315000003 — not yet in generated types
  const { data, error } = await (client as any)
    .from('push_subscriptions')
    .select('id, endpoint, p256dh_key, auth_key, created_at')
    .eq('user_id', userId)

  if (error) {
    console.error('getSubscriptionsByUser query failed:', error)
    return { data: null, error }
  }

  return { data: (data ?? []) as Array<{
    id: string
    endpoint: string
    p256dh_key: string
    auth_key: string
    created_at: string
  }>, error: null }
}

// ---------------------------------------------------------------------------
// createSubscription
// ---------------------------------------------------------------------------

interface CreateSubscriptionInput {
  userId: string
  orgId: string
  endpoint: string
  p256dhKey: string
  authKey: string
}

export async function createSubscription(
  client: TypedClient,
  input: CreateSubscriptionInput
) {
  // Table added by migration 20260315000003 — not yet in generated types
  const { data, error } = await (client as any)
    .from('push_subscriptions')
    .upsert(
      {
        user_id: input.userId,
        org_id: input.orgId,
        endpoint: input.endpoint,
        p256dh_key: input.p256dhKey,
        auth_key: input.authKey,
      },
      { onConflict: 'user_id,endpoint' }
    )
    .select()
    .single()

  if (error) {
    console.error('createSubscription failed:', error)
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// deleteSubscription
// ---------------------------------------------------------------------------

export async function deleteSubscription(
  client: TypedClient,
  userId: string,
  endpoint: string
) {
  // Table added by migration 20260315000003 — not yet in generated types
  const { error } = await (client as any)
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)
    .eq('endpoint', endpoint)

  if (error) {
    console.error('deleteSubscription failed:', error)
    return { error }
  }

  return { error: null }
}
