# Epic: [EPIC-06] — Local Retailer Integration

**Source PRD:** `docs/prds/prd-06-retailer-integration.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 4,000
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-3, fullstack-1, fullstack-2, fullstack-4, devops, ux-designer, marketing-writer

## Epic Summary

Local Retailer Integration is the commerce backbone — it ingests, normalizes, and serves real-time inventory data from 20+ independent wine shops. Without it, every wine recommendation is hypothetical. This epic delivers the full pipeline: retailer onboarding, CSV import with fuzzy wine matching, automated POS sync (Square, Lightspeed, Shopify, Clover), PostGIS-powered availability queries, and the admin tools to manage the matching and sync lifecycle. Every downstream feature (Order Placement, Search availability dots, Curation availability filtering) depends on this data layer.

## Success Criteria

- [ ] 20+ retailers can onboard via form + CSV upload with 85%+ auto-match rate on wine records
- [ ] POS adapters for Square, Lightspeed, Shopify, and Clover are operational with daily sync
- [ ] Availability API responds in < 200ms p95 for 15-mile radius PostGIS queries
- [ ] Inventory data freshness: 90% of records < 24 hours old
- [ ] Admin wine matching review queue handles unmatched and low-confidence matches
- [ ] Sync failures retain last-known inventory and alert retailers via email

## Architecture Dependencies

- **Database tables:** `retailers`, `retailer_inventory`, `retailer_sync_logs`, `wine_match_queue`
- **PostGIS extension:** Required for `geography(Point, 4326)` columns and distance queries
- **Medusa modules:** Product catalog for wine matching reference data
- **External integrations:** Square API, Lightspeed Retail API, Shopify POS API, Clover API
- **Shared components:** AvailabilityBadge, RetailerListCard (consumed by Search, Wine Detail, Curation)

## Cross-Cutting Concerns

- **EPIC-01 dependency:** Retailers are organizations — reuses org/membership infrastructure for retailer team access
- **EPIC-02 consumer:** Search & Browse displays availability dots powered by this epic's inventory data
- **EPIC-05 dependency:** Order Placement reads `retailer_inventory` for pricing, stock validation, and retailer selection
- **EPIC-07 consumer:** Curation Engine factors local availability into recommendations
- **EPIC-09 consumer:** Retailer Dashboard surfaces inventory analytics from this data layer
- **CG-3 resolution applied:** POSAdapter interface with 4 P0 adapters (Square, Lightspeed, Shopify, Clover) + CSV fallback — Shopify and Clover elevated from P1 to P0 per project directive
- **CG-5 resolution applied:** PostGIS `geography(Point, 4326)` with GIST index for proximity queries

## Technical Risks & Open Questions

- [ ] **POS API rate limits** — Square and Lightspeed may throttle bulk inventory pulls; need pagination + backoff strategies
- [ ] **Fuzzy matching accuracy** — Wine naming is wildly inconsistent across retailers (abbreviations, accent marks, vintage formats); matching engine must handle "Dom. Tempier Bandol Rose 2023" → "Domaine Tempier Bandol Rosé 2023"
- [ ] **Webhook reliability** — Lightspeed webhooks can be delayed or missed; need reconciliation via nightly full pull
- [ ] **PostGIS performance** — Confirmed available in Supabase, but need to benchmark radius queries with 20+ retailers × 500+ wines each
- [ ] **CSV format chaos** — Independent shops export wildly different CSV formats; column mapping UI must be forgiving
- [ ] **Shopify/Clover API maturity** — These are newer additions (elevated from P1); verify API capabilities match Square/Lightspeed patterns before sprint commitment

---

## Developer Stories

> Individual story files are located in `.claude/work-plan/stories/epic-06/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-06/story-01-create-retailers-inventory-schema-postgis.md) | Create Retailers and Inventory Schema with PostGIS | backend | 8 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-06/story-02-dal-functions-retailers-inventory.md) | DAL Functions for Retailers and Inventory | backend | 5 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-06/story-03-csv-import-pipeline.md) | CSV Import Pipeline | backend | 5 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-06/story-04-fuzzy-wine-matching-engine.md) | Fuzzy Wine Matching Engine | backend | 8 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-06/story-05-posadapter-interface-square-integration.md) | POSAdapter Interface and Square Integration | backend | 5 | sr-backend | CP3 | pending |
| [STORY-06](../stories/epic-06/story-06-lightspeed-retail-adapter.md) | Lightspeed Retail Adapter | backend | 5 | sr-backend | CP3 | pending |
| [STORY-07](../stories/epic-06/story-07-shopify-pos-clover-adapters.md) | Shopify POS and Clover Adapters | backend | 5 | sr-backend | CP3 | pending |
| [STORY-08](../stories/epic-06/story-08-inventory-sync-scheduling-error-handling.md) | Inventory Sync Scheduling and Error Handling | infrastructure | 5 | devops | CP3 | pending |
| [STORY-09](../stories/epic-06/story-09-availability-api-endpoint.md) | Availability API Endpoint | backend | 3 | sr-backend | CP3 | pending |
| [STORY-10](../stories/epic-06/story-10-retailer-onboarding-form-csv-upload-ui.md) | Retailer Onboarding Form and CSV Upload UI | frontend | 5 | fullstack-1 | CP4 | pending |
| [STORY-11](../stories/epic-06/story-11-csv-column-mapping-import-preview-ui.md) | CSV Column Mapping and Import Preview UI | frontend | 8 | fullstack-4 | CP4 | pending |
| [STORY-12](../stories/epic-06/story-12-admin-wine-matching-review-interface.md) | Admin Wine Matching Review Interface | frontend | 5 | fullstack-4 | CP4 | pending |
| [STORY-13](../stories/epic-06/story-13-ux-design-user-facing-copy.md) | UX Design and User-Facing Copy | design + copy | 5 | ux-designer | CP4 | pending |

**Total: 13 stories, 72 story points**
