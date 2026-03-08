### [EPIC-02/STORY-05] — Write browse and search page copy

**Type:** copy
**Story Points:** 2
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build)

#### User Story

As an explorer, I want the browse experience to speak to me like a knowledgeable friend, not a wine encyclopedia.

#### Acceptance Criteria

```gherkin
Given marketing-writer delivers browse copy
When reviewed
Then it includes: browse landing page headline + intro, region descriptions (2-3 sentences each for top 10 regions), varietal descriptions (1-2 sentences each for top 15 varietals), occasion collection names + descriptions, empty state messages, zero-result suggestions, search placeholder text, filter labels, and section headers

Given region descriptions are written
When a user reads the France/Burgundy description
Then it communicates what wines from there taste like in plain, evocative language — no jargon, no scores
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `docs/copy/browse-pages.md` | Create |

#### Dependencies

- **Blocked by:** None
- **Blocks:** EPIC-02/STORY-06 (pages need copy)

#### Testing Requirements

- [ ] **Review:** Copy reviewed for brand voice, accuracy, accessibility of language

#### Implementation Notes

- Region descriptions should make someone who's never had wine from that region curious to try it.
- Occasion names must match the 12 predefined categories exactly.
- Zero-result copy should be helpful, not apologetic: "No wines matched those filters. Try widening your price range or exploring a different region."
- Search placeholder: something like "Search by wine, producer, or region..." — not generic "Search."
