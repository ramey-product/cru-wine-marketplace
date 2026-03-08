### [EPIC-04/STORY-04] — Wine-to-Medusa sync webhook

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want a webhook endpoint that receives Supabase database webhook events from the wines table and syncs wine data to Medusa Products so that the commerce catalog stays in sync with the content catalog.

#### Acceptance Criteria

```gherkin
Given a new wine is inserted into the wines table
When the Supabase database webhook fires
Then the sync endpoint receives the payload, creates a Medusa Product with title = wine.name, handle = wine.slug, and metadata.supabase_wine_id = wine.id, and stores the medusa_product_id back on the wines row

Given an existing wine is updated in the wines table
When the database webhook fires
Then the sync endpoint updates the corresponding Medusa Product fields and returns success

Given the Medusa API is unavailable
When the sync endpoint attempts to create/update a product
Then it logs the error, returns 500, and does not update medusa_product_id (allowing retry on next webhook)

Given a duplicate webhook delivery for the same wine
When the sync endpoint processes the payload
Then it handles idempotently (upserts rather than duplicates)

Given a wine has no retailer_inventory rows
When the sync fires
Then the Medusa Product is still created (wine can exist in catalog for discovery before retail availability, per CG-1 resolution)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| API Route | `app/api/webhooks/supabase/wine-sync/route.ts` | Create |
| Medusa | `lib/medusa/sync.ts` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_wine_sync_webhook_trigger.sql` | Create |
| Test | `app/api/webhooks/supabase/__tests__/wine-sync.test.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-01 — wines table must exist
- **Blocked by:** Medusa.js setup (infrastructure — ensure Medusa is running and admin SDK is configured)
- **Blocks:** EPIC-05 Order Placement — needs Medusa Products to exist for commerce operations

#### Testing Requirements

- [ ] **Unit:** Sync function correctly transforms Supabase wine row to Medusa Product payload
- [ ] **Integration:** Webhook endpoint creates/updates Medusa Product and stores medusa_product_id back on wines row
- [ ] **Idempotency:** Duplicate webhook delivery does not create duplicate Medusa Products
- [ ] **Error handling:** Medusa API failure returns 500 and logs error without corrupting data

#### Implementation Notes

- Per CG-1 resolution: Supabase Database Webhook (pg_net extension) fires HTTP POST to `/api/webhooks/supabase/wine-sync`.
- The webhook trigger SQL: `CREATE TRIGGER wine_sync_trigger AFTER INSERT OR UPDATE ON wines FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(...)`. See checkpoint-1-resolution.md Section 4 for exact SQL.
- Use `supabaseAdmin` (service role) in the webhook handler — no user session exists.
- Idempotency: Check if `medusa_product_id` already exists on the wine row. If so, update rather than create.
- Back-reference: After Medusa Product creation, update `wines.medusa_product_id` using service role client.
- Verify the webhook payload signature if Supabase provides one (check docs).
