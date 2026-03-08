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
