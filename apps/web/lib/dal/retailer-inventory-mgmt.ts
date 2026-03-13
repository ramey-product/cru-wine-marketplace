import type { TypedClient } from '@/lib/dal/types'

// ---------------------------------------------------------------------------
// getInventoryHealth — join retailer_sync_logs for latest sync info
// ---------------------------------------------------------------------------

export async function getInventoryHealth(
  client: TypedClient,
  retailerId: string
) {
  // Get the latest sync log for this retailer
  const { data: syncLog, error: syncError } = await client
    .from('retailer_sync_logs')
    .select('*')
    .eq('retailer_id', retailerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (syncError) {
    return { data: null, error: syncError }
  }

  // Get inventory counts by stock_status
  const { data: inventory, error: invError } = await client
    .from('retailer_inventory')
    .select('stock_status')
    .eq('retailer_id', retailerId)

  if (invError) {
    return { data: null, error: invError }
  }

  const statusCounts: Record<string, number> = {}
  for (const row of inventory ?? []) {
    statusCounts[row.stock_status] = (statusCounts[row.stock_status] ?? 0) + 1
  }

  return {
    data: {
      total_items: (inventory ?? []).length,
      status_counts: statusCounts,
      last_sync: syncLog
        ? {
            id: syncLog.id,
            sync_type: syncLog.sync_type,
            sync_source: syncLog.sync_source,
            status: syncLog.status,
            records_processed: syncLog.records_processed,
            records_created: syncLog.records_created,
            records_updated: syncLog.records_updated,
            records_failed: syncLog.records_failed,
            started_at: syncLog.started_at,
            completed_at: syncLog.completed_at,
            duration_ms: syncLog.duration_ms,
          }
        : null,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// getInventorySummary — counts of in_stock/low_stock/out_of_stock
// Considers active overrides (cleared_at IS NULL) which take precedence.
// ---------------------------------------------------------------------------

export async function getInventorySummary(
  client: TypedClient,
  retailerId: string
) {
  // Get base inventory
  const { data: inventory, error: invError } = await client
    .from('retailer_inventory')
    .select('id, wine_id, stock_status')
    .eq('retailer_id', retailerId)

  if (invError) {
    return { data: null, error: invError }
  }

  // Get active overrides
  const { data: overrides, error: overrideError } = await client
    .from('retailer_stock_overrides')
    .select('wine_id, override_status')
    .eq('retailer_id', retailerId)
    .is('cleared_at', null)

  if (overrideError) {
    return { data: null, error: overrideError }
  }

  // Build override lookup
  const overrideMap = new Map<string, string>()
  for (const o of overrides ?? []) {
    overrideMap.set(o.wine_id, o.override_status)
  }

  // Count effective statuses (override takes precedence)
  const counts = { in_stock: 0, low_stock: 0, out_of_stock: 0 }
  for (const item of inventory ?? []) {
    const effectiveStatus = overrideMap.get(item.wine_id) ?? item.stock_status
    if (effectiveStatus in counts) {
      counts[effectiveStatus as keyof typeof counts]++
    }
  }

  return {
    data: {
      total: (inventory ?? []).length,
      ...counts,
    },
    error: null,
  }
}

// ---------------------------------------------------------------------------
// getActiveOverrides — list active overrides (cleared_at IS NULL) with wine names
// ---------------------------------------------------------------------------

export async function getActiveOverrides(
  client: TypedClient,
  retailerId: string
) {
  const { data, error } = await client
    .from('retailer_stock_overrides')
    .select('*, wines(name)')
    .eq('retailer_id', retailerId)
    .is('cleared_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error }
  }

  return { data: data ?? [], error: null }
}

// ---------------------------------------------------------------------------
// upsertStockOverride — insert/update override using the partial unique index
// ---------------------------------------------------------------------------

export async function upsertStockOverride(
  client: TypedClient,
  data: {
    retailerId: string
    wineId: string
    overrideStatus: string
    overriddenBy: string
    orgId: string
  }
) {
  // First try to find an existing active override
  const { data: existing } = await client
    .from('retailer_stock_overrides')
    .select('id')
    .eq('retailer_id', data.retailerId)
    .eq('wine_id', data.wineId)
    .is('cleared_at', null)
    .maybeSingle()

  if (existing) {
    // Update the existing override
    const { data: updated, error } = await client
      .from('retailer_stock_overrides')
      .update({
        override_status: data.overrideStatus,
        overridden_by: data.overriddenBy,
      })
      .eq('id', existing.id)
      .select()
      .single()

    return { data: updated, error }
  }

  // Insert a new override
  const { data: inserted, error } = await client
    .from('retailer_stock_overrides')
    .insert({
      org_id: data.orgId,
      retailer_id: data.retailerId,
      wine_id: data.wineId,
      override_status: data.overrideStatus,
      overridden_by: data.overriddenBy,
    })
    .select()
    .single()

  return { data: inserted, error }
}

// ---------------------------------------------------------------------------
// clearStockOverride — set cleared_at = now()
// ---------------------------------------------------------------------------

export async function clearStockOverride(
  client: TypedClient,
  retailerId: string,
  wineId: string
) {
  const { data, error } = await client
    .from('retailer_stock_overrides')
    .update({ cleared_at: new Date().toISOString() })
    .eq('retailer_id', retailerId)
    .eq('wine_id', wineId)
    .is('cleared_at', null)
    .select()

  return { data, error }
}
