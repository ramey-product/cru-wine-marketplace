# Epic: [EPIC-01] — User Accounts & Authentication

**Source PRD:** `docs/prds/prd-01-user-accounts.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 10,000
**Build Order:** #1 (Track A — root of all dependency chains)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, ux-designer, marketing-writer, qa

## Epic Summary

User Accounts is the foundational epic upon which every other P0 feature depends. It delivers authenticated user sessions (email+password, Google OAuth, Apple Sign-In), user preference capture (location, price range, occasion interests), wishlist management, and account lifecycle (profile editing, notification prefs, CCPA-compliant account deletion). Without this epic, no personalization, ordering, or social features can function.

## Success Criteria

- [ ] Users can sign up via email+password, Google OAuth, or Apple Sign-In with <60s completion time
- [ ] 70%+ of signup starters complete the flow (measured via analytics events)
- [ ] Age gate checkbox (21+) is enforced on all signup paths
- [ ] Users can set and edit location (zip/geolocation), price range, and occasion preferences
- [ ] Wishlist add/remove/view works with proper RLS isolation (users see only their own data)
- [ ] Account deletion anonymizes all PII within 30 days per CCPA
- [ ] All user-scoped tables have RLS policies (positive and negative test coverage)
- [ ] Cookie-based sessions persist across tabs and browser restarts (7-day refresh token)

## Architecture Dependencies

- **Database tables:** `profiles`, `user_preferences`, `wishlists`, `wishlist_items` (all user-scoped, NO org_id per CG-2)
- **Auth provider:** Supabase Auth with `@supabase/ssr` cookie-based sessions
- **External integrations:** Google OAuth 2.0, Apple Sign-In
- **Shared components:** Auth guard wrapper, session provider, preference form components

## Cross-Cutting Concerns

- **Session layer** — every downstream epic depends on `auth.uid()` being available via Supabase Auth cookies
- **Profiles table** — referenced as FK by taste_profiles, wishlists, follows, share_events, recommendation_events, curated_collections (curator_id)
- **User preferences** — location and price range feed into EPIC-02 (search filtering), EPIC-07 (curation scoring)
- **Auth guard pattern** — reusable middleware/layout guard needed by all authenticated routes
- **Age gate** — required before any wine-related content or purchasing

## Technical Risks & Open Questions

- [ ] **Session duration**: Architecture review resolved as 7-day refresh token, but confirm with security review
- [ ] **Age gate compliance**: Checkbox may not meet CA compliance for online alcohol — legal review pending. Current implementation is checkbox + ToS acceptance
- [ ] **OAuth account linking**: P1 feature (linking Google to existing email account) — excluded from this epic but schema should not prevent it
- [ ] **Geolocation permission UX**: Browser geolocation requires HTTPS + user permission grant. Fallback to zip code entry must be seamless

---

## Developer Stories

> Individual story files are located in `.claude/work-plan/stories/epic-01/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-01/story-01-profiles-preferences-tables.md) | Create profiles and user_preferences tables with RLS | backend | 5 | sr-backend | CP3 | done |
| [STORY-02](../stories/epic-01/story-02-wishlists-tables.md) | Create wishlists and wishlist_items tables with RLS | backend | 3 | sr-backend | CP3 | blocked |
| [STORY-03](../stories/epic-01/story-03-auth-dal-server-actions.md) | Build auth DAL functions and Server Actions | backend | 5 | sr-backend | CP3 | done |
| [STORY-04](../stories/epic-01/story-04-preferences-dal-server-actions.md) | Build preferences DAL and Server Actions | backend | 3 | sr-backend | CP3 | done |
| [STORY-05](../stories/epic-01/story-05-wishlist-dal-server-actions.md) | Build wishlist DAL and Server Actions | backend | 3 | sr-backend | CP3 | blocked |
| [STORY-06](../stories/epic-01/story-06-auth-pages.md) | Build auth pages (signup, login, password reset, OAuth callback) | frontend | 8 | fullstack-1 | CP4 | pending |
| [STORY-07](../stories/epic-01/story-07-wishlist-page-toggle.md) | Build wishlist page and wishlist toggle button | frontend | 5 | fullstack-2 | CP4 | pending |
| [STORY-08](../stories/epic-01/story-08-settings-preferences-pages.md) | Build settings/preferences pages | frontend | 5 | fullstack-2 | CP4 | pending |
| [STORY-09](../stories/epic-01/story-09-auth-page-copy.md) | Write auth page copy and microcopy | copy | 2 | marketing-writer | CP4 | pending |
| [STORY-10](../stories/epic-01/story-10-settings-page-copy.md) | Write settings page copy and microcopy | copy | 2 | marketing-writer | CP4 | pending |
| [STORY-11](../stories/epic-01/story-11-account-deletion-ccpa.md) | Implement account deletion (CCPA compliance) | backend | 5 | sr-backend | CP3 | done |

**Total: 11 stories, 46 story points**

