import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// dismissWine — record that a user dismissed a wine recommendation
// Idempotent: uses ON CONFLICT DO NOTHING so repeat calls are safe.
// PostHog tracking is NOT done here — keep the DAL pure for data access.
// ---------------------------------------------------------------------------

export async function dismissWine(
  client: TypedClient,
  userId: string,
  wineId: string
) {
  const { data, error } = await client
    .from('user_wine_dismissals')
    .upsert(
      { user_id: userId, wine_id: wineId },
      { onConflict: 'user_id,wine_id', ignoreDuplicates: true }
    )
    .select()
    .single()

  // If ignoreDuplicates triggers, .single() returns null — treat as success
  if (error && error.code === 'PGRST116') {
    return { data: null, error: null }
  }

  if (error) {
    return { data: null, error }
  }

  return { data, error: null }
}

// ---------------------------------------------------------------------------
// undismissWine — remove a dismissal so the wine can be recommended again
// ---------------------------------------------------------------------------

export async function undismissWine(
  client: TypedClient,
  userId: string,
  wineId: string
) {
  const { error } = await client
    .from('user_wine_dismissals')
    .delete()
    .eq('user_id', userId)
    .eq('wine_id', wineId)

  return { error }
}

// ---------------------------------------------------------------------------
// getUserDismissedWineIds — return a flat array of wine IDs the user dismissed
// ---------------------------------------------------------------------------

export async function getUserDismissedWineIds(
  client: TypedClient,
  userId: string
) {
  const { data, error } = await client
    .from('user_wine_dismissals')
    .select('wine_id')
    .eq('user_id', userId)

  if (error) {
    return { data: [], error }
  }

  const wineIds = (data ?? []).map((row) => row.wine_id)
  return { data: wineIds, error: null }
}
