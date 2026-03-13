'use server'

import { createClient } from '@/lib/supabase/server'
import { createShareEvent } from '@/lib/dal/shares'
import { TrackShareSchema } from '@/lib/validations/shares'

// ---------------------------------------------------------------------------
// trackShare — record a share event for the authenticated user
// ---------------------------------------------------------------------------

export async function trackShare(input: {
  shareableType: string
  shareableId: string
  platform: string
}) {
  // 1. Zod validate
  const parsed = TrackShareSchema.safeParse(input)
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

  // 3. DAL call — createShareEvent
  const { error } = await createShareEvent(supabase, {
    user_id: user.id,
    shareable_type: parsed.data.shareableType,
    shareable_id: parsed.data.shareableId,
    platform: parsed.data.platform,
  })
  if (error) {
    console.error('trackShare failed:', error)
    return { error: 'Failed to track share event' }
  }

  return { data: { tracked: true } }
}
