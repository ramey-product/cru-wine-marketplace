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

---

### [EPIC-06/STORY-01] — Create Retailers and Inventory Schema with PostGIS

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want a normalized data model for retailers and their inventory so that all downstream features (Search, Orders, Curation) query a consistent, location-aware inventory layer.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When I query the retailers table
Then it includes PostGIS geography columns with GIST indexes for location queries

Given a retailer with latitude/longitude
When I query for retailers within 10 miles of a user
Then PostGIS ST_DWithin returns correct results in < 50ms for 20 retailers

Given a retailer_inventory record
When I check the table structure
Then it has wine_id, price (integer cents), quantity, stock_status enum, sync_source, and last_synced_at

Given any table in this migration
When I check RLS policies
Then retailers are readable by authenticated users and writable by org members
And retailer_inventory is readable by authenticated users and writable by org members

Given a sync completes or fails
When I check retailer_sync_logs
Then a log entry records sync_type, status, records_processed, records_failed, error_details, and duration_ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_retailers.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_retailer_inventory.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_retailer_sync_logs.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_wine_match_queue.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_enable_postgis.sql` | Create |
| Test | `supabase/tests/retailers.test.sql` | Create |
| Test | `supabase/tests/retailer_inventory.test.sql` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 — needs `organizations` table and membership infrastructure
- **Blocks:** EPIC-06/STORY-02 — DAL functions need schema to exist
- **Blocks:** EPIC-05/STORY-07 — retailer selection UI queries this schema

#### Testing Requirements

- [ ] **RLS:** Retailers readable by all authenticated users, writable only by org members
- [ ] **RLS:** Retailer inventory readable by all authenticated users, writable only by org members
- [ ] **RLS:** Sync logs readable/writable only by org members
- [ ] **RLS:** Wine match queue readable/writable only by platform admins
- [ ] **PostGIS:** ST_DWithin queries return correct results for known coordinates
- [ ] **PostGIS:** GIST index is used (EXPLAIN ANALYZE confirms index scan)
- [ ] **Constraints:** price >= 0, quantity >= 0, stock_status in valid enum values

#### Implementation Notes

**Schema Design:**

```
retailers:
  id UUID PK DEFAULT gen_random_uuid()
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  name TEXT NOT NULL
  slug TEXT UNIQUE NOT NULL
  address TEXT NOT NULL
  city TEXT NOT NULL
  state TEXT NOT NULL DEFAULT 'CA'
  zip TEXT NOT NULL
  location geography(Point, 4326) NOT NULL  -- PostGIS
  phone TEXT
  email TEXT
  website TEXT
  pos_type TEXT  -- 'square' | 'lightspeed' | 'shopify' | 'clover' | 'csv_only' | 'other'
  pos_credentials JSONB  -- encrypted at rest, contains API keys/tokens
  fulfillment_capabilities JSONB NOT NULL DEFAULT '["pickup"]'
    -- array of: 'pickup', 'delivery', 'shipping'
  delivery_radius_miles INTEGER
  commission_rate NUMERIC(5,4) DEFAULT 0.15  -- 15% default
  is_active BOOLEAN DEFAULT true
  onboarded_at TIMESTAMPTZ
  created_at TIMESTAMPTZ DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT now()

retailer_inventory:
  id UUID PK DEFAULT gen_random_uuid()
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE
  sku TEXT  -- retailer's internal SKU
  price INTEGER NOT NULL  -- cents, matching Stripe format
  quantity INTEGER NOT NULL DEFAULT 0
  stock_status TEXT NOT NULL DEFAULT 'in_stock'
    -- 'in_stock' | 'low_stock' | 'out_of_stock'
  sync_source TEXT NOT NULL DEFAULT 'csv'
    -- 'csv' | 'pos_api' | 'manual'
  last_synced_at TIMESTAMPTZ DEFAULT now()
  created_at TIMESTAMPTZ DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT now()
  UNIQUE(retailer_id, wine_id)  -- one inventory record per wine per retailer

retailer_sync_logs:
  id UUID PK DEFAULT gen_random_uuid()
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE
  sync_type TEXT NOT NULL  -- 'csv_import' | 'pos_full' | 'pos_incremental' | 'manual'
  sync_source TEXT NOT NULL  -- 'square' | 'lightspeed' | 'shopify' | 'clover' | 'csv'
  status TEXT NOT NULL  -- 'started' | 'completed' | 'failed' | 'partial'
  records_processed INTEGER DEFAULT 0
  records_created INTEGER DEFAULT 0
  records_updated INTEGER DEFAULT 0
  records_failed INTEGER DEFAULT 0
  error_details JSONB
  started_at TIMESTAMPTZ DEFAULT now()
  completed_at TIMESTAMPTZ
  duration_ms INTEGER
  created_at TIMESTAMPTZ DEFAULT now()

wine_match_queue:
  id UUID PK DEFAULT gen_random_uuid()
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE
  raw_wine_name TEXT NOT NULL
  raw_producer TEXT
  raw_vintage TEXT
  raw_varietal TEXT
  raw_sku TEXT
  raw_price INTEGER  -- cents
  raw_quantity INTEGER
  matched_wine_id UUID REFERENCES wines(id)
  match_confidence NUMERIC(5,4)  -- 0.0000 to 1.0000
  match_status TEXT NOT NULL DEFAULT 'pending'
    -- 'pending' | 'auto_matched' | 'manual_matched' | 'rejected' | 'new_wine_created'
  reviewed_by UUID REFERENCES auth.users(id)
  reviewed_at TIMESTAMPTZ
  sync_log_id UUID REFERENCES retailer_sync_logs(id)
  created_at TIMESTAMPTZ DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT now()
```

**PostGIS setup:**
- Enable PostGIS extension: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Create GIST index on `retailers.location`
- Populate location from address during onboarding (geocoding via external API or manual lat/lng input)
- Distance queries: `ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_meters)`

**RLS Pattern:**
- Retailers and inventory are **publicly readable** by any authenticated user (consumers need to see nearby retailers)
- Retailers and inventory are **writable only by org members** (retailer staff managing their own data)
- Sync logs are **org-scoped** (only retailer's own team sees sync history)
- Wine match queue is **platform admin only** (content team reviews matches)

---

### [EPIC-06/STORY-02] — DAL Functions for Retailers and Inventory

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want typed DAL functions for retailers and inventory so that all features query through a consistent, testable data access layer.

#### Acceptance Criteria

```gherkin
Given a user's coordinates and radius
When I call getRetailersNearby(client, lat, lng, radiusMiles)
Then it returns retailers within the radius sorted by distance, with PostGIS calculation

Given a wine_id and user location
When I call getAvailabilityForWine(client, wineId, lat, lng, radiusMiles)
Then it returns an array of { retailer, price, quantity, stockStatus, distanceMiles }

Given a retailer_id
When I call getRetailerInventory(client, retailerId, { page, limit, search })
Then it returns paginated inventory with wine details joined

Given a retailer_id and wine_id
When I call upsertInventoryItem(client, retailerId, wineId, data)
Then it inserts or updates the inventory record via UPSERT on (retailer_id, wine_id)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailers.ts` | Create |
| DAL | `lib/dal/inventory.ts` | Create |
| DAL | `lib/dal/wine-matching.ts` | Create |
| Validation | `lib/validations/retailers.ts` | Create |
| Validation | `lib/validations/inventory.ts` | Create |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-01 — schema must exist
- **Blocks:** EPIC-06/STORY-03, STORY-04, STORY-05, STORY-09 — all backend stories consume DAL

#### Testing Requirements

- [ ] **Unit:** getRetailersNearby returns correct distance sorting
- [ ] **Unit:** getAvailabilityForWine joins retailer + inventory correctly
- [ ] **Unit:** upsertInventoryItem handles insert and update cases
- [ ] **Unit:** Pagination works correctly for getRetailerInventory
- [ ] **Integration:** PostGIS distance calculations match expected values for known coordinates

#### Implementation Notes

**Key DAL Functions:**

`lib/dal/retailers.ts`:
- `getRetailerBySlug(client, slug)` — single retailer lookup
- `getRetailerByOrgId(client, orgId)` — get retailer profile for an org
- `getRetailersNearby(client, lat, lng, radiusMiles, options?)` — PostGIS proximity query
- `createRetailer(client, data)` — insert new retailer
- `updateRetailer(client, retailerId, data)` — update retailer details
- `getRetailerSyncLogs(client, retailerId, { page, limit })` — paginated sync history

`lib/dal/inventory.ts`:
- `getAvailabilityForWine(client, wineId, lat, lng, radiusMiles)` — core availability query
- `getRetailerInventory(client, retailerId, options)` — paginated inventory list
- `upsertInventoryItem(client, retailerId, wineId, data)` — UPSERT single item
- `bulkUpsertInventory(client, retailerId, items[])` — batch UPSERT for CSV/POS sync
- `updateStockStatus(client, inventoryId, status)` — manual stock adjustment
- `getStaleInventory(client, hoursThreshold)` — find inventory not synced recently

`lib/dal/wine-matching.ts`:
- `getMatchQueue(client, { status, page, limit })` — paginated match queue
- `resolveMatch(client, queueId, { matchedWineId, status })` — admin resolves a match
- `createWineFromMatch(client, queueId)` — creates a new wine record from CSV data

**PostGIS query pattern:**
```sql
SELECT r.*,
  ST_Distance(r.location, ST_MakePoint($lng, $lat)::geography) / 1609.34 AS distance_miles
FROM retailers r
WHERE ST_DWithin(r.location, ST_MakePoint($lng, $lat)::geography, $radiusMiles * 1609.34)
  AND r.is_active = true
ORDER BY distance_miles ASC;
```

---

### [EPIC-06/STORY-03] — CSV Import Pipeline

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer, I want to upload my wine inventory via CSV so that my stock appears on Cru without complex technical setup.

#### Acceptance Criteria

```gherkin
Given a retailer uploads a valid CSV with 500 wines
When the import pipeline processes it
Then all rows are parsed, validated, and staged in wine_match_queue within 5 minutes

Given a CSV has unmappable columns
When the pipeline receives the column mapping from the UI
Then it remaps columns accordingly and processes successfully

Given a CSV row has invalid data (negative price, missing wine name)
When validation runs
Then the row is rejected with a specific error and the import continues for valid rows

Given an import completes
When I check retailer_sync_logs
Then a log entry shows records_processed, records_created, records_updated, records_failed
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/csv-import.ts` | Create |
| Utility | `lib/csv/parser.ts` | Create |
| Utility | `lib/csv/validator.ts` | Create |
| Utility | `lib/csv/column-mapper.ts` | Create |
| Validation | `lib/validations/csv-import.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-02 — needs DAL functions for inventory upsert and match queue
- **Blocks:** EPIC-06/STORY-04 — matching engine processes rows from wine_match_queue
- **Blocks:** EPIC-06/STORY-11 — CSV upload UI calls these actions

#### Testing Requirements

- [ ] **Unit:** Parser handles different CSV encodings (UTF-8, Latin-1) and line endings
- [ ] **Unit:** Validator catches invalid prices, missing required fields, negative quantities
- [ ] **Unit:** Column mapper correctly remaps non-standard column names
- [ ] **Integration:** Full pipeline from CSV string → parsed → validated → match queue entries

#### Implementation Notes

**CSV Template Columns (standard):**
`wine_name, producer, vintage, varietal, sku, price, quantity`

**Column Mapper:** The column mapping step handles retailer CSVs that use different names:
- "Wine" → wine_name, "Winery" → producer, "Year" → vintage, "Grape" → varietal, "Cost" → price
- The mapper receives a JSON mapping from the CSV upload UI (STORY-11) and transforms accordingly

**Price normalization:** Accept both dollar strings ("$24.99") and numbers (24.99), convert to cents (2499)

**Pipeline steps:**
1. Parse CSV → rows[]
2. Apply column mapping
3. Validate each row (collect errors per row)
4. Price normalization to cents
5. Insert valid rows into wine_match_queue with status='pending'
6. Create retailer_sync_log entry
7. Trigger matching engine (STORY-04) asynchronously

**File size limit:** 10MB max (handles ~10,000 wines easily). Use Supabase Storage for upload, stream processing for parsing.

---

### [EPIC-06/STORY-04] — Fuzzy Wine Matching Engine

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want imported wine entries to automatically match against our canonical wine database so that retailer inventory links to the correct wine records without manual effort.

#### Acceptance Criteria

```gherkin
Given a retailer lists "Dom. Tempier Bandol Rose 2023"
When the matching engine runs
Then it matches to "Domaine Tempier Bandol Rosé 2023" with >90% confidence and auto-matches

Given a wine entry has 70-90% match confidence
When the matching engine runs
Then it is flagged as 'pending' in wine_match_queue for manual review

Given a wine entry has <70% match confidence
When the matching engine runs
Then it is flagged as 'unmatched' in wine_match_queue

Given a batch of 500 wines from a CSV import
When the matching engine processes them
Then 85%+ are auto-matched (>90% confidence) and the rest are queued for review

Given a match is auto-confirmed
When the engine resolves it
Then the corresponding retailer_inventory record is created via DAL upsert
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Service | `lib/services/wine-matcher.ts` | Create |
| Utility | `lib/utils/string-similarity.ts` | Create |
| Utility | `lib/utils/wine-name-normalizer.ts` | Create |
| Action | `lib/actions/wine-matching.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-03 — match queue is populated by CSV import
- **Blocked by:** EPIC-04/STORY-01 — needs wines table to exist for matching
- **Blocks:** EPIC-06/STORY-12 — admin review UI consumes match queue

#### Testing Requirements

- [ ] **Unit:** String similarity handles abbreviations (Dom. → Domaine, Ch. → Château)
- [ ] **Unit:** Accent normalization (Rosé → Rose for matching, preserves original)
- [ ] **Unit:** Vintage matching is exact (2023 ≠ 2022)
- [ ] **Unit:** Confidence scoring correctly brackets auto/review/unmatched thresholds
- [ ] **Integration:** End-to-end from match queue entry → matched inventory record

#### Implementation Notes

**Matching Algorithm:**
1. **Normalize** wine name: lowercase, strip accents, expand abbreviations (Dom.→Domaine, Ch.→Château, Mt.→Mount), remove punctuation
2. **Tokenize** into components: producer, wine name, vintage, varietal
3. **Score each component** independently:
   - Producer: trigram similarity (pg_trgm) against wines.producer_name — weight 0.30
   - Wine name: trigram similarity against wines.name — weight 0.35
   - Vintage: exact match — weight 0.20
   - Varietal: fuzzy match against wines.varietal — weight 0.15
4. **Weighted composite score** determines action:
   - ≥ 0.90 → auto_matched (create inventory record immediately)
   - 0.70–0.89 → pending (queued for manual review)
   - < 0.70 → unmatched (queued with no suggested match)

**PostgreSQL support:**
- Enable `pg_trgm` extension for trigram similarity: `similarity()` and `%` operator
- Create GIN trigram indexes on `wines.name` and `wines.producer_name` for fast fuzzy search
- Use `SELECT *, similarity(name, $search) AS score FROM wines WHERE name % $search ORDER BY score DESC LIMIT 5`

**Wine name normalizer (`lib/utils/wine-name-normalizer.ts`):**
- Abbreviation dictionary: 50+ common wine abbreviations
- Accent folding: é→e, ü→u, ñ→n, etc.
- Vintage extraction: regex for 4-digit year (19xx or 20xx)
- Producer/wine splitting heuristics

---

### [EPIC-06/STORY-05] — POSAdapter Interface and Square Integration

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want a standardized POS adapter interface so that adding new POS integrations is consistent and predictable, with Square as the first implementation.

#### Acceptance Criteria

```gherkin
Given the POSAdapter interface exists
When I implement a new adapter (e.g., SquareAdapter)
Then it implements fullSync(), incrementalSync(), and parseInventoryItem() methods

Given a Square-connected retailer
When fullSync() is called
Then all catalog items with wine category are fetched, mapped to InventoryItem format, and processed through the matching engine

Given a Square API rate limit is hit
When the adapter retries
Then it uses exponential backoff with jitter and eventually completes

Given a Square sync completes
When I check the sync log
Then it records records_processed, records_created, records_updated, duration_ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Interface | `lib/integrations/pos/types.ts` | Create |
| Adapter | `lib/integrations/pos/square-adapter.ts` | Create |
| Adapter | `lib/integrations/pos/adapter-factory.ts` | Create |
| Utility | `lib/integrations/pos/rate-limiter.ts` | Create |
| Action | `lib/actions/pos-sync.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-02 — needs DAL functions
- **Blocked by:** EPIC-06/STORY-04 — sync feeds through matching engine
- **Blocks:** EPIC-06/STORY-06, STORY-07 — other adapters implement the same interface
- **Blocks:** EPIC-06/STORY-08 — scheduler triggers adapters

#### Testing Requirements

- [ ] **Unit:** POSAdapter interface enforces required methods
- [ ] **Unit:** Square item → InventoryItem mapping is correct
- [ ] **Unit:** Rate limiter implements exponential backoff with jitter
- [ ] **Integration:** Full sync with mocked Square API returns correct inventory
- [ ] **Unit:** Adapter factory returns correct adapter for pos_type string

#### Implementation Notes

**POSAdapter Interface (`lib/integrations/pos/types.ts`):**
```typescript
interface POSAdapter {
  readonly posType: string;

  // Full inventory pull — nightly
  fullSync(retailerId: string, credentials: POSCredentials): Promise<SyncResult>;

  // Incremental update — every 4 hours or webhook
  incrementalSync(retailerId: string, credentials: POSCredentials, since: Date): Promise<SyncResult>;

  // Parse a single item from POS format to Cru format
  parseInventoryItem(rawItem: unknown): InventoryItem | null;

  // Validate credentials are still valid
  testConnection(credentials: POSCredentials): Promise<boolean>;
}

interface InventoryItem {
  rawWineName: string;
  rawProducer?: string;
  rawVintage?: string;
  rawVarietal?: string;
  sku?: string;
  price: number;      // cents
  quantity: number;
}

interface SyncResult {
  status: 'completed' | 'failed' | 'partial';
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsFailed: number;
  errors?: Array<{ item: string; error: string }>;
  durationMs: number;
}
```

**Adapter Factory Pattern:**
```typescript
function getPOSAdapter(posType: string): POSAdapter {
  switch (posType) {
    case 'square': return new SquareAdapter();
    case 'lightspeed': return new LightspeedAdapter();
    case 'shopify': return new ShopifyAdapter();
    case 'clover': return new CloverAdapter();
    default: throw new Error(`Unsupported POS: ${posType}`);
  }
}
```

**Square-specific:**
- Use Square Catalog API to fetch items
- Filter by wine-related categories
- Map Square's `CatalogItemVariation` → InventoryItem
- Square uses OAuth2 for authentication — store access token in `pos_credentials`
- Handle pagination with Square's cursor-based pagination

---

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

---

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

---

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

---

### [EPIC-06/STORY-09] — Availability API Endpoint

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a frontend developer, I want a fast availability API so that wine cards and detail pages can show real-time stock status and nearby retailer information.

#### Acceptance Criteria

```gherkin
Given a wine_id and user coordinates
When I call GET /api/v1/inventory/check?wine_id=X&lat=Y&lng=Z&radius=15
Then it returns retailers with this wine in stock, sorted by distance, with price and fulfillment options

Given a request for a wine with no local availability
When the API responds
Then it returns an empty array with a suggestion to wishlist for notifications

Given a high-traffic period
When the API receives concurrent requests
Then it responds in < 200ms p95 for a 15-mile radius query

Given invalid parameters (missing wine_id, invalid coordinates)
When the API is called
Then it returns a 400 error with specific validation messages
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Route | `app/api/v1/inventory/check/route.ts` | Create |
| Validation | `lib/validations/inventory-check.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-02 — needs DAL functions for availability queries
- **Blocks:** EPIC-02 — Search & Browse consumes this for availability dots
- **Blocks:** EPIC-05/STORY-07 — retailer selection UI calls this API

#### Testing Requirements

- [ ] **Unit:** Zod validation catches invalid parameters
- [ ] **Unit:** Response shape matches API contract
- [ ] **Integration:** Full request → PostGIS query → response lifecycle
- [ ] **Performance:** p95 latency < 200ms with realistic data volume

#### Implementation Notes

**API Response Shape:**
```typescript
interface AvailabilityResponse {
  wineId: string;
  available: boolean;
  retailers: Array<{
    retailerId: string;
    name: string;
    distanceMiles: number;
    price: number;           // cents
    quantity: number;
    stockStatus: 'in_stock' | 'low_stock';
    fulfillmentOptions: string[];  // ['pickup', 'delivery']
    lastSyncedAt: string;    // ISO timestamp
  }>;
}
```

**Performance:**
- PostGIS GIST index on `retailers.location` is critical for query speed
- Composite index on `retailer_inventory(wine_id, retailer_id)` for the join
- Consider response caching (60-second TTL) for frequently requested wines
- Query only `in_stock` and `low_stock` items — exclude `out_of_stock`

**Route implementation:**
- `GET` handler in Route Handler format
- Zod validates query params
- Calls `getAvailabilityForWine()` DAL function
- No auth required (public data), but rate-limited

---

### [EPIC-06/STORY-10] — Retailer Onboarding Form and CSV Upload UI

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want to sign up and upload my initial inventory via a guided onboarding form so that my store appears on Cru quickly.

#### Acceptance Criteria

```gherkin
Given a retailer visits the onboarding page
When they complete the multi-step form
Then an organization, membership, and retailer record are created

Given the form requires address input
When the retailer enters their address
Then it geocodes to lat/lng and displays a map pin for confirmation

Given the retailer reaches the inventory step
When they upload a CSV file
Then the file is validated for size (< 10MB) and format, and a preview shows

Given the form submission succeeds
When the retailer is redirected
Then they see their dashboard with import status and a "processing" indicator

Given the form has validation errors
When the retailer submits
Then inline errors appear on the specific fields with corrective guidance
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/retailer-onboarding/page.tsx` | Create |
| Component | `components/features/retailer-onboarding/OnboardingWizard.tsx` | Create |
| Component | `components/features/retailer-onboarding/StoreDetailsStep.tsx` | Create |
| Component | `components/features/retailer-onboarding/POSSelectionStep.tsx` | Create |
| Component | `components/features/retailer-onboarding/CSVUploadStep.tsx` | Create |
| Component | `components/features/retailer-onboarding/FulfillmentStep.tsx` | Create |
| Action | `lib/actions/retailer-onboarding.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-01 — needs retailers table
- **Blocked by:** EPIC-01/STORY-01 — needs org/membership creation
- **Blocked by:** EPIC-06/STORY-13 — needs UX wireframes
- **Blocks:** EPIC-06/STORY-11 — CSV mapping UI extends from upload step

#### Testing Requirements

- [ ] **Unit:** Form validation catches missing required fields
- [ ] **Integration:** Full form submission creates org + membership + retailer records
- [ ] **Accessibility:** All form fields have labels, error messages are announced to screen readers
- [ ] **E2E:** Complete onboarding flow from form to dashboard redirect

#### Implementation Notes

**Multi-Step Wizard:**
1. **Store Details** — name, address (with geocoding), phone, email, website
2. **POS Selection** — radio group: Square, Lightspeed, Shopify, Clover, CSV Only, Other
3. **Fulfillment** — checkboxes: pickup, delivery (+ radius slider if delivery selected)
4. **Initial Inventory** — CSV upload dropzone with template download link
5. **Review & Submit** — summary of all entries, submit button

**Geocoding:**
- Use a geocoding API (e.g., Mapbox or Google Geocoding) to convert address → lat/lng
- Display a small map preview using Mapbox GL or Google Maps embed for visual confirmation
- Store as PostGIS geography point

**Form state management:** Use `react-hook-form` with Zod resolver for multi-step validation. Persist state across steps with form context.

**CSV template download:** Provide a downloadable `.csv` template file with example data and column headers.

---

### [EPIC-06/STORY-11] — CSV Column Mapping and Import Preview UI

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want to map my CSV columns to Cru's expected format and preview the import before confirming so that I can catch errors before my inventory goes live.

#### Acceptance Criteria

```gherkin
Given a retailer uploads a CSV with non-standard column names
When the mapping UI renders
Then it auto-detects likely mappings and allows manual override via dropdowns

Given the column mapping is complete
When the retailer clicks "Preview Import"
Then a table shows the first 20 rows with mapped values and highlights any validation errors

Given the preview shows validation errors
When the retailer reviews them
Then errors are highlighted in red with specific messages (e.g., "Invalid price: -5.00")

Given the retailer confirms the import
When they click "Start Import"
Then the CSV is processed through the import pipeline and they see a progress indicator

Given an import completes
When the results are shown
Then a summary displays: X matched, Y pending review, Z errors
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/csv-import/ColumnMapper.tsx` | Create |
| Component | `components/features/csv-import/ImportPreview.tsx` | Create |
| Component | `components/features/csv-import/ImportProgress.tsx` | Create |
| Component | `components/features/csv-import/ImportSummary.tsx` | Create |
| Page | `app/(app)/[orgSlug]/inventory/import/page.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-03 — needs CSV import pipeline
- **Blocked by:** EPIC-06/STORY-13 — needs UX wireframes for mapping UI
- **Blocks:** None (end of import flow)

#### Testing Requirements

- [ ] **Unit:** Auto-detection maps "Wine Name" → wine_name, "Winery" → producer, etc.
- [ ] **Unit:** Preview correctly highlights validation errors per row
- [ ] **Accessibility:** Column mapping dropdowns are keyboard navigable
- [ ] **E2E:** Full flow from upload → map → preview → confirm → summary

#### Implementation Notes

**Column auto-detection:**
- Maintain a dictionary of common column name variations per target field
- Score each CSV column header against the dictionary, suggest the best match
- Allow retailer to override any mapping via dropdown selects
- Required mappings: wine_name, price, quantity (minimum viable import)
- Optional mappings: producer, vintage, varietal, sku

**Preview table:**
- Use Shadcn/ui `<Table>` with virtualization if > 100 rows
- Red-highlighted cells for validation errors with tooltip error messages
- Green-highlighted cells for auto-detected mappings
- Gray cells for unmapped optional columns

**Import progress:**
- After confirmation, show a polling-based progress indicator
- Poll import status every 3 seconds until completion
- On completion, show ImportSummary with matched/review/error counts

**This is the most complex UI in this epic** — the column mapping interaction needs to be intuitive for non-technical retail staff. Close collaboration with UX designer.

---

### [EPIC-06/STORY-12] — Admin Wine Matching Review Interface

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a Cru content admin, I want to review unmatched and low-confidence wine matches so that retailer inventory links to the correct canonical wine records.

#### Acceptance Criteria

```gherkin
Given the wine_match_queue has pending entries
When an admin opens the review page
Then they see a filterable, sortable list of pending matches with retailer name, raw wine data, and suggested match (if any)

Given an entry has a suggested match (70-90% confidence)
When the admin reviews it
Then they see the raw CSV data side-by-side with the suggested Cru wine record and can approve or reject

Given an entry is unmatched (<70% confidence)
When the admin reviews it
Then they can search the Cru wine database to find a manual match, or create a new wine record

Given the admin creates a new wine record from an unmatched entry
When they click "Create Wine"
Then a new wine record is created in the wines table pre-populated with CSV data, and the match is resolved

Given matches are resolved (approved, rejected, or new wine created)
When the resolution is saved
Then the wine_match_queue entry is updated and (if approved) the retailer_inventory record is created
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/admin/wine-matching/page.tsx` | Create |
| Component | `components/features/wine-matching/MatchQueueTable.tsx` | Create |
| Component | `components/features/wine-matching/MatchReviewCard.tsx` | Create |
| Component | `components/features/wine-matching/WineSearchModal.tsx` | Create |
| Component | `components/features/wine-matching/CreateWineForm.tsx` | Create |
| Action | `lib/actions/wine-matching.ts` | Modify |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-04 — match queue must be populated
- **Blocked by:** EPIC-04/STORY-01 — needs wines table for search and match resolution
- **Blocked by:** EPIC-06/STORY-13 — needs UX wireframes

#### Testing Requirements

- [ ] **Unit:** Match resolution correctly updates queue status and creates inventory records
- [ ] **Unit:** Wine search returns relevant results from canonical database
- [ ] **Accessibility:** Table is navigable with keyboard, review cards have proper focus management
- [ ] **RLS:** Only platform admins can access this page (not retailer staff)

#### Implementation Notes

**Admin-only page:** This page lives under `app/(app)/admin/` and is restricted to users with platform admin role. Not visible to retailer organizations.

**Match review workflow:**
1. Admin sees queue table with filters: status (pending/unmatched/all), retailer, date range
2. Click a row to expand the review card
3. Side-by-side view: left = raw CSV data, right = suggested Cru wine (or search)
4. Actions: Approve Match, Reject, Search for Different Wine, Create New Wine
5. Batch actions: approve all high-confidence matches (>85%) in one click

**Wine search modal:** Instant search against wines table by name, producer, vintage. Uses the same trigram similarity as the matching engine for relevant results.

---

### [EPIC-06/STORY-13] — UX Design and User-Facing Copy

**Type:** design + copy
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend

#### User Story

As a product team, I want polished wireframes and copy for the entire retailer integration flow so that the UI is intuitive for non-technical retail partners and the admin matching experience is efficient.

#### Acceptance Criteria

```gherkin
Given the retailer onboarding flow
When UX delivers wireframes
Then they include: store details form, POS selection, fulfillment config, CSV upload, review & submit

Given the CSV import flow
When UX delivers wireframes
Then they include: column mapping UI, import preview table, progress indicator, results summary

Given the admin matching review
When UX delivers wireframes
Then they include: queue table, side-by-side review card, wine search modal, create wine form

Given all user-facing text
When marketing-writer delivers copy
Then it includes: form labels, help text, error messages, empty states, confirmation messages, email notification templates (sync success/failure)

Given a non-technical retailer
When they use the onboarding flow
Then the copy guides them without requiring POS or CSV jargon knowledge
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `.claude/work-plan/designs/retailer-onboarding-wireframes.md` | Create |
| Design | `.claude/work-plan/designs/csv-import-wireframes.md` | Create |
| Design | `.claude/work-plan/designs/wine-matching-admin-wireframes.md` | Create |
| Copy | `.claude/work-plan/copy/retailer-integration-copy.md` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-01 — needs schema to understand data model
- **Blocks:** EPIC-06/STORY-10, STORY-11, STORY-12 — frontend stories need wireframes

#### Testing Requirements

- [ ] **Accessibility:** All wireframes annotated with ARIA roles and keyboard navigation
- [ ] **Accessibility:** Color contrast meets WCAG 2.1 AA for all states

#### Implementation Notes

**UX priorities:**
- Retailer onboarding must feel as simple as a Shopify signup — minimize steps, maximize progressive disclosure
- CSV column mapping is the riskiest UX — most retailers have never done this. Auto-detection + drag-and-drop column assignment
- Admin matching review needs efficiency — keyboard shortcuts for approve/reject, batch operations
- Mobile-responsive: retailers may onboard from a phone between customers

**Copy priorities:**
- Zero jargon in retailer-facing flows — "Upload your wine list" not "Import CSV inventory feed"
- Error messages should be helpful, not technical — "We couldn't read row 47. The price column seems empty." not "Validation error: price is required at index 46"
- Email templates: warm, professional tone — retailers are business partners, not end users
- Include microcopy for POS selection explaining what each integration means and how it helps

---

## Story Summary

| Story | Title | Points | Agent | Phase |
|-------|-------|--------|-------|-------|
| STORY-01 | Create Retailers and Inventory Schema with PostGIS | 8 | sr-backend | Backend |
| STORY-02 | DAL Functions for Retailers and Inventory | 5 | sr-backend | Backend |
| STORY-03 | CSV Import Pipeline | 5 | sr-backend | Backend |
| STORY-04 | Fuzzy Wine Matching Engine | 8 | sr-backend | Backend |
| STORY-05 | POSAdapter Interface and Square Integration | 5 | sr-backend | Backend |
| STORY-06 | Lightspeed Retail Adapter | 5 | fullstack-3 | Backend |
| STORY-07 | Shopify POS and Clover Adapters | 5 | fullstack-3 | Backend |
| STORY-08 | Inventory Sync Scheduling and Error Handling | 5 | devops | Backend |
| STORY-09 | Availability API Endpoint | 3 | sr-backend | Backend |
| STORY-10 | Retailer Onboarding Form and CSV Upload UI | 5 | fullstack-2 | Frontend |
| STORY-11 | CSV Column Mapping and Import Preview UI | 8 | fullstack-1 | Frontend |
| STORY-12 | Admin Wine Matching Review Interface | 5 | fullstack-4 | Frontend |
| STORY-13 | UX Design and User-Facing Copy | 5 | ux-designer + marketing-writer | Frontend |
| **Total** | | **72** | | |

## Dependency Graph

```
EPIC-01/STORY-01 (organizations table)
  └─→ EPIC-06/STORY-01 (retailers + inventory schema)
        └─→ EPIC-06/STORY-02 (DAL functions)
              ├─→ EPIC-06/STORY-03 (CSV import pipeline)
              │     └─→ EPIC-06/STORY-04 (fuzzy matching engine)
              │           └─→ EPIC-06/STORY-12 (admin matching review UI)
              ├─→ EPIC-06/STORY-05 (POSAdapter + Square)
              │     ├─→ EPIC-06/STORY-06 (Lightspeed adapter)
              │     ├─→ EPIC-06/STORY-07 (Shopify + Clover adapters)
              │     └─→ EPIC-06/STORY-08 (sync scheduling)
              └─→ EPIC-06/STORY-09 (availability API)
                    └─→ EPIC-05/STORY-07 (retailer selection UI)
                    └─→ EPIC-02 (availability dots in Search)

EPIC-06/STORY-13 (UX + copy) ──→ STORY-10, STORY-11, STORY-12 (frontend stories)
EPIC-06/STORY-03 ──→ EPIC-06/STORY-11 (CSV mapping UI calls import pipeline)
EPIC-06/STORY-01 ──→ EPIC-06/STORY-10 (onboarding form creates retailer record)

EPIC-04/STORY-01 (wines table) ──→ EPIC-06/STORY-04 (matching needs wines to match against)
```

## Critical Path

**STORY-01 → STORY-02 → STORY-03 → STORY-04** (schema → DAL → CSV pipeline → matching engine)

This is the foundational data pipeline. Once matching works, POS adapters (STORY-05/06/07) and sync scheduling (STORY-08) can be built in parallel. Frontend stories (STORY-10/11/12) run in parallel during Checkpoint 4, gated by STORY-13 (UX design).
