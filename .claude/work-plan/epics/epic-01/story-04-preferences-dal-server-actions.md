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
