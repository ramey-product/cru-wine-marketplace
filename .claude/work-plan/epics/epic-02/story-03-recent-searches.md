### [EPIC-02/STORY-03] — Implement recent searches DAL and Server Action

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want to see my recent searches when I focus the search bar so that I can quickly re-run previous queries.

#### Acceptance Criteria

```gherkin
Given a user performs a search for "pinot noir"
When the search is executed
Then the query is saved to their recent searches list

Given a user has 12 saved searches
When recent searches are retrieved
Then only the 10 most recent are returned (FIFO)

Given user-A has recent searches
When user-B requests their recent searches
Then user-B sees only their own searches (empty if new)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_recent_searches.sql` | Create |
| DAL | `lib/dal/search.ts` | Modify (add recent search functions) |
| Action | `lib/actions/search.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table)
- **Blocks:** EPIC-02/STORY-07 (search UI uses recent searches)

#### Testing Requirements

- [ ] **RLS (pgTAP):** User can only read/write their own recent searches
- [ ] **Unit:** FIFO cap at 10 — oldest search removed when 11th is added

#### Implementation Notes

- `recent_searches` table: `id UUID PK`, `user_id UUID FK -> profiles.id`, `query TEXT`, `searched_at TIMESTAMPTZ DEFAULT now()`. User-scoped (NO org_id per CG-2 pattern).
- RLS: `user_id = auth.uid()` for all operations.
- DAL: `getRecentSearches(client, userId, limit=10)`, `saveRecentSearch(client, userId, query)`.
- `saveRecentSearch`: Use `INSERT` then `DELETE` the oldest if count > 10. Or use a single transaction with CTE.
- Deduplicate: if same query already exists, update `searched_at` instead of creating new row.
