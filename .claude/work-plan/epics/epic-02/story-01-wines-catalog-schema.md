### [EPIC-02/STORY-01] — Create wines, wine_tags, and wine_occasions tables with FTS

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform, I need a wines catalog schema with full-text search support so that the browse and search features have a performant data foundation.

#### Acceptance Criteria

```gherkin
Given the migration is applied
When I inspect the database schema
Then the wines table exists with columns: id (UUID PK), producer_id (FK -> producers.id), name (TEXT), slug (TEXT UNIQUE), varietal (TEXT), region (TEXT), sub_region (TEXT nullable), appellation (TEXT nullable), country (TEXT), vintage (INT nullable), description (TEXT nullable), tasting_description (TEXT nullable), food_pairings (JSONB nullable), flavor_profile (JSONB nullable), story_hook (TEXT nullable), image_url (TEXT nullable), price_min (NUMERIC 10,2 nullable), price_max (NUMERIC 10,2 nullable), is_active (BOOLEAN DEFAULT true), search_vector (tsvector), org_id (UUID FK), created_at, updated_at
And a GIN index exists on search_vector
And a trigger auto-updates search_vector on INSERT/UPDATE using name, varietal, region, sub_region, appellation, country
And wine_tags table exists with: id, wine_id (FK), tag_name (TEXT), org_id, created_at
And wine_occasions table exists with: id, wine_id (FK), occasion_name (TEXT), org_id, created_at
And all tables have RLS enabled with content-scoped policies (SELECT: any authenticated user, write: platform org admins only)
And pg_trgm extension is enabled

Given a wine with name "Domaine Tempier Bandol Rosé" exists
When I search with ts_query 'tempier & rose'
Then the wine appears in results

Given a wine tagged with "natural" and "biodynamic"
When I filter wine_tags WHERE tag_name = 'natural'
Then the wine appears in results
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_wines_catalog.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_enable_pg_trgm.sql` | Create |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-01 (producers table — wines has FK to producers) OR create both in same migration
- **Blocks:** EPIC-02/STORY-02, EPIC-02/STORY-03, EPIC-01/STORY-02 (wishlists FK to wines), EPIC-03 (taste_profile_wines), EPIC-05 (orders), EPIC-06 (inventory)

#### Testing Requirements

- [ ] **RLS (pgTAP):** Any authenticated user can SELECT wines, wine_tags, wine_occasions
- [ ] **RLS (pgTAP):** Non-platform-admin user cannot INSERT/UPDATE/DELETE wines
- [ ] **RLS (pgTAP):** Platform admin CAN INSERT/UPDATE/DELETE wines
- [ ] **Unit:** FTS trigger correctly updates search_vector on wine INSERT and UPDATE
- [ ] **Unit:** pg_trgm similarity query returns expected fuzzy matches

#### Implementation Notes

- Per CG-2, wines are **content-scoped** — they DO have `org_id` but it always references the platform organization. SELECT is permissive for all authenticated users.
- FTS trigger function: `tsvector_update_trigger` or custom function that concatenates `name || ' ' || varietal || ' ' || region || ' ' || COALESCE(sub_region, '') || ' ' || COALESCE(appellation, '') || ' ' || country` weighted appropriately (name = 'A', varietal = 'B', region = 'B', others = 'C').
- `pg_trgm` extension: enables `similarity()` and `%` operator for fuzzy matching. Used by EPIC-06 wine matching and autocomplete.
- Add trigram index: `CREATE INDEX idx_wines_name_trgm ON wines USING gin (name gin_trgm_ops);`
- `slug` column needs unique B-tree index for URL lookups (`/wines/[slug]`).
- `producer_id` FK — if producers table isn't created yet, this migration must create it first (coordinate with EPIC-04/STORY-01). Consider a single migration that creates both.
- `story_hook` is ≤120 chars — enforce at Zod layer, not database (per design principle: `TEXT` over `VARCHAR(n)`).
- `price_min` / `price_max` — these are platform-level suggested prices, not retailer prices. Retailer-specific prices live in `retailer_inventory` (EPIC-06).
