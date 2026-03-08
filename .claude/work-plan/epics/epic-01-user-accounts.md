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

## Story Index

| Story | Title | Type | Points | File |
|-------|-------|------|--------|------|
| STORY-01 | Create profiles and user_preferences tables with RLS | backend | 5 | `epic-01/story-01-profiles-preferences-tables.md` |
| STORY-02 | Create wishlists and wishlist_items tables with RLS | backend | 3 | `epic-01/story-02-wishlists-tables.md` |
| STORY-03 | Implement auth DAL and Server Actions | backend | 5 | `epic-01/story-03-auth-dal-server-actions.md` |
| STORY-04 | Implement preferences DAL and Server Actions | backend | 3 | `epic-01/story-04-preferences-dal-server-actions.md` |
| STORY-05 | Implement wishlist DAL and Server Actions | backend | 3 | `epic-01/story-05-wishlist-dal-server-actions.md` |
| STORY-06 | Build auth pages (signup, login, password reset, OAuth callback) | frontend | 8 | `epic-01/story-06-auth-pages.md` |
| STORY-07 | Build wishlist page and wishlist toggle button | frontend | 5 | `epic-01/story-07-wishlist-page-toggle.md` |
| STORY-08 | Build settings/preferences pages | frontend | 5 | `epic-01/story-08-settings-preferences-pages.md` |
| STORY-09 | Write auth page copy and microcopy | copy | 2 | `epic-01/story-09-auth-page-copy.md` |
| STORY-10 | Write settings page copy and microcopy | copy | 2 | `epic-01/story-10-settings-page-copy.md` |
| STORY-11 | Implement account deletion (CCPA compliance) | backend | 5 | `epic-01/story-11-account-deletion-ccpa.md` |

**Total: 11 stories, 46 story points**

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

---

### [EPIC-01/STORY-01] — Create profiles and user_preferences tables with RLS

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform, I need database tables for user profiles and preferences so that authenticated users have persistent storage for their identity and settings.

#### Acceptance Criteria

```gherkin
Given the migration is applied
When I inspect the database schema
Then the profiles table exists with columns: id (UUID PK = auth.users.id), email, full_name, display_name, avatar_url, created_at, updated_at
And the user_preferences table exists with columns: id, user_id (FK -> profiles.id), location_zip, location_lat, location_lng, price_range_min, price_range_max, occasion_tags (JSONB), notification_email_frequency (enum: daily/weekly/off), created_at, updated_at
And both tables have RLS enabled
And profiles SELECT policy allows any authenticated user to read any profile
And profiles UPDATE policy restricts to user_id = auth.uid()
And user_preferences SELECT/UPDATE policies restrict to user_id = auth.uid()
And updated_at triggers are active on both tables

Given a user with id 'user-A' is authenticated
When they query user_preferences
Then they see only their own preferences row

Given a user with id 'user-B' is authenticated
When they try to UPDATE user_preferences for user-A
Then the operation returns zero affected rows
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_profiles_and_preferences.sql` | Create |
| Types | `types/database.ts` | Regenerate via `supabase gen types` |

#### Dependencies

- **Blocked by:** None — this is the root migration
- **Blocks:** EPIC-01/STORY-02, EPIC-01/STORY-03, EPIC-01/STORY-04, EPIC-01/STORY-05, and all downstream epics

#### Testing Requirements

- [ ] **RLS (pgTAP):** Positive — user can SELECT/UPDATE own profile and preferences
- [ ] **RLS (pgTAP):** Negative — user cannot SELECT/UPDATE another user's preferences
- [ ] **RLS (pgTAP):** Profiles SELECT — any authenticated user can read any profile (public)
- [ ] **Unit:** Verify migration applies cleanly on fresh database

#### Implementation Notes

- Per CG-2, these are **user-scoped tables** — they do NOT have `org_id`. RLS uses `user_id = auth.uid()` pattern.
- `profiles.id` should be `UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` — the profile IS the user.
- `user_preferences` is 1:1 with profiles — add `UNIQUE(user_id)` constraint.
- `price_range_min` and `price_range_max` are `INTEGER` (whole dollar amounts matching the UI buckets: 10, 20, 35, 50, 100).
- `occasion_tags` is a JSONB array of strings. Add a GIN index for containment queries.
- `notification_email_frequency` should be a PostgreSQL enum type `notification_frequency` with values `('daily', 'weekly', 'off')`.
- `location_lat` / `location_lng` are `NUMERIC(10,7)` for precision. These are NOT PostGIS columns — simple lat/lng for user preference storage. PostGIS is used in EPIC-06 for retailer spatial queries.

---

### [EPIC-01/STORY-02] — Create wishlists and wishlist_items tables with RLS

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want my wishlist data stored securely so that only I can view and manage my saved wines.

#### Acceptance Criteria

```gherkin
Given the migration is applied
When I inspect the database schema
Then the wishlists table exists with columns: id (UUID PK), user_id (FK -> profiles.id), name (TEXT DEFAULT 'My Wishlist'), created_at, updated_at
And the wishlist_items table exists with columns: id (UUID PK), wishlist_id (FK -> wishlists.id ON DELETE CASCADE), wine_id (FK -> wines.id), notes (TEXT nullable), added_at (TIMESTAMPTZ DEFAULT now())
And both tables have RLS enabled
And RLS policies enforce user_id = auth.uid() on wishlists
And wishlist_items RLS joins through wishlist ownership

Given user-A adds a wine to their wishlist
When user-B queries wishlist_items
Then user-B sees zero items from user-A's wishlist

Given user-A deletes their wishlist
When I check wishlist_items
Then all items for that wishlist are cascade-deleted
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_wishlists.sql` | Create |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table), EPIC-02/STORY-01 (wines table)
- **Blocks:** EPIC-01/STORY-07 (wishlist UI)

#### Testing Requirements

- [ ] **RLS (pgTAP):** Positive — user can CRUD their own wishlist and items
- [ ] **RLS (pgTAP):** Negative — user cannot read/write another user's wishlist
- [ ] **Unit:** Cascade delete removes items when wishlist is deleted
- [ ] **Unit:** UNIQUE constraint on (wishlist_id, wine_id) prevents duplicate adds

#### Implementation Notes

- Per CG-2, wishlists are **user-scoped** — NO `org_id`.
- Add `UNIQUE(wishlist_id, wine_id)` to prevent adding same wine twice.
- `wishlist_items` RLS for SELECT: `EXISTS (SELECT 1 FROM wishlists WHERE id = wishlist_items.wishlist_id AND user_id = auth.uid())`.
- Each user gets one default wishlist. Multi-wishlist support is future scope but schema should accommodate it (hence the separate wishlists table rather than putting user_id directly on wishlist_items).
- Index on `wishlist_items(wishlist_id)` for efficient item listing.
- Index on `wishlist_items(wine_id)` for "is this wine on my wishlist?" lookups.

---

### [EPIC-01/STORY-03] — Implement auth DAL and Server Actions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I need DAL functions and Server Actions for authentication so that the frontend can sign users up, log them in, and manage sessions through the standard application patterns.

#### Acceptance Criteria

```gherkin
Given a new user submits valid signup data (email, password, full_name, age_confirmed=true)
When the signup Server Action executes
Then a Supabase Auth user is created, a profile row is inserted, and a verification email is sent

Given a user submits signup with age_confirmed=false
When the signup Server Action executes
Then it returns { error: "You must confirm you are 21 or older" } and no user is created

Given a user submits login with valid credentials
When the login Server Action executes
Then a session cookie is set and the user is redirected to the app

Given a user calls the Google OAuth action
When the action executes
Then the user is redirected to Google's consent screen with the correct callback URL

Given a user submits a password reset request
When the action executes with a valid email
Then a reset email is sent regardless of whether the account exists (no email enumeration)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/users.ts` | Create |
| Action | `lib/actions/auth.ts` | Create |
| Validation | `lib/validations/auth.ts` | Create |
| Supabase | `lib/supabase/server.ts` | Verify exists (cookie-based server client) |
| Supabase | `lib/supabase/client.ts` | Verify exists (browser client for OAuth redirect) |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table exists)
- **Blocks:** EPIC-01/STORY-06 (auth UI pages)

#### Testing Requirements

- [ ] **Unit (Vitest):** Zod schemas reject invalid email, short passwords, missing age confirmation
- [ ] **Unit (Vitest):** DAL functions return correct shapes for profile CRUD
- [ ] **Integration:** Signup action creates auth user + profile row in single transaction
- [ ] **Integration:** Login action sets session cookie correctly

#### Implementation Notes

- `lib/dal/users.ts` functions: `getProfile(client, userId)`, `updateProfile(client, userId, data)`, `createProfile(client, data)`, `deleteProfile(client, userId)`.
- `lib/actions/auth.ts` functions: `signUp(formData)`, `signIn(formData)`, `signInWithGoogle()`, `signInWithApple()`, `signOut()`, `resetPassword(formData)`, `updatePassword(formData)`.
- `lib/validations/auth.ts`: Zod schemas for `SignUpSchema`, `SignInSchema`, `ResetPasswordSchema`. Password minimum 8 chars, require email format.
- Age confirmation is a boolean field on the signup form — validated by Zod, stored as `age_confirmed_at TIMESTAMPTZ` on the profiles table.
- For OAuth: use `supabase.auth.signInWithOAuth({ provider: 'google' })` with `redirectTo` pointing to `/auth/callback` route handler.
- Auth callback route handler at `app/(auth)/callback/route.ts` exchanges code for session.
- Password reset: use `supabase.auth.resetPasswordForEmail()` — always return success to prevent email enumeration.

---

### [EPIC-01/STORY-04] — Implement preferences DAL and Server Actions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want my location and price preferences saved so that the platform remembers my settings across sessions and devices.

#### Acceptance Criteria

```gherkin
Given an authenticated user submits preference data (zip=90026, price_min=20, price_max=35, occasions=["weeknight dinner","gift"])
When the updatePreferences Server Action executes
Then the user_preferences row is upserted with the provided values

Given a user has not yet set preferences
When getPreferences is called
Then it returns null (not an error)

Given a user updates their zip code from 90026 to 10001
When the action completes
Then revalidatePath is called to refresh any Server Components showing location-dependent data
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/preferences.ts` | Create |
| Action | `lib/actions/preferences.ts` | Create |
| Validation | `lib/validations/preferences.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (user_preferences table)
- **Blocks:** EPIC-01/STORY-08 (preferences UI), EPIC-02 (search uses location/price), EPIC-07 (curation uses preferences)

#### Testing Requirements

- [ ] **Unit (Vitest):** Zod schema validates zip format (5-digit US), price range bounds, occasion tag set
- [ ] **Unit (Vitest):** DAL upsert creates row if none exists, updates if exists
- [ ] **Integration:** Full Server Action flow: validate → auth → DAL → revalidate

#### Implementation Notes

- `lib/dal/preferences.ts`: `getPreferences(client, userId)`, `upsertPreferences(client, userId, data)`.
- `lib/validations/preferences.ts`: `PreferencesSchema` with zip (regex `^\d{5}$`), price_range_min/max (enum matching UI buckets), occasion_tags (array of strings from predefined set).
- The 12 valid occasion categories: weeknight dinner, date night, dinner party, celebration, outdoor gathering, gift, solo unwinding, learning & exploring, food pairing, business entertaining, holiday & seasonal, just because.
- Use Supabase `upsert` with `onConflict: 'user_id'` for the preferences table.
- Geocoding zip to lat/lng is NOT done here — that's a future enhancement. For now, store zip and let the search/availability layer handle radius calculations.

---

### [EPIC-01/STORY-05] — Implement wishlist DAL and Server Actions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want to save and remove wines from my wishlist so that I can track bottles I'm interested in.

#### Acceptance Criteria

```gherkin
Given an authenticated user adds a wine to their wishlist
When the addToWishlist action executes
Then a wishlist_items row is created linking the wine to the user's default wishlist

Given a user tries to add a wine that's already on their wishlist
When the action executes
Then it returns success (idempotent) without creating a duplicate

Given a user removes a wine from their wishlist
When the removeFromWishlist action executes
Then the wishlist_items row is deleted

Given a user requests their wishlist
When getWishlistItems is called
Then items are returned with wine details (name, producer, price, image) joined from the wines table
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/wishlists.ts` | Create |
| Action | `lib/actions/wishlists.ts` | Create |
| Validation | `lib/validations/wishlists.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-02 (wishlists tables), EPIC-02/STORY-01 (wines table for JOIN)
- **Blocks:** EPIC-01/STORY-07 (wishlist UI)

#### Testing Requirements

- [ ] **Unit (Vitest):** DAL correctly creates default wishlist on first add
- [ ] **Unit (Vitest):** Idempotent add returns success without duplicate
- [ ] **Integration:** Full add/remove cycle through Server Actions
- [ ] **RLS:** Verify user cannot add items to another user's wishlist via direct SQL

#### Implementation Notes

- Auto-create default wishlist: `getOrCreateDefaultWishlist(client, userId)` — creates a wishlist named "My Wishlist" if none exists.
- `addToWishlist`: Use `INSERT ... ON CONFLICT (wishlist_id, wine_id) DO NOTHING` for idempotency.
- `getWishlistItems`: JOIN with wines table to return denormalized wine data. Support sorting by `added_at DESC` (default) or by wine price.
- `removeFromWishlist`: DELETE by wishlist_item_id. Verify ownership via the wishlist -> user_id chain before deleting.

---

### [EPIC-01/STORY-06] — Build auth pages (signup, login, password reset, OAuth callback)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to create an account or sign in so that I can access personalized wine recommendations and save my preferences.

#### Acceptance Criteria

```gherkin
Given I am an unauthenticated visitor
When I navigate to /signup
Then I see a signup form with email, password, full name, age confirmation checkbox, and OAuth buttons (Google, Apple)

Given I fill in valid signup details and check the age confirmation
When I submit the form
Then I see a "Check your email for verification" message

Given I click "Sign in with Google"
When I authorize on Google's consent screen
Then I am redirected back and logged in with my Google profile data pre-populated

Given I am on the login page with valid credentials
When I submit the form
Then I am redirected to the app home page with a valid session

Given I enter an email on the password reset page
When I submit
Then I see "If an account exists, we've sent a reset link" (no email enumeration)

Given I am on any auth page
When I inspect the page with axe-core
Then there are zero accessibility violations
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(auth)/signup/page.tsx` | Create |
| Page | `app/(auth)/login/page.tsx` | Create |
| Page | `app/(auth)/reset-password/page.tsx` | Create |
| Page | `app/(auth)/callback/route.ts` | Create |
| Page | `app/(auth)/layout.tsx` | Create |
| Component | `components/features/auth/SignupForm.tsx` | Create |
| Component | `components/features/auth/LoginForm.tsx` | Create |
| Component | `components/features/auth/ResetPasswordForm.tsx` | Create |
| Component | `components/features/auth/OAuthButtons.tsx` | Create |
| Component | `components/features/auth/AgeGateCheckbox.tsx` | Create |
| Loading | `app/(auth)/signup/loading.tsx` | Create |
| Error | `app/(auth)/signup/error.tsx` | Create |
| Loading | `app/(auth)/login/loading.tsx` | Create |
| Error | `app/(auth)/login/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-03 (auth Server Actions), EPIC-01/STORY-09 (copy for auth pages)
- **Blocks:** EPIC-01/STORY-08 (settings pages depend on auth layout pattern)

#### Testing Requirements

- [ ] **E2E (Playwright):** Complete signup flow via email — form → submit → verification message
- [ ] **E2E (Playwright):** Login with valid credentials → redirect to app
- [ ] **E2E (Playwright):** Login with invalid credentials → error message
- [ ] **Accessibility:** axe-core scan on signup, login, and reset-password pages
- [ ] **Unit:** Form validation client-side matches Zod schemas

#### Implementation Notes

- Auth pages use `(auth)` route group with its own layout (centered card, Cru branding, no nav).
- Forms are Client Components (`'use client'`) since they need interactivity (form state, validation, submission).
- Use Shadcn `<Form>`, `<Input>`, `<Button>`, `<Checkbox>` components.
- OAuth callback route handler (`/auth/callback/route.ts`) exchanges the auth code for a session using `supabase.auth.exchangeCodeForSession(code)`.
- After signup, redirect to onboarding preferences flow (EPIC-01/STORY-08). After login, redirect to `/(app)/[orgSlug]/` or app home.
- Age gate checkbox: must be checked to enable submit button. Label text from marketing-writer (STORY-09).
- Error states: duplicate email ("An account with this email already exists"), invalid password format, network errors.
- All pages need `loading.tsx` (skeleton card) and `error.tsx` (error boundary with retry).

---

### [EPIC-01/STORY-07] — Build wishlist page and wishlist toggle button

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to view my wishlist and add/remove wines with a single click so that I can curate my list of interesting wines effortlessly.

#### Acceptance Criteria

```gherkin
Given I am logged in and have wines on my wishlist
When I navigate to my wishlist page
Then I see all saved wines as cards with name, producer, price, and a "Remove" button
And wines are sorted by most recently added by default

Given I am viewing a wine anywhere in the app
When I click the heart/bookmark icon
Then the wine is added to my wishlist with optimistic UI (instant visual feedback)

Given a wine is already on my wishlist
When I click the heart/bookmark icon on that wine
Then the wine is removed from my wishlist with optimistic UI

Given I view my wishlist on mobile
When I interact with the list
Then it is fully responsive with touch-friendly remove targets

Given I view an empty wishlist
When the page loads
Then I see a friendly empty state with copy directing me to browse wines
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/wishlist/page.tsx` | Create |
| Component | `components/features/wishlist/WishlistPage.tsx` | Create |
| Component | `components/features/wishlist/WishlistCard.tsx` | Create |
| Component | `components/features/wishlist/WishlistToggleButton.tsx` | Create |
| Loading | `app/(app)/[orgSlug]/wishlist/loading.tsx` | Create |
| Error | `app/(app)/[orgSlug]/wishlist/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-05 (wishlist DAL/Actions), EPIC-02/STORY-06 (Wine Card component for reuse)
- **Blocks:** EPIC-07 (curation uses wishlist interactions as signal)

#### Testing Requirements

- [ ] **E2E (Playwright):** Add wine to wishlist → appears on wishlist page
- [ ] **E2E (Playwright):** Remove wine from wishlist → disappears from wishlist page
- [ ] **Accessibility:** axe-core on wishlist page, toggle button has aria-label
- [ ] **Unit:** Optimistic update logic rolls back on server error

#### Implementation Notes

- `WishlistToggleButton` is a Client Component used across the app (wine cards, wine detail pages). It needs to be a shared component in `components/features/wishlist/`.
- Use `useOptimistic` hook for instant toggle feedback. On server error, revert the optimistic state.
- The wishlist page is a Server Component that fetches data via DAL, with the individual cards containing client-side toggle buttons.
- Empty state: use Shadcn empty state pattern with illustration, friendly copy from marketing-writer.
- Sort options: "Date Added" (default), "Price: Low to High", "Price: High to Low". Use URL search params for sort state.

---

### [EPIC-01/STORY-08] — Build settings/preferences pages

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to view and edit my profile, preferences, and notification settings so that I maintain control over my Cru experience.

#### Acceptance Criteria

```gherkin
Given I am logged in
When I navigate to settings
Then I see sections for: Profile, Preferences (location, price range, occasions), Notifications, and Account (delete)

Given I update my zip code and save
When the form submits
Then my preferences are updated and a success toast appears

Given I toggle notification frequency to "weekly"
When the form submits
Then my notification preference is updated

Given I click "Delete Account"
When I confirm the deletion dialog
Then a deletion is initiated, I am logged out, and I see a confirmation message

Given I view settings on a screen reader
When I tab through all controls
Then every input has a proper label and the form structure is semantically correct
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/settings/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/settings/profile/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/settings/preferences/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/settings/notifications/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/settings/account/page.tsx` | Create |
| Component | `components/features/settings/ProfileForm.tsx` | Create |
| Component | `components/features/settings/PreferencesForm.tsx` | Create |
| Component | `components/features/settings/NotificationForm.tsx` | Create |
| Component | `components/features/settings/DeleteAccountDialog.tsx` | Create |
| Layout | `app/(app)/[orgSlug]/settings/layout.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-03 (auth actions), EPIC-01/STORY-04 (preferences actions), EPIC-01/STORY-10 (copy for settings)
- **Blocks:** None directly

#### Testing Requirements

- [ ] **E2E (Playwright):** Update preferences → verify data persisted on page reload
- [ ] **E2E (Playwright):** Delete account flow → logged out, redirected to landing
- [ ] **Accessibility:** axe-core on all settings pages
- [ ] **Unit:** All form validation matches Zod schemas

#### Implementation Notes

- Settings uses a sidebar nav layout (desktop) / tab bar (mobile) with sub-routes.
- Each settings section is its own page within the settings layout.
- Forms are Client Components using Shadcn `<Form>` with react-hook-form + Zod resolver.
- Delete account: two-step confirmation dialog. First click shows dialog, second click (with "DELETE" typed) triggers the action.
- Delete account action: calls `supabase.auth.admin.deleteUser()` via service role (requires a route handler, not a Server Action, since service role shouldn't be in client-accessible code). Alternative: mark for deletion and process via background job.
- Location: show text input for zip code with a "Use my location" button for browser geolocation. Geolocation requires user permission grant — handle denial gracefully.
- Price range: Shadcn select or radio group with the 5 predefined ranges.
- Occasion tags: multi-select checkboxes from the 12 predefined categories.

---

### [EPIC-01/STORY-09] — Write auth page copy and microcopy

**Type:** copy
**Story Points:** 2
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build — copy delivered before STORY-06 begins)

#### User Story

As an explorer, I want the signup and login experience to feel warm, trustworthy, and distinctly Cru — not like every other generic sign-in form.

#### Acceptance Criteria

```gherkin
Given the marketing-writer delivers auth copy
When a developer reviews the copy document
Then it includes: signup page headline + subhead, login page headline + subhead, age gate checkbox label, password reset messaging, email verification message, OAuth button labels, error messages (duplicate email, invalid password, network error), and placeholder text for all inputs

Given the copy is integrated into auth pages
When a user reads the signup page
Then the messaging communicates trust, purpose, and personality — not boilerplate
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `docs/copy/auth-pages.md` | Create |

#### Dependencies

- **Blocked by:** None (can start immediately)
- **Blocks:** EPIC-01/STORY-06 (auth pages need copy before build)

#### Testing Requirements

- [ ] **Review:** Copy reviewed by pm-orchestrator for brand voice consistency

#### Implementation Notes

- Deliver as a markdown file with sections matching each page/component.
- Include both primary copy and error/edge-case microcopy.
- Age gate label must be legally precise ("I confirm I am 21 years of age or older") while still feeling on-brand.
- Error messages should be helpful, not scolding. "That email's already part of the Cru family — try logging in instead."

---

### [EPIC-01/STORY-10] — Write settings page copy and microcopy

**Type:** copy
**Story Points:** 2
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build — copy delivered before STORY-08 begins)

#### User Story

As an explorer, I want the settings experience to feel clear and empowering, especially around data control and account deletion.

#### Acceptance Criteria

```gherkin
Given the marketing-writer delivers settings copy
When a developer reviews the copy document
Then it includes: section headers, form labels, help text, success/error toasts, empty states, delete account confirmation dialog text, and post-deletion message

Given account deletion copy is integrated
When a user reads the deletion dialog
Then the messaging clearly explains what will happen, the 30-day timeline, and that this is irreversible
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `docs/copy/settings-pages.md` | Create |

#### Dependencies

- **Blocked by:** None
- **Blocks:** EPIC-01/STORY-08 (settings pages need copy)

#### Testing Requirements

- [ ] **Review:** Copy reviewed by pm-orchestrator for brand voice and legal accuracy

#### Implementation Notes

- Account deletion copy is especially sensitive — must be clear about CCPA compliance, timeline, and irreversibility.
- Notification frequency options need brief descriptions: "Daily digest — a curated email each morning," "Weekly roundup — highlights every Monday."
- Occasion tag labels should match the 12 predefined categories exactly.

---

### [EPIC-01/STORY-11] — Implement account deletion (CCPA compliance)

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a user, I want to delete my account and have all my personal data removed within 30 days so that my privacy is respected per CCPA requirements.

#### Acceptance Criteria

```gherkin
Given a user requests account deletion
When the deletion is initiated
Then the user's profile is marked as pending_deletion with a deletion_scheduled_at timestamp 30 days in the future
And the user is immediately logged out
And a confirmation email is sent

Given a user's deletion_scheduled_at has passed
When the background deletion job runs
Then all PII is anonymized: email set to 'deleted-{uuid}@deleted.cru', full_name set to 'Deleted User', all preferences cleared, all wishlist items removed
And the auth user is deleted from Supabase Auth

Given a user requests deletion then changes their mind within 30 days
When they contact support
Then the deletion can be cancelled by removing the pending_deletion flag
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_add_deletion_columns.sql` | Create |
| DAL | `lib/dal/users.ts` | Modify (add deletion functions) |
| Action | `lib/actions/account.ts` | Create |
| Edge Function | `supabase/functions/process-deletions/index.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table), EPIC-01/STORY-03 (auth DAL)
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** Deletion initiation sets correct timestamp
- [ ] **Integration:** Full deletion flow — initiate → mark → process → verify anonymization
- [ ] **Unit:** Verify all PII columns are anonymized (no data leaks)

#### Implementation Notes

- Add `deletion_requested_at TIMESTAMPTZ` and `deletion_scheduled_at TIMESTAMPTZ` columns to profiles.
- Background job: Supabase Edge Function or a cron-triggered function that runs daily, finds profiles with `deletion_scheduled_at < now()`, anonymizes PII, and deletes the auth user via service role.
- Anonymization: replace email, name, avatar. Delete preferences, wishlists, taste profiles, follows, share events. Keep order history but anonymize customer name for retailer record-keeping.
- The 30-day window allows support-initiated cancellation. Users who change their mind can email support, who removes the deletion flag via admin API.
