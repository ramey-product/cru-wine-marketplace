# PRD: User Accounts & Preferences

**Feature:** User Accounts & Preferences
**Priority:** P0 — Launch Critical (RICE: 10,000)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Every feature in Cru depends on knowing who the user is. Without authenticated accounts, there is no taste profile, no order history, no saved preferences, no social graph, and no personalization — which means no Cru. Today, wine discovery apps like Vivino allow anonymous browsing but gate core value behind account creation after the fact, creating friction at the worst possible moment (mid-discovery). Cru needs to make account creation feel like the beginning of a relationship, not a tollbooth.

This feature affects 100% of users from Day 1. The cost of getting it wrong is total — no other P0 feature functions without it.

## 2. Goals

**User Goals:**
- Create an account in under 60 seconds using email, Google, or Apple sign-in
- Understand immediately what Cru will do with their preferences (build trust, not suspicion)
- Access saved preferences, order history, and wishlist across devices without re-entry
- Control their data: what's shared, what's visible to others, and how to delete their account

**Business Goals:**
- Achieve 70%+ signup-to-profile-completion rate within the first session
- Capture preference signals (location, price range, occasion interest) at signup to bootstrap curation
- Establish the authenticated session layer that every downstream feature depends on
- Enable multi-tenant architecture: org_id scoping for future retailer/producer portals

## 3. Non-Goals

- **SSO/SAML for enterprise retailers** — That's the Retailer Dashboard (PRD #9). User accounts are consumer-facing only at launch.
- **Social profile customization** — Profile photos, bios, and public display names are part of Social/Community Layer (PRD #8). User Accounts handles auth and preferences only.
- **Payment method storage** — Handled by Stripe during Order Placement (PRD #5). User Accounts does not store credit card data.
- **Multi-account or family accounts** — Premature complexity. One account per email at launch.
- **Age verification at signup** — Legal age gate is a simple checkbox + ToS acceptance. Full ID-based age verification is an Order Placement / compliance concern.

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to sign up using my Google account so that I don't need to remember another password.
- As an Explorer, I want to set my location during onboarding so that Cru shows me wines available at nearby stores.
- As an Explorer, I want to set a default price range so that I see wines I'd actually buy, not $200 bottles I'd never consider.
- As an Explorer, I want to save wines to a wishlist so that I can come back to them when I'm ready to purchase.
- As an Explorer, I want to see my order history so that I can reorder a wine I loved or remember what I tried.

### Enthusiast (Secondary)
- As an Enthusiast, I want to adjust my taste preferences over time so that recommendations evolve with my palate.
- As an Enthusiast, I want to manage notification preferences so that I get alerts about new releases without being spammed.

### All Users
- As any user, I want to reset my password via email so that I can recover access to my account.
- As any user, I want to delete my account and all associated data so that I have full control over my information.
- As any user, I want my session to persist across browser tabs and app restarts so that I don't have to log in repeatedly.

### Edge Cases
- As a user who signed up with email and later wants to link Google auth, I want to connect my Google account so that I have multiple login options.
- As a user on a shared device, I want to log out and be confident my session is fully cleared.
- As a user who attempts to sign up with an email that already exists, I want a clear message directing me to log in instead.

## 5. Requirements

### Must-Have (P0)

**Authentication**
- Email + password signup/login with email verification
- Google OAuth 2.0 and Apple Sign-In
- Password reset via email with secure token (expires in 1 hour)
- Session persistence via Supabase Auth cookie-based sessions (`@supabase/ssr`)
- Age gate: checkbox confirming user is 21+ (US legal requirement) at signup
- Acceptance criteria:
  - Given a new user enters a valid email and password, when they submit the signup form, then they receive a verification email within 30 seconds
  - Given a user clicks the Google OAuth button, when they authorize access, then an account is created and they are redirected to onboarding
  - Given a user with an existing account tries to sign up with the same email, when they submit, then they see "An account with this email already exists. Log in instead?" with a link

**Preferences**
- Location capture (zip code or browser geolocation with permission) — used to scope retailer inventory
- Default price range selector: $10-20, $20-35, $35-50, $50-100, $100+
- Occasion/interest tags (optional): "Weeknight dinner," "Gift," "Exploring," "Building a collection," "Date night"
- All preferences stored in user profile and editable from Settings
- Acceptance criteria:
  - Given a user sets their zip code to 90026, when they browse wines, then only wines available from retailers within a configurable radius (default 15 miles) appear in local results
  - Given a user selects the $20-35 price range, when they receive recommendations, then at least 80% of curated picks fall within that range

**Account Management**
- View and edit profile: email, name, location, price range, occasion tags
- View order history (read-only list, details link to Order Placement)
- Wishlist: add/remove wines, view wishlist, sort by date added or price
- Notification preferences: email digest frequency (daily/weekly/off), push notification toggles (when available)
- Account deletion: self-serve delete that removes all PII within 30 days, per CCPA requirements
- Acceptance criteria:
  - Given a user adds a wine to their wishlist, when they view the wishlist, then the wine appears with its name, producer, price, and a "Remove" action
  - Given a user requests account deletion, when they confirm, then all PII is anonymized within 30 days and the user receives a confirmation email

**Technical Requirements**
- All user data scoped by `org_id` (multi-tenant architecture per CLAUDE.md)
- RLS policies on all user-facing tables: users can only read/write their own data
- DAL functions in `lib/dal/users.ts` — no direct Supabase calls from components
- Server Actions in `lib/actions/auth.ts` and `lib/actions/preferences.ts` following Zod validate → auth check → DAL call → revalidatePath
- `users` table, `user_preferences` table, `wishlists` table, `wishlist_items` table — all with `org_id`, RLS enabled, `updated_at` triggers

### Nice-to-Have (P1)

- Link multiple auth providers to one account (e.g., add Google to email account)
- Profile avatar upload
- Export personal data (GDPR data portability)
- "Remember this device" toggle for session duration control

### Future Considerations (P2)

- SSO/SAML for enterprise retailers and producers (Retailer Dashboard scope)
- Family/household accounts with shared wishlists
- Account-level referral tracking and credit system

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Signup completion rate | 70% of visitors who start signup | 80% | Supabase Auth events + analytics |
| Time to complete signup | < 60 seconds (email), < 30 seconds (OAuth) | < 45s / < 20s | Event timestamps |
| Preference completion rate | 60% set location + price range in first session | 75% | user_preferences table fill rate |
| Wishlist adoption | 30% of users add 1+ wine in first week | 40% | wishlist_items count by user |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Account retention (Day 7) | 40% return within 7 days of signup | 50% | Supabase Auth session data |
| Account retention (Day 30) | 25% active in Day 30 | 35% | Monthly active users / signups |
| Account deletion rate | < 5% in first 30 days | < 3% | Deletion requests / total accounts |
| Password reset frequency | < 10% of users in first month | < 5% | Auth reset events |

## 7. Open Questions

- **[Engineering — blocking]** What is the session duration default? 7 days? 30 days? Needs alignment with security posture.
- **[Design — non-blocking]** Should the onboarding preference flow be a separate wizard or integrated into the first browse session? (UX designer to recommend.)
- **[Legal — blocking]** Does the age gate checkbox meet CA compliance for online alcohol sales, or do we need a date-of-birth capture?
- **[Product — non-blocking]** Should we capture "How did you hear about Cru?" at signup for attribution? Low friction but valuable for GTM.

## 8. Timeline Considerations

- **Build order: #1** — Must ship before any other feature can begin.
- **Week 1-2 of pre-launch sprint** (Track A)
- **Hard dependency:** None — this is the root of all dependency chains.
- **Downstream dependents:** Every other P0 feature. Search & Browse begins immediately after User Accounts ships.
- **Checkpoint cadence:** Architecture Review (end of Week 1), Backend Complete (mid-Week 2), Frontend Complete (end of Week 2), QA Complete (start of Week 3).
