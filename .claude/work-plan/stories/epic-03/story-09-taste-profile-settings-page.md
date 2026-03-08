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
