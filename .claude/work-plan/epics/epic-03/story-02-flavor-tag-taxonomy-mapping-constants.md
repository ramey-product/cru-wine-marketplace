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
