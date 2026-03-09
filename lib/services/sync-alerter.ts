/**
 * Sync Alert Service
 *
 * Provides structured alerting for POS inventory sync failures and staleness
 * detection. Alerts are currently logged via console.error with structured
 * JSON details. Email integration will be added in EPIC-09 when React Email
 * is set up.
 *
 * Usage:
 *   sendSyncFailureAlert(retailer, error, syncLogId)
 *   sendStalenessAlert(staleRetailers)
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Configuration for sync alerting thresholds and channels. */
export interface SyncAlertConfig {
  /** Hours without a successful sync before a retailer is considered stale. */
  stalenessThresholdHours: number
  /** Maximum number of consecutive failures before escalating the alert. */
  maxConsecutiveFailures: number
}

/** Default alert configuration. */
export const DEFAULT_ALERT_CONFIG: SyncAlertConfig = {
  stalenessThresholdHours: 48,
  maxConsecutiveFailures: 3,
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Minimal retailer info needed for alerts. */
export interface AlertRetailerInfo {
  id: string
  name: string
  org_id: string
  pos_type: string | null
}

/** A retailer flagged as having stale inventory. */
export interface StaleRetailerInfo extends AlertRetailerInfo {
  /** ISO 8601 timestamp of the last successful sync, or null if never synced. */
  last_successful_sync: string | null
  /** Number of hours since the last successful sync. */
  hours_since_sync: number
}

// ---------------------------------------------------------------------------
// sendSyncFailureAlert — alert on individual sync failure
// ---------------------------------------------------------------------------

/**
 * Send an alert when a retailer's POS sync fails.
 *
 * Currently logs a structured error message. When EPIC-09 adds React Email
 * support, this function will send an alert email to the org admin and/or
 * a platform monitoring address.
 *
 * @param retailer   - The retailer whose sync failed
 * @param error      - The error message or Error object
 * @param syncLogId  - The sync log entry ID for reference
 */
export function sendSyncFailureAlert(
  retailer: AlertRetailerInfo,
  error: string | Error,
  syncLogId: string
): void {
  const errorMessage = error instanceof Error ? error.message : error
  const timestamp = new Date().toISOString()

  // Structured console.error for log aggregation (Vercel, Datadog, etc.)
  console.error(
    JSON.stringify({
      alert_type: 'sync_failure',
      severity: 'error',
      timestamp,
      retailer_id: retailer.id,
      retailer_name: retailer.name,
      org_id: retailer.org_id,
      pos_type: retailer.pos_type,
      sync_log_id: syncLogId,
      error: errorMessage,
      // TODO [EPIC-09]: Send email via React Email to org admins
      // TODO [EPIC-09]: Post to Slack/Discord webhook if configured
    })
  )
}

// ---------------------------------------------------------------------------
// sendStalenessAlert — alert on stale inventory
// ---------------------------------------------------------------------------

/**
 * Send an alert when one or more retailers have stale inventory.
 *
 * Stale inventory means no successful sync has completed within the
 * configured threshold (default: 48 hours). This is called by the
 * daily staleness check cron job.
 *
 * @param staleRetailers - Array of retailers with stale inventory
 * @param config         - Alert configuration (optional, uses defaults)
 */
export function sendStalenessAlert(
  staleRetailers: StaleRetailerInfo[],
  config: SyncAlertConfig = DEFAULT_ALERT_CONFIG
): void {
  if (staleRetailers.length === 0) return

  const timestamp = new Date().toISOString()

  // Structured console.error for log aggregation
  console.error(
    JSON.stringify({
      alert_type: 'inventory_staleness',
      severity: 'warning',
      timestamp,
      threshold_hours: config.stalenessThresholdHours,
      stale_retailer_count: staleRetailers.length,
      stale_retailers: staleRetailers.map((r) => ({
        retailer_id: r.id,
        retailer_name: r.name,
        org_id: r.org_id,
        pos_type: r.pos_type,
        last_successful_sync: r.last_successful_sync,
        hours_since_sync: r.hours_since_sync,
      })),
      // TODO [EPIC-09]: Send email digest to platform admins
      // TODO [EPIC-09]: Send individual emails to each org's admin
    })
  )
}
