### [EPIC-01/STORY-07] — Build wishlist page and wishlist toggle button

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to view my wishlist and add/remove wines with a single click so that I can curate my list of interesting wines effortlessly.

#### Acceptance Criteria

```gherkin
Given I am logged in and have wines on my wishlist
When I navigate to my wishlist page
Then I see all saved wines as cards with name, producer, price, and a "Remove" button
And wines are sorted by most recently added by default

Given I am viewing a wine anywhere in the app
When I click the heart/bookmark icon
Then the wine is added to my wishlist with optimistic UI (instant visual feedback)

Given a wine is already on my wishlist
When I click the heart/bookmark icon on that wine
Then the wine is removed from my wishlist with optimistic UI

Given I view my wishlist on mobile
When I interact with the list
Then it is fully responsive with touch-friendly remove targets

Given I view an empty wishlist
When the page loads
Then I see a friendly empty state with copy directing me to browse wines
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/wishlist/page.tsx` | Create |
| Component | `components/features/wishlist/WishlistPage.tsx` | Create |
| Component | `components/features/wishlist/WishlistCard.tsx` | Create |
| Component | `components/features/wishlist/WishlistToggleButton.tsx` | Create |
| Loading | `app/(app)/[orgSlug]/wishlist/loading.tsx` | Create |
| Error | `app/(app)/[orgSlug]/wishlist/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-05 (wishlist DAL/Actions), EPIC-02/STORY-06 (Wine Card component for reuse)
- **Blocks:** EPIC-07 (curation uses wishlist interactions as signal)

#### Testing Requirements

- [ ] **E2E (Playwright):** Add wine to wishlist → appears on wishlist page
- [ ] **E2E (Playwright):** Remove wine from wishlist → disappears from wishlist page
- [ ] **Accessibility:** axe-core on wishlist page, toggle button has aria-label
- [ ] **Unit:** Optimistic update logic rolls back on server error

#### Implementation Notes

- `WishlistToggleButton` is a Client Component used across the app (wine cards, wine detail pages). It needs to be a shared component in `components/features/wishlist/`.
- Use `useOptimistic` hook for instant toggle feedback. On server error, revert the optimistic state.
- The wishlist page is a Server Component that fetches data via DAL, with the individual cards containing client-side toggle buttons.
- Empty state: use Shadcn empty state pattern with illustration, friendly copy from marketing-writer.
- Sort options: "Date Added" (default), "Price: Low to High", "Price: High to Low". Use URL search params for sort state.
