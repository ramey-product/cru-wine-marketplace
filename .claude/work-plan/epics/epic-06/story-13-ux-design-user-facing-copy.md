### [EPIC-06/STORY-13] — UX Design and User-Facing Copy

**Type:** design + copy
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend

#### User Story

As a product team, I want polished wireframes and copy for the entire retailer integration flow so that the UI is intuitive for non-technical retail partners and the admin matching experience is efficient.

#### Acceptance Criteria

```gherkin
Given the retailer onboarding flow
When UX delivers wireframes
Then they include: store details form, POS selection, fulfillment config, CSV upload, review & submit

Given the CSV import flow
When UX delivers wireframes
Then they include: column mapping UI, import preview table, progress indicator, results summary

Given the admin matching review
When UX delivers wireframes
Then they include: queue table, side-by-side review card, wine search modal, create wine form

Given all user-facing text
When marketing-writer delivers copy
Then it includes: form labels, help text, error messages, empty states, confirmation messages, email notification templates (sync success/failure)

Given a non-technical retailer
When they use the onboarding flow
Then the copy guides them without requiring POS or CSV jargon knowledge
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | `.claude/work-plan/designs/retailer-onboarding-wireframes.md` | Create |
| Design | `.claude/work-plan/designs/csv-import-wireframes.md` | Create |
| Design | `.claude/work-plan/designs/wine-matching-admin-wireframes.md` | Create |
| Copy | `.claude/work-plan/copy/retailer-integration-copy.md` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-01 — needs schema to understand data model
- **Blocks:** EPIC-06/STORY-10, STORY-11, STORY-12 — frontend stories need wireframes

#### Testing Requirements

- [ ] **Accessibility:** All wireframes annotated with ARIA roles and keyboard navigation
- [ ] **Accessibility:** Color contrast meets WCAG 2.1 AA for all states

#### Implementation Notes

**UX priorities:**
- Retailer onboarding must feel as simple as a Shopify signup — minimize steps, maximize progressive disclosure
- CSV column mapping is the riskiest UX — most retailers have never done this. Auto-detection + drag-and-drop column assignment
- Admin matching review needs efficiency — keyboard shortcuts for approve/reject, batch operations
- Mobile-responsive: retailers may onboard from a phone between customers

**Copy priorities:**
- Zero jargon in retailer-facing flows — "Upload your wine list" not "Import CSV inventory feed"
- Error messages should be helpful, not technical — "We couldn't read row 47. The price column seems empty." not "Validation error: price is required at index 46"
- Email templates: warm, professional tone — retailers are business partners, not end users
- Include microcopy for POS selection explaining what each integration means and how it helps
