### [EPIC-06/STORY-04] — Fuzzy Wine Matching Engine

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want imported wine entries to automatically match against our canonical wine database so that retailer inventory links to the correct wine records without manual effort.

#### Acceptance Criteria

```gherkin
Given a retailer lists "Dom. Tempier Bandol Rose 2023"
When the matching engine runs
Then it matches to "Domaine Tempier Bandol Rosé 2023" with >90% confidence and auto-matches

Given a wine entry has 70-90% match confidence
When the matching engine runs
Then it is flagged as 'pending' in wine_match_queue for manual review

Given a wine entry has <70% match confidence
When the matching engine runs
Then it is flagged as 'unmatched' in wine_match_queue

Given a batch of 500 wines from a CSV import
When the matching engine processes them
Then 85%+ are auto-matched (>90% confidence) and the rest are queued for review

Given a match is auto-confirmed
When the engine resolves it
Then the corresponding retailer_inventory record is created via DAL upsert
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Service | `lib/services/wine-matcher.ts` | Create |
| Utility | `lib/utils/string-similarity.ts` | Create |
| Utility | `lib/utils/wine-name-normalizer.ts` | Create |
| Action | `lib/actions/wine-matching.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06/STORY-03 — match queue is populated by CSV import
- **Blocked by:** EPIC-04/STORY-01 — needs wines table to exist for matching
- **Blocks:** EPIC-06/STORY-12 — admin review UI consumes match queue

#### Testing Requirements

- [ ] **Unit:** String similarity handles abbreviations (Dom. → Domaine, Ch. → Château)
- [ ] **Unit:** Accent normalization (Rosé → Rose for matching, preserves original)
- [ ] **Unit:** Vintage matching is exact (2023 ≠ 2022)
- [ ] **Unit:** Confidence scoring correctly brackets auto/review/unmatched thresholds
- [ ] **Integration:** End-to-end from match queue entry → matched inventory record

#### Implementation Notes

**Matching Algorithm:**
1. **Normalize** wine name: lowercase, strip accents, expand abbreviations (Dom.→Domaine, Ch.→Château, Mt.→Mount), remove punctuation
2. **Tokenize** into components: producer, wine name, vintage, varietal
3. **Score each component** independently:
   - Producer: trigram similarity (pg_trgm) against wines.producer_name — weight 0.30
   - Wine name: trigram similarity against wines.name — weight 0.35
   - Vintage: exact match — weight 0.20
   - Varietal: fuzzy match against wines.varietal — weight 0.15
4. **Weighted composite score** determines action:
   - ≥ 0.90 → auto_matched (create inventory record immediately)
   - 0.70–0.89 → pending (queued for manual review)
   - < 0.70 → unmatched (queued with no suggested match)

**PostgreSQL support:**
- Enable `pg_trgm` extension for trigram similarity: `similarity()` and `%` operator
- Create GIN trigram indexes on `wines.name` and `wines.producer_name` for fast fuzzy search
- Use `SELECT *, similarity(name, $search) AS score FROM wines WHERE name % $search ORDER BY score DESC LIMIT 5`

**Wine name normalizer (`lib/utils/wine-name-normalizer.ts`):**
- Abbreviation dictionary: 50+ common wine abbreviations
- Accent folding: é→e, ü→u, ñ→n, etc.
- Vintage extraction: regex for 4-digit year (19xx or 20xx)
- Producer/wine splitting heuristics
