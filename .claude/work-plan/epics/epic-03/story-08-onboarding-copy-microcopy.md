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
