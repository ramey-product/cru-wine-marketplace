### [EPIC-07/STORY-03] — Rules-Based Matching Engine

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an Explorer with a completed taste profile, I want Cru to generate personalized wine recommendations based on my flavor preferences so that I see wines I'll actually enjoy rather than generic popular picks.

#### Acceptance Criteria

```gherkin
Given a user with flavor_affinities ["berry", "earthy", "pepper"] and no aversions
When the engine runs
Then the top 8 results are wines with matching flavor_profile attributes, sorted by match_score descending

Given a user with flavor_aversions ["very_sweet"]
When the engine runs
Then no wine with a dominant sweetness profile appears in recommendations

Given a user with adventurousness_score = 3 ("Surprise me")
When the engine runs
Then at least 2 of the top 8 results are outside the user's primary flavor affinity cluster

Given a user has purchased wine X and dismissed wine Y
When the engine runs
Then neither wine X nor wine Y appear in recommendations

Given a user has no taste profile
When the engine is called
Then it returns null/empty (caller falls back to "Popular Near You")

Given the wine catalog has 1,000 wines
When the engine runs
Then recommendation generation completes in < 500ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Create |
| DAL | `lib/dal/curation.ts` | Create |
| Validation | `lib/validations/curation.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs wine-dismissals DAL for `getUserDismissedWineIds()` exclusion queries
- **Blocked by:** [EPIC-03/STORY-01] — needs taste_profiles table
- **Blocked by:** [EPIC-04/STORY-01] — needs wines with flavor_profile JSONB
- **Blocks:** [EPIC-07/STORY-04] — explanation system consumes match data
- **Blocks:** [EPIC-07/STORY-05] — caching wraps the engine output
- **Blocks:** [EPIC-07/STORY-08] — home screen consumes engine output

#### Testing Requirements

- [ ] **Unit:** Scoring formula produces correct scores for known flavor/wine combinations
- [ ] **Unit:** Aversion violations correctly exclude wines
- [ ] **Unit:** Adventurousness diversity bonus adds variety for high-adventurousness users
- [ ] **Unit:** Exclusion logic removes purchased, dismissed, and wishlisted wines
- [ ] **Unit:** Empty taste profile returns null/empty
- [ ] **Unit:** < 6 matches triggers fallback padding (popular wines fill remaining slots)
- [ ] **Integration:** Full engine run with seeded data returns expected top 8

#### Implementation Notes

**Scoring Formula:**

```typescript
matchScore =
  (flavorAffinityMatches × 3.0) +   // How many of user's loved flavors this wine has
  (noAversionViolation × 5.0) +      // Binary: 5 if no aversions violated, 0 if any violated
  (priceRangeMatch × 2.0) +          // 2 if within user's budget range, 0 otherwise
  (localAvailability × 4.0) +        // 4 if in stock at a nearby retailer, 0 otherwise
  (adventurenessBonus × adventurenessScore)  // Diversity bonus scaled by user's openness
```

**Engine Architecture:**
- `lib/dal/curation.ts` contains the data-fetching: `getRecommendationCandidates(supabase, userId)` — fetches user's taste profile, all wines with flavor_profile, user's exclusion set (purchased + dismissed + wishlisted), and nearby availability
- `lib/actions/curation.ts` contains `generateRecommendations(userId)` Server Action:
  1. Fetch user's taste profile via DAL
  2. If no profile, return `{ data: null }` (no personalized recs)
  3. Fetch candidate wines (all wines minus exclusions)
  4. Score each candidate against user's profile
  5. Sort by score descending
  6. If < 6 results, pad with popular nearby wines
  7. Take top 8
  8. Generate match_reason for each (delegates to explanation system)
  9. Return `{ data: RecommendationResult[] }`

**Weights Configuration:**
- Store scoring weights in a config object (not hardcoded magic numbers) so they can be tuned without code changes
- V1: `SCORING_WEIGHTS = { flavorAffinity: 3.0, noAversion: 5.0, priceRange: 2.0, localAvailability: 4.0, adventurenessBase: 1.5 }`

**Performance:**
- The engine runs as a single Supabase query with server-side scoring (not N+1 queries per wine)
- For V1 with ≤ 1,000 wines, fetch all candidates in one query and score in-memory in the Server Action
- If catalog grows beyond 5,000 wines, consider moving scoring into a Supabase function for DB-level filtering
