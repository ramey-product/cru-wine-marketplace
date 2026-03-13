'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPlatformOrgAdmin } from '@/lib/auth/permissions'
import { CsvImportInputSchema, DetectColumnsInputSchema } from '@/lib/validations/csv-import'
import { parseCsv } from '@/lib/csv/parser'
import { applyColumnMapping, detectStandardColumns } from '@/lib/csv/column-mapper'
import { validateCsvRows } from '@/lib/csv/validator'
import { bulkCreateMatchQueueItems } from '@/lib/dal/wine-matching'
import { createSyncLog, updateSyncLog } from '@/lib/dal/retailers'
import type { CsvRowError } from '@/lib/csv/validator'

// ---------------------------------------------------------------------------
// importCsvAction — full CSV import pipeline
// ---------------------------------------------------------------------------

/**
 * Server Action: Import a CSV file into the wine match queue.
 *
 * Pipeline:
 * 1. Zod validate input
 * 2. Auth check (authenticated + org admin)
 * 3. Parse CSV content
 * 4. Auto-detect or apply column mapping
 * 5. Validate and normalize rows
 * 6. Bulk insert valid rows into wine_match_queue
 * 7. Create a sync log entry
 * 8. Revalidate relevant paths
 * 9. Return structured result
 */
export async function importCsvAction(input: {
  org_id: string
  retailer_id: string
  csv_content: string
  column_mapping?: Record<string, string>
}) {
  // 1. Validate input
  const parsed = CsvImportInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { org_id, retailer_id, csv_content, column_mapping } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // TODO: M1 — migrate to hasPermission(role, 'inventory:import') when RBAC system is built
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const startedAt = new Date()

  // 3. Parse CSV
  const { headers, rows: rawRows } = parseCsv(csv_content)

  if (headers.length === 0 || rawRows.length === 0) {
    return { error: 'CSV file is empty or contains no data rows' }
  }

  // 4. Determine column mapping
  const effectiveMapping = column_mapping ?? detectStandardColumns(headers)

  // 5. Apply column mapping and validate rows
  const mappedRows = applyColumnMapping(rawRows, effectiveMapping)
  const { validRows, errors } = validateCsvRows(mappedRows)

  const completedAt = new Date()
  const durationMs = completedAt.getTime() - startedAt.getTime()
  const totalRows = rawRows.length

  // 6. Bulk insert valid rows into wine_match_queue
  let syncLogId: string | null = null

  // Create the sync log entry first so we can reference it in queue items
  const syncLogStatus: string =
    validRows.length === 0
      ? 'failed'
      : errors.length > 0
        ? 'partial'
        : 'completed'

  // 7. Create sync log entry via DAL
  const { data: syncLog, error: syncLogError } = await createSyncLog(
    supabase,
    org_id,
    {
      retailer_id,
      sync_type: 'csv_import',
      sync_source: 'csv',
      status: syncLogStatus,
      records_processed: totalRows,
      records_created: validRows.length,
      records_updated: 0,
      records_failed: errors.length,
      error_details: errors.length > 0 ? (errors as unknown as Record<string, unknown>[]) : null,
      started_at: startedAt.toISOString(),
      completed_at: completedAt.toISOString(),
      duration_ms: durationMs,
    }
  )

  if (syncLogError) {
    console.error('importCsvAction: failed to create sync log:', syncLogError)
    return { error: 'Failed to create sync log entry' }
  }

  syncLogId = syncLog!.id

  // 8. Insert valid rows into match queue (with sync_log_id reference)
  if (validRows.length > 0) {
    const queueItems = validRows.map((row) => ({
      retailer_id,
      raw_wine_name: row.wine_name,
      raw_producer: row.producer,
      raw_vintage: row.vintage,
      raw_varietal: row.varietal,
      raw_sku: row.sku,
      raw_price: row.price,
      raw_quantity: row.quantity,
      match_status: 'pending' as const,
      sync_log_id: syncLogId!,
    }))

    const { error: insertError } = await bulkCreateMatchQueueItems(
      supabase,
      org_id,
      queueItems
    )

    if (insertError) {
      console.error('importCsvAction: bulk insert failed:', insertError)

      // Update sync log to reflect the failure via DAL
      await updateSyncLog(supabase, org_id, syncLogId!, {
        status: 'failed',
        records_created: 0,
        error_details: [
          ...(errors as unknown as Record<string, unknown>[]),
          { row: 0, field: 'system', message: 'Failed to insert rows into match queue' },
        ],
      })

      return { error: 'Failed to insert rows into wine match queue' }
    }
  }

  // 9. Revalidate relevant paths
  revalidatePath('/(app)/[orgSlug]/retailers', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')

  // 10. Return result
  return {
    data: {
      sync_log_id: syncLogId,
      records_processed: totalRows,
      records_created: validRows.length,
      records_failed: errors.length,
      errors: errors as CsvRowError[],
    },
  }
}

// ---------------------------------------------------------------------------
// detectColumnsAction — column detection for UI preview
// ---------------------------------------------------------------------------

/**
 * Server Action: Parse CSV headers and auto-detect standard column mappings.
 *
 * Called by the UI before the full import to show users the detected column
 * mapping and allow them to adjust it. Requires authentication but does not
 * require org admin privileges.
 */
export async function detectColumnsAction(input: { csv_content: string }) {
  // 1. Validate input
  const parsed = DetectColumnsInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  // 2. Auth check (authenticated only, no org admin required)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Parse CSV to extract headers
  const { headers, rows } = parseCsv(parsed.data.csv_content)

  if (headers.length === 0) {
    return { error: 'CSV file is empty or has no headers' }
  }

  // 4. Auto-detect standard columns
  const detected_mapping = detectStandardColumns(headers)

  return {
    data: {
      headers,
      detected_mapping,
      row_count: rows.length,
    },
  }
}
