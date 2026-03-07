# PRD: Search & Browse

**Feature:** Search & Browse
**Priority:** P0 — Launch Critical (RICE: 7,500)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Wine discovery is broken in two directions. Mass-market platforms like Wine.com organize inventory by varietal and price — a model that works for people who already know what they want and fails everyone else. Review-driven platforms like Vivino surface popular bottles through crowd ratings, which reward marketing budgets and familiar brands over quality and personal fit. Neither approach helps the Explorer who wants to find something great but doesn't have the vocabulary to search for it.

Cru's Search & Browse must serve users who know exactly what they want ("2021 Domaine Tempier Bandol Rosé") and users who only know how they feel ("something light and fun for a Tuesday night"). This dual-mode discovery engine is the foundation that Taste Profile, Curation, and the entire commerce funnel are built on.

Every one of Cru's 5,000 target launch users will interact with Search & Browse on every session. A clunky or jargon-heavy browse experience violates Product Principle #1 (Curiosity over expertise) and kills the core loop before it starts.

## 2. Goals

**User Goals:**
- Find wines through natural, non-technical language — by mood, occasion, food pairing, or story theme — not just traditional wine taxonomy
- Refine results by practical criteria: price, availability nearby, producer story, varietal, region
- Discover wines they wouldn't have found on their own through curated browse paths and contextual suggestions
- Get from "I want wine" to "I found the right one" in under 3 minutes

**Business Goals:**
- Drive 60%+ of sessions to a product detail page (wine + producer story) within the first 2 minutes
- Generate the browse data that feeds Taste Profile Onboarding and AI Curation Engine
- Support the "local first" model by always surfacing local availability alongside discovery
- Create SEO-indexable browse pages (region, varietal, producer) for organic growth

## 3. Non-Goals

- **Full-text search of tasting notes or reviews** — No user-generated reviews at launch. Search indexes wine metadata, producer content, and Cru editorial.
- **AI-powered semantic search** — V1 uses structured filters + keyword search. Semantic / natural language search is a P1 enhancement that builds on the ML Curation Upgrade.
- **Saved searches or search alerts** — Push Notifications (P1) handles "alert me when X is available."
- **Map-based browse** — "Show me shops near me" is a Retailer Integration concern. Search & Browse shows wines, not stores.
- **Sort by rating/score** — Cru explicitly rejects the ratings-first model (Product Principle #2: Stories over scores). No numerical scores in browse results.

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to browse wines by mood or occasion (e.g., "Weeknight dinner," "Impress a date," "Backyard BBQ") so that I can find something appropriate without knowing wine terminology.
- As an Explorer, I want to filter by price range so that I only see wines I'd actually buy.
- As an Explorer, I want to see which wines are available at stores near me so that I can get the bottle today, not in a week.
- As an Explorer, I want to search by the name of a wine I had at a restaurant so that I can find it again.
- As an Explorer, I want to browse by region with a brief, non-jargon description of what wines from that region taste like so that I learn while I shop.

### Enthusiast (Secondary)
- As an Enthusiast, I want to browse by varietal and sub-region so that I can explore specific styles I'm interested in.
- As an Enthusiast, I want to filter by producer type (e.g., natural, biodynamic, women-owned, single-vineyard) so that I can shop my values.
- As an Enthusiast, I want to see new arrivals and recently added producers so that I can discover what's new on the platform.

### All Users
- As any user, I want search results to load in under 2 seconds so that browsing feels fast and fluid.
- As any user, I want to see a wine's producer story preview in the browse results so that I can decide whether to click through without needing more information.
- As any user on mobile, I want filter controls to be accessible without scrolling so that I can refine results on a small screen.

### Edge Cases
- As a user who searches for a wine that isn't on the platform, I want to see a "Not found — request this wine" option so that I feel heard, not dead-ended.
- As a user in a location with no retailer partners, I want to still browse and wishlist wines so that I get value even before local commerce is available.
- As a user who applies filters that return zero results, I want a helpful suggestion ("Try widening your price range" or "See similar wines in a nearby region") rather than an empty page.

## 5. Requirements

### Must-Have (P0)

**Browse Modes**
- Browse by Region: top-level (France, Italy, California, etc.) with sub-regions. Each region has a 2-3 sentence plain-language description.
- Browse by Varietal: major varietals with plain-language flavor descriptions ("Pinot Noir — lighter red, earthy, pairs with everything from salmon to mushroom risotto").
- Browse by Occasion/Mood: curated collections tagged by occasion ("Weeknight," "Celebration," "Gift," "First Date," "Exploring"). Minimum 6 collections at launch.
- Browse by Producer: alphabetical and filterable list of all producer profiles on the platform.
- Browse by "New on Cru": reverse-chronological list of recently added wines and producers.
- Acceptance criteria:
  - Given a user taps "Browse by Region" and selects "France," when the page loads, then they see sub-regions (Burgundy, Bordeaux, Rhône, Loire, etc.) with descriptions and wine counts
  - Given a user taps "Browse by Occasion" and selects "Weeknight dinner," when results load, then all wines shown are tagged for that occasion and sorted by local availability

**Search**
- Keyword search across: wine name, producer name, varietal, region, appellation
- Autocomplete suggestions as user types (debounced, results within 300ms)
- Search results page with same filter controls as browse
- Recent searches persisted per user (last 10)
- Acceptance criteria:
  - Given a user types "Temp" in the search bar, when autocomplete fires, then they see suggestions including "Tempranillo" (varietal) and "Domaine Tempier" (producer)
  - Given a user searches for "organic rosé under $25 near me," when results display, then wines matching those criteria appear (keyword match on "organic," "rosé," price filter ≤$25, location filter active)

**Filters**
- Price range: slider or preset buckets ($10-20, $20-35, $35-50, $50-100, $100+)
- Varietal: multi-select
- Region: multi-select with sub-regions
- Available nearby: toggle (uses user's stored location preference)
- Producer attributes: natural, biodynamic, organic, women-owned, BIPOC-owned, single-vineyard (multi-select)
- Filters persist during a browse session and reset on new session
- Acceptance criteria:
  - Given a user enables "Available nearby" and their zip is 90026, when they browse, then only wines stocked by retailers within the configured radius appear
  - Given a user selects "Natural" and "Under $35," when results display, then all wines match both criteria

**Wine Card (Browse Result)**
- Each wine in browse results displays: wine name, producer name, varietal, region, vintage, price (or price range if multiple retailers), one-line story hook from producer profile, local availability indicator (green dot = in stock nearby, gray = not locally available)
- Tapping a wine card navigates to the Wine Detail Page (shared with Producer Storytelling)
- Acceptance criteria:
  - Given a wine is in stock at a retailer within the user's radius, when it appears in browse results, then a green availability indicator is visible
  - Given a wine card is displayed, when the user sees it, then the producer story hook is ≤ 120 characters and ends with "Read more →"

**Technical Requirements**
- Search index built on PostgreSQL full-text search (Supabase) — evaluate migration to Typesense/Meilisearch in P1 if performance degrades past 10K wines
- Browse pages are Server Components with `<Suspense>` boundaries for filter changes
- All queries go through DAL (`lib/dal/wines.ts`, `lib/dal/search.ts`)
- Browse pages are SEO-indexable: `/wines/region/[region]`, `/wines/varietal/[varietal]`, `/wines/occasion/[occasion]`
- Mobile-first responsive design — filter drawer on mobile, sidebar on desktop
- `wines` table, `wine_tags` table, `wine_occasions` table — all with `org_id`, RLS enabled

### Nice-to-Have (P1)

- Semantic / natural language search ("something like that wine I had in Barcelona")
- "Similar wines" suggestions on zero-result pages
- Infinite scroll with skeleton loading states
- Voice search input on mobile
- Search analytics dashboard for the PM (most searched terms, zero-result queries)

### Future Considerations (P2)

- AI-powered search that understands flavor descriptions ("something jammy and bold but not too tannic")
- Collaborative filtering: "People who liked X also browsed Y"
- Visual search: snap a photo of a wine label to find it on Cru

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Browse-to-PDP rate | 60% of sessions reach a wine detail page | 70% | Analytics event tracking |
| Time to first PDP click | < 2 minutes from session start | < 90 seconds | Event timestamps |
| Search usage rate | 40% of sessions include a search | 50% | Search event logs |
| Zero-result search rate | < 15% of searches | < 10% | Search query logs |
| Filter usage rate | 50% of browse sessions use at least one filter | 60% | Filter event tracking |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Browse-to-purchase conversion | 5% of sessions that reach PDP result in order | 8% | Funnel analytics |
| SEO-driven sessions | 500+ organic sessions/month by Month 3 | 1,000+ | Google Analytics |
| Return browse sessions | 50% of users browse again within 7 days | 60% | Session analytics |

## 7. Open Questions

- **[Engineering — blocking]** PostgreSQL full-text search vs. dedicated search engine (Typesense/Meilisearch) — what's the latency threshold that triggers migration? Need benchmarks at 1K, 5K, 10K wine count.
- **[Design — blocking]** How many occasion/mood categories at launch? Need final taxonomy before content team can tag wines. Proposed: 8 categories.
- **[Product — non-blocking]** Should "Browse by Occasion" use AI-generated or human-curated collections? Decision: human-curated at launch (aligns with MVP curation model).
- **[Data — non-blocking]** What happens when a wine is available in multiple retailers at different prices? Show range? Lowest price? Need pricing display rules.

## 8. Timeline Considerations

- **Build order: #2** — Begins immediately after User Accounts ships (Week 2-3).
- **Week 2-4 of pre-launch sprint** (Track A)
- **Hard dependency:** User Accounts (#1) must be complete — search requires authenticated user context for location-based results and preference-informed ranking.
- **Downstream dependents:** Taste Profile Onboarding (#3) needs browse content to build profiles against. AI Curation (#7) needs the browse infrastructure for recommendation display.
- **Parallel work:** Producer Storytelling (#4) is building the content that Search indexes — they must coordinate on wine card data model and Producer content schema.
