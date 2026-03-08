### [EPIC-04/STORY-02] — DAL functions for producers, wines, and producer_photos

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want typed DAL functions for producers, wines, and producer_photos so that all data access goes through a consistent, type-safe layer.

#### Acceptance Criteria

```gherkin
Given I call getProducerBySlug(client, slug)
When the producer exists and is_active = true
Then it returns the producer row with joined producer_photos ordered by display_order

Given I call getProducerBySlug(client, slug)
When the producer does not exist or is_active = false
Then it returns null

Given I call getWineBySlug(client, slug)
When the wine exists and is_active = true
Then it returns the wine row with joined producer (name, slug, hero_image_url)

Given I call getWinesByProducerId(client, producerId)
When wines exist for that producer
Then it returns all active wines ordered by name, with price range info

Given I call listProducers(client, { limit, offset, farmingPractice? })
When called with optional filters
Then it returns paginated producers ordered by name with total count

Given I call createProducer(client, data)
When called with valid producer data
Then it inserts the row and returns the created producer

Given I call updateProducer(client, id, data)
When called with partial update data
Then it updates only the provided fields and returns the updated producer

Given I call createWine(client, data)
When called with valid wine data including producer_id
Then it inserts the row and returns the created wine

Given I call updateWine(client, id, data)
When called with partial update data
Then it updates only the provided fields and returns the updated wine

Given I call addProducerPhoto(client, data)
When called with producer_id, image_url, and optional caption/display_order
Then it inserts the photo and returns the created row

Given I call deleteProducerPhoto(client, id)
When the photo exists
Then it deletes the row and returns success

Given I call reorderProducerPhotos(client, producerId, orderedIds)
When called with an array of photo IDs in desired order
Then it updates display_order for each photo accordingly
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/producers.ts` | Create |
| DAL | `lib/dal/wines.ts` | Create |
| Types | `types/database.ts` | Regenerate (supabase gen types) |
| Test | `lib/dal/__tests__/producers.test.ts` | Create |
| Test | `lib/dal/__tests__/wines.test.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-01 — tables must exist
- **Blocks:** EPIC-04/STORY-03 (Server Actions), STORY-05 (Producer Profile Page), STORY-06 (Wine Detail Page)

#### Testing Requirements

- [ ] **Unit:** Each DAL function returns correct shape with mocked Supabase client
- [ ] **Integration:** DAL functions work against local Supabase with seeded data
- [ ] **Edge cases:** getProducerBySlug with inactive producer returns null; getWinesByProducerId with no wines returns empty array

#### Implementation Notes

- All DAL functions accept a typed Supabase client as first argument and return the query builder result.
- Use `Database` types from `types/database.ts` for type safety.
- `getProducerBySlug` should include a `.select()` that joins `producer_photos` ordered by `display_order ASC`.
- `getWineBySlug` should join the producer with `.select('*, producer:producers(name, slug, hero_image_url)')`.
- Pagination pattern: return `{ data, count }` using `.range(offset, offset + limit - 1)` with `{ count: 'exact' }`.
