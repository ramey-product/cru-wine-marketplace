### [EPIC-08/STORY-02] — DAL Functions for Follows and Shares

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want typed DAL functions for managing follows and tracking shares so that components and actions have a clean data access interface.

#### Acceptance Criteria

```gherkin
Given a user_id
When getFollowing(client, userId) is called
Then it returns all users the given user follows with their profile info

Given a user_id
When getFollowers(client, userId) is called
Then it returns all users following the given user with their profile info

Given a follower_id and following_id
When getIsFollowing(client, followerId, followingId) is called
Then it returns true if the follow relationship exists, false otherwise

Given a user_id
When getFollowCounts(client, userId) is called
Then it returns { followers: number, following: number }

Given share event data
When createShareEvent(client, data) is called
Then a new row is inserted into share_events
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/follows.ts` | Create |
| DAL | `lib/dal/shares.ts` | Create |
| DAL | `lib/dal/user-profiles.ts` | Modify (add getUserByUsername, updateProfileSocial) |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-01] — schema must exist
- **Blocks:** [EPIC-08/STORY-03], [EPIC-08/STORY-04] — Server Actions consume DAL functions

#### Testing Requirements

- [ ] **Unit:** getFollowing returns correct user list with profile data
- [ ] **Unit:** getFollowers returns correct user list with profile data
- [ ] **Unit:** getIsFollowing returns boolean correctly for existing and non-existing follows
- [ ] **Unit:** getFollowCounts returns accurate numbers
- [ ] **Unit:** createShareEvent inserts row with correct fields
- [ ] **Unit:** getUserByUsername returns profile or null

#### Implementation Notes

**DAL functions for `lib/dal/follows.ts`:**
- `getFollowing(client, userId, opts?: { limit, offset })` — join follows → user_profiles for following_id
- `getFollowers(client, userId, opts?: { limit, offset })` — join follows → user_profiles for follower_id
- `getIsFollowing(client, followerId, followingId)` — single row check
- `getFollowCounts(client, userId)` — two count queries (or a single RPC)
- `createFollow(client, followerId, followingId)` — insert into follows
- `deleteFollow(client, followerId, followingId)` — delete from follows

**DAL functions for `lib/dal/shares.ts`:**
- `createShareEvent(client, data)` — insert into share_events
- `getShareCounts(client, shareableType, shareableId)` — count shares per item (for internal analytics)

**DAL extensions for `lib/dal/user-profiles.ts`:**
- `getUserByUsername(client, username)` — lookup by username for profile page routing
- `updateProfileSocial(client, userId, { bio, isPublic })` — update social fields

Pagination support on getFollowing/getFollowers via limit/offset — V0 default 50 per page.
