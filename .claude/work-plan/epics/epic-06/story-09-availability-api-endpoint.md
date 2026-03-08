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
