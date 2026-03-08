### [EPIC-08/STORY-07] — Follow/Unfollow Button with Optimistic UI

**Type:** frontend
**Story Points:** 3
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want to follow another user with a single tap and see the state change instantly so that the interaction feels responsive and natural.

#### Acceptance Criteria

```gherkin
Given User A views User B's profile and is not following them
When User A taps "Follow"
Then the button immediately changes to "Following" state and the follower count increments by 1

Given User A is following User B
When User A taps "Following" (hover shows "Unfollow")
Then the button immediately changes to "Follow" state and the follower count decrements by 1

Given the follow action fails on the server (e.g., network error)
When the optimistic update is rolled back
Then the button reverts to its previous state and a toast shows "Couldn't follow — try again"

Given a logged-out visitor views a user profile
When they tap "Follow"
Then they are redirected to the signup/login page with a return URL
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/social/FollowButton.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-03] — follow/unfollow Server Actions must exist
- **Blocks:** [EPIC-08/STORY-08] — User profile page includes the FollowButton

#### Testing Requirements

- [ ] **Unit:** Button renders "Follow" when isFollowing = false
- [ ] **Unit:** Button renders "Following" when isFollowing = true
- [ ] **Unit:** Optimistic state change happens immediately on click
- [ ] **Unit:** Rollback restores previous state on server error
- [ ] **Accessibility:** Button has clear aria-label indicating current state and action

#### Implementation Notes

Client component with `useOptimistic` from React for instant state updates.

**State machine:**
- Default: `"Follow"` (not following)
- Following: `"Following"` (on hover → `"Unfollow"` with red text)
- Loading: disabled with spinner during server round-trip (brief — optimistic update makes this nearly invisible)

```typescript
interface FollowButtonProps {
  targetUserId: string
  isFollowing: boolean
  followerCount: number
}
```

Use `useOptimistic` to update both button state and follower count simultaneously. The `startTransition` wrapping ensures the optimistic update is shown immediately while the Server Action runs.

Hover behavior on desktop: "Following" label shows in green/neutral. On hover, text changes to "Unfollow" with destructive styling (red text). This is the Twitter/X pattern — familiar to users.

Logged-out handling: check auth state client-side. If no session, redirect to `/login?returnTo=/users/${username}` on click.
