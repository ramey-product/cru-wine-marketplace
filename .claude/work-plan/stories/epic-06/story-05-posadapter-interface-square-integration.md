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
