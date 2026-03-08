# Epic: [EPIC-04] — Producer Storytelling

**Source PRD:** `docs/prds/prd-04-producer-storytelling.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 6,000
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-4, ux-designer, marketing-writer

## Epic Summary

Producer Storytelling is the content heart of Cru — the feature that transforms a wine catalogue into a platform worth visiting. This epic delivers producer profile pages, wine detail pages, the CMS content model (producers, wines, producer_photos tables), photo galleries, SEO optimization (JSON-LD, OG tags, ISR), and the admin content management interface for the Cru editorial team. It embodies Product Principle #5 (The farmer earns the spotlight) and Product Principle #2 (Stories over scores).

## Success Criteria

- [ ] Producer profiles render hero, story, quick facts, wine portfolio, and photo gallery in a single desktop scroll
- [ ] Wine detail pages show producer story hook, tasting description, food pairings, and retailer availability
- [ ] Producer and wine pages are SEO-indexable with JSON-LD structured data and OG tags
- [ ] 30-50 producer profiles can be seeded via admin interface or seed scripts before launch
- [ ] Producer page → wine click-through rate trackable (target: 30%)
- [ ] Wine pages with no local availability show "Wishlist + Notify me" CTA instead of buy buttons
- [ ] All content tables have RLS with public SELECT and platform-org-admin-only writes

## Architecture Dependencies

- **Database tables:** `producers`, `wines`, `producer_photos` (content-scoped, org_id = platform org)
- **Medusa sync:** `wines` table INSERT/UPDATE triggers Supabase Database Webhook → Next.js sync endpoint → Medusa Product creation (per CG-1 resolution, ADR-002)
- **Depends on:** `profiles` table (EPIC-01/STORY-01) for auth context; `organizations` table for platform org reference
- **Downstream:** EPIC-02 Search & Browse indexes wine/producer content; EPIC-03 Taste Profile uses `wines.flavor_profile` for matching; EPIC-07 Curation Engine references producer content in explanations; EPIC-05 Order Placement links from wine detail page
- **Shared components:** Photo gallery component (reusable), wine card component (shared with Search & Browse), producer card component

## Cross-Cutting Concerns

- **CG-2 Table Categorization:** `producers`, `wines`, and `producer_photos` are content-scoped tables. Per CG-2 resolution (Checkpoint 1 approved), they have `org_id` referencing the platform organization's ID. SELECT policy is permissive (all authenticated users). Write policies require platform org membership with admin role.
- **CG-1 Medusa Sync:** Wine data lives in Supabase as source of truth. A database webhook on the `wines` table triggers one-directional sync to Medusa Products. Wine can exist in Supabase without a Medusa Product (for discovery/storytelling before retail availability).
- **Shared wine card:** The wine card component used in the producer portfolio grid is the same component used in Search & Browse results (EPIC-02). Coordinate with EPIC-02 on props/interface.
- **Content seeding:** 30-50 producer profiles and 100-150+ wines need human-written content. This is the longest lead-time item outside engineering (Weeks 4-8). Engineering must provide tooling (seed scripts, admin UI) early.
- **Rich text storage:** Story content stored as Markdown in the database (simpler for V1, per PRD open question). Structured content format (ProseMirror JSON) deferred to P1 Editorial Content.

## Technical Risks & Open Questions

- [ ] Content authoring: Who writes the 30-50 launch profiles? Budget/timeline implications for content seeding tooling priority.
- [ ] Rich text rendering: Markdown is chosen for V1, but need to ensure sanitization (XSS prevention) when rendering user-authored Markdown.
- [ ] Photo storage: Where do producer/wine images live? Supabase Storage with CDN? External CDN? This affects `hero_image_url` and `image_url` column design.
- [ ] ISR revalidation strategy: How frequently do producer/wine pages revalidate? On-demand (webhook from admin update) vs. time-based (every 1 hour)?
- [ ] `medusa_product_id` back-reference: When Medusa Product is created for a wine, the ID must be stored back on the Supabase `wines` row (per CG-1 resolution).

---

## Developer Stories

---

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

---

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

---

### [EPIC-04/STORY-03] — Server Actions for producer and wine content management

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform admin, I want Server Actions for creating and updating producers, wines, and photos so that the admin interface can manage content through validated, authorized mutations.

#### Acceptance Criteria

```gherkin
Given a platform admin calls createProducerAction with valid data
When the action executes
Then it validates with Zod, checks auth (getUser), checks platform org admin permission, calls DAL createProducer, revalidates /producers and /producers/[slug], and returns { data: producer }

Given a non-admin calls createProducerAction
When the action executes
Then it returns { error: 'Unauthorized' } without modifying data

Given a platform admin calls updateWineAction with partial update
When the action executes
Then it validates partial data, checks auth + permission, calls DAL updateWine, revalidates /wines/[slug], and returns { data: wine }

Given invalid data is submitted (e.g., tagline > 150 chars)
When the action executes
Then Zod validation fails and returns { error: 'Validation failed: ...' }

Given a platform admin calls addProducerPhotoAction
When the action executes with producer_id and image_url
Then it validates, checks auth + permission, calls DAL addProducerPhoto, revalidates /producers/[slug], and returns { data: photo }

Given a platform admin calls deleteProducerPhotoAction
When the action executes with a valid photo id
Then it checks auth + permission, calls DAL deleteProducerPhoto, revalidates, and returns { data: { success: true } }
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/producers.ts` | Create |
| Action | `lib/actions/wines.ts` | Create |
| Validation | `lib/validations/producers.ts` | Create |
| Validation | `lib/validations/wines.ts` | Create |
| Test | `lib/actions/__tests__/producers.test.ts` | Create |
| Test | `lib/actions/__tests__/wines.test.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-02 — DAL functions must exist
- **Blocks:** EPIC-04/STORY-07 (Admin Content Management UI)

#### Testing Requirements

- [ ] **Unit:** Zod schemas reject invalid data (tagline too long, missing required fields, invalid vintage year)
- [ ] **Integration:** Server Actions succeed with valid data + platform admin auth, fail with non-admin auth
- [ ] **Edge cases:** Duplicate slug returns appropriate error; updating non-existent producer returns error

#### Implementation Notes

- Pattern: `'use server'` → Zod validate → `supabase.auth.getUser()` → check membership role in platform org → DAL call → `revalidatePath()` → return `{ data }` or `{ error }`.
- Zod schemas: `createProducerSchema`, `updateProducerSchema` (partial), `createWineSchema`, `updateWineSchema` (partial), `producerPhotoSchema`.
- Slug generation: auto-generate from name using `slugify()` on create if not provided. Ensure uniqueness (append -2, -3 if needed).
- `revalidatePath` targets: `/producers`, `/producers/[slug]`, `/wines`, `/wines/[slug]` as appropriate.

---

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

---

### [EPIC-04/STORY-05] — Producer Profile Page (frontend)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to visit a producer's profile page and see their story, quick facts, wine portfolio, and photo gallery so that I feel a connection to the person behind the wine.

#### Acceptance Criteria

```gherkin
Given a user navigates to /producers/[slug]
When the page loads
Then they see the hero section (name, region/country, hero photo, tagline), story section (rendered Markdown), quick facts sidebar, wine portfolio grid, and photo gallery — all within a single scroll on desktop

Given the producer has 5 wines on Cru
When the portfolio section renders
Then all 5 active wines display with wine name, vintage, varietal, price range, and a link to the wine detail page

Given the producer has 4 photos
When the gallery section renders
Then photos display as a horizontally scrollable gallery with captions, ordered by display_order

Given a producer's slug does not exist
When the user navigates to /producers/[nonexistent-slug]
Then a 404 page renders with a "Browse all producers" link

Given the page URL is shared on social media
When the link preview renders
Then it shows the producer's hero photo, name, and tagline via Open Graph meta tags

Given a search engine crawls /producers/[slug]
When it parses the page
Then it finds valid JSON-LD structured data (Organization schema type for the producer)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/producers/[slug]/page.tsx` | Create |
| Page | `app/(app)/producers/[slug]/loading.tsx` | Create |
| Page | `app/(app)/producers/[slug]/error.tsx` | Create |
| Component | `components/features/producers/ProducerHero.tsx` | Create |
| Component | `components/features/producers/ProducerStory.tsx` | Create |
| Component | `components/features/producers/ProducerQuickFacts.tsx` | Create |
| Component | `components/features/producers/ProducerWineGrid.tsx` | Create |
| Component | `components/features/producers/PhotoGallery.tsx` | Create |
| Metadata | `app/(app)/producers/[slug]/opengraph-image.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-02 — DAL functions for data fetching
- **Blocked by:** EPIC-04/STORY-08 — marketing-writer provides all page copy and microcopy
- **Coordinate with:** EPIC-02 for shared WineCard component interface
- **Blocks:** None directly, but UX-designer should review before CHECKPOINT 4 approval

#### Testing Requirements

- [ ] **E2E:** Producer page loads with all 5 sections visible and correct data
- [ ] **Accessibility:** axe-core clean on producer profile page (focus management, alt text on images, heading hierarchy)
- [ ] **SEO:** JSON-LD validates against Schema.org Organization type
- [ ] **SEO:** Open Graph tags include og:title, og:description, og:image
- [ ] **404:** Non-existent slug renders 404 with navigation options
- [ ] **Responsive:** Page renders correctly on mobile (single column), tablet, desktop

#### Implementation Notes

- This is a Server Component — fetch data with DAL functions in the page component, no client-side data fetching.
- Use `generateMetadata()` for dynamic OG tags per producer.
- Markdown rendering: Use a library like `react-markdown` with `rehype-sanitize` for XSS prevention. Never use `dangerouslySetInnerHTML`.
- Photo gallery: Consider a lightweight component (not a heavy carousel library). Horizontal scroll with CSS `overflow-x: auto` and snap points is simplest.
- ISR: Use `export const revalidate = 3600` (1 hour) or on-demand revalidation via the admin update Server Action.
- Producer page route is outside `[orgSlug]` — this is public content, not org-scoped. Route: `app/(app)/producers/[slug]/page.tsx`.
- Wine portfolio grid reuses the WineCard component from EPIC-02. If EPIC-02 hasn't built it yet, define the interface here and let EPIC-02 adopt it.

---

### [EPIC-04/STORY-06] — Wine Detail Page (frontend)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to visit a wine detail page and see the tasting description, food pairings, producer story hook, and local availability so that I can decide whether to buy it.

#### Acceptance Criteria

```gherkin
Given a user navigates to /wines/[slug]
When the page loads
Then they see wine name, vintage, varietal, region, appellation, tasting description (plain language), food pairings, producer story hook (2-3 sentences + "Read full story →" link), price, and availability section

Given a wine is in stock at 2 local retailers
When the availability section renders
Then both retailers appear with their price and a "Buy from [store name]" button linking to Order Placement

Given a wine has no local availability
When the page renders
Then a "Wishlist + Notify me when available nearby" CTA replaces the buy buttons

Given the user clicks "Read full story →"
When the link is followed
Then they navigate to /producers/[producer-slug]

Given the user clicks the Wishlist button
When they are authenticated
Then the wine is added to their wishlist (or removed if already wishlisted)

Given the user clicks the Share button
When the share dialog opens
Then they can share the wine page URL via native share or copy link

Given a wine's slug does not exist
When the user navigates to /wines/[nonexistent-slug]
Then a 404 page renders with a "Browse all wines" link

Given a search engine crawls /wines/[slug]
When it parses the page
Then it finds valid JSON-LD structured data (Product + Offer schema)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/wines/[slug]/page.tsx` | Create |
| Page | `app/(app)/wines/[slug]/loading.tsx` | Create |
| Page | `app/(app)/wines/[slug]/error.tsx` | Create |
| Component | `components/features/wines/WineDetailHero.tsx` | Create |
| Component | `components/features/wines/TastingDescription.tsx` | Create |
| Component | `components/features/wines/FoodPairings.tsx` | Create |
| Component | `components/features/wines/ProducerHook.tsx` | Create |
| Component | `components/features/wines/AvailabilitySection.tsx` | Create |
| Component | `components/features/wines/WishlistButton.tsx` | Create |
| Component | `components/features/wines/ShareButton.tsx` | Create |
| Metadata | `app/(app)/wines/[slug]/opengraph-image.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-02 — DAL functions for data fetching
- **Blocked by:** EPIC-04/STORY-08 — marketing-writer provides all page copy and microcopy
- **Coordinate with:** EPIC-05 Order Placement for "Buy from [store name]" button behavior and retailer availability data model
- **Coordinate with:** EPIC-03 for wishlist data model (wishlist_items table)

#### Testing Requirements

- [ ] **E2E:** Wine detail page loads with correct data for all sections
- [ ] **E2E:** "Buy from [store name]" button links correctly to Order Placement flow
- [ ] **E2E:** Wishlist button toggles correctly and persists state
- [ ] **Accessibility:** axe-core clean (heading hierarchy, button labels, image alt text)
- [ ] **SEO:** JSON-LD validates against Schema.org Product + Offer types
- [ ] **SEO:** OG tags include wine image, name, and description
- [ ] **404:** Non-existent slug renders 404
- [ ] **Responsive:** Page renders correctly on mobile, tablet, desktop

#### Implementation Notes

- Server Component for data fetching; WishlistButton and ShareButton are `'use client'` components.
- Availability section depends on EPIC-06 retailer inventory data. For initial build, accept an `availability` prop and render conditionally. The actual data source (retailer_inventory table + location query) will come from EPIC-06.
- JSON-LD for Product + Offer: include `name`, `description`, `image`, `offers` (with price, availability, seller info per Schema.org spec).
- Share button: Use `navigator.share()` API with fallback to clipboard copy.
- Wishlist: If wishlist_items table isn't built yet (EPIC-03 dependency), stub the button with a placeholder action and connect later.
- `generateMetadata()` for dynamic OG tags per wine.

---

### [EPIC-04/STORY-07] — Admin Content Management UI

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a content team member, I want an admin interface to create and edit producer profiles and wines so that I can seed and manage content without using raw SQL or API calls.

#### Acceptance Criteria

```gherkin
Given a platform admin navigates to /admin/producers
When the page loads
Then they see a table of all producers with name, region, wine count, is_active status, and edit/view actions

Given a platform admin clicks "New Producer"
When the form renders
Then it shows fields for: name, slug (auto-generated from name, editable), region, country, tagline (with character counter, max 150), story_content (Markdown editor with preview), farming_practices (multi-select), vineyard_size, year_established, annual_production, hero_image_url

Given a platform admin submits the new producer form with valid data
When the action completes
Then the producer is created, the admin is redirected to the producer edit page, and a success toast displays

Given a platform admin navigates to /admin/producers/[id]/wines
When the page loads
Then they see the producer's wine portfolio with options to add, edit, or deactivate wines

Given a platform admin adds a new wine
When the form is submitted with valid data
Then the wine is created, linked to the producer, and appears in the portfolio list

Given a platform admin navigates to /admin/producers/[id]/photos
When the page loads
Then they see the photo gallery with drag-to-reorder functionality and options to add/delete photos

Given a non-admin user attempts to access /admin/*
When the route renders
Then they are redirected to the home page (or shown a 403 page)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/admin/producers/page.tsx` | Create |
| Page | `app/(app)/admin/producers/new/page.tsx` | Create |
| Page | `app/(app)/admin/producers/[id]/page.tsx` | Create |
| Page | `app/(app)/admin/producers/[id]/wines/page.tsx` | Create |
| Page | `app/(app)/admin/producers/[id]/photos/page.tsx` | Create |
| Component | `components/features/admin/ProducerForm.tsx` | Create |
| Component | `components/features/admin/WineForm.tsx` | Create |
| Component | `components/features/admin/ProducerTable.tsx` | Create |
| Component | `components/features/admin/PhotoManager.tsx` | Create |
| Layout | `app/(app)/admin/layout.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-03 — Server Actions for mutations
- **Blocked by:** EPIC-04/STORY-02 — DAL functions for data fetching
- **Coordinate with:** ux-designer for admin UI patterns (data tables, forms, navigation)

#### Testing Requirements

- [ ] **E2E:** Admin can create a producer, add wines, and add photos end-to-end
- [ ] **E2E:** Non-admin user is blocked from admin routes
- [ ] **Accessibility:** axe-core clean on all admin pages (form labels, table headers, focus management)
- [ ] **Validation:** Form rejects invalid data and shows inline error messages

#### Implementation Notes

- Admin layout (`app/(app)/admin/layout.tsx`) should check user's platform org membership and role on the server. If not admin, redirect or show 403.
- Markdown editor: Use a simple textarea with a preview toggle (or a lightweight Markdown editor component). Don't over-engineer for V1.
- Photo upload: For V1, accept image URLs (pasted from Supabase Storage or external CDN). Drag-and-drop upload to Supabase Storage is a nice-to-have enhancement.
- Photo reorder: Use a drag-and-drop library (e.g., `@dnd-kit/sortable`) with client-side state, then call `reorderProducerPhotos` Server Action on save.
- Data table: Use Shadcn/ui DataTable with sorting, filtering, pagination.
- Character counter on tagline field: simple `'use client'` component.

---

### [EPIC-04/STORY-08] — UX design and copy for Producer Storytelling pages

**Type:** design + copy
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build)

#### User Story

As the development team, I want finalized UX layouts and all page copy for producer profile pages, wine detail pages, and admin content management so that frontend developers can build to a clear specification.

#### Acceptance Criteria

```gherkin
Given the ux-designer creates layouts for producer profile page
When the layouts are complete
Then they include: hero section with photo/tagline, story section layout, quick facts sidebar positioning, wine portfolio grid (card size, columns, responsive breakpoints), photo gallery scroll behavior, and mobile/tablet/desktop breakpoints

Given the ux-designer creates layouts for wine detail page
When the layouts are complete
Then they include: wine hero with image, tasting description layout, food pairings presentation, producer hook section with "Read full story →" CTA, availability section (in-stock and out-of-stock states), wishlist/share button placement

Given the marketing-writer writes copy for producer pages
When the copy is complete
Then it includes: section headings, empty state messages, CTA button text, error state messages, loading state text, meta description templates, and any instructional microcopy

Given the marketing-writer writes copy for wine detail pages
When the copy is complete
Then it includes: section headings, "Notify me" CTA text, wishlist button states (add/remove), share dialog text, no-availability messaging, and meta description templates

Given the ux-designer creates layouts for admin content management
When the layouts are complete
Then they include: producer table columns and actions, form field layouts, photo manager interactions, and navigation patterns
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `.claude/work-plan/designs/epic-04-producer-profile.md` | Create |
| Design | `.claude/work-plan/designs/epic-04-wine-detail.md` | Create |
| Design | `.claude/work-plan/designs/epic-04-admin-cms.md` | Create |
| Copy | `.claude/work-plan/copy/epic-04-copy-deck.md` | Create |

#### Dependencies

- **Blocked by:** None — this story can start immediately
- **Blocks:** EPIC-04/STORY-05 (Producer Profile Page), STORY-06 (Wine Detail Page), STORY-07 (Admin UI) — frontend build waits on design and copy

#### Testing Requirements

- [ ] **Review:** UX layouts reviewed by pm-orchestrator for completeness
- [ ] **Review:** Copy reviewed by pm-orchestrator for brand voice consistency
- [ ] **Accessibility:** Layouts include focus order annotations and ARIA landmark regions

#### Implementation Notes

- UX designer should reference existing patterns from EPIC-01/EPIC-02/EPIC-03 design work for consistency.
- Marketing writer: All copy must follow Product Principle #2 (Stories over scores) and #5 (The farmer earns the spotlight). No jargon. Second person voice for producer stories.
- Copy deck should include template strings for dynamic content (e.g., `"When you taste {producer}'s {varietal}, you're tasting..."`) used in meta descriptions and story hooks.
- Admin UI design: Prioritize speed and simplicity over polish. This is internal tooling for the content team.

---

### [EPIC-04/STORY-09] — Content seeding script and sample data

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a content team member, I want seed scripts that populate sample producers and wines so that I can test the platform with realistic data and use the scripts as templates for production content seeding.

#### Acceptance Criteria

```gherkin
Given a developer runs the seed script
When it completes
Then at least 5 sample producers are created with complete profiles (name, slug, region, country, tagline, story_content, farming_practices, hero_image_url)

Given the seed script runs
When producers are created
Then each producer has 2-4 sample wines with tasting descriptions, food pairings, and flavor profiles

Given the seed script runs
When producers are created
Then each producer has 2-3 sample photos with captions

Given the seed script is run twice
When it encounters existing data (matching slugs)
Then it upserts rather than duplicating

Given a developer wants to add real launch content
When they look at the seed script
Then the structure is clear enough to use as a template for real producer data entry
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Seed | `supabase/seed-producers.sql` | Create |
| Script | `scripts/seed-producers.ts` | Create (TypeScript alternative using DAL) |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-01 — tables must exist
- **Blocks:** EPIC-04/STORY-05, STORY-06 — frontend pages need data to render during development

#### Testing Requirements

- [ ] **Integration:** Seed script runs without errors against local Supabase
- [ ] **Idempotency:** Running the script twice does not create duplicate data

#### Implementation Notes

- Two options: SQL seed file (`supabase/seed-producers.sql`) for simplicity, or TypeScript script (`scripts/seed-producers.ts`) using DAL functions for type safety and reuse. Prefer TypeScript if DAL functions are ready.
- Sample content should be realistic but clearly fake (e.g., "Domaine des Tests", "Sample Vineyard"). Use placeholder images from a free service.
- Include sample `flavor_profile` JSONB on wines for EPIC-03 taste matching development.
- The `org_id` for all seeded content should reference the platform organization.

---

## Epic Summary Table

| Story | Title | Type | Points | Agent | Phase | Blocked By |
|-------|-------|------|--------|-------|-------|------------|
| STORY-01 | Create producers, wines, producer_photos tables with RLS | backend | 8 | sr-backend | CP3 | EPIC-01/STORY-01 |
| STORY-02 | DAL functions for producers, wines, producer_photos | backend | 5 | sr-backend | CP3 | STORY-01 |
| STORY-03 | Server Actions for content management | backend | 5 | sr-backend | CP3 | STORY-02 |
| STORY-04 | Wine-to-Medusa sync webhook | backend | 5 | sr-backend | CP3 | STORY-01 |
| STORY-05 | Producer Profile Page | frontend | 8 | fullstack-1 | CP4 | STORY-02, STORY-08 |
| STORY-06 | Wine Detail Page | frontend | 8 | fullstack-1 | CP4 | STORY-02, STORY-08 |
| STORY-07 | Admin Content Management UI | fullstack | 8 | fullstack-4 | CP4 | STORY-02, STORY-03 |
| STORY-08 | UX design and copy | design+copy | 5 | ux-designer, marketing-writer | CP4 (pre-build) | None |
| STORY-09 | Content seeding script | backend | 3 | sr-backend | CP3 | STORY-01 |

**Total: 9 stories, 55 story points**
