### [EPIC-07/STORY-09] — Collection Detail Page

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to view a curated collection's full wine list with the curator's editorial description and per-wine notes so that I can explore a themed discovery path.

#### Acceptance Criteria

```gherkin
Given a user navigates to a collection page via slug
When the collection exists and is active
Then the page shows the collection title, description, cover image, and all wines in curator order

Given a collection item has a curator_note
When the wine card renders
Then the curator's note appears below the wine details

Given a collection is inactive or past its end_date
When a user navigates to its URL
Then a 404 page is shown

Given a user clicks a wine in the collection
When the wine detail page loads
Then a PostHog "recommendation_click" event is captured with source: "curated_collection"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/collections/CollectionDetail.tsx` | Create |
| Component | `components/features/collections/CollectionWineCard.tsx` | Create |
| Page | `app/(app)/[orgSlug]/collections/[slug]/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/collections/[slug]/loading.tsx` | Create |
| Page | `app/(app)/[orgSlug]/collections/[slug]/error.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs collections DAL (getCollectionBySlug, getCollectionWithItems)
- **Blocked by:** [EPIC-02/STORY-08] — needs wine card component
- **Blocked by:** [EPIC-07/STORY-11] — needs UX design specs

#### Testing Requirements

- [ ] **Unit:** CollectionDetail renders title, description, cover image, wine count
- [ ] **Unit:** CollectionWineCard renders curator_note when present
- [ ] **Unit:** Inactive/expired collections return 404
- [ ] **Accessibility:** Page has proper heading structure, wine cards are keyboard-navigable

#### Implementation Notes

- Route: `app/(app)/[orgSlug]/collections/[slug]/page.tsx`
- Use `getCollectionBySlug(supabase, slug)` to fetch, return `notFound()` if missing or inactive
- Wine cards in curator-defined order (position field)
- Curator notes as italic text below wine info on each card
- Cover image as hero banner at top of page
- Track clicks via PostHog `posthog.capture('recommendation_click', { source: 'curated_collection', wine_id })` in client component
- Include `loading.tsx` skeleton with placeholder cards
- Include `error.tsx` for data fetch failures
