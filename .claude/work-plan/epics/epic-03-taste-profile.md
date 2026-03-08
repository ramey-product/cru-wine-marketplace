# Epic: [EPIC-03] — Taste Profile Onboarding

**Source PRD:** `docs/prds/prd-03-taste-profile.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 6,000
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, ux-designer, marketing-writer

## Epic Summary

Taste Profile Onboarding is Cru's core differentiator — a 3-minute, jargon-free flow that translates everyday flavor language into a structured palate model. Instead of quizzing users on grape varietals, it asks about flavors they already know (berry, earthy, pepper) and maps those to wine attributes that power the curation engine. This epic delivers the 5-screen onboarding flow, the taste_profiles data model, the "Wines I've Loved" quick-add feature, and the rules-based profile summary generator.

## Success Criteria

- [ ] 65%+ taste profile completion rate among new signups in first session
- [ ] Onboarding completes in under 3 minutes average
- [ ] Less than 15% drop-off per screen in the funnel
- [ ] Profile summary generates a human-readable paragraph (not a tag list)
- [ ] First recommendation batch appears within 1 second of "Looks right!" tap
- [ ] Users who skip onboarding can still browse and receive generic curation
- [ ] Profile can be re-done or edited from settings at any time

## Story Index

| Story | Title | Type | Points | File |
|-------|-------|------|--------|------|
| STORY-01 | Create taste_profiles and taste_profile_wines tables with RLS | backend | 5 | `epic-03/story-01-create-taste-profiles-tables-rls.md` |
| STORY-02 | Create flavor tag taxonomy data and mapping constants | backend | 3 | `epic-03/story-02-flavor-tag-taxonomy-mapping-constants.md` |
| STORY-03 | Implement taste profile DAL and Server Actions | backend | 5 | `epic-03/story-03-taste-profile-dal-server-actions.md` |
| STORY-04 | Implement profile summary template engine | backend | 3 | `epic-03/story-04-profile-summary-template-engine.md` |
| STORY-05 | Design taste profile onboarding flow UX | design | 5 | `epic-03/story-05-design-onboarding-flow-ux.md` |
| STORY-06 | Build taste profile onboarding Client Component | frontend | 8 | `epic-03/story-06-build-onboarding-client-component.md` |
| STORY-07 | Build "Wines I've Loved" quick-add feature | frontend | 5 | `epic-03/story-07-wines-ive-loved-quick-add.md` |
| STORY-08 | Write taste profile onboarding copy and microcopy | copy | 3 | `epic-03/story-08-onboarding-copy-microcopy.md` |
| STORY-09 | Build taste profile settings page for editing | frontend | 3 | `epic-03/story-09-taste-profile-settings-page.md` |

**Total: 9 stories, 40 story points**

## Architecture Dependencies

- **Database tables:** `taste_profiles`, `taste_profile_wines`
- **Depends on:** `wines` table (EPIC-02/STORY-01) for "Wines I've Loved" autocomplete and flavor attribute lookup
- **Depends on:** `profiles` table (EPIC-01/STORY-01) for user identity
- **Downstream:** EPIC-07 Curation Engine consumes taste_profiles as its primary input signal
- **Shared components:** Tag selector component (reusable), profile summary template engine

## Cross-Cutting Concerns

- **CG-2 Table Categorization:** `taste_profiles` and `taste_profile_wines` are user-scoped tables. Per CG-2 resolution, user-scoped tables do NOT have `org_id`. However, PRD specifies `org_id` on these tables. Following CG-2 resolution (approved in Checkpoint 1) — these tables use `user_id` as primary scope, no `org_id` column.
- **Data seeding dependency:** Wine-to-flavor-profile mapping data must be populated before taste matching rules work. Cross-track dependency with EPIC-04 (Producer Storytelling) and content seeding.
- **Skip experience:** Users who skip onboarding receive generic curation seeded by location and price range only (per PRD open question resolution).
- **Profile summary generation:** Rules-based template matrix at V1 (not LLM-generated) for predictability and speed.

## Technical Risks & Open Questions

- [ ] Final tag taxonomy for Screen 1 and Screen 2 — how many tags is optimal? PRD proposes 15-20 per screen in 4 categories.
- [ ] Wine-to-flavor-profile mapping table — who maintains it (editorial team vs. automated)? Needs a `wine_flavor_profiles` or equivalent data structure.
- [ ] Profile summary template matrix needs authoring — how many template combinations? Rough estimate: ~50-100 templates based on tag combinations.
- [ ] How does adventurousness_score (1-3) translate to concrete recommendation diversity multipliers in EPIC-07?

---

## Developer Stories

---

### [EPIC-03/STORY-01] — Create taste_profiles and taste_profile_wines tables with RLS

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want the taste_profiles and taste_profile_wines tables created with proper constraints and RLS so that user taste data is securely stored and tenant-isolated.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When I inspect the taste_profiles table
Then it has columns: id (UUID PK), user_id (UUID FK to auth.users, UNIQUE), flavor_affinities (JSONB DEFAULT '[]'), flavor_aversions (JSONB DEFAULT '[]'), drinking_contexts (JSONB DEFAULT '[]'), adventurousness_score (INTEGER DEFAULT 2 CHECK 1-3), profile_version (INTEGER DEFAULT 1), created_at (TIMESTAMPTZ), updated_at (TIMESTAMPTZ)

Given the migration runs successfully
When I inspect the taste_profile_wines table
Then it has columns: id (UUID PK), user_id (UUID FK to auth.users), wine_id (UUID FK to wines), source (TEXT CHECK IN ('onboarding', 'manual_add')), created_at (TIMESTAMPTZ)
And there is a UNIQUE constraint on (user_id, wine_id)

Given a user is authenticated
When they query taste_profiles
Then RLS allows them to SELECT/INSERT/UPDATE only their own rows (user_id = auth.uid())

Given a user is authenticated
When they query taste_profile_wines
Then RLS allows them to SELECT/INSERT/DELETE only their own rows (user_id = auth.uid())
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_taste_profiles.sql` | Create |
| Test | `supabase/tests/taste-profiles.test.sql` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-01 — wines table must exist for taste_profile_wines FK
- **Blocks:** EPIC-03/STORY-03, EPIC-03/STORY-04, EPIC-07/STORY-01

#### Testing Requirements

- [ ] **RLS:** Positive — user can read/write own taste_profile
- [ ] **RLS:** Negative — user cannot read/write another user's taste_profile
- [ ] **RLS:** Positive — user can add/remove own taste_profile_wines
- [ ] **RLS:** Negative — user cannot access another user's taste_profile_wines
- [ ] **Constraint:** adventurousness_score rejects values outside 1-3
- [ ] **Constraint:** duplicate (user_id, wine_id) in taste_profile_wines is rejected

#### Implementation Notes

- These are user-scoped tables per CG-2 resolution — NO `org_id` column. RLS is based on `user_id = auth.uid()`.
- `taste_profiles` should have a UNIQUE constraint on `user_id` (one profile per user).
- JSONB columns store arrays of string tags (e.g., `["berry", "earthy", "pepper"]`).
- Include `updated_at` trigger using `update_updated_at()` function.
- Index on `user_id` for both tables.

---

### [EPIC-03/STORY-02] — Create flavor tag taxonomy data and mapping constants

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want a well-defined flavor tag taxonomy and mapping constants so that the onboarding UI can render consistent tags and the curation engine can map tags to wine attributes.

#### Acceptance Criteria

```gherkin
Given the flavor taxonomy module exists
When I import it
Then it exports FLAVOR_AFFINITIES organized in 4 categories: Fruit (berry, citrus, tropical, stone fruit), Earth (mushroom, mineral, herbal), Spice (pepper, cinnamon, vanilla), Other (chocolate, coffee, floral, smoky)

Given the aversion taxonomy module exists
When I import it
Then it exports FLAVOR_AVERSIONS: very_sweet, very_dry_tannic, very_acidic_sour, oaky_buttery, bitter, fizzy_sparkling

Given the drinking context module exists
When I import it
Then it exports DRINKING_CONTEXTS: dinner_at_home, at_restaurants, parties_gatherings, solo_relaxation, as_a_gift, learn_and_explore

Given the adventurousness module exists
When I import it
Then it exports ADVENTUROUSNESS_LEVELS: { 1: 'Stick with what I know', 2: 'Open to suggestions', 3: 'Surprise me' }
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Constants | `lib/constants/taste-profile.ts` | Create |
| Validation | `lib/validations/taste-profile.ts` | Create |
| Test | `lib/__tests__/taste-profile-validation.test.ts` | Create |

#### Dependencies

- **Blocked by:** None
- **Blocks:** EPIC-03/STORY-03, EPIC-03/STORY-05, EPIC-03/STORY-06

#### Testing Requirements

- [ ] **Unit:** All tag arrays contain expected values
- [ ] **Unit:** Zod schema validates valid taste profile payloads
- [ ] **Unit:** Zod schema rejects invalid payloads (adventurousness outside 1-3, unknown tags, etc.)

#### Implementation Notes

- Create Zod schemas for the taste profile submission payload: `TasteProfileSchema` with `flavor_affinities` (array of valid tag strings, 0-8 items), `flavor_aversions` (array of valid aversion strings, 0+ items), `drinking_contexts` (array of valid context strings, 1+ items), `adventurousness_score` (1-3).
- Tags should be typed as `const` arrays for type safety.
- This module is shared between frontend (rendering) and backend (validation).

---

### [EPIC-03/STORY-03] — Implement taste profile DAL and Server Actions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a developer, I want DAL functions and Server Actions for creating, updating, and reading taste profiles so that the frontend can persist onboarding data through the standard action pattern.

#### Acceptance Criteria

```gherkin
Given a user completes onboarding
When the saveTasteProfile Server Action is called with valid data
Then a new row is inserted in taste_profiles (or updated if one exists via UPSERT)
And profile_version is incremented on update

Given a user adds a wine via "Wines I've Loved"
When addTasteProfileWine Server Action is called with a valid wine_id
Then a row is inserted in taste_profile_wines with source="manual_add"

Given a user wants to view their profile
When getTasteProfile DAL function is called
Then it returns the user's taste_profiles row with all JSONB fields

Given a user wants to see their loved wines
When getTasteProfileWines DAL function is called
Then it returns all taste_profile_wines rows with joined wine data (name, image, varietal)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/taste-profiles.ts` | Create |
| Action | `lib/actions/taste-profile.ts` | Create |
| Test | `lib/__tests__/taste-profile-actions.test.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-01 — tables must exist
- **Blocked by:** EPIC-03/STORY-02 — Zod schemas needed for validation
- **Blocks:** EPIC-03/STORY-06, EPIC-03/STORY-07

#### Testing Requirements

- [ ] **Unit:** DAL functions return correct data shapes
- [ ] **Integration:** saveTasteProfile creates a new profile for new users
- [ ] **Integration:** saveTasteProfile updates existing profile and increments version
- [ ] **Integration:** addTasteProfileWine inserts and rejects duplicates gracefully
- [ ] **Integration:** removeTasteProfileWine deletes the correct row

#### Implementation Notes

- Server Action pattern: Zod validate → `supabase.auth.getUser()` → DAL call → `revalidatePath`.
- `saveTasteProfile` should use UPSERT (INSERT ... ON CONFLICT (user_id) DO UPDATE) to handle both create and edit scenarios.
- The onboarding flow sends a single payload on completion (not per-screen) to minimize network calls.
- DAL functions: `getTasteProfile(supabase, userId)`, `upsertTasteProfile(supabase, userId, data)`, `getTasteProfileWines(supabase, userId)`, `addTasteProfileWine(supabase, userId, wineId, source)`, `removeTasteProfileWine(supabase, userId, wineId)`.

---

### [EPIC-03/STORY-04] — Implement profile summary template engine

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a user completing my taste profile, I want to see a human-readable summary paragraph describing my predicted wine style so that I can confirm the system understood my preferences.

#### Acceptance Criteria

```gherkin
Given a user has selected "berry," "earthy," and "pepper" as affinities with "Very sweet" as an aversion
When the profile summary is generated
Then it outputs a natural paragraph like "You enjoy bold, earthy wines with berry fruit and a peppery edge. You'll want to avoid sweeter styles."

Given a user has selected no affinities (marked "Not sure" on Screen 1)
When the profile summary is generated
Then it outputs a graceful fallback like "You're keeping an open mind — we'll start with crowd favorites and learn your taste as you explore."

Given any combination of valid affinities, aversions, contexts, and adventurousness
When the profile summary is generated
Then it always returns a non-empty string under 300 characters
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Util | `lib/utils/taste-profile-summary.ts` | Create |
| Test | `lib/__tests__/taste-profile-summary.test.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-02 — needs tag taxonomy constants
- **Blocks:** EPIC-03/STORY-07

#### Testing Requirements

- [ ] **Unit:** All major tag combinations produce a valid, non-empty summary
- [ ] **Unit:** Edge case — no affinities selected produces graceful fallback
- [ ] **Unit:** Edge case — all aversions selected produces valid summary
- [ ] **Unit:** Summary length never exceeds 300 characters
- [ ] **Unit:** Adventurousness level adjusts summary tone appropriately

#### Implementation Notes

- V1 uses a rules-based template matrix (NOT LLM-generated) for predictability and speed.
- Approach: Build a template system with sentence fragments that compose based on tag categories. E.g., affinity categories map to style descriptors ("bold, earthy" for Earth tags, "bright and fruity" for Fruit tags). Aversions map to exclusion clauses. Adventurousness maps to tone modifiers.
- Estimate ~50-100 template combinations needed. Use string interpolation, not hardcoded paragraphs.
- This is a pure utility function with no database dependency — takes a TasteProfile object, returns a string.
- Marketing-writer should review the template language (see EPIC-03/STORY-08).

---

### [EPIC-03/STORY-05] — Design taste profile onboarding flow UX

**Type:** design
**Story Points:** 5
**Assigned Agent:** ux-designer
**Phase:** Checkpoint 4: Frontend

#### User Story

As a UX designer, I want to design the 5-screen onboarding flow with interaction patterns, component hierarchy, and responsive layouts so that the frontend team can build it with clear specifications.

#### Acceptance Criteria

```gherkin
Given the design spec is complete
When a developer reads it
Then they know the exact layout, spacing, typography, and interaction pattern for each of the 5 screens

Given the tag selector component is specified
When it's reviewed
Then it defines: tag shape, selected state, category grouping, max selection behavior (3-8 for affinities), and "Not sure" option placement

Given the adventurousness selector is specified
When it's reviewed
Then it defines whether to use a slider, 3-option cards, or segmented control, with clear visual states

Given the profile summary screen is specified
When it's reviewed
Then it defines the layout for: summary paragraph, "Looks right!" / "Not quite" buttons, and the first-batch recommendation cards below

Given responsive behavior is specified
When reviewed
Then it covers mobile-first layout (320px+), tablet (768px+), and desktop (1024px+)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `components/features/taste-profile/` (spec) | Create |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-02 — needs finalized tag taxonomy for UI
- **Blocks:** EPIC-03/STORY-06, EPIC-03/STORY-07

#### Testing Requirements

- [ ] **Accessibility:** All interactive elements have proper contrast ratios and touch targets (44x44px minimum)
- [ ] **Accessibility:** Screen reader flow is logical across all 5 screens
- [ ] **Accessibility:** Keyboard navigation works through tag selection and screen progression

#### Implementation Notes

- The flow should feel like a conversation, not a form. Progressive disclosure — one question per screen, not a long form.
- Tag selector should support touch-friendly tapping (no hover-only states).
- Progress indicator across the 5 screens (dots or step counter).
- "Skip" option should be visible but not prominent — bottom of screen, subtle styling.
- Screen transitions should be smooth (consider slide or fade animations).
- The profile summary screen is the most important — it's the "aha moment" where users feel understood.

---

### [EPIC-03/STORY-06] — Build taste profile onboarding Client Component

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to complete a 5-screen onboarding flow that asks about my flavor preferences, aversions, drinking context, and adventurousness so that Cru can personalize my wine recommendations.

#### Acceptance Criteria

```gherkin
Given I am a new user who just signed up
When I am shown the onboarding flow
Then I see Screen 1 (Flavor Preferences) with selectable tags organized by category

Given I select 3-8 flavor tags on Screen 1
When I tap "Next"
Then I advance to Screen 2 (Aversions) and my selections are preserved in local state

Given I select "Not sure" on Screen 1
When I tap "Next"
Then I advance to Screen 2 without error and flavor_affinities is stored as empty array

Given I complete all 5 screens and tap "Looks right!"
When the form submits
Then a single Server Action call saves my complete taste profile
And I am navigated to the personalized browse/curation feed

Given I tap "Skip" at any point during onboarding
When I skip
Then I am navigated to the generic browse experience without a taste profile

Given I tap "Not quite" on the summary screen
When I choose to adjust
Then I can navigate back to any previous screen to change my selections
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/taste-profile/TasteProfileOnboarding.tsx` | Create |
| Component | `components/features/taste-profile/FlavorTagSelector.tsx` | Create |
| Component | `components/features/taste-profile/AversionSelector.tsx` | Create |
| Component | `components/features/taste-profile/DrinkingContextSelector.tsx` | Create |
| Component | `components/features/taste-profile/AdventurenessSelector.tsx` | Create |
| Component | `components/features/taste-profile/ProfileSummary.tsx` | Create |
| Component | `components/features/taste-profile/OnboardingProgress.tsx` | Create |
| Page | `app/(app)/onboarding/page.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-02 — tag taxonomy constants
- **Blocked by:** EPIC-03/STORY-03 — Server Action to save profile
- **Blocked by:** EPIC-03/STORY-05 — UX design spec
- **Blocked by:** EPIC-03/STORY-08 — copy for all screens
- **Blocks:** EPIC-03/STORY-09

#### Testing Requirements

- [ ] **Unit:** Each selector component renders correct tags from taxonomy
- [ ] **Unit:** Selection state management works correctly (select/deselect, min/max constraints)
- [ ] **Integration:** Complete flow calls saveTasteProfile with correct payload
- [ ] **Integration:** Skip flow navigates without saving
- [ ] **Accessibility:** All screens pass axe-core scan
- [ ] **Accessibility:** Keyboard navigation through tag selection and screen progression

#### Implementation Notes

- This is a `'use client'` component — the entire onboarding flow manages state locally and only writes to server on completion (single Server Action call at the end).
- Use React `useState` for step tracking and form state. Consider `useReducer` for complex state if needed.
- The flow lives at `/onboarding` — not org-scoped since taste profiles are user-scoped.
- Tag selector should support both click and keyboard selection (Space/Enter to toggle).
- "Not sure" option should clear selections for that screen and mark as unset.
- Profile summary calls the template engine (STORY-04) client-side before submission to show the preview.
- Consider `framer-motion` or CSS transitions for screen-to-screen animations.

---

### [EPIC-03/STORY-07] — Build "Wines I've Loved" quick-add feature

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to search for and add wines I've previously enjoyed so that Cru has concrete reference points for my taste and can improve my recommendations.

#### Acceptance Criteria

```gherkin
Given I am on the profile summary screen or in my settings
When I type a wine name in the "Wines I've Loved" input
Then I see autocomplete suggestions from the Cru wine database (debounced 300ms)

Given I select a wine from autocomplete
When the wine is added
Then it appears in my "Wines I've Loved" list with its image, name, and varietal
And the wine is saved to taste_profile_wines via Server Action

Given I want to remove a wine from my loved list
When I tap the remove button
Then the wine is removed from taste_profile_wines and disappears from the list

Given no wines match my search
When I see the empty state
Then I see a message like "We couldn't find that wine — try a different name"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/taste-profile/WinesIveLoved.tsx` | Create |
| Component | `components/features/taste-profile/WineSearchInput.tsx` | Create |
| Page | `app/(app)/settings/taste-profile/page.tsx` | Modify (add section) |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-03 — Server Actions for add/remove taste_profile_wines
- **Blocked by:** EPIC-02/STORY-02 — wine search DAL for autocomplete
- **Blocked by:** EPIC-03/STORY-05 — UX design spec
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** Autocomplete debounces correctly (300ms)
- [ ] **Unit:** Wine list renders added wines with correct data
- [ ] **Integration:** Adding a wine calls addTasteProfileWine Server Action
- [ ] **Integration:** Removing a wine calls removeTasteProfileWine Server Action
- [ ] **Accessibility:** Search input has proper label and autocomplete ARIA attributes

#### Implementation Notes

- Reuse the search infrastructure from EPIC-02 (wine search DAL) for autocomplete.
- This component appears in two places: the onboarding summary screen (Screen 5) and the settings/taste-profile page.
- Consider extracting the wine search autocomplete as a shared component if needed by other features.
- Optimistic UI: add the wine to the list immediately, revert if Server Action fails.

---

### [EPIC-03/STORY-08] — Write taste profile onboarding copy and microcopy

**Type:** copy
**Story Points:** 3
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend

#### User Story

As a marketing writer, I want to craft all user-facing copy for the taste profile onboarding flow so that it feels like a friendly conversation, not a quiz, and builds trust in Cru's ability to understand the user.

#### Acceptance Criteria

```gherkin
Given Screen 1 (Flavor Preferences) copy is written
When a user reads it
Then the heading and subheading feel approachable ("What flavors do you gravitate toward?" or similar conversational tone)

Given Screen 2 (Aversions) copy is written
When a user reads it
Then the framing is light and non-judgmental ("Anything you know you DON'T like?" with reassurance that there are no wrong answers)

Given Screen 3 (Drinking Context) copy is written
When a user reads it
Then the question feels natural ("How do you usually enjoy wine?")

Given Screen 4 (Adventurousness) copy is written
When a user reads it
Then the three options use distinct, personality-driven language that makes selection fun

Given Screen 5 (Profile Summary) copy is written
When a user reads it
Then it includes: summary intro text, "Looks right!" button label, "Not quite" button label, recommendation section header, and reassurance microcopy ("You can always update your taste profile in settings")

Given "Skip" copy is written
When reviewed
Then the skip option uses soft language ("I'll explore on my own for now") rather than harsh ("Skip")

Given all profile summary templates are written
When the template engine generates summaries
Then they sound natural, warm, and specific — not generic or robotic
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `lib/utils/taste-profile-summary.ts` (review templates) | Review |
| Copy | Copy doc / content spec for all 5 screens | Create |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-02 — needs finalized tag taxonomy to write accurate tag labels
- **Blocked by:** EPIC-03/STORY-04 — needs template engine structure to write templates
- **Blocks:** EPIC-03/STORY-06 — frontend needs finalized copy before building

#### Testing Requirements

- [ ] **Review:** All copy reviewed for brand voice consistency
- [ ] **Review:** No wine jargon in any user-facing text (core PRD requirement)
- [ ] **Review:** "Not sure" / skip messaging is warm and non-pressuring
- [ ] **Review:** Profile summary templates cover all major tag combinations naturally

#### Implementation Notes

- This is one of the most important copy tasks in the entire platform. The onboarding flow is Cru's first real interaction with users — it sets the tone for the entire brand.
- The PRD explicitly states: no wine jargon. Everything should use everyday language.
- Tag labels need particular attention — "berry" is fine, but "tannic" should be translated to "Very dry/tannic" or similar.
- Profile summary templates should vary enough that users with different profiles don't see the same paragraph. Aim for 50+ distinct template combinations.
- Consider the "Not quite" flow copy — how do we frame the ability to go back and adjust without making the user feel like they failed?

---

### [EPIC-03/STORY-09] — Build taste profile settings page for editing

**Type:** frontend
**Story Points:** 3
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to view and edit my taste profile from my account settings so that I can update my preferences as my palate evolves or correct initial choices.

#### Acceptance Criteria

```gherkin
Given I have a completed taste profile
When I navigate to Settings > Taste Profile
Then I see my current selections for affinities, aversions, contexts, and adventurousness
And I see my "Wines I've Loved" list
And I see my profile summary paragraph

Given I change my flavor affinities and tap "Save"
When the update is saved
Then my taste profile is updated, profile_version is incremented, and the summary regenerates

Given I want to redo my entire profile
When I tap "Redo Taste Profile"
Then I am taken back through the 5-screen onboarding flow with my current selections pre-filled

Given I never completed onboarding
When I navigate to Settings > Taste Profile
Then I see a prompt to complete the onboarding flow with a "Get Started" button
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/settings/taste-profile/page.tsx` | Create |
| Component | `components/features/taste-profile/TasteProfileEditor.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-03/STORY-03 — Server Actions for profile updates
- **Blocked by:** EPIC-03/STORY-06 — onboarding flow for "redo" functionality
- **Blocked by:** EPIC-03/STORY-07 — "Wines I've Loved" component
- **Blocked by:** EPIC-01/STORY-08 — settings page layout

#### Testing Requirements

- [ ] **Unit:** Editor renders current profile data correctly
- [ ] **Integration:** Save updates profile and increments version
- [ ] **Integration:** "Redo" navigates to onboarding with pre-filled state
- [ ] **Accessibility:** Settings page passes axe-core scan

#### Implementation Notes

- The settings page at `/settings/taste-profile` is a Server Component that fetches the user's taste profile via DAL, then renders the `TasteProfileEditor` Client Component.
- Editing individual sections (affinities, aversions, etc.) could use inline editing or modal-based editing — defer to UX designer spec.
- "Redo" reuses the onboarding component from STORY-06 but with pre-filled state passed as props.
- The `WinesIveLoved` component from STORY-07 is embedded here.
