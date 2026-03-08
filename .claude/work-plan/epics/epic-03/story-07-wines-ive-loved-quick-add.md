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
