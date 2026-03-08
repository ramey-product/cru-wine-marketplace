### [EPIC-08/STORY-09] — Following and Followers List Pages

**Type:** frontend
**Story Points:** 3
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want to see a list of people I follow and people who follow me so that I can manage my connections and discover new users.

#### Acceptance Criteria

```gherkin
Given a user views their "Following" list
When the page renders
Then all users they follow are displayed with display name, avatar, bio snippet, and an Unfollow button

Given a user views their "Followers" list
When the page renders
Then all their followers are displayed with display name, avatar, bio snippet, and a Follow Back button (if not already following)

Given a user has more than 50 follows
When the list renders
Then pagination controls appear to load more results

Given a user views another user's following/followers list
When the profile is public
Then the lists are visible to all visitors
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/users/[username]/following/page.tsx` | Create |
| Page | `app/(app)/users/[username]/followers/page.tsx` | Create |
| Component | `components/features/social/UserListItem.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-02] — getFollowing, getFollowers DAL functions
- **Blocked by:** [EPIC-08/STORY-07] — FollowButton component for follow-back
- **Blocked by:** [EPIC-08/STORY-08] — User profile page links to these lists

#### Testing Requirements

- [ ] **Integration:** Following list displays correct users with profile data
- [ ] **Integration:** Followers list displays correct users with Follow Back button where applicable
- [ ] **Integration:** Pagination loads next batch of results
- [ ] **Accessibility:** List items are keyboard navigable, pagination controls have aria-labels

#### Implementation Notes

**Route structure:**
- `/users/[username]/following` — list of people this user follows
- `/users/[username]/followers` — list of people following this user

Both are Server Components that fetch data server-side. The FollowButton within each list item is a Client Component for optimistic updates.

**UserListItem component:**
```typescript
interface UserListItemProps {
  user: {
    id: string
    displayName: string
    avatarUrl: string | null
    bio: string | null
    username: string
  }
  showFollowButton: boolean
  isFollowing: boolean
}
```

Pagination: V0 uses simple "Load more" button (not infinite scroll). Pass `offset` as URL search param for server-side pagination. Default 50 per page.

Privacy: Respect `is_public` on the profile being viewed. If the profile is private and the viewer is not a follower, these list pages return 404 or a "private profile" message.
