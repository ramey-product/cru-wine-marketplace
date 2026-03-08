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

> Individual story files are located in `.claude/work-plan/stories/epic-04/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-04/story-01-create-producers-wines-tables-rls.md) | Create producers, wines, and producer_photos tables with RLS | backend | 8 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-04/story-02-dal-functions-producers-wines.md) | DAL functions for producers, wines, and producer_photos | backend | 5 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-04/story-03-server-actions-content-management.md) | Server Actions for producer and wine content management | backend | 5 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-04/story-04-wine-medusa-sync-webhook.md) | Wine-to-Medusa sync webhook | backend | 5 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-04/story-05-producer-profile-page.md) | Producer Profile Page (frontend) | frontend | 8 | fullstack-1 | CP4 | pending |
| [STORY-06](../stories/epic-04/story-06-wine-detail-page.md) | Wine Detail Page (frontend) | frontend | 8 | fullstack-4 | CP4 | pending |
| [STORY-07](../stories/epic-04/story-07-admin-content-management-ui.md) | Admin Content Management UI | fullstack | 8 | fullstack-1 | CP4 | pending |
| [STORY-08](../stories/epic-04/story-08-ux-design-copy.md) | UX design and copy for Producer Storytelling pages | design+copy | 5 | ux-designer | CP4 | pending |
| [STORY-09](../stories/epic-04/story-09-content-seeding-script.md) | Content seeding script and sample data | backend | 3 | sr-backend | CP3 | pending |

**Total: 9 stories, 55 story points**
