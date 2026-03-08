### [EPIC-02/STORY-02] — Implement search and wines DAL functions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I need DAL functions for querying wines with search, filters, and browse modes so that the frontend can access wine data through the standard data access pattern.

#### Acceptance Criteria

```gherkin
Given a search query "tempier rosé"
When searchWines is called with the query
Then wines matching the FTS query are returned, ranked by relevance

Given filters { varietal: ["Pinot Noir"], price_max: 35, region: ["Burgundy"] }
When getWines is called with filters
Then only wines matching ALL filters are returned

Given a browse mode "by_region" with region="France"
When getWinesByRegion is called
Then wines from France are returned, grouped by sub_region

Given a browse mode "by_occasion" with occasion="weeknight dinner"
When getWinesByOccasion is called
Then wines tagged with that occasion are returned via join with wine_occasions

Given a search query "temp"
When getSearchSuggestions is called
Then autocomplete results include wine names AND varietal names AND producer names matching the prefix/trigram
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/wines.ts` | Create |
| DAL | `lib/dal/search.ts` | Create |
| Validation | `lib/validations/wines.ts` | Create |
| Validation | `lib/validations/search.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-01 (wines tables exist)
- **Blocks:** EPIC-02/STORY-05, EPIC-02/STORY-06, EPIC-02/STORY-07, EPIC-02/STORY-08

#### Testing Requirements

- [ ] **Unit (Vitest):** Search returns relevant results for exact and partial matches
- [ ] **Unit (Vitest):** Filters compose correctly (AND logic across filter types)
- [ ] **Unit (Vitest):** Pagination returns correct page with total count
- [ ] **Unit (Vitest):** Autocomplete returns mixed results (wines, varietals, producers)

#### Implementation Notes

- `lib/dal/wines.ts` functions: `getWines(client, filters, pagination)`, `getWineBySlug(client, slug)`, `getWinesByRegion(client, region)`, `getWinesByVarietal(client, varietal)`, `getWinesByOccasion(client, occasion)`, `getNewWines(client, limit)`, `getWinesByProducer(client, producerId)`.
- `lib/dal/search.ts` functions: `searchWines(client, query, filters, pagination)`, `getSearchSuggestions(client, prefix)`.
- Filter interface: `WineFilters { query?: string, varietals?: string[], regions?: string[], sub_regions?: string[], occasions?: string[], tags?: string[], price_min?: number, price_max?: number, available_nearby?: boolean, producer_id?: string }`.
- Pagination: cursor-based or offset-based. For MVP, offset with `{ page: number, per_page: number }` returning `{ data, total, page, per_page }`.
- `searchWines` uses `to_tsquery` with `plainto_tsquery` fallback for user-friendly query parsing.
- `getSearchSuggestions` combines: (1) wine name trigram matches, (2) varietal DISTINCT matches, (3) producer name matches — limited to 8 total suggestions.
- `available_nearby` filter: initially a no-op until EPIC-06 builds retailer_inventory. Design the interface to accept `{ lat, lng, radius_miles }` but return all wines when inventory data is absent.
