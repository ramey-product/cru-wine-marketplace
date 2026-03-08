# Epic: [EPIC-08] — Social/Community Layer (V0)

**Source PRD:** `docs/prds/prd-08-social-layer.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 4,200 (V0 scope)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, fullstack-4, ux-designer, marketing-writer

## Epic Summary

Cru's V0 social layer provides two deliberately minimal social primitives: external sharing (growth loop) and internal follows (retention signal). Users can share wine and producer pages to any platform via the Web Share API or clipboard fallback, with rich Open Graph previews that drive organic traffic. The follow system builds a social graph that validates the full social expansion in Month 4-5 while giving users a sense of community from Day 1. V0 builds nothing beyond these two primitives — no feed, no UGC, no messaging.

## Success Criteria

- [ ] Users can share wine and producer pages via native share sheet on mobile, with clipboard fallback on desktop
- [ ] Shared links render rich Open Graph previews (wine image, name, producer, price) on all major platforms
- [ ] Users can follow/unfollow other users with optimistic UI and accurate follower/following counts
- [ ] Public user profiles display at `/users/[username]` with follow button, bio, and counts
- [ ] Share events and follow actions are tracked for analytics (share volume, platform distribution, graph density)
- [ ] Privacy toggle allows users to control profile visibility (public vs. private)

## Story Index

| Story | Title | Type | Points | File |
|-------|-------|------|--------|------|
| STORY-01 | Social Layer Database Schema | backend | 5 | [`story-01-social-layer-database-schema.md`](epic-08/story-01-social-layer-database-schema.md) |
| STORY-02 | DAL Functions for Follows and Shares | backend | 3 | [`story-02-dal-functions-follows-shares.md`](epic-08/story-02-dal-functions-follows-shares.md) |
| STORY-03 | Follow/Unfollow Server Actions | backend | 3 | [`story-03-follow-unfollow-server-actions.md`](epic-08/story-03-follow-unfollow-server-actions.md) |
| STORY-04 | Share Tracking Server Action and API Route | backend | 2 | [`story-04-share-tracking-server-action.md`](epic-08/story-04-share-tracking-server-action.md) |
| STORY-05 | Open Graph Metadata for Shareable Pages | fullstack | 3 | [`story-05-open-graph-metadata.md`](epic-08/story-05-open-graph-metadata.md) |
| STORY-06 | Share Button Component | frontend | 5 | [`story-06-share-button-component.md`](epic-08/story-06-share-button-component.md) |
| STORY-07 | Follow/Unfollow Button with Optimistic UI | frontend | 3 | [`story-07-follow-button-optimistic-ui.md`](epic-08/story-07-follow-button-optimistic-ui.md) |
| STORY-08 | User Profile Page (Public View) | fullstack | 5 | [`story-08-user-profile-page.md`](epic-08/story-08-user-profile-page.md) |
| STORY-09 | Following and Followers List Pages | frontend | 3 | [`story-09-following-followers-list-pages.md`](epic-08/story-09-following-followers-list-pages.md) |
| STORY-10 | UX Design and User-Facing Copy for Social Layer | design | 3 | [`story-10-ux-design-social-copy.md`](epic-08/story-10-ux-design-social-copy.md) |

**Total: 10 stories, 35 story points**

## Architecture Dependencies

- **Database tables:** `follows` (new), `share_events` (new), `user_profiles` ALTER (add username, bio, is_public columns)
- **Existing tables consumed:** `wines`, `producers`, `user_profiles` (from Epic 01)
- **External integrations:** Web Share API (browser-native), Open Graph protocol
- **Shared components:** ShareButton (reusable on wine detail, producer profile, collection pages), FollowButton (reusable on user profiles, curator cards)

## Cross-Cutting Concerns

- **Open Graph tags** require wine images, producer names, and taglines from Epic 04 (Producer Storytelling) — wine/producer pages must have `generateMetadata()` that pulls this data
- **User profiles** extend the `user_profiles` table from Epic 01 — schema changes must be additive (new columns, not restructuring)
- **Share URLs** use the same slug-based routing from Epic 02 (Search & Browse) — `/wines/[slug]` and `/producers/[slug]`
- **UTM parameter tracking** feeds into analytics infrastructure that may be shared with recommendation_events (Epic 07)
- **CG-2 applied:** `follows` and `share_events` are user-scoped (NO `org_id`) — they represent personal user behavior, not org-owned data. This overrides the PRD's `org_id` specification per the Checkpoint 1 architecture resolution.

## Technical Risks & Open Questions

- [ ] Web Share API browser support — need graceful fallback detection and desktop experience that doesn't feel second-class
- [ ] Open Graph image generation — do we serve the wine's existing image or generate a branded card? V0: use existing wine image, V1: branded OG image via `@vercel/og`
- [ ] Username uniqueness enforcement — need migration strategy if user_profiles doesn't already have a unique username field
- [ ] Follow count denormalization — real-time counts via `COUNT(*)` queries or denormalized counters on user_profiles? V0: query-based (simpler), revisit if performance degrades

---

## Developer Stories

---

### [EPIC-08/STORY-01] — Social Layer Database Schema

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want the follows and share_events tables created with proper indexes and RLS so that the social layer has its data foundation.

#### Acceptance Criteria

```gherkin
Given the migration runs
When I inspect the database schema
Then the follows table exists with follower_id, following_id, created_at columns and a UNIQUE constraint on (follower_id, following_id)

Given the migration runs
When I inspect the database schema
Then the share_events table exists with user_id, shareable_type, shareable_id, platform, created_at columns

Given the migration runs
When I inspect user_profiles
Then it has username (TEXT UNIQUE), bio (TEXT), and is_public (BOOLEAN DEFAULT true) columns added

Given a user attempts to follow themselves
When the INSERT executes
Then a CHECK constraint prevents follower_id = following_id

Given two users in the follows table
When RLS policies are evaluated
Then a user can only see their own follow relationships (rows where follower_id = auth.uid() OR following_id = auth.uid())
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_social_layer_schema.sql` | Create |
| Test | `supabase/tests/social-layer.test.sql` | Create |

#### Dependencies

- **Blocked by:** [EPIC-01/STORY-01] — user_profiles table must exist for ALTER and for foreign key references
- **Blocks:** [EPIC-08/STORY-02] — DAL functions need schema to exist

#### Testing Requirements

- [ ] **RLS:** User can read their own follows (as follower or following)
- [ ] **RLS:** User cannot read follows between two other users
- [ ] **RLS:** User can insert a follow where follower_id = their own user_id
- [ ] **RLS:** User cannot insert a follow for another user
- [ ] **RLS:** User can read their own share_events
- [ ] **RLS:** User cannot read another user's share_events
- [ ] **Constraint:** UNIQUE(follower_id, following_id) prevents duplicate follows
- [ ] **Constraint:** CHECK(follower_id != following_id) prevents self-follows
- [ ] **Constraint:** shareable_type CHECK IN ('wine', 'producer')
- [ ] **Constraint:** platform CHECK IN ('native_share', 'clipboard', 'twitter', 'facebook', 'email')

#### Implementation Notes

**CG-2 Table Classification:**
- `follows` — user-scoped (NO `org_id`). Follow relationships are between users, not org-owned data. Both `follower_id` and `following_id` reference `auth.users(id)`.
- `share_events` — user-scoped (NO `org_id`). Like `recommendation_events`, these are personal user behavior logs.
- `user_profiles` ALTER — user_profiles is already user-scoped from Epic 01.

**Schema design:**

```sql
-- User-scoped: NO org_id per CG-2
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- User-scoped: NO org_id per CG-2
CREATE TABLE share_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shareable_type TEXT NOT NULL CHECK (shareable_type IN ('wine', 'producer')),
  shareable_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('native_share', 'clipboard', 'twitter', 'facebook', 'email')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_share_events_user ON share_events(user_id);
CREATE INDEX idx_share_events_shareable ON share_events(shareable_type, shareable_id);

-- Extend user_profiles (already user-scoped from Epic 01)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 160),
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
```

**RLS for follows** — users can see follows they're part of (as follower or following), can insert their own follows, can delete their own follows. Public follower/following counts are handled via a count function or view.

**No `updated_at` on follows or share_events** — follows are created/deleted (never updated), share_events are append-only log entries. Both are immutable once created.

---

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

---

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

---

### [EPIC-08/STORY-04] — Share Tracking Server Action and API Route

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a product team member, I want every share event tracked so that we can measure organic growth and identify our most-shared content.

#### Acceptance Criteria

```gherkin
Given a user shares a wine via the share button
When the trackShare action is called
Then a share_event row is inserted with correct shareable_type, shareable_id, and platform

Given a share event with an invalid platform value
When the action validates input
Then { error: "Invalid platform" } is returned

Given a logged-out user clicks share (clipboard copy)
When the API route receives the event
Then the event is stored with user_id = null (anonymous share tracking)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/shares.ts` | Create |
| Validation | `lib/validations/shares.ts` | Create |
| Route | `app/api/v1/share-events/route.ts` | Create (for beacon/anonymous tracking) |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-02] — DAL functions must exist
- **Blocks:** [EPIC-08/STORY-06] — ShareButton component fires these tracking calls

#### Testing Requirements

- [ ] **Unit:** Zod validation accepts valid shareable_type and platform values
- [ ] **Unit:** Zod validation rejects unknown platform or shareable_type values
- [ ] **Integration:** trackShare inserts a share_event row with correct data
- [ ] **Integration:** API route handles POST with valid body

#### Implementation Notes

Two tracking paths:
1. **Server Action** (`trackShare`) — for authenticated users, called from ShareButton client component
2. **API Route** (`POST /api/v1/share-events`) — for fire-and-forget tracking via `navigator.sendBeacon()`, supports anonymous shares

Zod schema:
```typescript
{
  shareableType: z.enum(['wine', 'producer']),
  shareableId: z.string().uuid(),
  platform: z.enum(['native_share', 'clipboard', 'twitter', 'facebook', 'email'])
}
```

The API route should be lightweight — validate, insert, return 202 Accepted. No auth required for the API route (anonymous share tracking is valuable for measuring share link reach).

---

### [EPIC-08/STORY-05] — Open Graph Metadata for Shareable Pages

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user sharing a wine link, I want the shared link to display a rich preview card (wine image, name, producer, price) so that my friends are compelled to click through.

#### Acceptance Criteria

```gherkin
Given a wine detail page URL is pasted into iMessage
When the link preview renders
Then it shows the wine's hero image, wine name, producer name, and price (if available)

Given a producer profile page URL is shared on Twitter/X
When the link card renders
Then it shows the producer's image, name, region, and tagline

Given a wine page URL is shared
When the Open Graph tags are inspected
Then og:title, og:description, og:image, og:url, og:type, and twitter:card meta tags are present

Given a shared URL includes UTM parameters
When the page loads
Then the UTM params do not affect page content or rendering
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/wines/[slug]/page.tsx` | Modify (add generateMetadata) |
| Page | `app/(app)/producers/[slug]/page.tsx` | Modify (add generateMetadata) |
| Component | `components/shared/OGMetaTags.tsx` | Create (optional helper) |

#### Dependencies

- **Blocked by:** [EPIC-04/STORY-08] — Wine detail page must exist with slug routing
- **Blocked by:** [EPIC-04/STORY-07] — Producer profile page must exist
- **Blocks:** [EPIC-08/STORY-06] — ShareButton UX is better when previews look good

#### Testing Requirements

- [ ] **Integration:** Wine page generateMetadata returns correct og:title, og:image, og:description
- [ ] **Integration:** Producer page generateMetadata returns correct og:title, og:image, og:description
- [ ] **Integration:** twitter:card is set to "summary_large_image"
- [ ] **Integration:** og:url does not include UTM parameters (canonical URL only)

#### Implementation Notes

Use Next.js `generateMetadata()` export in the page file. This is the standard approach for dynamic OG tags in App Router.

**Wine page metadata:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wine = await getWineBySlug(client, params.slug)
  return {
    title: `${wine.name} — ${wine.producer.name} | Cru`,
    description: wine.tagline || `${wine.varietal} from ${wine.region}`,
    openGraph: {
      title: wine.name,
      description: wine.tagline,
      images: [{ url: wine.hero_image_url, width: 1200, height: 630 }],
      type: 'product',
      url: `https://cru.wine/wines/${wine.slug}`,
    },
    twitter: { card: 'summary_large_image' },
  }
}
```

**Producer page metadata** — similar pattern with producer fields.

V0: Use existing wine/producer images. V1 enhancement: generate branded OG images via `@vercel/og` for a more polished social card.

Ensure `og:url` is the canonical URL (no UTM params) — UTM params are only appended by the share button client-side.

---

### [EPIC-08/STORY-06] — Share Button Component

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want to share a wine or producer page to my preferred platform so that I can recommend it to friends with a single tap.

#### Acceptance Criteria

```gherkin
Given a user taps "Share" on a wine detail page on mobile
When the Web Share API is supported
Then the native share sheet opens with the wine name, description, and URL with UTM params

Given a user clicks "Share" on desktop where Web Share API is not supported
When the fallback UI renders
Then it shows "Copy link," Twitter/X, Facebook, and Email share options

Given a user clicks "Copy link"
When the clipboard write succeeds
Then a toast notification confirms "Link copied!" and a share_event is tracked with platform = "clipboard"

Given a user shares via the native share sheet
When the share dialog closes
Then a share_event is tracked with platform = "native_share"

Given any share action
When the URL is constructed
Then UTM parameters are appended: utm_source=share&utm_medium=[platform]&utm_campaign=user_share
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/social/ShareButton.tsx` | Create |
| Component | `components/features/social/ShareMenu.tsx` | Create (desktop fallback) |
| Hook | `lib/hooks/useWebShare.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-04] — share tracking action/API must exist
- **Blocked by:** [EPIC-08/STORY-05] — OG metadata should be in place for good share previews
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** useWebShare hook correctly detects Web Share API support
- [ ] **Unit:** UTM parameters are correctly appended to share URLs
- [ ] **Unit:** ShareMenu renders correct platform links with proper URLs
- [ ] **Integration:** Share button calls trackShare action with correct platform
- [ ] **Accessibility:** Share button has aria-label, ShareMenu is keyboard navigable

#### Implementation Notes

**Component architecture:**
- `ShareButton` — client component (`'use client'`). Detects Web Share API support via `navigator.share`. On mobile (supported): calls `navigator.share()` directly. On desktop (unsupported): opens `ShareMenu` popover.
- `ShareMenu` — Shadcn `Popover` with share options: Copy Link, Twitter/X, Facebook, Email. Each option constructs the appropriate share URL with UTM params.
- `useWebShare` hook — encapsulates `navigator.share` detection and invocation, handles the promise rejection when user cancels the share sheet.

**UTM construction:**
```typescript
function buildShareUrl(baseUrl: string, platform: string): string {
  const url = new URL(baseUrl)
  url.searchParams.set('utm_source', 'share')
  url.searchParams.set('utm_medium', platform)
  url.searchParams.set('utm_campaign', 'user_share')
  return url.toString()
}
```

**Platform-specific share URLs:**
- Twitter/X: `https://twitter.com/intent/tweet?url={url}&text={text}`
- Facebook: `https://www.facebook.com/sharer/sharer.php?u={url}`
- Email: `mailto:?subject={subject}&body={body}`

**Clipboard:** Use `navigator.clipboard.writeText()` with Shadcn `toast()` confirmation.

**Tracking:** Fire `trackShare` action (or `sendBeacon` to API route for non-blocking) after each share action. For native share, track on share sheet open (we can't detect if user completed the share).

Props interface:
```typescript
interface ShareButtonProps {
  shareableType: 'wine' | 'producer'
  shareableId: string
  title: string
  description: string
  url: string
  imageUrl?: string
}
```

---

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

---

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

---

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

---

### [EPIC-08/STORY-10] — UX Design and User-Facing Copy for Social Layer

**Type:** design
**Story Points:** 3
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user, I want the social features to feel natural and human — not like a corporate social network — so that sharing and following feels like something I'd actually do with wine friends.

#### Acceptance Criteria

```gherkin
Given the UX designer delivers social component wireframes
When the designs are reviewed
Then they include: ShareButton placement on wine/producer pages, ShareMenu layout, FollowButton states, UserProfile layout, Following/Followers list layout, and privacy toggle placement

Given the marketing writer delivers social copy
When the copy is reviewed
Then it includes: share button label and toast messages, follow/unfollow button states, empty state messages (no followers yet, no following yet), privacy toggle description, profile bio placeholder text, and "Follow to see more" private profile message

Given the social UX patterns
When compared against Cru's brand guidelines
Then the social layer avoids: follower count vanity (no prominence beyond small text), notification spam patterns, engagement-bait language, or anything that feels like a "social media platform"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `components/features/social/` | Inform (all component designs) |
| Copy | Social copy strings | Create |

#### Dependencies

- **Blocked by:** None (design and copy can start in parallel with backend)
- **Blocks:** [EPIC-08/STORY-06], [EPIC-08/STORY-07], [EPIC-08/STORY-08], [EPIC-08/STORY-09] — all frontend stories consume these designs and copy

#### Testing Requirements

- [ ] **Accessibility:** All social components meet WCAG 2.1 AA in design
- [ ] **Accessibility:** Color contrast ratios verified for follow button states
- [ ] **Accessibility:** Screen reader announcements defined for optimistic state changes

#### Implementation Notes

**Key UX decisions for ux-designer:**
- ShareButton placement: icon button (share icon) in the action bar of wine detail and producer profile pages. Not too prominent — it's a utility, not a CTA.
- ShareMenu: Shadcn `Popover` anchored to the share icon. Clean list of platform icons + labels. "Copy link" at the top (most common action).
- FollowButton: Compact, secondary style. "Follow" / "Following" / "Unfollow" (on hover). Not a primary CTA — following is a background action.
- Profile page: Clean, minimal layout. Avatar + name prominently. Bio below. Counts small and understated (not vanity metrics). No "activity score" or gamification.
- Privacy toggle: In account settings, not on the profile page itself. Simple on/off with explanation.

**Key copy decisions for marketing-writer:**
- Share toast: "Link copied!" (not "Shared successfully!" — the user knows what they did)
- Empty followers: "No followers yet — share your favorite wines to connect with friends"
- Empty following: "You're not following anyone yet — discover wine lovers you trust"
- Private profile message: "This profile is private. Follow to see more."
- Bio placeholder: "Tell the world what you love about wine (160 chars)"
- Follow CTA from shared link (logged out): "Join Cru to follow [name] and discover wines together"

Tone: warm, casual, wine-friend energy. Never corporate. Never "grow your network" language.
