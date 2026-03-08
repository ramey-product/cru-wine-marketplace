# Epic: [EPIC-07] — AI + Human Curation Engine

**Source PRD:** `docs/prds/prd-07-curation-engine.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 6,000 (MVP scope)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, fullstack-4, ux-designer, marketing-writer

## Epic Summary

The curation engine is Cru's core differentiator — a hybrid rules-based matching engine combined with human-curated collections that delivers personally relevant wine recommendations from Day 1. It uses taste profile data (flavor affinities, aversions, adventurousness) to score wines against user preferences, generates plain-language explanations for each recommendation, and tracks every interaction to build the dataset needed for ML-powered recommendations in Month 5-6. Curated collections provide editorial discovery for all users including those without taste profiles.

## Success Criteria

- [ ] Rules engine returns top 8 recommendations in < 500ms for 1,000-wine catalog
- [ ] Every recommendation includes a human-readable `match_reason` explanation
- [ ] Curated collections are admin-managed with CRUD, ordering, and date-range scheduling
- [ ] Home screen renders "Picked for You" (with profile) or "Popular Near You" (without) + collections
- [ ] Recommendation interactions (impression, click, dismiss, wishlist, purchase) tracked via PostHog Cloud for ML training
- [ ] Dismissed wines excluded from future recommendation runs
- [ ] 15%+ CTR target on "Picked for You" recommendations

## Architecture Dependencies

- **Database tables:** `curated_collections`, `curated_collection_items`, `user_wine_dismissals`
- **Consumed tables:** `taste_profiles` (Epic 03), `wines` with `flavor_profile` JSONB (Epic 04), `retailer_inventory` (Epic 06), `orders` / `wishlists` (Epic 05)
- **External integrations:** PostHog Cloud (free tier — 1M events/month) for recommendation interaction tracking (impressions, clicks, dismisses, wishlists, purchases)
- **Shared components:** Wine cards (Epic 02), availability display (Epic 06)

## Cross-Cutting Concerns

- **CG-2 Table Categorization:**
  - `user_wine_dismissals` = user-scoped (NO `org_id` — tied to `user_id`, lightweight exclusion record for matching engine)
  - `curated_collections` and `curated_collection_items` = content-scoped (`org_id` = platform org)
- **Caching:** Per-user recommendation cache with 1-hour TTL. V1 uses Next.js `unstable_cache` (Vercel-native). Invalidate on taste profile update or new purchase.
- **Wine cards:** Curation sections reuse the same wine card component from Search & Browse (Epic 02) but augmented with `match_reason` display
- **Interaction tracking:** All recommendation events (impression, click, dismiss, wishlist, purchase) are tracked via **PostHog Cloud free tier** (1M events/month, unlimited seats, no credit card required). PostHog serves as the foundational analytics layer for the P2 ML upgrade. The `user_wine_dismissals` Supabase table provides synchronous dismiss lookups for the matching engine — PostHog handles the analytics/reporting side.

## Technical Risks & Open Questions

- [ ] **Caching strategy:** PRD debates Redis (Upstash) vs. Next.js unstable_cache vs. Supabase edge function cache. V1 decision: Next.js unstable_cache for simplicity and Vercel-native performance. Revisit at 5K users if latency degrades.
- [ ] **Catalog sparsity:** With 500 wines and 20 flavor attributes, matching may be sparse for niche profiles. Mitigation: fallback to "Popular Near You" when < 6 personalized matches.
- [ ] **Scoring formula tuning:** The weighted scoring formula is a best guess pre-launch. Need rapid iteration based on early CTR data. Engine should make weights configurable, not hardcoded.
- [ ] **Home screen collection count:** PRD proposes 4 visible + "See all" link. Finalize with UX review.

---

## Developer Stories

> Individual story files are located in `.claude/work-plan/stories/epic-07/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-07/story-01-curation-database-schema.md) | Curation Database Schema | backend | 5 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-07/story-02-curation-dal-functions.md) | Curation DAL Functions | backend | 5 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-07/story-03-rules-based-matching-engine.md) | Rules-Based Matching Engine | backend | 8 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-07/story-04-recommendation-explanation-templates.md) | Recommendation Explanation Templates | backend | 3 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-07/story-05-recommendation-caching.md) | Recommendation Caching | backend | 3 | sr-backend | CP3 | pending |
| [STORY-06](../stories/epic-07/story-06-dismiss-server-action-posthog-tracking.md) | Dismiss Server Action & PostHog Tracking Setup | backend | 2 | sr-backend | CP3 | pending |
| [STORY-07](../stories/epic-07/story-07-curated-collections-admin-interface.md) | Curated Collections Admin Interface | fullstack | 8 | fullstack-1 | CP4 | pending |
| [STORY-08](../stories/epic-07/story-08-home-screen-curation-sections.md) | Home Screen Curation Sections | fullstack | 8 | fullstack-2 | CP4 | pending |
| [STORY-09](../stories/epic-07/story-09-collection-detail-page.md) | Collection Detail Page | frontend | 5 | fullstack-4 | CP4 | pending |
| [STORY-10](../stories/epic-07/story-10-recommendation-card-with-dismiss.md) | Recommendation Card with Dismiss Action | frontend | 5 | fullstack-4 | CP4 | pending |
| [STORY-11](../stories/epic-07/story-11-curation-ux-design-copy.md) | Curation UX Design & User-Facing Copy | design | 5 | ux-designer | CP4 | pending |

**Total: 11 stories, 57 story points**
