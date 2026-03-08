### [EPIC-07/STORY-10] — Recommendation Card with Dismiss Action

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to dismiss a recommendation with a "Not for me" action so that the system learns what I don't want and future recommendations improve.

#### Acceptance Criteria

```gherkin
Given a recommendation card is visible
When the user clicks "Not for me"
Then the card animates out and a dismiss event is tracked

Given a user dismisses a wine from "Picked for You"
When they refresh the home screen
Then the dismissed wine no longer appears in recommendations

Given a recommendation card enters the viewport
When IntersectionObserver fires
Then an impression event is tracked (once per card per session)

Given a user clicks a recommendation card
When the wine detail page loads
Then a click event is tracked with the match_score
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/curation/RecommendationCard.tsx` | Modify |
| Component | `components/features/curation/DismissButton.tsx` | Create |
| Lib | `lib/hooks/useRecommendationTracking.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs PostHog analytics helpers (`captureRecommendationEvent`, `batchCaptureImpressions`)
- **Blocked by:** [EPIC-07/STORY-06] — needs dismiss Server Action
- **Blocked by:** [EPIC-07/STORY-08] — needs RecommendationCard component to exist

#### Testing Requirements

- [ ] **Unit:** Dismiss button calls dismiss Server Action and removes card from DOM
- [ ] **Unit:** IntersectionObserver fires PostHog impression capture once per card
- [ ] **Unit:** Click tracking calls `posthog.capture('recommendation_click', ...)` with match_score
- [ ] **Integration:** Dismissed wine excluded from next engine run

#### Implementation Notes

**Client Component (`'use client'`):**
- `DismissButton`: small icon button (X or thumbs-down) with tooltip "Not for me"
- On dismiss: call `dismissRecommendation` Server Action (from STORY-06) which writes to Supabase + PostHog
- Optimistic UI: immediately animate card out (fade + collapse) without waiting for server response
- Use `useRecommendationTracking` hook for impression and click tracking logic

**Impression Tracking (PostHog JS SDK):**
- Use IntersectionObserver to detect when card enters viewport (threshold: 0.5)
- Track each impression once per card per page session (use a Set to deduplicate)
- Batch impressions: collect wine_ids for 500ms debounce, then call `batchCaptureImpressions(userId, wineIds, source)` from PostHog helpers

**Click Tracking (PostHog JS SDK):**
- On card click (before navigation), call `posthog.capture('recommendation_click', { wine_id, source, match_score })`
- PostHog JS SDK handles fire-and-forget — no need for Beacon API or custom fetch calls
