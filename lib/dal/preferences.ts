import type { TypedClient } from '@/lib/dal/types'

export async function getPreferences(client: TypedClient, userId: string) {
  const { data, error } = await client
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return { data, error }
}

export async function upsertPreferences(
  client: TypedClient,
  userId: string,
  data: {
    location_zip?: string
    price_range_min?: number
    price_range_max?: number
    occasion_tags?: string[]
    notification_email_frequency?: 'daily' | 'weekly' | 'off'
  }
) {
  return client
    .from('user_preferences')
    .upsert(
      { user_id: userId, ...data },
      { onConflict: 'user_id' }
    )
    .select()
    .single()
}
