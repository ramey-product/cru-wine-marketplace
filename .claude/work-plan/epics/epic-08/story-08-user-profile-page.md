### [EPIC-08/STORY-08] — User Profile Page (Public View)

**Type:** fullstack
**Story Points:** 5
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want to visit another user's profile to see who they are, how many people follow them, and to follow them myself so that I can build trust in their wine taste.

#### Acceptance Criteria

```gherkin
Given a user has a public profile
When any visitor navigates to /users/[username]
Then they see the user's display name, avatar, bio, join date, follower count, following count, and a Follow button

Given a user has a private profile
When a non-follower navigates to /users/[username]
Then they see a limited view: display name, avatar, and a "Follow to see more" message

Given a user views their own profile
When the page renders
Then they see an "Edit profile" link instead of a Follow button

Given a username that doesn't exist
When a visitor navigates to /users/[invalid-username]
Then a 404 page is displayed

Given a user follows someone who later deletes their account
When the follower visits the deleted user's profile
Then a 404 page is displayed (follow silently removed via CASCADE)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/users/[username]/page.tsx` | Create |
| Page | `app/(app)/users/[username]/loading.tsx` | Create |
| Page | `app/(app)/users/[username]/not-found.tsx` | Create |
| Component | `components/features/social/UserProfileCard.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-01] — username column must exist on user_profiles
- **Blocked by:** [EPIC-08/STORY-02] — getUserByUsername, getFollowCounts DAL functions
- **Blocked by:** [EPIC-08/STORY-07] — FollowButton component
- **Blocks:** [EPIC-08/STORY-09] — Following/Followers lists link from this page

#### Testing Requirements

- [ ] **Integration:** Public profile renders all fields correctly
- [ ] **Integration:** Private profile shows limited view to non-followers
- [ ] **Integration:** Own profile shows "Edit profile" instead of Follow
- [ ] **Integration:** Invalid username returns 404
- [ ] **Accessibility:** Profile page passes axe-core scan
- [ ] **Accessibility:** All interactive elements have aria-labels

#### Implementation Notes

**Routing:** `/users/[username]` lives under `app/(app)/` but is accessible without org context. This is a platform-level route (users are global, not org-scoped).

**Page structure (Server Component):**
```
UserProfilePage
├── UserProfileCard (Server Component)
│   ├── Avatar + Display Name + Bio
│   ├── Join date
│   ├── Follower Count / Following Count (links to lists)
│   └── FollowButton (Client Component) or "Edit Profile" link
└── [Future: Activity feed placeholder — V1]
```

**Data fetching:** Single server-side fetch of user profile + follow counts + isFollowing (if viewer is authenticated). Pass as props to avoid waterfall.

```typescript
const profile = await getUserByUsername(client, params.username)
if (!profile) notFound()

const counts = await getFollowCounts(client, profile.id)
const isFollowing = currentUser
  ? await getIsFollowing(client, currentUser.id, profile.id)
  : false
```

**Privacy logic:** If `profile.is_public === false` and the viewer is not a follower (and not the profile owner), render the limited view. The limited view shows name + avatar + "Follow to see more" + FollowButton.

**Metadata:** `generateMetadata` with profile name and avatar for when profile URLs are shared.
