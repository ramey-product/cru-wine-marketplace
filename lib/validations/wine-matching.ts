import { z } from 'zod'

// ---------------------------------------------------------------------------
// Match status enum (aligned with wine_match_queue CHECK constraint)
// ---------------------------------------------------------------------------

export const MatchStatusEnum = z.enum([
  'pending',
  'auto_matched',
  'manual_matched',
  'rejected',
  'new_wine_created',
])
export type MatchStatus = z.infer<typeof MatchStatusEnum>

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
// Approve match action input
// ---------------------------------------------------------------------------

export const ApproveMatchInputSchema = z.object({
  queue_entry_id: z.string().uuid('Invalid queue entry ID'),
})

export type ApproveMatchInput = z.infer<typeof ApproveMatchInputSchema>

// ---------------------------------------------------------------------------
// Reject match action input
// ---------------------------------------------------------------------------

export const RejectMatchInputSchema = z.object({
  queue_entry_id: z.string().uuid('Invalid queue entry ID'),
})

export type RejectMatchInput = z.infer<typeof RejectMatchInputSchema>

// ---------------------------------------------------------------------------
// Manual match action input
// ---------------------------------------------------------------------------

export const ManualMatchInputSchema = z.object({
  queue_entry_id: z.string().uuid('Invalid queue entry ID'),
  wine_id: z.string().uuid('Invalid wine ID'),
})

export type ManualMatchInput = z.infer<typeof ManualMatchInputSchema>

// ---------------------------------------------------------------------------
// Create wine from queue entry action input
// ---------------------------------------------------------------------------

export const CreateWineFromQueueInputSchema = z.object({
  queue_entry_id: z.string().uuid('Invalid queue entry ID'),
  producer_id: z.string().uuid('Invalid producer ID'),
  name: z.string().min(1).max(500).optional(),
  varietal: z.string().max(200).optional(),
  vintage: z.number().int().min(1900).max(2100).optional(),
  region: z.string().max(200).optional(),
  country: z.string().max(200).optional(),
})

export type CreateWineFromQueueInput = z.infer<typeof CreateWineFromQueueInputSchema>

// ---------------------------------------------------------------------------
// Batch approve matches action input
// ---------------------------------------------------------------------------

export const BatchApproveMatchesInputSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  min_confidence: z
    .number()
    .min(0, 'Minimum confidence must be >= 0')
    .max(1, 'Minimum confidence must be <= 1')
    .default(0.90),
})

export type BatchApproveMatchesInput = z.infer<typeof BatchApproveMatchesInputSchema>

// ---------------------------------------------------------------------------
// Search wines action input
// ---------------------------------------------------------------------------

export const SearchWinesInputSchema = z.object({
  org_id: z.string().uuid('Invalid organization ID'),
  query: z.string().min(1, 'Search query is required').max(500),
  limit: z
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(50, 'Limit cannot exceed 50')
    .default(10),
})

export type SearchWinesInput = z.infer<typeof SearchWinesInputSchema>

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
  /** Match status: auto_matched, pending, or unmatched */
  status: 'auto_matched' | 'pending' | 'unmatched'
  /** Best match wine ID (if any candidate was found) */
  matched_wine_id?: string
  /** Composite match confidence score (0-1) */
  confidence?: number
  /** Whether an inventory record was created (only for auto_matched) */
  inventory_created?: boolean
}
