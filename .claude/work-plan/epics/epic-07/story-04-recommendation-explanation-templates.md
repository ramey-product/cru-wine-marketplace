### [EPIC-07/STORY-04] — Recommendation Explanation Templates

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an Explorer, I want each recommendation to include a plain-language explanation of why it was picked for me so that I trust the suggestion and learn about my own palate.

#### Acceptance Criteria

```gherkin
Given a wine matched on flavor affinity + local availability
When the explanation generates
Then the match_reason reads something like "This earthy Rhône red matches your palate — and it's in stock at [Store Name], 2 miles away"

Given a wine matched primarily on adventurousness diversity
When the explanation generates
Then the match_reason signals discovery: "Something new for you: a [varietal] from [region] that [producer tagline]"

Given a wine matched on multiple factors
When the explanation generates
Then it combines up to 3 reason fragments into a single natural sentence

Given a wine with no strong single match factor
When the explanation generates
Then a generic but warm fallback is used: "A [varietal] we think you'll enjoy based on your taste profile"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/curation.ts` | Modify (add explanation generation) |
| Lib | `lib/curation/explanation-templates.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-03] — needs match data to generate explanations
- **Blocks:** [EPIC-07/STORY-08] — home screen displays match_reason

#### Testing Requirements

- [ ] **Unit:** Each template type produces grammatically correct output with test data
- [ ] **Unit:** Fragment combination logic handles 1, 2, and 3 fragments
- [ ] **Unit:** Fallback template used when no strong match factors exist
- [ ] **Unit:** Template correctly interpolates store name, distance, varietal, region, producer tagline

#### Implementation Notes

**Template System:**

```typescript
type MatchFactor = 'flavor_affinity' | 'no_aversion' | 'price_range' | 'local_availability' | 'adventureness' | 'producer_story';

interface ExplanationFragment {
  factor: MatchFactor;
  weight: number; // contribution to total score
  template: string; // parameterized template string
}
```

**Template Examples:**
- `flavor_affinity`: "This has the {flavors} character you love"
- `local_availability`: "In stock at {storeName}, {distance} away"
- `adventureness`: "Something new for you: a {varietal} from {region}"
- `producer_story`: "From {producerName} — {tagline}"
- `price_range`: "Right in your sweet spot at {price}"

**Combination Logic:**
1. Sort fragments by weight descending
2. Take top 3 fragments
3. Join with natural connectors: first fragment as main clause, subsequent with " — " or " and "
4. Ensure output is a single sentence, max ~120 characters

**Copy Ownership:** The marketing-writer agent should review and refine all template strings in STORY-11 to ensure they match Cru's brand voice. Use placeholder copy in the engine and replace during the copy pass.
