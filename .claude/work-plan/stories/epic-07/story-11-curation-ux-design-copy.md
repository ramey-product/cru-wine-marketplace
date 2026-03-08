### [EPIC-07/STORY-11] — Curation UX Design & User-Facing Copy

**Type:** design
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend (design before build)

#### User Story

As the product team, I want polished UX specifications and brand-voice copy for all curation surfaces so that the curated experience feels personal, warm, and distinctly Cru.

#### Acceptance Criteria

```gherkin
Given the home screen curation sections
When UX specs are delivered
Then layouts for "Picked for You," "Curated Collections," and "Popular Near You" are specified with spacing, card sizes, scroll behavior, and responsive breakpoints

Given the recommendation explanation templates
When marketing copy is delivered
Then all template strings use Cru's brand voice — warm, knowledgeable, never pretentious

Given the "Not for me" dismiss interaction
When UX specs are delivered
Then the animation, button placement, and confirmation behavior are specified

Given the curated collections admin interface
When UX specs are delivered
Then the admin CRUD flow is wireframed with form layouts, drag-and-drop reorder, and date picker

Given empty states and edge cases
When designs are delivered
Then empty "Picked for You" (no profile), sparse results (< 6 matches), and no-collections states have designed fallbacks
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | UX specifications for curation surfaces | Deliver |
| Copy | Recommendation explanation templates (brand voice) | Deliver |
| Copy | Section headings, CTAs, empty state messages | Deliver |
| Copy | Collection admin UI labels and help text | Deliver |

#### Dependencies

- **Blocked by:** None — design can begin as soon as PRD is understood
- **Blocks:** [EPIC-07/STORY-07] — admin interface needs design specs
- **Blocks:** [EPIC-07/STORY-08] — home screen sections need design specs
- **Blocks:** [EPIC-07/STORY-09] — collection detail page needs design specs
- **Blocks:** [EPIC-07/STORY-10] — dismiss interaction needs design specs

#### Testing Requirements

- [ ] **Accessibility:** All designs meet WCAG 2.1 AA contrast and target size requirements
- [ ] **Accessibility:** Dismiss action is keyboard-accessible with clear focus states
- [ ] **Accessibility:** Collection card scroll has keyboard navigation

#### Implementation Notes

**UX Designer Deliverables:**
- Home screen section layouts (mobile + desktop)
- Recommendation card design (match_reason placement, dismiss button position)
- Curated collection card design (cover image ratio, title truncation)
- Collection detail page layout
- Admin collections CRUD wireframes
- Empty states for all edge cases
- Animation specs for dismiss interaction

**Marketing Writer Deliverables:**
- All recommendation explanation template strings (STORY-04)
- Section headings: "Picked for You," "Curated Collections," "Popular Near You" (or better alternatives)
- Empty state copy: "Complete your taste profile to get personalized picks" etc.
- Dismiss button tooltip text
- Collection admin help text and field descriptions
- "See all collections" CTA copy
