# PRD: AI + Human Curation Engine

**Feature:** AI + Human Curation Engine (MVP)
**Priority:** P0 — Launch Critical (RICE: 6,000 — MVP scope)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Discovery-driven platforms live or die on the quality of their recommendations. Netflix didn't win because it had the most movies — it won because it convinced every user that the next thing on their screen was chosen *for them*. Cru faces the same challenge: a catalog of 500+ wines means nothing if users still feel lost.

The problem is that good wine curation traditionally requires a human sommelier who knows the customer. That model doesn't scale beyond a single shop. Algorithmic approaches (Vivino's crowd ratings, Wine.com's collaborative filtering) optimize for popularity, not personal fit — they recommend what everyone likes, not what *you'd* like.

Cru's MVP curation engine takes a hybrid approach: rules-based algorithmic matching (using the Taste Profile data) combined with human-curated collections from founding curators. The rules engine handles the personalization math; the humans bring the editorial voice and discovery instinct that no algorithm matches at launch scale. This hybrid model ships fast, delivers good-enough personalization on Day 1, and generates the interaction data that a proper ML model needs to train (Month 5-6 upgrade per roadmap).

This feature affects every user who sees a recommendation — which is every user. Bad curation means irrelevant suggestions, which means abandoned sessions. Good curation is Cru's moat.

## 2. Goals

**User Goals:**
- See wine recommendations that feel personally relevant — not generic "popular picks" that could be for anyone
- Understand *why* a wine was recommended in plain language ("Because you like earthy reds with a little spice" not "Based on users like you")
- Discover wines they wouldn't have found browsing on their own — the serendipity factor
- Trust that recommendations improve over time as Cru learns their preferences

**Business Goals:**
- Achieve 15%+ click-through rate on curated recommendations (vs. 5-8% industry average for generic suggestions)
- Drive 40% of first purchases through curated recommendations (not organic browse)
- Generate the interaction dataset (clicks, purchases, skips, wishlists) required for ML model training in Month 5-6
- Establish the "Cru Picks" brand as a trusted editorial voice in wine discovery

## 3. Non-Goals

- **ML-powered recommendation model** — V1 is rules-based matching + human curation. ML upgrade happens in Month 5-6 after sufficient interaction data (1,000+ rated bottles, 500+ active taste learners, >75% validation accuracy). Architecture should support the upgrade but we're not building it now.
- **Collaborative filtering ("users like you also liked")** — Requires scale we won't have at launch. This is a P2 capability.
- **Real-time personalization that adapts mid-session** — V1 recommendations are generated per-session based on the stored taste profile. In-session adaptation is a P1 enhancement.
- **Wine scoring or ranking** — Curation explains *why*, never assigns a numerical score (Product Principle #2).
- **User-generated recommendation lists** — Social sharing of curated lists is a P1 feature tied to Social/Community Layer expansion.

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to see a "Picked for You" section on my home screen with wines matched to my taste profile so that I don't have to browse blindly.
- As an Explorer, I want each recommendation to include a one-sentence explanation of why it was picked for me so that I trust the suggestion and learn about my own palate.
- As an Explorer, I want to dismiss a recommendation with a "Not for me" action so that the system learns what I don't want.
- As an Explorer, I want to see curated collections ("Staff Picks," "Weekend Wines," "Under $25 Gems") so that I have a starting point even before my taste profile kicks in.

### Enthusiast (Secondary)
- As an Enthusiast, I want recommendations that push my boundaries — not just wines I'd obviously like, but wines that expand my palate based on my adventurousness setting.
- As an Enthusiast, I want to see the producer story integrated into the recommendation explanation so that I understand the context, not just the flavor match.

### Content Team (Internal)
- As a curator, I want to create themed collections (e.g., "Spring Rosés," "Natural Wines Under $30") with editorial descriptions so that users see a human-crafted discovery path.
- As a curator, I want to feature specific wines or producers for a set time period so that I can support new arrivals and seasonal promotions.
- As a curator, I want to see which of my curated picks are getting the most engagement so that I can refine my editorial instinct.

### Edge Cases
- As a user who skipped taste profile onboarding, I want to see generic curated collections (not an empty "Picked for You" section) so that I still get value.
- As a user whose taste profile produces fewer than 6 matches, I want the system to fill remaining slots with popular local picks rather than showing empty space.
- As a user who has purchased all recommended wines, I want fresh recommendations that go deeper into my preference space rather than repeating the same suggestions.

## 5. Requirements

### Must-Have (P0)

**Rules-Based Matching Engine**
- Match algorithm: compare user's `taste_profiles` (flavor_affinities, flavor_aversions, adventurousness_score) against wine `flavor_profile` JSONB attributes
- Scoring formula: weighted sum of (flavor affinity matches × 3) + (no aversion violations × 5) + (price range match × 2) + (local availability × 4) + (adventurousness diversity bonus × adventurousness_score)
- Output: ranked list of wine_ids with match_score and match_reason (human-readable explanation template)
- Exclude: wines the user has already purchased, dismissed, or wishlisted
- Acceptance criteria:
  - Given a user with flavor_affinities ["berry", "earthy", "pepper"] and no aversions, when the engine runs, then the top 8 results are wines with matching flavor_profile attributes, sorted by match_score
  - Given a user with flavor_aversions ["very_sweet"], when the engine runs, then no wine with a dominant sweetness profile appears in recommendations
  - Given a user with adventurousness_score = 3 ("Surprise me"), when the engine runs, then at least 2 of the top 8 results are outside the user's primary flavor affinity cluster

**Recommendation Explanations**
- Every recommendation includes a `match_reason` string generated from a template system
- Templates map match attributes to plain-language phrases: e.g., flavor match → "This has the earthy, peppery character you love"; availability → "In stock at [store] near you"; producer story → "From a family vineyard in [region] — [tagline]"
- Explanations combine up to 3 reason fragments into a single sentence
- Acceptance criteria:
  - Given a wine matched on flavor affinity + local availability, when the recommendation renders, then the explanation reads something like "This earthy Rhône red matches your palate — and it's in stock at [Store Name], 2 miles away"
  - Given a wine matched primarily on adventurousness diversity, when the recommendation renders, then the explanation signals discovery: "Something new for you: a [varietal] from [region] that [producer tagline]"

**Curated Collections (Human-Edited)**
- `curated_collections` table: id, title, slug, description (rich text), cover_image_url, curator_id, display_order, is_active, start_date, end_date (nullable for evergreen), org_id
- `curated_collection_items` table: collection_id, wine_id, position, curator_note (optional short text), org_id
- Admin interface: create/edit collections, add/remove/reorder wines, set active/inactive, set date range
- Minimum 6 collections at launch: "Staff Picks," "New on Cru," "Under $25," "Weekend Wines," "Natural & Biodynamic," "Local Favorites"
- Acceptance criteria:
  - Given a curator creates a collection with 10 wines, when a user views the collection page, then all 10 wines display in the curator's chosen order with optional curator notes
  - Given a collection has an end_date that has passed, when the home screen renders, then the expired collection no longer appears

**Home Screen Integration**
- "Picked for You" section: top 8 personalized recommendations from the rules engine (requires completed taste profile)
- "Curated Collections" section: horizontal scroll of active collections
- "Popular Near You" section: top wines by order volume at retailers within the user's radius (fallback for users without taste profiles)
- Each section lazy-loads independently via `<Suspense>` boundaries
- Acceptance criteria:
  - Given a user with a completed taste profile, when they view the home screen, then "Picked for You" appears as the first section with 8 wine cards
  - Given a user who skipped taste profile, when they view the home screen, then "Picked for You" is replaced by "Popular Near You" and curated collections are promoted

**Interaction Tracking (ML Training Data)**
- Track every recommendation interaction: impression, click, dismiss ("Not for me"), wishlist, purchase
- `recommendation_events` table: id, user_id, wine_id, event_type (enum: impression, click, dismiss, wishlist, purchase), recommendation_source (enum: rules_engine, curated_collection, popular), match_score (nullable), created_at, org_id
- Events logged via lightweight client-side tracking (beacon API or fetch POST)
- Acceptance criteria:
  - Given a user clicks a recommended wine, when the event fires, then a row is inserted in recommendation_events with event_type = "click" and the match_score that produced the recommendation
  - Given a user dismisses a recommendation, when the event fires, then future runs of the rules engine exclude that wine for that user

**Technical Requirements**
- Rules engine as a Server Action in `lib/actions/curation.ts` — called on home screen load and cacheable for 1 hour per user
- DAL functions in `lib/dal/curation.ts` (recommendations), `lib/dal/collections.ts` (curated collections), `lib/dal/recommendation-events.ts` (tracking)
- All tables with RLS, org_id, updated_at triggers
- Recommendation generation should complete in < 500ms for a catalog of 1,000 wines
- Cache recommendations in a per-user key (e.g., `curation:user:{user_id}`) with 1-hour TTL; invalidate on taste profile update or new purchase

### Nice-to-Have (P1)

- "Why this pick?" expandable detail on each recommendation card
- Recommendation feedback: thumbs up/down on individual picks (richer signal than dismiss)
- Curator analytics dashboard: collection engagement, click-through rates, conversion by collection
- Progressive personalization: adjust recommendations based on browse behavior within a session
- Seasonal/temporal weighting: boost rosés in summer, bold reds in winter

### Future Considerations (P2)

- ML-powered recommendation model trained on recommendation_events data (Month 5-6 roadmap)
- Collaborative filtering: "Wine lovers like you also enjoyed..."
- Context-aware recommendations: time of day, weather, calendar events
- Taste profile clusters for cold-start users (group-based recommendations before individual data exists)

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Recommendation CTR | 15% of "Picked for You" impressions clicked | 20% | recommendation_events click/impression ratio |
| Collection CTR | 10% of collection impressions clicked | 15% | recommendation_events for curated_collection source |
| Dismiss rate | < 25% of recommendations dismissed | < 20% | recommendation_events dismiss/impression ratio |
| Recommendation → purchase | 8% of clicked recommendations result in purchase | 12% | recommendation_events funnel |
| Engine latency | < 500ms p95 for recommendation generation | < 300ms | API monitoring |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| % of purchases from curation | 40% of first purchases via curated recommendation | 50% | Order attribution |
| Repeat engagement | Users who interact with recommendations return 2x more often than non-engagers | 2.5x | Cohort analysis |
| Recommendation diversity | Average user sees wines from 5+ different producers in their top 8 | 7+ | Recommendation logs |
| ML readiness | 1,000+ recommendation_events per week by Month 3 | 2,000+ | Event count |

## 7. Open Questions

- **[Engineering — blocking]** Caching strategy for per-user recommendations: Redis (Upstash) vs. Next.js unstable_cache vs. Supabase edge function cache? Need to evaluate latency and cost at 5K users.
- **[Product — blocking]** How many curated collections should display on the home screen simultaneously? Too many overwhelms; too few feels sparse. Proposed: 4 visible + "See all" link.
- **[Content — blocking]** Who are the founding curators? Are they Cru team members, contracted sommeliers, or wine-industry advisors? Their credibility matters for "Staff Picks" trust.
- **[Engineering — non-blocking]** Should the rules engine run server-side on every page load (cached) or pre-compute nightly? Server-side is fresher but more compute; nightly is cheaper but stale. Proposed: server-side with 1-hour cache.
- **[Data — non-blocking]** What's the minimum catalog size for the rules engine to produce good results? With 500 wines and 20 flavor attributes, how sparse is the matching matrix?

## 8. Timeline Considerations

- **Build order: #7** — But the data model and collection CMS can start in Week 3-4 while other Track B work progresses.
- **Weeks 5-8 of pre-launch sprint** (Track A, overlapping with Track C)
- **Hard dependency:** Taste Profile Onboarding (#3) must be complete — the rules engine consumes taste_profiles data. Producer Storytelling (#4) must have wine flavor_profile data populated for matching to work.
- **Parallel coordination:** Content team must create 6+ curated collections by Week 7. This is editorial work that happens outside the engineering sprint.
- **Downstream dependents:** ML Curation Upgrade (P1, Month 5-6) builds directly on the recommendation_events data collected here. Advanced Taste Learning (P1) feeds richer signals back into the matching engine.
- **Critical sequencing note from Roadmap:** Advanced Taste Learning must be live for 4+ weeks before ML Curation Upgrade can ship. Correct sequence: Advanced Taste Learning feature-complete by Month 4 Week 2, ML model development begins Month 5 Week 1, ML Curation ships Month 6.
