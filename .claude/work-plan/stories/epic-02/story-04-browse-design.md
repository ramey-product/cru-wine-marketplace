### [EPIC-02/STORY-04] — Design browse page layout and Wine Card component

**Type:** design
**Story Points:** 3
**Assigned Agent:** ux-designer
**Phase:** Checkpoint 4: Frontend (pre-build)

#### User Story

As an explorer, I want the browse experience to feel intuitive and inviting — not like a database query tool — so that discovering wine is enjoyable, not clinical.

#### Acceptance Criteria

```gherkin
Given the UX designer delivers browse layouts
When reviewed by fullstack-1
Then designs cover: browse landing page, region browse, varietal browse, occasion browse, producer browse, search results page, empty state, and zero-results state
And each layout shows mobile (375px) and desktop (1280px) versions
And the Wine Card component spec includes: visual hierarchy, content slots, availability indicator placement, interaction states (hover, active, loading)

Given the filter system is designed
When reviewed
Then mobile uses a filter drawer pattern (bottom sheet or slide-in)
And desktop uses a sidebar filter panel
And filter selections persist visually (chips or badges)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `docs/design/browse-layouts.md` | Create |
| Design | `docs/design/wine-card-spec.md` | Create |

#### Dependencies

- **Blocked by:** None (can start immediately)
- **Blocks:** EPIC-02/STORY-06 (Wine Card build), EPIC-02/STORY-05 (browse pages build)

#### Testing Requirements

- [ ] **Review:** Design reviewed by fullstack-1 and pm-orchestrator for feasibility and brand alignment

#### Implementation Notes

- The Wine Card is the most reused component in the app — it appears in browse results, curation sections, wishlist, producer pages, and search results. Design must be flexible enough for all these contexts.
- Availability indicator: green dot for "in stock nearby," gray dot for "not locally available," no dot if inventory data unavailable (EPIC-06 not yet built).
- Story hook: 1-2 line preview of the producer story. Truncated with "Read more →". This is the key differentiator from other wine apps.
- Mobile: wine cards in a single-column list. Desktop: 3-4 column grid.
- Filter patterns: follow Shadcn/ui patterns (Sheet for mobile drawer, Sidebar for desktop panel).
