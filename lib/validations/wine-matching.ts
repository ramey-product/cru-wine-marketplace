import { z } from 'zod'

// ---------------------------------------------------------------------------
// Process match queue action input
// ---------------------------------------------------------------------------

/**
 * Input schema for the processMatchQueueAction server action.
 * Triggers batch fuzzy matching for all pending queue entries in an org.
 */
export const ProcessMatchQueueInputSchema = z.object({
  /** Organization ID to process pending matches for */
  org_id: z.string().uuid('Invalid organization ID'),

  /** Maximum number of entries to process in this batch (default 100) */
  batch_size: z
    .number()
    .int()
    .min(1, 'Batch size must be at least 1')
    .max(500, 'Batch size cannot exceed 500')
    .default(100),
})

export type ProcessMatchQueueInput = z.infer<typeof ProcessMatchQueueInputSchema>

// ---------------------------------------------------------------------------
// Retry match action input
// ---------------------------------------------------------------------------

/**
 * Input schema for the retryMatchAction server action.
 * Retries fuzzy matching for a single queue entry.
 */
export const RetryMatchInputSchema = z.object({
  /** The wine_match_queue entry ID to retry matching for */
  queue_entry_id: z.string().uuid('Invalid queue entry ID'),
})

export type RetryMatchInput = z.infer<typeof RetryMatchInputSchema>

// ---------------------------------------------------------------------------
// Match result types (not schemas — used by the service layer)
// ---------------------------------------------------------------------------

/** Summary of a batch match processing run. */
export interface MatchProcessingResult {
  /** Total number of entries processed in this batch */
  processed: number
  /** Number of entries that were auto-matched (confidence >= 0.90) */
  auto_matched: number
  /** Number of entries flagged for manual review (confidence 0.70-0.89) */
  pending: number
  /** Number of entries with no match found (confidence < 0.70) */
  unmatched: number
  /** Errors encountered during processing (entry ID -> error message) */
  errors: Array<{ entry_id: string; error: string }>
}

/** Result of matching a single queue entry. */
export interface SingleMatchResult {
  /** The queue entry ID */
  entry_id: string
  /** Match status: auto_matched, pending, or unchanged */
  status: 'auto_matched' | 'pending' | 'unmatched'
  /** Best match wine ID (if any candidate was found) */
  matched_wine_id?: string
  /** Composite match confidence score (0-1) */
  confidence?: number
  /** Whether an inventory record was created (only for auto_matched) */
  inventory_created?: boolean
}
