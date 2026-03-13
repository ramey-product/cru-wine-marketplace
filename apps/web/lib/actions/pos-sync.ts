'use server'

/**
 * POS Sync Server Actions
 *
 * Server actions for triggering POS inventory syncs and testing connections.
 *
 * Pipeline: Zod validate -> auth check -> fetch retailer -> permission check
 *           -> get adapter -> run sync -> create sync log -> insert into
 *           wine_match_queue -> trigger matching -> revalidatePath -> return
 */

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPlatformOrgAdmin } from '@/lib/auth/permissions'
import { getPOSAdapter, isPOSAdapterAvailable } from '@/lib/integrations/pos/adapter-factory'
import { bulkCreateMatchQueueItems } from '@/lib/dal/wine-matching'
import { processMatchQueue } from '@/lib/services/wine-matcher'
import type { POSCredentials, SyncResult } from '@/lib/integrations/pos/types'
import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// Zod validation schemas
// ---------------------------------------------------------------------------

const TriggerPOSSyncInputSchema = z.object({
  /** The retailer UUID to sync inventory for. */
  retailer_id: z.string().uuid('Invalid retailer ID'),

  /** Type of sync to perform. */
  sync_type: z.enum(['full', 'incremental'], {
    errorMap: () => ({ message: 'sync_type must be "full" or "incremental"' }),
  }),
})

export type TriggerPOSSyncInput = z.infer<typeof TriggerPOSSyncInputSchema>

const TestPOSConnectionInputSchema = z.object({
  /** The retailer UUID whose POS connection to test. */
  retailer_id: z.string().uuid('Invalid retailer ID'),
})

export type TestPOSConnectionInput = z.infer<typeof TestPOSConnectionInputSchema>

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** Successful sync result returned to the caller. */
interface POSSyncActionResult {
  sync_log_id: string
  status: SyncResult['status']
  records_processed: number
  records_created: number
  records_updated: number
  records_failed: number
  duration_ms: number
  match_queue_inserted: number
}

// ---------------------------------------------------------------------------
// triggerPOSSyncAction — main POS sync action
// ---------------------------------------------------------------------------

/**
 * Server Action: Trigger a full or incremental POS inventory sync for a retailer.
 *
 * Pipeline:
 * 1. Zod validate input
 * 2. Auth check (authenticated user)
 * 3. Fetch retailer (to get org_id, pos_type, pos_credentials)
 * 4. Permission check (must be org admin/owner)
 * 5. Validate POS adapter exists for this retailer's pos_type
 * 6. Create "started" sync log entry
 * 7. Run the adapter sync (full or incremental)
 * 8. Insert parsed items into wine_match_queue
 * 9. Trigger matching engine on new queue entries
 * 10. Update sync log with final results
 * 11. Revalidate relevant paths
 * 12. Return structured result
 *
 * @returns { data: POSSyncActionResult } on success, { error: string } on failure
 */
export async function triggerPOSSyncAction(
  input: TriggerPOSSyncInput
): Promise<{ data: POSSyncActionResult } | { error: string }> {
  // 1. Validate input
  const parsed = TriggerPOSSyncInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { retailer_id, sync_type } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch retailer — need org_id, pos_type, pos_credentials
  const { data: retailer, error: retailerError } = await supabase
    .from('retailers')
    .select('id, org_id, name, slug, pos_type, pos_credentials, is_active')
    .eq('id', retailer_id)
    .single()

  if (retailerError || !retailer) {
    return { error: 'Retailer not found' }
  }

  if (!retailer.is_active) {
    return { error: 'Retailer is not active' }
  }

  // 4. Permission check — must be platform org admin for this retailer's org
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, retailer.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Validate POS adapter
  if (!retailer.pos_type) {
    return { error: 'Retailer does not have a POS type configured' }
  }

  if (!isPOSAdapterAvailable(retailer.pos_type)) {
    return {
      error: `POS adapter not available for type "${retailer.pos_type}"`,
    }
  }

  const credentials = retailer.pos_credentials as POSCredentials | null
  if (!credentials) {
    return { error: 'Retailer does not have POS credentials configured' }
  }

  // 6. Create "started" sync log entry
  const syncLogResult = await createSyncLog(supabase, {
    org_id: retailer.org_id,
    retailer_id: retailer.id,
    sync_type: sync_type === 'full' ? 'pos_full' : 'pos_incremental',
    sync_source: retailer.pos_type,
    status: 'started',
  })

  if (!syncLogResult.data) {
    return { error: 'Failed to create sync log entry' }
  }

  const syncLogId = syncLogResult.data.id

  // 7. Run the adapter sync
  let syncResult: SyncResult
  try {
    const adapter = getPOSAdapter(retailer.pos_type)

    if (sync_type === 'full') {
      syncResult = await adapter.fullSync(retailer.id, credentials)
    } else {
      // For incremental sync, find the last successful sync timestamp
      const lastSyncTime = await getLastSuccessfulSyncTime(
        supabase,
        retailer.id
      )
      const since = lastSyncTime ?? new Date(Date.now() - 4 * 60 * 60 * 1000) // default: 4 hours ago
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
    })

    return { error: `POS sync failed: ${errorMessage}` }
  }

  // 8. Insert parsed items into wine_match_queue
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
      console.error('triggerPOSSyncAction: failed to insert match queue items:', queueError)
    } else {
      matchQueueInserted = count
    }
  }

  // 9. Trigger matching engine on new queue entries (best-effort)
  if (matchQueueInserted > 0) {
    try {
      await processMatchQueue(supabase, retailer.org_id, {
        batchSize: Math.min(matchQueueInserted, 500),
      })
    } catch (matchErr) {
      // Non-fatal — matching can be retried later
      console.error(
        'triggerPOSSyncAction: matching engine failed (non-fatal):',
        matchErr instanceof Error ? matchErr.message : matchErr
      )
    }
  }

  // 10. Update sync log with final results
  const completedAt = new Date().toISOString()
  const finalStatus = syncResult.status
  await updateSyncLog(supabase, syncLogId, {
    status: finalStatus,
    records_processed: syncResult.recordsProcessed,
    records_created: syncResult.recordsCreated,
    records_updated: syncResult.recordsUpdated,
    records_failed: syncResult.recordsFailed,
    error_details:
      syncResult.errors && syncResult.errors.length > 0
        ? { errors: syncResult.errors }
        : null,
    completed_at: completedAt,
    duration_ms: syncResult.durationMs,
  })

  // 11. Revalidate relevant paths
  revalidatePath('/(app)/[orgSlug]/retailers', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')

  // 12. Return structured result
  return {
    data: {
      sync_log_id: syncLogId,
      status: finalStatus,
      records_processed: syncResult.recordsProcessed,
      records_created: syncResult.recordsCreated,
      records_updated: syncResult.recordsUpdated,
      records_failed: syncResult.recordsFailed,
      duration_ms: syncResult.durationMs,
      match_queue_inserted: matchQueueInserted,
    },
  }
}

// ---------------------------------------------------------------------------
// testPOSConnectionAction — test POS credentials
// ---------------------------------------------------------------------------

/**
 * Server Action: Test the POS connection for a retailer.
 * Validates that the stored credentials are still valid by making a
 * lightweight API call to the POS system.
 *
 * Pipeline:
 * 1. Zod validate input
 * 2. Auth check
 * 3. Fetch retailer
 * 4. Permission check
 * 5. Run adapter testConnection()
 * 6. Return result
 *
 * @returns { data: { connected: boolean } } on success, { error: string } on failure
 */
export async function testPOSConnectionAction(
  input: TestPOSConnectionInput
): Promise<{ data: { connected: boolean } } | { error: string }> {
  // 1. Validate input
  const parsed = TestPOSConnectionInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const { retailer_id } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch retailer
  const { data: retailer, error: retailerError } = await supabase
    .from('retailers')
    .select('id, org_id, pos_type, pos_credentials')
    .eq('id', retailer_id)
    .single()

  if (retailerError || !retailer) {
    return { error: 'Retailer not found' }
  }

  // 4. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, retailer.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Validate POS configuration
  if (!retailer.pos_type) {
    return { error: 'Retailer does not have a POS type configured' }
  }

  if (!isPOSAdapterAvailable(retailer.pos_type)) {
    return {
      error: `POS adapter not available for type "${retailer.pos_type}"`,
    }
  }

  const credentials = retailer.pos_credentials as POSCredentials | null
  if (!credentials) {
    return { error: 'Retailer does not have POS credentials configured' }
  }

  // 6. Test the connection
  try {
    const adapter = getPOSAdapter(retailer.pos_type)
    const connected = await adapter.testConnection(credentials)
    return { data: { connected } }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Connection test failed'
    return { error: errorMessage }
  }
}

// ---------------------------------------------------------------------------
// Private helpers — sync log operations
// ---------------------------------------------------------------------------

/**
 * Create a new sync log entry with "started" status.
 */
async function createSyncLog(
  client: TypedClient,
  data: {
    org_id: string
    retailer_id: string
    sync_type: string
    sync_source: string
    status: string
  }
) {
  const { data: result, error } = await client
    .from('retailer_sync_logs')
    .insert({
      org_id: data.org_id,
      retailer_id: data.retailer_id,
      sync_type: data.sync_type,
      sync_source: data.sync_source,
      status: data.status,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('createSyncLog failed:', error)
    return { data: null, error }
  }

  return { data: result, error: null }
}

/**
 * Update an existing sync log entry with completion data.
 * Note: retailer_sync_logs is append-only (no updated_at trigger),
 * but we do update the status and completion fields on the same row.
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
) {
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
    console.error('updateSyncLog failed:', error)
  }
}

/**
 * Find the last successful sync completion time for a retailer.
 * Used to determine the `since` parameter for incremental syncs.
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
