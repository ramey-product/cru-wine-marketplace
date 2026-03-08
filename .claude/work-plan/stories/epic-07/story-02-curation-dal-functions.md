### [EPIC-07/STORY-02] — Curation DAL Functions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer building curation features, I want typed DAL functions for collections and wine dismissals, plus a PostHog analytics helper, so that all data access is centralized, type-safe, and RLS-compliant.

#### Acceptance Criteria

```gherkin
Given I call getActiveCollections()
When the query executes
Then I receive all active collections with is_active=true and valid date ranges, ordered by display_order

Given I call getCollectionWithItems(collectionId)
When the collection exists
Then I receive the collection with all its wine items ordered by position, including wine details

Given I call dismissWine(userId, wineId)
When the insert succeeds
Then a user_wine_dismissals row is created and a PostHog 'recommendation_dismiss' event is captured

Given I call getUserDismissedWineIds(userId)
When the user has dismissed wines
Then I receive an array of wine_ids from user_wine_dismissals for exclusion from future recommendations

Given I call undismissWine(userId, wineId)
When the delete succeeds
Then the user_wine_dismissals row is removed and the wine can reappear in recommendations
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/collections.ts` | Create |
| DAL | `lib/dal/wine-dismissals.ts` | Create |
| Lib | `lib/analytics/posthog.ts` | Modify (add recommendation event helpers) |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-01] — tables and PostHog client must exist
- **Blocks:** [EPIC-07/STORY-03] — matching engine uses DAL for dismiss lookups
- **Blocks:** [EPIC-07/STORY-07] — admin collections CRUD uses DAL
- **Blocks:** [EPIC-07/STORY-10] — recommendation card uses PostHog tracking helpers

#### Testing Requirements

- [ ] **Unit:** getActiveCollections returns only active, date-valid collections
- [ ] **Unit:** getCollectionWithItems returns wines in position order
- [ ] **Unit:** getUserDismissedWineIds returns correct exclusion set from user_wine_dismissals
- [ ] **Unit:** dismissWine creates user_wine_dismissals row and calls PostHog capture
- [ ] **Unit:** undismissWine removes dismissal row
- [ ] **Integration:** DAL functions respect RLS (user can only read/write own dismissals)

#### Implementation Notes

**Collections DAL (`lib/dal/collections.ts`):**
- `getActiveCollections(supabase)` — SELECT active collections where `is_active = true` AND (`start_date IS NULL OR start_date <= now()`) AND (`end_date IS NULL OR end_date >= now()`) ORDER BY `display_order`
- `getCollectionWithItems(supabase, collectionId)` — JOIN with curated_collection_items and wines, order items by position
- `getCollectionBySlug(supabase, slug)` — for collection detail page routing
- `createCollection(supabase, data)` — admin only
- `updateCollection(supabase, collectionId, data)` — admin only
- `addItemToCollection(supabase, collectionId, wineId, position, curatorNote)` — admin only
- `removeItemFromCollection(supabase, itemId)` — admin only
- `reorderCollectionItems(supabase, collectionId, itemIds)` — admin only

**Wine Dismissals DAL (`lib/dal/wine-dismissals.ts`):**
- `dismissWine(supabase, userId, wineId)` — INSERT into user_wine_dismissals (ON CONFLICT DO NOTHING for idempotency) + call PostHog `captureRecommendationEvent` with `recommendation_dismiss`
- `undismissWine(supabase, userId, wineId)` — DELETE from user_wine_dismissals WHERE user_id = $1 AND wine_id = $2
- `getUserDismissedWineIds(supabase, userId)` — SELECT wine_id FROM user_wine_dismissals WHERE user_id = $1 (returns string[] for engine exclusion)

**PostHog Analytics Helpers (added to `lib/analytics/posthog.ts`):**
- `captureRecommendationEvent(userId, eventName, properties)` — wraps PostHog capture with standard event properties
- `batchCaptureImpressions(userId, wineIds, source)` — captures batch impression events to PostHog
- All non-dismiss events (impression, click, wishlist, purchase) tracked via PostHog only — no Supabase storage
