### [EPIC-07/STORY-08] — Home Screen Curation Sections

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want my home screen to show "Picked for You" recommendations, curated collections, and "Popular Near You" wines so that I have multiple discovery paths the moment I open Cru.

#### Acceptance Criteria

```gherkin
Given a user with a completed taste profile
When they view the home screen
Then "Picked for You" appears as the first section with 8 wine cards, each with a match_reason

Given a user who skipped taste profile
When they view the home screen
Then "Picked for You" is replaced by "Popular Near You" and curated collections are promoted

Given curated collections exist
When the home screen renders
Then a horizontal-scrolling section shows up to 4 active collections with cover images and titles

Given the user clicks "See all collections"
When the page loads
Then all active collections display in a grid layout

Given any section is loading
When the page renders
Then each section shows an independent skeleton loader (Suspense boundary per section)

Given fewer than 6 personalized matches exist
When "Picked for You" renders
Then remaining slots are filled with popular nearby wines
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/curation/PickedForYou.tsx` | Create |
| Component | `components/features/curation/CuratedCollectionsRow.tsx` | Create |
| Component | `components/features/curation/PopularNearYou.tsx` | Create |
| Component | `components/features/curation/RecommendationCard.tsx` | Create |
| Page | `app/(app)/[orgSlug]/home/page.tsx` | Modify |
| Page | `app/(app)/[orgSlug]/collections/page.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-03] — needs matching engine
- **Blocked by:** [EPIC-07/STORY-04] — needs explanation templates
- **Blocked by:** [EPIC-07/STORY-05] — needs caching layer
- **Blocked by:** [EPIC-07/STORY-07] — needs collections to exist in DB
- **Blocked by:** [EPIC-02/STORY-08] — needs wine card component
- **Blocked by:** [EPIC-07/STORY-11] — needs UX design specs

#### Testing Requirements

- [ ] **Unit:** PickedForYou renders 8 cards with match_reason when profile exists
- [ ] **Unit:** PopularNearYou renders when no profile exists
- [ ] **Unit:** CuratedCollectionsRow renders up to 4 collections
- [ ] **Integration:** Home page sections load independently via Suspense
- [ ] **Accessibility:** All sections have proper heading hierarchy and aria-labels

#### Implementation Notes

**Section Architecture:**
- Each section is a Server Component that fetches its own data
- Wrap each section in `<Suspense fallback={<SectionSkeleton />}>` for independent loading
- Home page layout:
  1. "Picked for You" (or "Popular Near You" fallback) — full-width horizontal scroll of 8 cards
  2. "Curated Collections" — horizontal scroll of 4 collection cards with cover image + title
  3. Additional sections TBD (e.g., "New Arrivals" can be added later)

**RecommendationCard Component:**
- Extends the base wine card from Epic 02 with:
  - `match_reason` text below the wine info
  - "Not for me" dismiss button (triggers event + removes card with animation)
  - Impression tracking on viewport entry (IntersectionObserver)

**"Popular Near You" Fallback:**
- Query: top wines by order count at retailers within user's radius (last 30 days)
- Requires user's location (from browser geolocation or zip code in profile)
- Falls back to global popular if no location available

**"Curated Collections" Row:**
- Horizontal scroll with snap-to-card behavior
- Collection card: cover image, title, wine count badge
- "See all" link to `/[orgSlug]/collections`
