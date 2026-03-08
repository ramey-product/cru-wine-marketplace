### [EPIC-07/STORY-06] — Dismiss Server Action & PostHog Tracking Setup

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform developer, I want a dismiss Server Action that writes to both Supabase (`user_wine_dismissals`) and PostHog, so that dismisses are tracked for analytics while the matching engine can synchronously exclude dismissed wines.

#### Acceptance Criteria

```gherkin
Given a user dismisses a recommendation
When the Server Action executes
Then a row is inserted into user_wine_dismissals AND a "recommendation_dismiss" event is captured in PostHog

Given a user un-dismisses a wine (from a "Dismissed" management view)
When the undismiss Server Action executes
Then the row is deleted from user_wine_dismissals

Given a user dismisses the same wine twice
When the Server Action executes
Then the insert is idempotent (ON CONFLICT DO NOTHING) and no error is returned

Given PostHog is unreachable
When a dismiss event fires
Then the Supabase write succeeds regardless (PostHog capture is fire-and-forget, not blocking)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Create |
| Validation | `lib/validations/curation.ts` | Modify (add dismiss schemas) |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-01] — needs `user_wine_dismissals` table and PostHog client
- **Blocked by:** [EPIC-07/STORY-02] — needs wine-dismissals DAL functions
- **Blocks:** [EPIC-07/STORY-10] — recommendation card calls dismiss action

#### Testing Requirements

- [ ] **Unit:** Zod validation rejects missing wine_id or invalid UUID
- [ ] **Unit:** Dismiss action returns `{ data }` on success and `{ error }` on failure
- [ ] **Integration:** Dismiss action inserts row into `user_wine_dismissals` and calls PostHog capture
- [ ] **Integration:** Undismiss action deletes row from `user_wine_dismissals`
- [ ] **Integration:** Duplicate dismiss is idempotent (no error on conflict)

#### Implementation Notes

**Dismiss Server Action (`lib/actions/curation.ts`):**
```typescript
'use server'
// dismissRecommendation(formData):
//   1. Zod validate wine_id
//   2. auth check (getUser)
//   3. dismissWine(supabase, userId, wineId) — DAL call
//   4. captureRecommendationEvent(userId, 'recommendation_dismiss', { wine_id, source })
//   5. revalidatePath for recommendation sections
//   Return { data: { dismissed: true } } or { error: string }

// undismissRecommendation(formData):
//   1. Zod validate wine_id
//   2. auth check (getUser)
//   3. undismissWine(supabase, userId, wineId) — DAL call
//   4. revalidatePath for recommendation sections
//   Return { data: { undismissed: true } } or { error: string }
```

**PostHog fire-and-forget pattern:**
- PostHog `capture()` is non-blocking — if it fails, the dismiss still succeeds in Supabase
- No try/catch wrapping needed around PostHog calls; errors are silently logged
- All non-dismiss events (impression, click, wishlist, purchase) are tracked purely client-side via PostHog JS SDK in STORY-10
