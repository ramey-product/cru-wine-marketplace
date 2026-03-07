# PRD: Social/Community Layer

**Feature:** Social/Community Layer (V0)
**Priority:** P0 — Launch Critical (RICE: 4,200 — V0 scope)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Wine is inherently social. People share bottles at dinner, text friends photos of labels, ask "what should I bring to the party?" — yet no wine platform has built a social layer that reflects how people actually share wine recommendations. Vivino has reviews (anonymous crowd noise). CellarTracker has forums (enthusiast echo chambers). Neither captures the trust dynamic of "my friend who has great taste says try this."

Cru's long-term vision includes a full social graph — community tasting notes, shared wishlists, collaborative collections, and social proof on wine cards. But at launch, the scope is deliberately minimal: follow other users and share wines/producers to external platforms. This V0 gives us the social graph data structure, proves the sharing behavior hypothesis, and sets up the infrastructure for the V1 social expansion in Month 4-5.

The risk of over-building social at launch is wasted engineering time on features no one uses yet. The risk of zero social is missing the organic growth loop entirely — every shared wine card is a potential new user acquisition. V0 threads the needle: share externally (growth), follow internally (retention signal), build nothing else until we see usage data.

## 2. Goals

**User Goals:**
- Share a wine or producer they love with friends via their preferred platform (iMessage, Instagram, WhatsApp, etc.)
- Follow other Cru users whose taste they trust so they can see what those people are discovering
- Feel that Cru is a place for people, not just a catalog — even if the social features are minimal at launch

**Business Goals:**
- Generate 500+ external shares/month by Month 3 (organic acquisition channel)
- Build a social graph with 30%+ of active users following at least one other user by Month 3
- Collect follow/share interaction data that validates (or invalidates) the full social build in Month 4-5
- Create shareable wine card URLs that drive organic traffic and SEO value

## 3. Non-Goals

- **Community tasting notes or reviews** — No UGC at launch. Full community notes are a Month 4-5 feature tied to the Social V1 expansion.
- **In-app messaging or chat** — Not at launch, not even in V1 social. This is a P3 consideration at earliest.
- **Activity feed or timeline** — V0 has no feed. Users follow others but don't see a stream of their activity yet. The feed is a V1 social feature.
- **Social proof on wine cards ("12 friends liked this")** — Requires a mature social graph. This is P1.
- **Group features (shared lists, tasting groups, events)** — P2 feature after social graph proves valuable.
- **Gamification (badges, streaks, leaderboards)** — Not aligned with Cru's anti-pretentious brand.

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to share a wine I discovered on Cru to my Instagram story or iMessage so that my friends can see what I found.
- As an Explorer, I want the shared link to show a beautiful preview card (wine image, name, producer, one-line story hook) so that it looks good in the share context.
- As an Explorer, I want to follow a friend who's also on Cru so that I can eventually see what they're discovering.

### Enthusiast (Secondary)
- As an Enthusiast, I want to share a producer profile page so that I can tell friends about a winemaker I admire.
- As an Enthusiast, I want to see how many followers I have so that I know if my recommendations have an audience.
- As an Enthusiast, I want to find and follow Cru's founding curators so that I can see what the experts are picking.

### All Users
- As any user, I want to control whether my profile is publicly visible or private so that I have control over my social presence.
- As any user, I want to see a list of people I follow and people who follow me so that I can manage my connections.

### Edge Cases
- As a user who shares a wine that goes out of stock, I want the shared link to still work and show the wine with a "Notify me when available" option rather than a dead page.
- As a user who follows someone who deletes their account, I want that follow to silently disappear without an error.
- As a new user who arrived via a shared wine link, I want to see the wine immediately (no hard signup gate) and then be prompted to create an account to save or buy it.

## 5. Requirements

### Must-Have (P0)

**Share Functionality**
- Share button on Wine Detail Page and Producer Profile Page
- Uses Web Share API on mobile (native share sheet: iMessage, WhatsApp, Instagram, etc.)
- Fallback for desktop: copy-to-clipboard with toast confirmation + direct links for Twitter/X, Facebook, email
- Shared URL format: `https://cru.wine/wines/[slug]` or `https://cru.wine/producers/[slug]` — same as SEO-optimized pages
- Open Graph meta tags on all shareable pages: wine image, name, producer, tagline, price (if available)
- UTM parameters appended to shared links: `?utm_source=share&utm_medium=[platform]&utm_campaign=user_share`
- Acceptance criteria:
  - Given a user taps "Share" on a wine detail page on mobile, when the native share sheet opens, then the shared content includes the wine name, a one-line description, and the full URL with UTM params
  - Given a shared wine URL is pasted into iMessage, when the link preview renders, then it shows the wine's image, name, producer, and price
  - Given a user copies a link on desktop, when the clipboard write succeeds, then a toast notification confirms "Link copied!"

**Follow System**
- Follow/unfollow button on user profile pages
- `follows` table: id, follower_id (user_id), following_id (user_id), created_at, org_id
- Unique constraint on (follower_id, following_id) to prevent duplicate follows
- User profile displays follower count and following count
- Follow action is instant (optimistic UI) with server confirmation
- Acceptance criteria:
  - Given User A views User B's profile, when User A taps "Follow," then User B's follower count increments by 1 and User A sees "Following" state
  - Given User A already follows User B, when User A taps "Following" (unfollow), then the follow is removed and counts update
  - Given User A follows 10 users, when User A views their "Following" list, then all 10 profiles appear with current follower counts

**User Profile (Public View)**
- Public profile page at `/users/[username]`
- Displays: display name, avatar, join date, follower/following counts, bio (optional, ≤ 160 chars)
- Privacy toggle: public (anyone can see profile) or private (only followers can see activity — future-proofed for V1)
- No activity feed in V0 — profile shows basic info + follow button only
- Acceptance criteria:
  - Given a user has set their profile to public, when any visitor navigates to their profile URL, then they see the user's display name, avatar, follower/following counts, and a follow button
  - Given a user has set their profile to private, when a non-follower views their profile, then they see a limited view (name + avatar only) with a "Follow to see more" prompt

**Share Tracking**
- `share_events` table: id, user_id, shareable_type (enum: wine, producer), shareable_id, platform (enum: native_share, clipboard, twitter, facebook, email), created_at, org_id
- Track every share action for analytics (share volume, most-shared wines, platform distribution)
- Acceptance criteria:
  - Given a user shares a wine via the native share sheet, when the share completes, then a share_event row is inserted with platform = "native_share"

**Technical Requirements**
- `follows` table with RLS, org_id, indexes on follower_id and following_id, updated_at trigger
- `share_events` table with RLS, org_id, index on shareable_type + shareable_id
- DAL functions in `lib/dal/follows.ts`, `lib/dal/shares.ts`
- Server Actions in `lib/actions/follows.ts` (follow/unfollow), `lib/actions/shares.ts` (track share)
- User profile as Server Component with follow button as Client Component (optimistic update)
- Open Graph tags dynamically generated via Next.js `generateMetadata()` on wine and producer pages

### Nice-to-Have (P1)

- Activity feed: see wines purchased, wishlisted, or shared by people you follow
- "Friends on Cru" discovery: find friends via phone contacts or social account connection
- Social proof on wine cards: "2 people you follow wishlisted this"
- Shared wishlists: create a collaborative wine list with friends
- Follow suggestions: "People with similar taste" based on taste profile overlap

### Future Considerations (P2)

- Community tasting notes: write and share personal tasting impressions
- Tasting groups: create private groups for wine clubs or friend circles
- Social-driven curation: "Trending among people you follow"
- Wine gifting via social connection: "Send this bottle to [friend]"

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Share rate | 5% of wine detail page views result in a share | 8% | share_events / wine PDP views |
| Share platform distribution | 60%+ of shares via native share (mobile) | 70% | share_events by platform |
| Follow adoption | 20% of active users follow at least 1 person | 30% | follows table distinct follower_ids / active users |
| Shared link click-through | 10% of shared links result in a site visit | 15% | UTM tracking in analytics |
| Profile completion | 40% of users add a bio and avatar | 50% | user_profiles completeness check |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Monthly shares | 500+ shares/month by Month 3 | 1,000+ | share_events count |
| Share-to-signup conversion | 5% of shared link visitors create an account | 8% | UTM → signup funnel |
| Social graph density | Average 3+ follows per active user by Month 3 | 5+ | follows count / active users |
| Social-driven retention | Users who follow 3+ people have 1.5x Day-30 retention vs. non-followers | 2x | Cohort analysis |

## 7. Open Questions

- **[Engineering — blocking]** Web Share API support: what's the fallback experience on browsers that don't support it (mainly older desktop browsers)? Proposed: clipboard copy + platform-specific share links.
- **[Design — blocking]** Where does the follow button live outside of the profile page? Should wine cards show the producer's follow count? Should curated collections show the curator's follow button?
- **[Product — non-blocking]** Should we support "Follow" from a shared link landing page for logged-out visitors? Proposed: show the follow button but prompt signup when clicked.
- **[Growth — non-blocking]** What's the ideal Open Graph card design? Wine photo dominant, or wine + producer composite? Need design exploration and A/B testing infrastructure.

## 8. Timeline Considerations

- **Build order: #8** — But the follows data model and share tracking can be scaffolded in Week 4-5 alongside other Track A work.
- **Weeks 6-8 of pre-launch sprint** (Track A)
- **Hard dependency:** User Accounts (#1) for user profiles and authentication. Producer Storytelling (#4) for shareable wine/producer pages with Open Graph tags.
- **No hard dependency on:** Search, Taste Profile, Order Placement, or Retailer Integration — social features are orthogonal to the commerce chain.
- **Downstream dependents:** Full Social V1 expansion (Month 4-5) builds directly on the follows table and share infrastructure. Push Notifications (P1) uses follows for "Someone you follow just..." alerts.
- **Risk mitigation:** V0 scope is deliberately minimal. If social features get cut for time, the only loss is the share button and follow system — the commerce flow is completely unaffected.
