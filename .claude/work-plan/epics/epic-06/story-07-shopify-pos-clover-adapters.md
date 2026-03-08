### [EPIC-06/STORY-07] — Shopify POS and Clover Adapters

**Type:** backend
**Story Points:** 5
**Assigned Agent:** fullstack-3
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer using Shopify POS or Clover, I want Cru to sync my inventory automatically so that my wines appear on Cru with accurate stock levels.

#### Acceptance Criteria

```gherkin
Given a Shopify-connected retailer
When fullSync() runs
Then all products with wine-related tags/types are fetched and processed

Given a Clover-connected retailer
When fullSync() runs
Then all wine-category items are fetched via Clover Inventory API and processed

Given either adapter encounters rate limits
When retrying
Then exponential backoff is applied per the shared rate limiter utility

Given a sync from either adapter completes
When I check retailer_sync_logs
Then the sync_source correctly identifies 'shopify' or 'clover'
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Adapter | `lib/integrations/pos/shopify-adapter.ts` | Create |
| Adapter | `lib/integrations/pos/clover-adapter.ts` | Create |
| Webhook | `app/api/webhooks/shopify/route.ts` | Create |
| Webhook | `app/api/webhooks/clover/route.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-05 — needs POSAdapter interface
- **Blocks:** EPIC-06/STORY-08 — scheduler invokes these adapters

#### Testing Requirements

- [ ] **Unit:** Shopify product → InventoryItem mapping
- [ ] **Unit:** Clover item → InventoryItem mapping
- [ ] **Unit:** Webhook payload parsing for both platforms
- [ ] **Integration:** Full sync with mocked APIs for both

#### Implementation Notes

**Shopify POS:**
- Use Shopify Admin API (GraphQL or REST) — Products and Inventory Items resources
- Shopify uses OAuth2 app installation flow
- Filter products by `product_type` or tags containing wine-related terms
- Shopify webhooks: `products/update`, `inventory_levels/update` — register via API
- Webhook verification: HMAC-SHA256 with shared secret

**Clover:**
- Use Clover REST API — Inventory Items and Stock endpoints
- Clover uses OAuth2 with merchant-level authorization
- Filter by item categories (wine/spirits)
- Clover webhook support is limited — may need polling for incremental updates
- Handle Clover's pagination (offset/limit)

**Both adapters** follow the same POSAdapter interface from STORY-05. The adapter factory pattern makes them plug-and-play.
