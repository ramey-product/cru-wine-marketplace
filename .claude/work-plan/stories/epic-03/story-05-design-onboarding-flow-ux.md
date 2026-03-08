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
