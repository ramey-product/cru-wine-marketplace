import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TrackShareSchema } from '@/lib/validations/shares'

// POST /api/v1/share-events
// Fire-and-forget share tracking for navigator.sendBeacon() and anonymous users.
// Uses service role client to bypass RLS (supports anonymous shares with null user_id).

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = TrackShareSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin.from('share_events').insert({
    user_id: null,
    shareable_type: parsed.data.shareableType,
    shareable_id: parsed.data.shareableId,
    platform: parsed.data.platform,
  })

  if (error) {
    console.error('share-events API route: insert failed:', error)
    return NextResponse.json({ error: 'Failed to track share' }, { status: 500 })
  }

  return NextResponse.json({ tracked: true }, { status: 202 })
}
