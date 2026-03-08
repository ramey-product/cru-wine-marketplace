### [EPIC-07/STORY-07] — Curated Collections Admin Interface

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a curator, I want to create themed collections with editorial descriptions, add/remove/reorder wines, and schedule collections with start/end dates so that users see a human-crafted discovery path.

#### Acceptance Criteria

```gherkin
Given a curator navigates to the collections admin
When they click "New Collection"
Then a form appears for title, slug, description, cover image, display order, start/end dates

Given a curator is editing a collection
When they search for wines to add
Then they can search by name/producer and add wines with optional curator notes

Given a curator wants to reorder wines in a collection
When they drag-and-drop wine items
Then position values update and the new order persists

Given a curator sets an end_date of today on a collection
When tomorrow arrives
Then the collection no longer appears in user-facing sections

Given a curator marks a collection as inactive
When a user views the home screen
Then the inactive collection does not appear
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/collections.ts` | Create |
| Component | `components/features/collections/CollectionForm.tsx` | Create |
| Component | `components/features/collections/CollectionItemList.tsx` | Create |
| Component | `components/features/collections/CollectionManager.tsx` | Create |
| Page | `app/(app)/[orgSlug]/admin/collections/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/admin/collections/[collectionId]/page.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-07/STORY-02] — needs collections DAL
- **Blocked by:** [EPIC-07/STORY-11] — needs UX design specs
- **Blocks:** [EPIC-07/STORY-08] — home screen needs collections to exist

#### Testing Requirements

- [ ] **Unit:** Collection create/update Server Actions validate input and persist correctly
- [ ] **Unit:** Reorder action updates position values in correct sequence
- [ ] **Integration:** End-to-end collection CRUD flow
- [ ] **Accessibility:** All form fields labeled, drag-and-drop has keyboard alternative

#### Implementation Notes

- Admin-only pages — check `hasPermission(membership.role, 'collections:manage')`
- Wine search within collection editor: reuse wine search from Epic 02, filtered to wines in catalog
- Drag-and-drop reordering: use `@dnd-kit/sortable` (already a common Shadcn/ui companion)
- Cover image: URL input for V1 (no image upload infrastructure yet). Use placeholder if empty.
- Slug auto-generated from title with manual override option
- Server Actions in `lib/actions/collections.ts`: `createCollection`, `updateCollection`, `deleteCollection`, `addCollectionItem`, `removeCollectionItem`, `reorderCollectionItems`
