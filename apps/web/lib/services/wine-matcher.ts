/**
 * Wine Matching Service
 *
 * Core matching engine that processes wine_match_queue entries against the
 * canonical wines table using PostgreSQL trigram similarity (pg_trgm).
 *
 * Algorithm:
 * 1. Normalize raw wine data (expand abbreviations, fold accents, extract vintage)
 * 2. Call match_wine_candidates() RPC for trigram-based fuzzy search
 * 3. Apply confidence thresholds to classify matches
 * 4. Auto-matched entries get an inventory record created immediately
 * 5. Pending entries stay in queue for manual review
 */

import type { TypedClient } from '@/lib/dal/types'
import { normalizeWineName, normalizeForComparison } from '@/lib/utils/wine-name-normalizer'
import { classifyMatchScore } from '@/lib/utils/string-similarity'
import { upsertInventoryItem } from '@/lib/dal/inventory'
import { resolveMatch, matchWineCandidates, getPendingMatchQueueEntries } from '@/lib/dal/wine-matching'
import type {
  MatchProcessingResult,
  SingleMatchResult,
} from '@/lib/validations/wine-matching'

// ---------------------------------------------------------------------------
// Types for RPC response
// ---------------------------------------------------------------------------

/** Shape returned by the match_wine_candidates() RPC function. */
interface WineCandidate {
  wine_id: string
  wine_name: string
  wine_slug: string
  wine_vintage: number | null
  wine_varietal: string | null
  wine_region: string | null
  wine_country: string | null
  producer_id: string
  producer_name: string
  producer_slug: string
  name_score: number
  producer_score: number
  vintage_score: number
  varietal_score: number
  composite_score: number
}

/** Minimal shape of a wine_match_queue row for processing. */
interface QueueEntry {
  id: string
  org_id: string
  retailer_id: string
  raw_wine_name: string
  raw_producer: string | null
  raw_vintage: string | null
  raw_varietal: string | null
  raw_sku: string | null
  raw_price: number | null
  raw_quantity: number | null
}

// ---------------------------------------------------------------------------
// matchWineEntry — match a single queue entry
// ---------------------------------------------------------------------------

/**
 * Match a single wine_match_queue entry against the canonical wines table.
 *
 * Steps:
 * 1. Normalize the raw wine name, producer, vintage, and varietal
 * 2. Call the match_wine_candidates() RPC for trigram similarity search
 * 3. Take the best candidate and classify by score threshold
 * 4. If auto-matched, create/upsert the inventory record
 * 5. Update the queue entry with match results
 *
 * @param client - Supabase client (with user's auth context for RLS)
 * @param entry  - The queue entry to match
 * @param orgId  - Organization ID (for scoping the search)
 * @returns SingleMatchResult with the outcome
 */
export async function matchWineEntry(
  client: TypedClient,
  entry: QueueEntry,
  orgId: string
): Promise<SingleMatchResult> {
  // 1. Normalize the raw wine data
  const normalized = normalizeWineName(entry.raw_wine_name)

  // Determine the search components
  // Use raw_producer if provided; otherwise use whatever the normalizer extracted
  const searchName = normalized.normalizedName
  const searchProducer = entry.raw_producer
    ? normalizeForComparison(entry.raw_producer)
    : normalized.producer ?? null
  const searchVintage = entry.raw_vintage
    ? parseVintageString(entry.raw_vintage)
    : normalized.vintage ?? null
  const searchVarietal = entry.raw_varietal
    ? normalizeForComparison(entry.raw_varietal)
    : normalized.varietal ?? null

  // 2. Call trigram-based fuzzy search via DAL
  const { data: candidates, error: rpcError } = await matchWineCandidates(
    client,
    {
      searchName,
      searchProducer,
      searchVintage,
      searchVarietal,
      orgId,
      limit: 5,
    }
  )

  if (rpcError) {
    console.error(
      `matchWineEntry: RPC failed for queue entry ${entry.id}:`,
      rpcError
    )
    return {
      entry_id: entry.id,
      status: 'unmatched',
    }
  }

  const typedCandidates = (candidates ?? []) as WineCandidate[]

  // 3. No candidates found — mark as unmatched
  if (typedCandidates.length === 0) {
    return {
      entry_id: entry.id,
      status: 'unmatched',
    }
  }

  // 4. Take the best candidate (already sorted by composite_score DESC from RPC)
  const best = typedCandidates[0]!
  const score = best.composite_score
  const matchStatus = classifyMatchScore(score)

  // 5. Update the queue entry based on match classification
  if (matchStatus === 'auto_matched') {
    // Auto-match: update queue entry AND create inventory record
    // Uses DAL resolveMatch which includes org_id scoping and handles
    // reviewed_by conditionally (omitted here for system-generated matches).
    const { error: resolveError } = await resolveMatch(client, orgId, entry.id, {
      match_status: 'auto_matched',
      matched_wine_id: best.wine_id,
      match_confidence: score,
    })

    if (resolveError) {
      console.error(
        `matchWineEntry: failed to resolve auto-match for ${entry.id}:`,
        resolveError
      )
      return {
        entry_id: entry.id,
        status: 'unmatched',
      }
    }

    // Create/upsert inventory record
    let inventoryCreated = false
    if (entry.raw_price != null || entry.raw_quantity != null) {
      const { error: inventoryError } = await upsertInventoryItem(client, orgId, {
        org_id: orgId,
        retailer_id: entry.retailer_id,
        wine_id: best.wine_id,
        sku: entry.raw_sku ?? undefined,
        price: entry.raw_price ?? 0,
        quantity: entry.raw_quantity ?? 0,
        stock_status: (entry.raw_quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
        sync_source: 'csv',
      })

      if (inventoryError) {
        console.error(
          `matchWineEntry: inventory upsert failed for ${entry.id}:`,
          inventoryError
        )
        // Don't fail the match just because inventory upsert failed
      } else {
        inventoryCreated = true
      }
    }

    return {
      entry_id: entry.id,
      status: 'auto_matched',
      matched_wine_id: best.wine_id,
      confidence: score,
      inventory_created: inventoryCreated,
    }
  }

  if (matchStatus === 'pending') {
    // Pending review: update queue entry with suggested match but keep as pending.
    // Uses DAL resolveMatch which includes org_id scoping. reviewed_by omitted
    // since this is a system-suggested match awaiting human review.
    const { error: resolveError } = await resolveMatch(client, orgId, entry.id, {
      match_status: 'pending',
      matched_wine_id: best.wine_id,
      match_confidence: score,
    })

    if (resolveError) {
      console.error(
        `matchWineEntry: failed to update pending match for ${entry.id}:`,
        resolveError
      )
    }

    return {
      entry_id: entry.id,
      status: 'pending',
      matched_wine_id: best.wine_id,
      confidence: score,
    }
  }

  // Unmatched: score is below the review threshold
  // We still set the best candidate as a suggestion, but status is unmatched
  // (the UI can show "no good match found" with the best candidate as a reference)
  return {
    entry_id: entry.id,
    status: 'unmatched',
    matched_wine_id: best.wine_id,
    confidence: score,
  }
}

// ---------------------------------------------------------------------------
// processMatchQueue — batch process pending entries
// ---------------------------------------------------------------------------

/**
 * Process a batch of pending wine_match_queue entries for an organization.
 *
 * Fetches pending entries, runs each through matchWineEntry(), and returns
 * aggregate statistics. Processes entries sequentially to avoid overwhelming
 * the database with concurrent RPC calls.
 *
 * @param client    - Supabase client (with user's auth context for RLS)
 * @param orgId     - Organization ID to process entries for
 * @param options   - Processing options
 * @returns MatchProcessingResult with aggregate stats
 */
export async function processMatchQueue(
  client: TypedClient,
  orgId: string,
  options: { batchSize?: number } = {}
): Promise<MatchProcessingResult> {
  const batchSize = options.batchSize ?? 100

  // Fetch pending entries for this org via DAL
  const { data: entries, error: fetchError } = await getPendingMatchQueueEntries(
    client,
    orgId,
    batchSize
  )

  if (fetchError) {
    console.error('processMatchQueue: failed to fetch pending entries:', fetchError)
    return {
      processed: 0,
      auto_matched: 0,
      pending: 0,
      unmatched: 0,
      errors: [{ entry_id: 'batch', error: fetchError.message }],
    }
  }

  const typedEntries = (entries ?? []) as QueueEntry[]

  if (typedEntries.length === 0) {
    return {
      processed: 0,
      auto_matched: 0,
      pending: 0,
      unmatched: 0,
      errors: [],
    }
  }

  // Process each entry sequentially
  const result: MatchProcessingResult = {
    processed: 0,
    auto_matched: 0,
    pending: 0,
    unmatched: 0,
    errors: [],
  }

  for (const entry of typedEntries) {
    try {
      const matchResult = await matchWineEntry(client, entry, orgId)
      result.processed++

      switch (matchResult.status) {
        case 'auto_matched':
          result.auto_matched++
          break
        case 'pending':
          result.pending++
          break
        case 'unmatched':
          result.unmatched++
          break
      }
    } catch (err) {
      result.processed++
      result.errors.push({
        entry_id: entry.id,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
      result.unmatched++
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Helper: parse vintage string to number
// ---------------------------------------------------------------------------

/**
 * Parse a vintage string (e.g., "2023", "NV", "'19") to a number.
 * Returns null if the string is not a valid vintage.
 */
function parseVintageString(raw: string): number | null {
  if (!raw) return null

  const trimmed = raw.trim()

  // Non-vintage markers
  if (/^(nv|n\/v|non-vintage|non vintage)$/i.test(trimmed)) {
    return null
  }

  // Full 4-digit year
  const fullYear = trimmed.match(/\b((?:19|20)\d{2})\b/)
  if (fullYear?.[1]) {
    return parseInt(fullYear[1]!, 10)
  }

  // 2-digit year with apostrophe (e.g., "'19", "'23")
  const shortYear = trimmed.match(/^'?(\d{2})$/)
  if (shortYear?.[1]) {
    const twoDigit = parseInt(shortYear[1]!, 10)
    // Assume 2000s for 00-30, 1900s for 31-99
    return twoDigit <= 30 ? 2000 + twoDigit : 1900 + twoDigit
  }

  return null
}
