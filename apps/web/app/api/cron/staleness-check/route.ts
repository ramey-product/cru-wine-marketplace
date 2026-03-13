/**
 * Staleness Check Cron Endpoint
 *
 * Vercel Cron handler that audits all POS-connected retailers for stale
 * inventory. A retailer is considered stale if no successful sync has
 * completed within 48 hours.
 *
 * Scheduled via vercel.json: daily at 16:00 UTC (8 AM PT during PDT).
 *
 * When stale retailers are detected, the sync alerter is invoked to log
 * structured alerts. Email notifications will be added in EPIC-09.
 *
 * This endpoint uses the service-role Supabase client (no user auth context).
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkStaleness } from '@/lib/services/sync-orchestrator'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Staleness check is lightweight — 1 minute is plenty. */
export const maxDuration = 60

// ---------------------------------------------------------------------------
// GET handler — Vercel Cron uses GET requests
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('staleness-check cron: CRON_SECRET is not configured')
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    )
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Run the staleness check
  const startTime = Date.now()

  try {
    const result = await checkStaleness()

    const totalDurationMs = Date.now() - startTime

    // 3. Return results
    return NextResponse.json({
      ok: true,
      duration_ms: totalDurationMs,
      summary: {
        total_retailers: result.total_retailers,
        stale_count: result.stale_count,
        healthy_count: result.healthy_count,
      },
      stale_retailers: result.stale_retailers,
    })
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown staleness check error'

    console.error('staleness-check cron: threw:', errorMessage)

    return NextResponse.json(
      {
        ok: false,
        duration_ms: Date.now() - startTime,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
