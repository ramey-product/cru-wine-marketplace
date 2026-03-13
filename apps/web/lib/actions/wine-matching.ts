'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPlatformOrgAdmin } from '@/lib/auth/permissions'
import {
  ProcessMatchQueueInputSchema,
  RetryMatchInputSchema,
  ApproveMatchInputSchema,
  RejectMatchInputSchema,
  ManualMatchInputSchema,
  CreateWineFromQueueInputSchema,
  BatchApproveMatchesInputSchema,
  SearchWinesInputSchema,
} from '@/lib/validations/wine-matching'
import { processMatchQueue, matchWineEntry } from '@/lib/services/wine-matcher'
import { resolveMatch } from '@/lib/dal/wine-matching'
import { upsertInventoryItem } from '@/lib/dal/inventory'
import { createWine, searchWinesForMatch } from '@/lib/dal/wines'
import { slugify } from '@/lib/utils/slugify'

// ---------------------------------------------------------------------------
// processMatchQueueAction — batch match pending queue entries
// ---------------------------------------------------------------------------

/**
 * Server Action: Trigger batch fuzzy matching for all pending wine_match_queue
 * entries in an organization.
 *
 * Pipeline:
 * 1. Zod validate input
 * 2. Auth check (authenticated user)
 * 3. Permission check (must be org admin/owner)
 * 4. Run the matching engine on pending entries
 * 5. Revalidate relevant paths
 * 6. Return structured result
 *
 * @returns { data: MatchProcessingResult } on success, { error: string } on failure
 */
export async function processMatchQueueAction(input: {
  org_id: string
  batch_size?: number
}) {
  // 1. Validate input
  const parsed = ProcessMatchQueueInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { org_id, batch_size } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Permission check — must be platform org admin
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 4. Run the matching engine
  const result = await processMatchQueue(supabase, org_id, {
    batchSize: batch_size,
  })

  // 5. Revalidate relevant paths
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')

  // 6. Return structured result
  return { data: result }
}

// ---------------------------------------------------------------------------
// retryMatchAction — retry matching for a single queue entry
// ---------------------------------------------------------------------------

/**
 * Server Action: Retry fuzzy matching for a single wine_match_queue entry.
 *
 * Useful when:
 * - New wines have been added to the catalog since the last match attempt
 * - A user wants to re-evaluate a previously unmatched or pending entry
 *
 * Pipeline:
 * 1. Zod validate input
 * 2. Auth check (authenticated user)
 * 3. Fetch the queue entry to get org_id
 * 4. Permission check (must be org admin/owner)
 * 5. Run matching on the single entry
 * 6. Revalidate relevant paths
 * 7. Return the match result
 *
 * @returns { data: SingleMatchResult } on success, { error: string } on failure
 */
export async function retryMatchAction(input: { queue_entry_id: string }) {
  // 1. Validate input
  const parsed = RetryMatchInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { queue_entry_id } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch the queue entry
  const { data: entry, error: fetchError } = await supabase
    .from('wine_match_queue')
    .select(
      'id, org_id, retailer_id, raw_wine_name, raw_producer, raw_vintage, raw_varietal, raw_sku, raw_price, raw_quantity, match_status'
    )
    .eq('id', queue_entry_id)
    .single()

  if (fetchError || !entry) {
    return { error: 'Queue entry not found' }
  }

  // 4. Permission check — must be platform org admin for this entry's org
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, entry.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Reset the entry status to pending before re-matching
  // (only if it's not already in a terminal state like manual_matched or new_wine_created)
  if (
    entry.match_status === 'manual_matched' ||
    entry.match_status === 'new_wine_created'
  ) {
    return {
      error: `Cannot retry matching for an entry with status "${entry.match_status}"`,
    }
  }

  // 6. Run matching on the single entry
  const matchResult = await matchWineEntry(
    supabase,
    {
      id: entry.id,
      org_id: entry.org_id,
      retailer_id: entry.retailer_id,
      raw_wine_name: entry.raw_wine_name,
      raw_producer: entry.raw_producer,
      raw_vintage: entry.raw_vintage,
      raw_varietal: entry.raw_varietal,
      raw_sku: entry.raw_sku,
      raw_price: entry.raw_price,
      raw_quantity: entry.raw_quantity,
    },
    entry.org_id
  )

  // 7. Revalidate relevant paths
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')

  // 8. Return the match result
  return { data: matchResult }
}

// ---------------------------------------------------------------------------
// approveMatchAction — approve an auto_matched queue entry
// ---------------------------------------------------------------------------

export async function approveMatchAction(input: { queue_entry_id: string }) {
  // 1. Validate input
  const parsed = ApproveMatchInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { queue_entry_id } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch the queue entry
  const { data: entry, error: fetchError } = await supabase
    .from('wine_match_queue')
    .select(
      'id, org_id, retailer_id, matched_wine_id, match_confidence, match_status, raw_price, raw_quantity, raw_sku'
    )
    .eq('id', queue_entry_id)
    .single()

  if (fetchError || !entry) {
    return { error: 'Queue entry not found' }
  }

  // 4. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, entry.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Validate entry is in an approvable state
  if (entry.match_status !== 'auto_matched' && entry.match_status !== 'pending') {
    return { error: `Cannot approve entry with status "${entry.match_status}"` }
  }

  if (!entry.matched_wine_id) {
    return { error: 'No matched wine to approve' }
  }

  // 6. Resolve the match
  const { error: resolveError } = await resolveMatch(supabase, entry.org_id, queue_entry_id, {
    match_status: 'manual_matched',
    matched_wine_id: entry.matched_wine_id,
    match_confidence: entry.match_confidence,
    reviewed_by: user.id,
  })

  if (resolveError) {
    return { error: 'Failed to approve match' }
  }

  // 7. Create inventory record
  const { error: inventoryError } = await upsertInventoryItem(supabase, entry.org_id, {
    org_id: entry.org_id,
    retailer_id: entry.retailer_id,
    wine_id: entry.matched_wine_id,
    price: entry.raw_price ?? 0,
    quantity: entry.raw_quantity ?? 0,
    sku: entry.raw_sku ?? undefined,
    stock_status: (entry.raw_quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
    sync_source: 'csv',
  })

  if (inventoryError) {
    return { error: 'Match approved but inventory creation failed' }
  }

  // 8. Revalidate
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')

  return { data: { approved: true, queue_entry_id } }
}

// ---------------------------------------------------------------------------
// rejectMatchAction — reject a queue entry (no inventory created)
// ---------------------------------------------------------------------------

export async function rejectMatchAction(input: { queue_entry_id: string }) {
  // 1. Validate input
  const parsed = RejectMatchInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { queue_entry_id } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch the queue entry
  const { data: entry, error: fetchError } = await supabase
    .from('wine_match_queue')
    .select('id, org_id, match_status')
    .eq('id', queue_entry_id)
    .single()

  if (fetchError || !entry) {
    return { error: 'Queue entry not found' }
  }

  // 4. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, entry.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Only reject pending or auto_matched entries
  if (entry.match_status === 'manual_matched' || entry.match_status === 'new_wine_created') {
    return { error: `Cannot reject entry with status "${entry.match_status}"` }
  }

  // 6. Resolve as rejected
  const { error: resolveError } = await resolveMatch(supabase, entry.org_id, queue_entry_id, {
    match_status: 'rejected',
    matched_wine_id: null,
    match_confidence: null,
    reviewed_by: user.id,
  })

  if (resolveError) {
    return { error: 'Failed to reject match' }
  }

  // 7. Revalidate
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')

  return { data: { rejected: true, queue_entry_id } }
}

// ---------------------------------------------------------------------------
// manualMatchAction — admin manually assigns a wine to a queue entry
// ---------------------------------------------------------------------------

export async function manualMatchAction(input: {
  queue_entry_id: string
  wine_id: string
}) {
  // 1. Validate input
  const parsed = ManualMatchInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { queue_entry_id, wine_id } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch the queue entry
  const { data: entry, error: fetchError } = await supabase
    .from('wine_match_queue')
    .select('id, org_id, retailer_id, match_status, raw_price, raw_quantity, raw_sku')
    .eq('id', queue_entry_id)
    .single()

  if (fetchError || !entry) {
    return { error: 'Queue entry not found' }
  }

  // 4. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, entry.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Check entry is in an assignable state
  if (entry.match_status === 'manual_matched' || entry.match_status === 'new_wine_created') {
    return { error: `Cannot reassign entry with status "${entry.match_status}"` }
  }

  // 6. Verify the wine exists
  const { data: wine, error: wineError } = await supabase
    .from('wines')
    .select('id')
    .eq('id', wine_id)
    .eq('is_active', true)
    .single()

  if (wineError || !wine) {
    return { error: 'Selected wine not found or inactive' }
  }

  // 7. Resolve the match
  const { error: resolveError } = await resolveMatch(supabase, entry.org_id, queue_entry_id, {
    match_status: 'manual_matched',
    matched_wine_id: wine_id,
    match_confidence: 1.0,
    reviewed_by: user.id,
  })

  if (resolveError) {
    return { error: 'Failed to assign match' }
  }

  // 8. Create inventory record
  const { error: inventoryError } = await upsertInventoryItem(supabase, entry.org_id, {
    org_id: entry.org_id,
    retailer_id: entry.retailer_id,
    wine_id,
    price: entry.raw_price ?? 0,
    quantity: entry.raw_quantity ?? 0,
    sku: entry.raw_sku ?? undefined,
    stock_status: (entry.raw_quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
    sync_source: 'csv',
  })

  if (inventoryError) {
    return { error: 'Match assigned but inventory creation failed' }
  }

  // 9. Revalidate
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')

  return { data: { matched: true, queue_entry_id, wine_id } }
}

// ---------------------------------------------------------------------------
// createWineFromQueueAction — create a new wine from queue entry data
// ---------------------------------------------------------------------------

export async function createWineFromQueueAction(input: {
  queue_entry_id: string
  producer_id: string
  name?: string
  varietal?: string
  vintage?: number
  region?: string
  country?: string
}) {
  // 1. Validate input
  const parsed = CreateWineFromQueueInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { queue_entry_id, producer_id, ...overrides } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Fetch the queue entry
  const { data: entry, error: fetchError } = await supabase
    .from('wine_match_queue')
    .select(
      'id, org_id, retailer_id, raw_wine_name, raw_producer, raw_vintage, raw_varietal, raw_price, raw_quantity, raw_sku, match_status'
    )
    .eq('id', queue_entry_id)
    .single()

  if (fetchError || !entry) {
    return { error: 'Queue entry not found' }
  }

  // 4. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, entry.org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 5. Check entry is in a state that allows wine creation
  if (entry.match_status === 'manual_matched' || entry.match_status === 'new_wine_created') {
    return { error: `Cannot create wine for entry with status "${entry.match_status}"` }
  }

  // 6. Build wine data from queue entry + overrides
  const wineName = overrides.name || entry.raw_wine_name
  const vintage = overrides.vintage ?? (entry.raw_vintage ? parseInt(entry.raw_vintage, 10) : undefined)

  const { data: newWine, error: createError } = await createWine(supabase, {
    org_id: entry.org_id,
    producer_id,
    name: wineName,
    slug: slugify(wineName + (vintage ? `-${vintage}` : '')),
    varietal: overrides.varietal || entry.raw_varietal || undefined,
    vintage: vintage && !isNaN(vintage) ? vintage : undefined,
    region: overrides.region || undefined,
    country: overrides.country || undefined,
  })

  if (createError || !newWine) {
    return { error: 'Failed to create wine' }
  }

  // 7. Resolve the queue entry
  const { error: resolveError } = await resolveMatch(supabase, entry.org_id, queue_entry_id, {
    match_status: 'new_wine_created',
    matched_wine_id: newWine.id,
    match_confidence: 1.0,
    reviewed_by: user.id,
  })

  if (resolveError) {
    return { error: 'Wine created but failed to update queue entry' }
  }

  // 8. Create inventory record
  const { error: inventoryError } = await upsertInventoryItem(supabase, entry.org_id, {
    org_id: entry.org_id,
    retailer_id: entry.retailer_id,
    wine_id: newWine.id,
    price: entry.raw_price ?? 0,
    quantity: entry.raw_quantity ?? 0,
    sku: entry.raw_sku ?? undefined,
    stock_status: (entry.raw_quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
    sync_source: 'csv',
  })

  if (inventoryError) {
    return { error: 'Wine created but inventory creation failed' }
  }

  // 9. Revalidate
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers/[retailerSlug]/inventory', 'page')
  revalidatePath('/(app)/[orgSlug]/wines', 'page')

  return { data: { wine_id: newWine.id, queue_entry_id } }
}

// ---------------------------------------------------------------------------
// batchApproveMatchesAction — auto-approve all high-confidence matches
// ---------------------------------------------------------------------------

export async function batchApproveMatchesAction(input: {
  org_id: string
  min_confidence?: number
}) {
  // 1. Validate input
  const parsed = BatchApproveMatchesInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { org_id, min_confidence } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 4. Fetch all auto_matched entries above confidence threshold
  const { data: entries, error: fetchError } = await supabase
    .from('wine_match_queue')
    .select('id, org_id, retailer_id, matched_wine_id, match_confidence, raw_price, raw_quantity, raw_sku')
    .eq('org_id', org_id)
    .eq('match_status', 'auto_matched')
    .gte('match_confidence', min_confidence)
    .not('matched_wine_id', 'is', null)

  if (fetchError) {
    return { error: 'Failed to fetch auto-matched entries' }
  }

  if (!entries || entries.length === 0) {
    return { data: { approved: 0, failed: 0, errors: [] } }
  }

  // 5. Approve each entry and create inventory
  let approved = 0
  const errors: Array<{ entry_id: string; error: string }> = []

  for (const entry of entries) {
    // Resolve match
    const { error: resolveError } = await resolveMatch(supabase, entry.org_id, entry.id, {
      match_status: 'manual_matched',
      matched_wine_id: entry.matched_wine_id,
      match_confidence: entry.match_confidence,
      reviewed_by: user.id,
    })

    if (resolveError) {
      errors.push({ entry_id: entry.id, error: 'Failed to resolve match' })
      continue
    }

    // Create inventory
    const { error: inventoryError } = await upsertInventoryItem(supabase, entry.org_id, {
      org_id: entry.org_id,
      retailer_id: entry.retailer_id,
      wine_id: entry.matched_wine_id!,
      price: entry.raw_price ?? 0,
      quantity: entry.raw_quantity ?? 0,
      sku: entry.raw_sku ?? undefined,
      stock_status: (entry.raw_quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
      sync_source: 'csv',
    })

    if (inventoryError) {
      errors.push({ entry_id: entry.id, error: 'Inventory creation failed' })
      continue
    }

    approved++
  }

  // 6. Revalidate
  revalidatePath('/(app)/[orgSlug]/match-queue', 'page')
  revalidatePath('/(app)/[orgSlug]/retailers', 'page')

  return {
    data: {
      approved,
      failed: errors.length,
      errors,
    },
  }
}

// ---------------------------------------------------------------------------
// searchWinesAction — search wines for manual match assignment
// ---------------------------------------------------------------------------

export async function searchWinesAction(input: {
  org_id: string
  query: string
  limit?: number
}) {
  // 1. Validate input
  const parsed = SearchWinesInputSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }
  }

  const { org_id, query, limit } = parsed.data

  // 2. Auth check
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // 3. Permission check
  const isAdmin = await isPlatformOrgAdmin(supabase, user.id, org_id)
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  // 4. Search wines using fuzzy match RPC
  const { data, error } = await searchWinesForMatch(supabase, query, org_id, limit)

  if (error) {
    return { error: 'Wine search failed' }
  }

  return { data }
}
