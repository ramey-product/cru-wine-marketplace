'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isPlatformOrgAdmin } from '@/lib/auth/permissions'
import {
  ProcessMatchQueueInputSchema,
  RetryMatchInputSchema,
} from '@/lib/validations/wine-matching'
import { processMatchQueue, matchWineEntry } from '@/lib/services/wine-matcher'

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
    return { error: parsed.error.errors[0].message }
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
    return { error: parsed.error.errors[0].message }
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
