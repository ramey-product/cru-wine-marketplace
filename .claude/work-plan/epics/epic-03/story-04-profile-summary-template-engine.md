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
