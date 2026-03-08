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
