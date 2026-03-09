/**
 * Sync Orchestrator Service
 *
 * Orchestrates POS inventory syncs across all active retailers. Designed to
 * run from Vercel Cron jobs (no user auth context — uses service-role client).
 *
 * Three main functions:
 * - runFullSyncAll()        — nightly full sync for every POS-connected retailer
 * - runIncrementalSyncAll() — every-4-hours incremental sync
 * - checkStaleness()        — daily check for retailers with stale inventory
 *
 * Each retailer is synced independently — a failure in one does not stop the
 * others. Results are aggregated into an OrchestratorResult summary.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { getPOSAdapter, isPOSAdapterAvailable, SUPPORTED_POS_TYPES } from '@/lib/integrations/pos/adapter-factory'
import { bulkCreateMatchQueueItems } from '@/lib/dal/wine-matching'
import { processMatchQueue } from '@/lib/services/wine-matcher'
import {
  sendSyncFailureAlert,
  sendStalenessAlert,
  DEFAULT_ALERT_CONFIG,
} from '@/lib/services/sync-alerter'
import type { POSCredentials, SyncResult } from '@/lib/integrations/pos/types'
import type { TypedClient } from '@/lib/dal/types'
import type { StaleRetailerInfo } from '@/lib/services/sync-alerter'

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** Result for a single retailer's sync attempt. */
export interface RetailerSyncResult {
  retailer_id: string
  retailer_name: string
  org_id: string
  status: 'success' | 'failed' | 'skipped'
  records_processed?: number
  error?: string
  duration_ms?: number
}

/** Aggregate result for an orchestrator run. */
export interface OrchestratorResult {
  total_retailers: number
  successful: number
  failed: number
  skipped: number
  results: RetailerSyncResult[]
}

/** Result for a staleness check. */
export interface StalenessResult {
  total_retailers: number
  stale_count: number
  healthy_count: number
  stale_retailers: StaleRetailerInfo[]
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** Shape of a retailer row fetched for sync. */
interface SyncRetailer {
  id: string
  org_id: string
  name: string
  pos_type: string
  pos_credentials: unknown
  is_active: boolean
}

// ---------------------------------------------------------------------------
// runFullSyncAll — full sync for every POS-connected retailer
// ---------------------------------------------------------------------------

/**
 * Run a full POS inventory sync for all active, POS-connected retailers.
 *
 * Pipeline per retailer:
 * 1. Get POS adapter for the retailer's pos_type
 * 2. Call adapter.fullSync()
 * 3. Insert parsed items into wine_match_queue
 * 4. Trigger the matching engine
 * 5. Create/update sync log entries
 * 6. On failure: log error, alert, continue to next retailer
 *
 * @returns OrchestratorResult with aggregate statistics
 */
export async function runFullSyncAll(): Promise<OrchestratorResult> {
  return runSyncAll('full')
}

// ---------------------------------------------------------------------------
// runIncrementalSyncAll — incremental sync for every POS-connected retailer
// ---------------------------------------------------------------------------

/**
 * Run an incremental POS inventory sync for all active, POS-connected retailers.
 * Only fetches items changed since the last successful sync.
 *
 * @returns OrchestratorResult with aggregate statistics
 */
export async function runIncrementalSyncAll(): Promise<OrchestratorResult> {
  return runSyncAll('incremental')
}

// ---------------------------------------------------------------------------
// runSyncAll — shared implementation for full and incremental syncs
// ---------------------------------------------------------------------------

/**
 * Core sync loop. Fetches all eligible retailers and syncs each one
 * independently. Failures are caught per-retailer and do not abort the run.
 */
async function runSyncAll(
  syncType: 'full' | 'incremental'
): Promise<OrchestratorResult> {
  const supabase = createAdminClient()

  // 1. Query all active POS-connected retailers
  const retailers = await fetchSyncEligibleRetailers(supabase)

  const result: OrchestratorResult = {
    total_retailers: retailers.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    results: [],
  }

  if (retailers.length === 0) {
    return result
  }

  // 2. Process each retailer independently
  for (const retailer of retailers) {
    const retailerResult = await syncSingleRetailer(
      supabase,
      retailer,
      syncType
    )
    result.results.push(retailerResult)

    switch (retailerResult.status) {
      case 'success':
        result.successful++
        break
      case 'failed':
        result.failed++
        break
      case 'skipped':
        result.skipped++
        break
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// syncSingleRetailer — sync pipeline for one retailer
// ---------------------------------------------------------------------------

/**
 * Execute the full sync pipeline for a single retailer.
 * Catches all errors so that one retailer's failure never propagates.
 */
async function syncSingleRetailer(
  supabase: TypedClient,
  retailer: SyncRetailer,
  syncType: 'full' | 'incremental'
): Promise<RetailerSyncResult> {
  const startTime = Date.now()

  // Validate POS adapter availability
  if (!isPOSAdapterAvailable(retailer.pos_type)) {
    return {
      retailer_id: retailer.id,
      retailer_name: retailer.name,
      org_id: retailer.org_id,
      status: 'skipped',
      error: `No adapter available for POS type "${retailer.pos_type}"`,
    }
  }

  // Validate credentials
  const credentials = retailer.pos_credentials as POSCredentials | null
  if (!credentials) {
    return {
      retailer_id: retailer.id,
      retailer_name: retailer.name,
      org_id: retailer.org_id,
      status: 'skipped',
      error: 'Missing POS credentials',
    }
  }

  // Create "started" sync log entry
  const syncLogId = await createSyncLog(supabase, {
    org_id: retailer.org_id,
    retailer_id: retailer.id,
    sync_type: syncType === 'full' ? 'pos_full' : 'pos_incremental',
    sync_source: retailer.pos_type,
    status: 'started',
  })

  if (!syncLogId) {
    return {
      retailer_id: retailer.id,
      retailer_name: retailer.name,
      org_id: retailer.org_id,
      status: 'failed',
      error: 'Failed to create sync log entry',
      duration_ms: Date.now() - startTime,
    }
  }

  // Run the adapter sync
  let syncResult: SyncResult
  try {
    const adapter = getPOSAdapter(retailer.pos_type)

    if (syncType === 'full') {
      syncResult = await adapter.fullSync(retailer.id, credentials)
    } else {
      const lastSyncTime = await getLastSuccessfulSyncTime(
        supabase,
        retailer.id
      )
      // Default to 4 hours ago if no previous sync
      const since = lastSyncTime ?? new Date(Date.now() - 4 * 60 * 60 * 1000)
      syncResult = await adapter.incrementalSync(
        retailer.id,
        credentials,
        since
      )
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown sync error'

    // Update sync log as failed
    await updateSyncLog(supabase, syncLogId, {
      status: 'failed',
      error_details: { error: errorMessage },
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    })

    // Send failure alert
    sendSyncFailureAlert(
      {
        id: retailer.id,
        name: retailer.name,
        org_id: retailer.org_id,
        pos_type: retailer.pos_type,
      },
      errorMessage,
      syncLogId
    )

    return {
      retailer_id: retailer.id,
      retailer_name: retailer.name,
      org_id: retailer.org_id,
      status: 'failed',
      error: errorMessage,
      duration_ms: Date.now() - startTime,
    }
  }

  // Insert parsed items into wine_match_queue
  let matchQueueInserted = 0
  if (syncResult.items.length > 0) {
    const queueItems = syncResult.items.map((item) => ({
      org_id: retailer.org_id,
      retailer_id: retailer.id,
      raw_wine_name: item.rawWineName,
      raw_producer: item.rawProducer,
      raw_vintage: item.rawVintage,
      raw_varietal: item.rawVarietal,
      raw_sku: item.sku,
      raw_price: item.price,
      raw_quantity: item.quantity,
      match_status: 'pending',
      sync_log_id: syncLogId,
    }))

    const { count, error: queueError } = await bulkCreateMatchQueueItems(
      supabase,
      queueItems
    )

    if (queueError) {
      console.error(
        `syncSingleRetailer: failed to insert match queue items for retailer ${retailer.id}:`,
        queueError
      )
    } else {
      matchQueueInserted = count
    }
  }

  // Trigger matching engine (best-effort, non-fatal)
  if (matchQueueInserted > 0) {
    try {
      await processMatchQueue(supabase, retailer.org_id, {
        batchSize: Math.min(matchQueueInserted, 500),
      })
    } catch (matchErr) {
      console.error(
        `syncSingleRetailer: matching engine failed for retailer ${retailer.id} (non-fatal):`,
        matchErr instanceof Error ? matchErr.message : matchErr
      )
    }
  }

  // Update sync log with final results
  const durationMs = Date.now() - startTime
  await updateSyncLog(supabase, syncLogId, {
    status: syncResult.status,
    records_processed: syncResult.recordsProcessed,
    records_created: syncResult.recordsCreated,
    records_updated: syncResult.recordsUpdated,
    records_failed: syncResult.recordsFailed,
    error_details:
      syncResult.errors && syncResult.errors.length > 0
        ? { errors: syncResult.errors }
        : null,
    completed_at: new Date().toISOString(),
    duration_ms: durationMs,
  })

  // Alert on partial failures
  if (syncResult.status === 'failed') {
    sendSyncFailureAlert(
      {
        id: retailer.id,
        name: retailer.name,
        org_id: retailer.org_id,
        pos_type: retailer.pos_type,
      },
      `Sync completed with status "failed": ${syncResult.recordsFailed} records failed`,
      syncLogId
    )
  }

  return {
    retailer_id: retailer.id,
    retailer_name: retailer.name,
    org_id: retailer.org_id,
    status: syncResult.status === 'failed' ? 'failed' : 'success',
    records_processed: syncResult.recordsProcessed,
    duration_ms: durationMs,
  }
}

// ---------------------------------------------------------------------------
// checkStaleness — detect retailers with stale inventory
// ---------------------------------------------------------------------------

/**
 * Check all POS-connected retailers for stale inventory.
 *
 * A retailer is considered stale if no successful sync has completed within
 * the configured threshold (default: 48 hours).
 *
 * If stale retailers are found:
 * 1. A sync log entry is created with type 'staleness_check'
 * 2. The alerter is called to log/notify
 *
 * @returns StalenessResult with details on stale retailers
 */
export async function checkStaleness(): Promise<StalenessResult> {
  const supabase = createAdminClient()
  const config = DEFAULT_ALERT_CONFIG
  const thresholdMs = config.stalenessThresholdHours * 60 * 60 * 1000
  const thresholdDate = new Date(Date.now() - thresholdMs)

  // 1. Fetch all active POS-connected retailers
  const retailers = await fetchSyncEligibleRetailers(supabase)

  const result: StalenessResult = {
    total_retailers: retailers.length,
    stale_count: 0,
    healthy_count: 0,
    stale_retailers: [],
  }

  if (retailers.length === 0) {
    return result
  }

  // 2. For each retailer, check the most recent successful sync
  for (const retailer of retailers) {
    const lastSync = await getLastSuccessfulSyncTime(supabase, retailer.id)

    if (!lastSync || lastSync < thresholdDate) {
      const hoursSinceSync = lastSync
        ? Math.round((Date.now() - lastSync.getTime()) / (1000 * 60 * 60))
        : -1 // -1 means never synced

      const staleInfo: StaleRetailerInfo = {
        id: retailer.id,
        name: retailer.name,
        org_id: retailer.org_id,
        pos_type: retailer.pos_type,
        last_successful_sync: lastSync ? lastSync.toISOString() : null,
        hours_since_sync: hoursSinceSync === -1
          ? config.stalenessThresholdHours + 1 // flag as over threshold
          : hoursSinceSync,
      }

      result.stale_retailers.push(staleInfo)
      result.stale_count++
    } else {
      result.healthy_count++
    }
  }

  // 3. If stale retailers found, log a staleness_check sync log and alert
  if (result.stale_retailers.length > 0) {
    // Pick the first stale retailer's org for the log entry.
    // In practice, staleness is platform-wide, so we log once per check.
    const firstStale = result.stale_retailers[0]

    await createSyncLog(supabase, {
      org_id: firstStale.org_id,
      retailer_id: firstStale.id,
      sync_type: 'staleness_check',
      sync_source: firstStale.pos_type ?? 'csv',
      status: 'completed',
      error_details: {
        stale_retailer_count: result.stale_count,
        stale_retailers: result.stale_retailers.map((r) => ({
          retailer_id: r.id,
          retailer_name: r.name,
          org_id: r.org_id,
          last_successful_sync: r.last_successful_sync,
          hours_since_sync: r.hours_since_sync,
        })),
      },
    })

    sendStalenessAlert(result.stale_retailers, config)
  }

  return result
}

// ---------------------------------------------------------------------------
// Private helpers — retailer queries
// ---------------------------------------------------------------------------

/**
 * Fetch all retailers eligible for POS sync.
 * Criteria: is_active = true, pos_type in SUPPORTED_POS_TYPES,
 * pos_credentials is not null.
 *
 * Uses the service-role client (bypasses RLS) since cron jobs
 * have no user auth context.
 */
async function fetchSyncEligibleRetailers(
  supabase: TypedClient
): Promise<SyncRetailer[]> {
  const { data, error } = await supabase
    .from('retailers')
    .select('id, org_id, name, pos_type, pos_credentials, is_active')
    .eq('is_active', true)
    .in('pos_type', SUPPORTED_POS_TYPES as unknown as string[])
    .not('pos_credentials', 'is', null)
    .order('name', { ascending: true })

  if (error) {
    console.error('fetchSyncEligibleRetailers failed:', error)
    return []
  }

  return (data ?? []) as SyncRetailer[]
}

// ---------------------------------------------------------------------------
// Private helpers — sync log operations
// ---------------------------------------------------------------------------

/**
 * Create a new sync log entry. Returns the sync log ID or null on failure.
 *
 * Mirrors the createSyncLog helper in pos-sync.ts but operates with the
 * service-role client (no user auth context).
 */
async function createSyncLog(
  client: TypedClient,
  data: {
    org_id: string
    retailer_id: string
    sync_type: string
    sync_source: string
    status: string
    error_details?: Record<string, unknown>
  }
): Promise<string | null> {
  const { data: result, error } = await client
    .from('retailer_sync_logs')
    .insert({
      org_id: data.org_id,
      retailer_id: data.retailer_id,
      sync_type: data.sync_type,
      sync_source: data.sync_source,
      status: data.status,
      started_at: new Date().toISOString(),
      error_details: data.error_details ?? null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('sync-orchestrator createSyncLog failed:', error)
    return null
  }

  return result.id
}

/**
 * Update an existing sync log entry with completion data.
 *
 * Mirrors the updateSyncLog helper in pos-sync.ts but operates with the
 * service-role client.
 */
async function updateSyncLog(
  client: TypedClient,
  syncLogId: string,
  data: {
    status: string
    records_processed?: number
    records_created?: number
    records_updated?: number
    records_failed?: number
    error_details?: Record<string, unknown> | null
    completed_at?: string
    duration_ms?: number
  }
): Promise<void> {
  const { error } = await client
    .from('retailer_sync_logs')
    .update({
      status: data.status,
      records_processed: data.records_processed ?? 0,
      records_created: data.records_created ?? 0,
      records_updated: data.records_updated ?? 0,
      records_failed: data.records_failed ?? 0,
      error_details: data.error_details ?? null,
      completed_at: data.completed_at ?? null,
      duration_ms: data.duration_ms ?? null,
    })
    .eq('id', syncLogId)

  if (error) {
    console.error('sync-orchestrator updateSyncLog failed:', error)
  }
}

/**
 * Find the last successful sync completion time for a retailer.
 * Used for incremental sync `since` parameter and staleness detection.
 */
async function getLastSuccessfulSyncTime(
  client: TypedClient,
  retailerId: string
): Promise<Date | null> {
  const { data, error } = await client
    .from('retailer_sync_logs')
    .select('completed_at')
    .eq('retailer_id', retailerId)
    .in('sync_type', ['pos_full', 'pos_incremental'])
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data?.completed_at) return null

  return new Date(data.completed_at)
}
