### [EPIC-06/STORY-12] — Admin Wine Matching Review Interface

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a Cru content admin, I want to review unmatched and low-confidence wine matches so that retailer inventory links to the correct canonical wine records.

#### Acceptance Criteria

```gherkin
Given the wine_match_queue has pending entries
When an admin opens the review page
Then they see a filterable, sortable list of pending matches with retailer name, raw wine data, and suggested match (if any)

Given an entry has a suggested match (70-90% confidence)
When the admin reviews it
Then they see the raw CSV data side-by-side with the suggested Cru wine record and can approve or reject

Given an entry is unmatched (<70% confidence)
When the admin reviews it
Then they can search the Cru wine database to find a manual match, or create a new wine record

Given the admin creates a new wine record from an unmatched entry
When they click "Create Wine"
Then a new wine record is created in the wines table pre-populated with CSV data, and the match is resolved

Given matches are resolved (approved, rejected, or new wine created)
When the resolution is saved
Then the wine_match_queue entry is updated and (if approved) the retailer_inventory record is created
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/admin/wine-matching/page.tsx` | Create |
| Component | `components/features/wine-matching/MatchQueueTable.tsx` | Create |
| Component | `components/features/wine-matching/MatchReviewCard.tsx` | Create |
| Component | `components/features/wine-matching/WineSearchModal.tsx` | Create |
| Component | `components/features/wine-matching/CreateWineForm.tsx` | Create |
| Action | `lib/actions/wine-matching.ts` | Modify |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-04 — match queue must be populated
- **Blocked by:** EPIC-04/STORY-01 — needs wines table for search and match resolution
- **Blocked by:** EPIC-06/STORY-13 — needs UX wireframes

#### Testing Requirements

- [ ] **Unit:** Match resolution correctly updates queue status and creates inventory records
- [ ] **Unit:** Wine search returns relevant results from canonical database
- [ ] **Accessibility:** Table is navigable with keyboard, review cards have proper focus management
- [ ] **RLS:** Only platform admins can access this page (not retailer staff)

#### Implementation Notes

**Admin-only page:** This page lives under `app/(app)/admin/` and is restricted to users with platform admin role. Not visible to retailer organizations.

**Match review workflow:**
1. Admin sees queue table with filters: status (pending/unmatched/all), retailer, date range
2. Click a row to expand the review card
3. Side-by-side view: left = raw CSV data, right = suggested Cru wine (or search)
4. Actions: Approve Match, Reject, Search for Different Wine, Create New Wine
5. Batch actions: approve all high-confidence matches (>85%) in one click

**Wine search modal:** Instant search against wines table by name, producer, vintage. Uses the same trigram similarity as the matching engine for relevant results.
