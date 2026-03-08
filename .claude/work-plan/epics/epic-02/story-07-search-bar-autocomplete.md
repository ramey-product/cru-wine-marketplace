### [EPIC-02/STORY-07] — Build search bar with autocomplete

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to type a wine name, producer, or varietal and see instant suggestions so that I can find what I'm looking for without typing the full name.

#### Acceptance Criteria

```gherkin
Given I focus the search bar with no input
When the dropdown opens
Then I see my recent searches (up to 10)

Given I type "temp" in the search bar
When 300ms passes after keystroke (debounce)
Then autocomplete suggestions appear showing matching wines, varietals, and producers

Given I select an autocomplete suggestion
When I click/tap the suggestion
Then I am navigated to the appropriate page (wine detail, varietal browse, or producer page)

Given I press Enter with text in the search bar
When the search executes
Then I am navigated to the search results page with the query applied

Given the autocomplete is loading
When suggestions are being fetched
Then a loading spinner is visible in the dropdown
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/search/SearchBar.tsx` | Create |
| Component | `components/features/search/SearchSuggestions.tsx` | Create |
| Component | `components/features/search/RecentSearches.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-02 (search DAL), EPIC-02/STORY-03 (recent searches)
- **Blocks:** EPIC-02/STORY-08 (browse pages include search bar)

#### Testing Requirements

- [ ] **Unit:** Debounce fires after 300ms, not on every keystroke
- [ ] **Unit:** Suggestions categorized correctly (wines, varietals, producers)
- [ ] **E2E:** Type search → see suggestions → click suggestion → navigate
- [ ] **Accessibility:** Search bar has proper role="searchbox", suggestions have role="listbox", keyboard navigation works

#### Implementation Notes

- Client Component (`'use client'`) — needs state for query input, debounce, and dropdown visibility.
- Use `useDeferredValue` or custom debounce hook (300ms).
- Autocomplete calls a Server Action or API route that wraps `getSearchSuggestions` from the search DAL.
- Group suggestions: "Wines" section, "Varietals" section, "Producers" section — each with up to 3 items.
- Recent searches: stored server-side (STORY-03), fetched on focus. Display with a clock icon and "Recent" header.
- Keyboard: arrow keys to navigate, Enter to select, Escape to close.
- Search bar placement: top of all browse pages + in the app header/nav.
