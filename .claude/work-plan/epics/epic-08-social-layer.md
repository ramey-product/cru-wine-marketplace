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

> Individual story files are located in `.claude/work-plan/stories/epic-08/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-08/story-01-social-layer-database-schema.md) | Social Layer Database Schema | backend | 5 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-08/story-02-dal-functions-follows-shares.md) | DAL Functions for Follows and Shares | backend | 3 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-08/story-03-follow-unfollow-server-actions.md) | Follow/Unfollow Server Actions | backend | 3 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-08/story-04-share-tracking-server-action.md) | Share Tracking Server Action and API Route | backend | 2 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-08/story-05-open-graph-metadata.md) | Open Graph Metadata for Shareable Pages | fullstack | 3 | fullstack-1 | CP4 | pending |
| [STORY-06](../stories/epic-08/story-06-share-button-component.md) | Share Button Component | frontend | 5 | fullstack-2 | CP4 | pending |
| [STORY-07](../stories/epic-08/story-07-follow-button-optimistic-ui.md) | Follow/Unfollow Button with Optimistic UI | frontend | 3 | fullstack-2 | CP4 | pending |
| [STORY-08](../stories/epic-08/story-08-user-profile-page.md) | User Profile Page (Public View) | fullstack | 5 | fullstack-1 | CP4 | pending |
| [STORY-09](../stories/epic-08/story-09-following-followers-list-pages.md) | Following and Followers List Pages | frontend | 3 | fullstack-4 | CP4 | pending |
| [STORY-10](../stories/epic-08/story-10-ux-design-social-copy.md) | UX Design and User-Facing Copy for Social Layer | design | 3 | ux-designer | CP4 | pending |

**Total: 10 stories, 35 story points**
