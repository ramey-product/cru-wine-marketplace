### [EPIC-07/STORY-05] — Recommendation Caching

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want personalized recommendations cached per-user with a 1-hour TTL so that the home screen loads fast without re-running the matching engine on every page view.

#### Acceptance Criteria

```gherkin
Given a user loads the home screen
When recommendations exist in cache (< 1 hour old)
Then cached results are served without re-running the engine

Given a user updates their taste profile
When the profile save completes
Then the recommendation cache for that user is invalidated

Given a user completes a purchase
When the order is confirmed
Then the recommendation cache for that user is invalidated

Given the cache is empty or expired
When the user loads the home screen
Then the engine runs, results are cached, and recommendations display within 500ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Modify (add caching layer) |
| Lib | `lib/curation/cache.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-03] — needs the engine to wrap with cache
- **Blocks:** [EPIC-07/STORY-08] — home screen consumes cached recommendations

#### Testing Requirements

- [ ] **Unit:** Cache hit returns stored results without engine execution
- [ ] **Unit:** Cache miss triggers engine run and stores results
- [ ] **Unit:** Cache invalidation clears user's cached recommendations
- [ ] **Integration:** Taste profile update triggers cache invalidation
- [ ] **Integration:** Order completion triggers cache invalidation

#### Implementation Notes

**V1 Strategy: Next.js `unstable_cache`**
- Cache key: `curation:recommendations:${userId}`
- TTL: 3600 seconds (1 hour)
- Tags: `['curation', `user:${userId}`]` for targeted invalidation
- `revalidateTag(`user:${userId}`)` called from taste profile update and order completion Server Actions

**Why `unstable_cache` over Redis:**
- Zero additional infrastructure (Vercel-native)
- Sufficient for V1 scale (< 5K users)
- Automatic CDN-level caching on Vercel
- Revisit with Upstash Redis if latency exceeds 200ms at scale

**Invalidation Triggers:**
- Taste profile update: add `revalidateTag` call to `updateTasteProfile` action (Epic 03)
- Order completion: add `revalidateTag` call to `confirmOrder` action (Epic 05)
- Admin wine catalog changes: invalidate all curation caches (bulk revalidation)
