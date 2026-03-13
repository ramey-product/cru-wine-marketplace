/**
 * Inventory Sync Cron Endpoint
 *
 * Vercel Cron handler that triggers full or incremental POS inventory syncs
 * across all active retailers. Scheduled via vercel.json:
 *
 *   - Full sync:        daily at 10:00 UTC (2 AM PT during PDT)
 *   - Incremental sync: every 4 hours
 *
 * Security: Vercel Cron requests include a CRON_SECRET in the Authorization
 * header. This endpoint validates that secret before proceeding.
 *
 * This endpoint uses the service-role Supabase client (no user auth context).
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  runFullSyncAll,
  runIncrementalSyncAll,
} from '@/lib/services/sync-orchestrator'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Allow up to 5 minutes for a full sync across all retailers. */
export const maxDuration = 300

// ---------------------------------------------------------------------------
// GET handler — Vercel Cron uses GET requests
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest): Promise<NextResponse> {
  // 1. Verify CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('inventory-sync cron: CRON_SECRET is not configured')
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

  // 2. Determine sync type from query parameter
  const { searchParams } = new URL(request.url)
  const syncType = searchParams.get('type') ?? 'full'

  if (syncType !== 'full' && syncType !== 'incremental') {
    return NextResponse.json(
      { error: 'Invalid sync type. Must be "full" or "incremental".' },
      { status: 400 }
    )
  }

  // 3. Run the orchestrator
  const startTime = Date.now()

  try {
    const result =
      syncType === 'full'
        ? await runFullSyncAll()
        : await runIncrementalSyncAll()

    const totalDurationMs = Date.now() - startTime

    // 4. Return results — 200 even on partial failures (the cron job itself ran)
    return NextResponse.json({
      ok: true,
      sync_type: syncType,
      duration_ms: totalDurationMs,
      summary: {
        total_retailers: result.total_retailers,
        successful: result.successful,
        failed: result.failed,
        skipped: result.skipped,
      },
      results: result.results,
    })
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown orchestrator error'

    console.error('inventory-sync cron: orchestrator threw:', errorMessage)

    return NextResponse.json(
      {
        ok: false,
        sync_type: syncType,
        duration_ms: Date.now() - startTime,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
