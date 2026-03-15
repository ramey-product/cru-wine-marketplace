'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createSubscription,
  deleteSubscription,
} from '@/lib/dal/push-subscriptions'

// ---------------------------------------------------------------------------
// savePushSubscription — store a push subscription for the current user
// ---------------------------------------------------------------------------

export async function savePushSubscription(input: {
  endpoint: string
  p256dhKey: string
  authKey: string
}) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 2. Get user's org membership for org_id
  const { data: membership } = await supabase
    .from('memberships')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) {
    return { error: 'No organization found' }
  }

  // 3. Create subscription
  const { error } = await createSubscription(supabase, {
    userId: user.id,
    orgId: membership.org_id,
    endpoint: input.endpoint,
    p256dhKey: input.p256dhKey,
    authKey: input.authKey,
  })

  if (error) {
    return { error: 'Failed to save push subscription' }
  }

  return { data: { success: true } }
}

// ---------------------------------------------------------------------------
// deletePushSubscription — remove a push subscription
// ---------------------------------------------------------------------------

export async function deletePushSubscription(endpoint: string) {
  // 1. Auth
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 2. Delete subscription
  const { error } = await deleteSubscription(supabase, user.id, endpoint)

  if (error) {
    return { error: 'Failed to delete push subscription' }
  }

  return { data: { success: true } }
}
