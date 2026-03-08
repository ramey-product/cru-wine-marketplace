### [EPIC-08/STORY-03] — Follow/Unfollow Server Actions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a user, I want to follow and unfollow other users so that I can build a personal network of trusted wine discoverers.

#### Acceptance Criteria

```gherkin
Given an authenticated user
When they call the followUser action with a valid target user_id
Then a follow relationship is created and { data: { success: true } } is returned

Given an authenticated user who already follows target user
When they call followUser again
Then { error: "Already following this user" } is returned

Given an authenticated user
When they call unfollowUser with a valid target user_id
Then the follow relationship is deleted and { data: { success: true } } is returned

Given an authenticated user
When they try to follow themselves
Then { error: "Cannot follow yourself" } is returned

Given an unauthenticated request
When any follow action is called
Then { error: "Authentication required" } is returned
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/follows.ts` | Create |
| Validation | `lib/validations/follows.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-02] — DAL functions must exist
- **Blocks:** [EPIC-08/STORY-07] — FollowButton component calls these actions

#### Testing Requirements

- [ ] **Unit:** Zod validation rejects invalid user_id formats
- [ ] **Integration:** followUser creates a follow row and returns success
- [ ] **Integration:** followUser returns error for duplicate follow
- [ ] **Integration:** unfollowUser removes the follow row
- [ ] **Integration:** self-follow is rejected before hitting the database
- [ ] **Integration:** unauthenticated calls return auth error

#### Implementation Notes

**Server Action pattern:**
```typescript
'use server'
// followUser: Zod validate → auth check (getUser) → self-follow check → DAL createFollow → revalidatePath
// unfollowUser: Zod validate → auth check → DAL deleteFollow → revalidatePath
```

Zod schema: `{ targetUserId: z.string().uuid() }`

No permission check needed beyond auth — any authenticated user can follow any other user. The database CHECK constraint is the final defense against self-follows, but the action should catch it earlier for a better error message.

`revalidatePath` on the target user's profile page to refresh follower counts for other viewers.
