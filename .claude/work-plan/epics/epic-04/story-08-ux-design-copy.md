### [EPIC-04/STORY-08] — UX design and copy for Producer Storytelling pages

**Type:** design + copy
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build)

#### User Story

As the development team, I want finalized UX layouts and all page copy for producer profile pages, wine detail pages, and admin content management so that frontend developers can build to a clear specification.

#### Acceptance Criteria

```gherkin
Given the ux-designer creates layouts for producer profile page
When the layouts are complete
Then they include: hero section with photo/tagline, story section layout, quick facts sidebar positioning, wine portfolio grid (card size, columns, responsive breakpoints), photo gallery scroll behavior, and mobile/tablet/desktop breakpoints

Given the ux-designer creates layouts for wine detail page
When the layouts are complete
Then they include: wine hero with image, tasting description layout, food pairings presentation, producer hook section with "Read full story →" CTA, availability section (in-stock and out-of-stock states), wishlist/share button placement

Given the marketing-writer writes copy for producer pages
When the copy is complete
Then it includes: section headings, empty state messages, CTA button text, error state messages, loading state text, meta description templates, and any instructional microcopy

Given the marketing-writer writes copy for wine detail pages
When the copy is complete
Then it includes: section headings, "Notify me" CTA text, wishlist button states (add/remove), share dialog text, no-availability messaging, and meta description templates

Given the ux-designer creates layouts for admin content management
When the layouts are complete
Then they include: producer table columns and actions, form field layouts, photo manager interactions, and navigation patterns
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `.claude/work-plan/designs/epic-04-producer-profile.md` | Create |
| Design | `.claude/work-plan/designs/epic-04-wine-detail.md` | Create |
| Design | `.claude/work-plan/designs/epic-04-admin-cms.md` | Create |
| Copy | `.claude/work-plan/copy/epic-04-copy-deck.md` | Create |

#### Dependencies

- **Blocked by:** None — this story can start immediately
- **Blocks:** EPIC-04/STORY-05 (Producer Profile Page), STORY-06 (Wine Detail Page), STORY-07 (Admin UI) — frontend build waits on design and copy

#### Testing Requirements

- [ ] **Review:** UX layouts reviewed by pm-orchestrator for completeness
- [ ] **Review:** Copy reviewed by pm-orchestrator for brand voice consistency
- [ ] **Accessibility:** Layouts include focus order annotations and ARIA landmark regions

#### Implementation Notes

- UX designer should reference existing patterns from EPIC-01/EPIC-02/EPIC-03 design work for consistency.
- Marketing writer: All copy must follow Product Principle #2 (Stories over scores) and #5 (The farmer earns the spotlight). No jargon. Second person voice for producer stories.
- Copy deck should include template strings for dynamic content (e.g., `"When you taste {producer}'s {varietal}, you're tasting..."`) used in meta descriptions and story hooks.
- Admin UI design: Prioritize speed and simplicity over polish. This is internal tooling for the content team.
