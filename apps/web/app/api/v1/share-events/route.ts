import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TrackShareSchema } from '@/lib/validations/shares'

// POST /api/v1/share-events
// Fire-and-forget share tracking for navigator.sendBeacon() and anonymous users.
// Uses service role client to bypass RLS (supports anonymous shares with null user_id).

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL,
  'http://localhost:3000',
].filter(Boolean)

const MAX_BODY_BYTES = 1024 // 1KB — share events are tiny JSON payloads

export async function POST(request: Request) {
  // Origin validation — reject requests from unknown origins
  const origin = request.headers.get('origin')
  if (origin && ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Body size guard
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

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
