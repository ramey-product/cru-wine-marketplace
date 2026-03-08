### [EPIC-06/STORY-06] — Lightspeed Retail Adapter

**Type:** backend
**Story Points:** 5
**Assigned Agent:** fullstack-3
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer using Lightspeed Retail POS, I want Cru to automatically sync my inventory so that my stock levels stay current without manual CSV uploads.

#### Acceptance Criteria

```gherkin
Given a Lightspeed-connected retailer
When fullSync() runs nightly
Then all wine items are fetched via Lightspeed API and processed through matching

Given a Lightspeed-connected retailer sells a wine in-store
When the webhook fires
Then Cru's inventory record updates within 5 minutes via incrementalSync

Given the Lightspeed API is temporarily unavailable
When a sync attempt fails
Then the adapter retries with backoff and logs the failure in retailer_sync_logs

Given a nightly sync fails completely
When the next browse shows the retailer's inventory
Then last-known data is displayed (stale sync is better than no data)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Adapter | `lib/integrations/pos/lightspeed-adapter.ts` | Create |
| Webhook | `app/api/webhooks/lightspeed/route.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-05 — needs POSAdapter interface
- **Blocks:** EPIC-06/STORY-08 — scheduler invokes this adapter

#### Testing Requirements

- [ ] **Unit:** Lightspeed item → InventoryItem mapping handles Lightspeed's data format
- [ ] **Unit:** Webhook payload parsing extracts item changes correctly
- [ ] **Integration:** Full sync with mocked Lightspeed API
- [ ] **Unit:** Retry logic handles API failures gracefully

#### Implementation Notes

- Lightspeed uses OAuth2; store refresh_token in `pos_credentials`
- Lightspeed's Item API returns items with categories, matrix items (variants), and inventory counts
- Filter for wine categories — may need configurable category mapping per retailer
- Webhook: Lightspeed supports Item webhooks — register during onboarding for real-time stock updates
- Webhook verification: Lightspeed uses HMAC-SHA256 signature validation
- Handle Lightspeed's pagination (offset-based, not cursor-based)
