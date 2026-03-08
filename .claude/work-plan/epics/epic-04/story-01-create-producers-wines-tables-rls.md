### [EPIC-04/STORY-01] — Create producers, wines, and producer_photos tables with RLS

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want the producers, wines, and producer_photos tables created with proper constraints, indexes, and RLS policies so that content is securely stored with public readability and platform-admin-only writes.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When I inspect the producers table
Then it has columns: id (UUID PK, gen_random_uuid()), org_id (UUID FK to organizations NOT NULL), name (TEXT NOT NULL), slug (TEXT NOT NULL UNIQUE), region (TEXT), country (TEXT), tagline (TEXT CHECK char_length <= 150), story_content (TEXT), farming_practices (JSONB DEFAULT '[]'), vineyard_size (TEXT), year_established (INTEGER), annual_production (TEXT), hero_image_url (TEXT), is_active (BOOLEAN DEFAULT true), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
And there are indexes on org_id, slug, and is_active

Given the migration runs successfully
When I inspect the wines table
Then it has columns: id (UUID PK, gen_random_uuid()), org_id (UUID FK to organizations NOT NULL), producer_id (UUID FK to producers NOT NULL), name (TEXT NOT NULL), slug (TEXT NOT NULL UNIQUE), vintage (INTEGER), varietal (TEXT), region (TEXT), appellation (TEXT), tasting_description (TEXT), food_pairings (JSONB DEFAULT '[]'), flavor_profile (JSONB DEFAULT '{}'), price_min (NUMERIC), price_max (NUMERIC), medusa_product_id (TEXT), is_active (BOOLEAN DEFAULT true), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
And there are indexes on org_id, slug, producer_id, varietal, and is_active

Given the migration runs successfully
When I inspect the producer_photos table
Then it has columns: id (UUID PK, gen_random_uuid()), org_id (UUID FK to organizations NOT NULL), producer_id (UUID FK to producers NOT NULL ON DELETE CASCADE), image_url (TEXT NOT NULL), caption (TEXT), display_order (INTEGER DEFAULT 0), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)
And there is an index on producer_id

Given any authenticated user
When they SELECT from producers, wines, or producer_photos
Then the query succeeds (permissive SELECT for all authenticated users)

Given a user who is NOT a member of the platform org with admin role
When they attempt INSERT/UPDATE/DELETE on producers, wines, or producer_photos
Then the operation is denied by RLS

Given a platform org admin
When they INSERT/UPDATE/DELETE on producers, wines, or producer_photos
Then the operation succeeds
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_producers_wines_tables.sql` | Create |
| Test | `supabase/tests/producers_wines_rls.test.sql` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 — needs `organizations` table and `profiles` table for FK references and RLS auth context
- **Blocks:** EPIC-04/STORY-02, STORY-03, STORY-04, STORY-05, STORY-06, STORY-07, STORY-08 — all downstream stories depend on these tables

#### Testing Requirements

- [ ] **RLS (positive):** Platform org admin can INSERT/UPDATE/DELETE producers, wines, producer_photos
- [ ] **RLS (positive):** Any authenticated user can SELECT all producers, wines, producer_photos
- [ ] **RLS (negative):** Non-platform-org user cannot INSERT/UPDATE/DELETE
- [ ] **RLS (negative):** Non-admin member of platform org cannot INSERT/UPDATE/DELETE (if applicable — clarify role check)
- [ ] **Constraint:** Duplicate slug rejected with unique constraint error
- [ ] **Constraint:** Tagline exceeding 150 chars rejected
- [ ] **Cascade:** Deleting a producer cascades to producer_photos
- [ ] **Index:** Queries filtering by slug, producer_id, org_id use index scans

#### Implementation Notes

- Per CG-2 resolution: These are content-scoped tables. `org_id` always references the platform organization's ID. SELECT is open to all authenticated users. Write operations restricted to platform org admins.
- RLS policy pattern for writes: `EXISTS (SELECT 1 FROM memberships WHERE memberships.user_id = auth.uid() AND memberships.org_id = producers.org_id AND memberships.role IN ('admin', 'owner'))`
- The `wines` table `flavor_profile` JSONB column stores structured flavor data for EPIC-03 taste matching. Schema TBD by sr-backend but should include fields like `body`, `sweetness`, `acidity`, `tannin`, `flavor_tags`.
- `medusa_product_id` on wines is nullable — wines can exist without Medusa products (for editorial/discovery before retail availability).
- Include `update_updated_at()` trigger on all three tables.
