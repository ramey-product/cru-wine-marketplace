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
