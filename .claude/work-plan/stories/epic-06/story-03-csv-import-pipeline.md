### [EPIC-06/STORY-03] — CSV Import Pipeline

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer, I want to upload my wine inventory via CSV so that my stock appears on Cru without complex technical setup.

#### Acceptance Criteria

```gherkin
Given a retailer uploads a valid CSV with 500 wines
When the import pipeline processes it
Then all rows are parsed, validated, and staged in wine_match_queue within 5 minutes

Given a CSV has unmappable columns
When the pipeline receives the column mapping from the UI
Then it remaps columns accordingly and processes successfully

Given a CSV row has invalid data (negative price, missing wine name)
When validation runs
Then the row is rejected with a specific error and the import continues for valid rows

Given an import completes
When I check retailer_sync_logs
Then a log entry shows records_processed, records_created, records_updated, records_failed
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/csv-import.ts` | Create |
| Utility | `lib/csv/parser.ts` | Create |
| Utility | `lib/csv/validator.ts` | Create |
| Utility | `lib/csv/column-mapper.ts` | Create |
| Validation | `lib/validations/csv-import.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-02 — needs DAL functions for inventory upsert and match queue
- **Blocks:** EPIC-06/STORY-04 — matching engine processes rows from wine_match_queue
- **Blocks:** EPIC-06/STORY-11 — CSV upload UI calls these actions

#### Testing Requirements

- [ ] **Unit:** Parser handles different CSV encodings (UTF-8, Latin-1) and line endings
- [ ] **Unit:** Validator catches invalid prices, missing required fields, negative quantities
- [ ] **Unit:** Column mapper correctly remaps non-standard column names
- [ ] **Integration:** Full pipeline from CSV string → parsed → validated → match queue entries

#### Implementation Notes

**CSV Template Columns (standard):**
`wine_name, producer, vintage, varietal, sku, price, quantity`

**Column Mapper:** The column mapping step handles retailer CSVs that use different names:
- "Wine" → wine_name, "Winery" → producer, "Year" → vintage, "Grape" → varietal, "Cost" → price
- The mapper receives a JSON mapping from the CSV upload UI (STORY-11) and transforms accordingly

**Price normalization:** Accept both dollar strings ("$24.99") and numbers (24.99), convert to cents (2499)

**Pipeline steps:**
1. Parse CSV → rows[]
2. Apply column mapping
3. Validate each row (collect errors per row)
4. Price normalization to cents
5. Insert valid rows into wine_match_queue with status='pending'
6. Create retailer_sync_log entry
7. Trigger matching engine (STORY-04) asynchronously

**File size limit:** 10MB max (handles ~10,000 wines easily). Use Supabase Storage for upload, stream processing for parsing.
