### [EPIC-06/STORY-11] — CSV Column Mapping and Import Preview UI

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want to map my CSV columns to Cru's expected format and preview the import before confirming so that I can catch errors before my inventory goes live.

#### Acceptance Criteria

```gherkin
Given a retailer uploads a CSV with non-standard column names
When the mapping UI renders
Then it auto-detects likely mappings and allows manual override via dropdowns

Given the column mapping is complete
When the retailer clicks "Preview Import"
Then a table shows the first 20 rows with mapped values and highlights any validation errors

Given the preview shows validation errors
When the retailer reviews them
Then errors are highlighted in red with specific messages (e.g., "Invalid price: -5.00")

Given the retailer confirms the import
When they click "Start Import"
Then the CSV is processed through the import pipeline and they see a progress indicator

Given an import completes
When the results are shown
Then a summary displays: X matched, Y pending review, Z errors
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/csv-import/ColumnMapper.tsx` | Create |
| Component | `components/features/csv-import/ImportPreview.tsx` | Create |
| Component | `components/features/csv-import/ImportProgress.tsx` | Create |
| Component | `components/features/csv-import/ImportSummary.tsx` | Create |
| Page | `app/(app)/[orgSlug]/inventory/import/page.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-03 — needs CSV import pipeline
- **Blocked by:** EPIC-06/STORY-13 — needs UX wireframes for mapping UI
- **Blocks:** None (end of import flow)

#### Testing Requirements

- [ ] **Unit:** Auto-detection maps "Wine Name" → wine_name, "Winery" → producer, etc.
- [ ] **Unit:** Preview correctly highlights validation errors per row
- [ ] **Accessibility:** Column mapping dropdowns are keyboard navigable
- [ ] **E2E:** Full flow from upload → map → preview → confirm → summary

#### Implementation Notes

**Column auto-detection:**
- Maintain a dictionary of common column name variations per target field
- Score each CSV column header against the dictionary, suggest the best match
- Allow retailer to override any mapping via dropdown selects
- Required mappings: wine_name, price, quantity (minimum viable import)
- Optional mappings: producer, vintage, varietal, sku

**Preview table:**
- Use Shadcn/ui `<Table>` with virtualization if > 100 rows
- Red-highlighted cells for validation errors with tooltip error messages
- Green-highlighted cells for auto-detected mappings
- Gray cells for unmapped optional columns

**Import progress:**
- After confirmation, show a polling-based progress indicator
- Poll import status every 3 seconds until completion
- On completion, show ImportSummary with matched/review/error counts

**This is the most complex UI in this epic** — the column mapping interaction needs to be intuitive for non-technical retail staff. Close collaboration with UX designer.
