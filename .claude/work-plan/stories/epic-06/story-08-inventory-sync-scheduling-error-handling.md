### [EPIC-06/STORY-08] — Inventory Sync Scheduling and Error Handling

**Type:** infrastructure
**Story Points:** 5
**Assigned Agent:** devops
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want automated sync scheduling so that retailer inventory stays fresh without manual intervention, with alerting when syncs fail.

#### Acceptance Criteria

```gherkin
Given a POS-connected retailer
When the nightly schedule runs (2:00 AM PT)
Then a full sync is triggered for each retailer with automated POS integration

Given an incremental sync schedule
When the 4-hour interval fires
Then an incremental sync runs for all POS-connected retailers since last sync

Given a sync fails for a retailer
When the error handler runs
Then an alert email is sent to the retailer contact, the sync log records the failure, and last-known inventory is preserved

Given a sync has been failing for 48+ hours
When the staleness checker runs
Then inventory items for that retailer are flagged with a 'stale' indicator in the data
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Cron | `app/api/cron/inventory-sync/route.ts` | Create |
| Cron | `app/api/cron/staleness-check/route.ts` | Create |
| Service | `lib/services/sync-orchestrator.ts` | Create |
| Service | `lib/services/sync-alerter.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-05, STORY-06, STORY-07 — adapters must exist
- **Blocked by:** EPIC-01 — needs email sending infrastructure

#### Testing Requirements

- [ ] **Unit:** Sync orchestrator iterates all POS-connected retailers
- [ ] **Unit:** Error handler sends alert emails on failure
- [ ] **Unit:** Staleness checker correctly identifies inventory older than threshold
- [ ] **Integration:** Cron endpoint triggers syncs for correct retailers

#### Implementation Notes

**Scheduling approach:**
- Use Vercel Cron Jobs (`vercel.json` cron config) for scheduled triggers
- Nightly full sync: `0 2 * * *` (2:00 AM PT) — calls `app/api/cron/inventory-sync/route.ts`
- Incremental sync: `0 */4 * * *` (every 4 hours) — same endpoint with `type=incremental` query param
- Staleness check: `0 8 * * *` (8:00 AM PT) — daily staleness audit

**Sync Orchestrator (`lib/services/sync-orchestrator.ts`):**
1. Query all retailers where `pos_type != 'csv_only'` and `is_active = true`
2. For each, get the appropriate adapter via factory
3. Call `fullSync()` or `incrementalSync()` based on sync type
4. Process results through matching engine
5. Log results in retailer_sync_logs
6. On failure: log error, send alert, preserve existing inventory

**Error alerting:**
- Use React Email template for retailer sync failure notification
- Include: which sync failed, when, what to do (upload CSV as fallback)
- Admin dashboard shows sync health summary (EPIC-09)

**Vercel Cron configuration:**
```json
{
  "crons": [
    { "path": "/api/cron/inventory-sync?type=full", "schedule": "0 2 * * *" },
    { "path": "/api/cron/inventory-sync?type=incremental", "schedule": "0 */4 * * *" },
    { "path": "/api/cron/staleness-check", "schedule": "0 8 * * *" }
  ]
}
```
