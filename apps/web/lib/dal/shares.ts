import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// createShareEvent — record a share event for a wine or producer
// ---------------------------------------------------------------------------

export async function createShareEvent(
  client: TypedClient,
  data: {
    user_id?: string | null
    shareable_type: 'wine' | 'producer'
    shareable_id: string
    platform: 'native_share' | 'clipboard' | 'twitter' | 'facebook' | 'email'
  }
) {
  return client
    .from('share_events')
    .insert(data)
    .select()
    .single()
}

// ---------------------------------------------------------------------------
// getShareCounts — count total shares for a given item (internal analytics)
// ---------------------------------------------------------------------------

export async function getShareCounts(
  client: TypedClient,
  shareableType: 'wine' | 'producer',
  shareableId: string
) {
  const { count, error } = await client
    .from('share_events')
    .select('*', { count: 'exact', head: true })
    .eq('shareable_type', shareableType)
    .eq('shareable_id', shareableId)

  if (error) {
    return { data: null, error }
  }

  return { data: { count: count ?? 0 }, error: null }
}
