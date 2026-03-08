### [EPIC-02/STORY-08] — Build browse pages (region, varietal, occasion, producer, new)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want multiple entry points to discover wines — by region, varietal, occasion, producer, or recency — so that I can navigate in the way that feels most natural to me.

#### Acceptance Criteria

```gherkin
Given I navigate to /wines/region
When the page loads
Then I see a list of regions with descriptions and wine counts, linking to sub-pages

Given I navigate to /wines/region/france
When the page loads
Then I see French wines grouped by sub-region (Burgundy, Bordeaux, Rhône, etc.) with descriptions

Given I navigate to /wines/occasion/weeknight-dinner
When the page loads
Then I see wines tagged with "weeknight dinner" occasion displayed as Wine Cards

Given I navigate to /wines/varietal/pinot-noir
When the page loads
Then I see all Pinot Noir wines with the varietal description at top and Wine Cards below

Given I apply filters (price: $20-35, available nearby: true)
When filter change completes
Then the wine list updates showing only matching wines with filter chips visible

Given I navigate to /wines/new
When the page loads
Then wines are sorted by created_at descending showing most recently added first

Given I am on mobile
When I tap the filter button
Then a filter drawer slides up from the bottom with all filter controls
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/wines/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/region/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/region/[region]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/varietal/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/varietal/[varietal]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/occasion/[occasion]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/new/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/wines/search/page.tsx` | Create |
| Component | `components/features/browse/BrowseLanding.tsx` | Create |
| Component | `components/features/browse/FilterPanel.tsx` | Create |
| Component | `components/features/browse/FilterDrawer.tsx` | Create |
| Component | `components/features/browse/WineGrid.tsx` | Create |
| Component | `components/features/browse/RegionCard.tsx` | Create |
| Component | `components/features/browse/BrowseEmptyState.tsx` | Create |
| Loading | `app/(app)/[orgSlug]/wines/loading.tsx` | Create |
| Error | `app/(app)/[orgSlug]/wines/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-02 (wines DAL), EPIC-02/STORY-04 (design), EPIC-02/STORY-05 (copy), EPIC-02/STORY-06 (Wine Card)
- **Blocks:** None directly (but EPIC-03 and EPIC-07 pages link into browse)

#### Testing Requirements

- [ ] **E2E (Playwright):** Navigate browse landing → region → sub-region → see wines
- [ ] **E2E (Playwright):** Apply price filter → results narrow correctly
- [ ] **Accessibility:** axe-core on browse landing, region page, search results
- [ ] **Unit:** Filter state syncs with URL search params
- [ ] **Visual:** Mobile filter drawer, desktop sidebar, responsive grid

#### Implementation Notes

- Browse pages are Server Components that fetch data via DAL with `<Suspense>` boundaries around the wine grid.
- Filters use URL search params (not client state) so that filtered views are shareable/bookmarkable: `?price_min=20&price_max=35&varietal=pinot-noir`.
- Filter panel: Client Component for interactivity, updates URL params on change, triggers Server Component re-render.
- SEO: each browse route generates `<title>` and `<meta description>` via `generateMetadata()`. Include JSON-LD BreadcrumbList.
- Mobile filter drawer: use Shadcn `<Sheet>` component from bottom. Show active filter count badge on the filter button.
- Empty state: when zero results, show suggestions ("Try widening your price range" or "Browse all [region] wines").
- Wine grid: use CSS Grid with responsive columns (1 on mobile, 2 on tablet, 3-4 on desktop).
- Pagination: "Load more" button at bottom (not infinite scroll for V1 — keeps server component model simple).
