# Epic: [EPIC-02] — Search & Browse

**Source PRD:** `docs/prds/prd-02-search-browse.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 7,500
**Build Order:** #2 (Track A — immediately after User Accounts)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-4, ux-designer, marketing-writer, qa

## Epic Summary

Search & Browse is the primary discovery engine that lets users find wines through multiple paths: keyword search, region, varietal, occasion/mood, producer, and recency. It serves both users who know exactly what they want ("Domaine Tempier Bandol Rosé") and explorers who only know how they feel ("something fun for Tuesday night"). This epic builds the wines catalog schema, full-text search infrastructure, filter system, Wine Card component, and all browse pages — forming the foundation that Taste Profile, Curation, and the commerce funnel build upon.

## Success Criteria

- [ ] Users can search wines by keyword across name, producer, varietal, region, and appellation with <2s results
- [ ] Autocomplete suggestions appear within 300ms of typing (debounced)
- [ ] Browse modes work for Region, Varietal, Occasion, Producer, and "New on Cru"
- [ ] Filters (price, varietal, region, available nearby, producer attributes) narrow results correctly
- [ ] Wine Card displays name, producer, varietal, region, vintage, price, story hook (≤120 chars), availability indicator
- [ ] 60%+ of sessions reach a wine detail page within 2 minutes
- [ ] SEO routes are indexable: `/wines/region/[region]`, `/wines/varietal/[varietal]`, `/wines/occasion/[occasion]`
- [ ] All browse pages are mobile-first responsive with filter drawer on mobile

## Architecture Dependencies

- **Database tables:** `wines` (with tsvector), `wine_tags`, `wine_occasions` (all content-scoped, org_id = platform org per CG-2)
- **Search infrastructure:** PostgreSQL FTS + `pg_trgm` extension (ADR-003)
- **External integrations:** None (search is internal)
- **Shared components:** Wine Card (reused by EPIC-07 curation, EPIC-04 producer pages, EPIC-01 wishlist)

## Cross-Cutting Concerns

- **wines table** — foundational table referenced by wishlists (EPIC-01), taste_profiles (EPIC-03), orders (EPIC-05), retailer_inventory (EPIC-06), curation (EPIC-07)
- **Wine Card component** — shared UI used across browse, curation, wishlist, producer portfolio, and search results
- **Location-based filtering** — "Available nearby" toggle depends on user preferences (EPIC-01) and retailer inventory (EPIC-06)
- **FTS infrastructure** — tsvector generation trigger reused if search expands to producer content

## Technical Risks & Open Questions

- [ ] **FTS performance at scale**: PostgreSQL FTS is sufficient for <5K wines. Need benchmark plan for 5K-10K migration threshold to Meilisearch (ADR-003)
- [ ] **Multi-retailer pricing display**: When a wine is available at multiple retailers with different prices, display rule needed (lowest price? range?)
- [ ] **Occasion taxonomy**: 12 categories defined in architecture — confirm final list matches content team tagging
- [ ] **"Available nearby" without EPIC-06**: Browse builds before retailer inventory exists. Need graceful handling when no inventory data exists yet (hide the toggle or show "coming soon")

---

## Developer Stories

> Individual story files are located in `.claude/work-plan/stories/epic-02/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-02/story-01-wines-catalog-schema.md) | Wines Catalog Schema & FTS Setup | backend | 8 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-02/story-02-search-wines-dal.md) | Search Wines DAL & Server Actions | backend | 5 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-02/story-03-recent-searches.md) | Recent Searches | backend | 3 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-02/story-04-browse-design.md) | Browse Page Layout & Wine Card Design | design | 5 | ux-designer | CP4 | pending |
| [STORY-05](../stories/epic-02/story-05-browse-copy.md) | Browse & Search Page Copy | copy | 3 | marketing-writer | CP4 | pending |
| [STORY-06](../stories/epic-02/story-06-wine-card-component.md) | Wine Card Component | frontend | 5 | fullstack-1 | CP4 | pending |
| [STORY-07](../stories/epic-02/story-07-search-bar-autocomplete.md) | Search Bar with Autocomplete | frontend | 5 | fullstack-1 | CP4 | pending |
| [STORY-08](../stories/epic-02/story-08-browse-pages.md) | Browse Pages | frontend | 8 | fullstack-4 | CP4 | pending |
| [STORY-09](../stories/epic-02/story-09-wine-detail-page.md) | Wine Detail Page | frontend | 5 | fullstack-4 | CP4 | pending |
| [STORY-10](../stories/epic-02/story-10-seo-sitemap.md) | SEO Metadata & Sitemap | frontend | 3 | fullstack-1 | CP4 | pending |

**Total: 10 stories, 50 story points**

