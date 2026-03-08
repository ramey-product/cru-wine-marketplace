### [EPIC-04/STORY-07] — Admin Content Management UI

**Type:** fullstack
**Story Points:** 8
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a content team member, I want an admin interface to create and edit producer profiles and wines so that I can seed and manage content without using raw SQL or API calls.

#### Acceptance Criteria

```gherkin
Given a platform admin navigates to /admin/producers
When the page loads
Then they see a table of all producers with name, region, wine count, is_active status, and edit/view actions

Given a platform admin clicks "New Producer"
When the form renders
Then it shows fields for: name, slug (auto-generated from name, editable), region, country, tagline (with character counter, max 150), story_content (Markdown editor with preview), farming_practices (multi-select), vineyard_size, year_established, annual_production, hero_image_url

Given a platform admin submits the new producer form with valid data
When the action completes
Then the producer is created, the admin is redirected to the producer edit page, and a success toast displays

Given a platform admin navigates to /admin/producers/[id]/wines
When the page loads
Then they see the producer's wine portfolio with options to add, edit, or deactivate wines

Given a platform admin adds a new wine
When the form is submitted with valid data
Then the wine is created, linked to the producer, and appears in the portfolio list

Given a platform admin navigates to /admin/producers/[id]/photos
When the page loads
Then they see the photo gallery with drag-to-reorder functionality and options to add/delete photos

Given a non-admin user attempts to access /admin/*
When the route renders
Then they are redirected to the home page (or shown a 403 page)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/admin/producers/page.tsx` | Create |
| Page | `app/(app)/admin/producers/new/page.tsx` | Create |
| Page | `app/(app)/admin/producers/[id]/page.tsx` | Create |
| Page | `app/(app)/admin/producers/[id]/wines/page.tsx` | Create |
| Page | `app/(app)/admin/producers/[id]/photos/page.tsx` | Create |
| Component | `components/features/admin/ProducerForm.tsx` | Create |
| Component | `components/features/admin/WineForm.tsx` | Create |
| Component | `components/features/admin/ProducerTable.tsx` | Create |
| Component | `components/features/admin/PhotoManager.tsx` | Create |
| Layout | `app/(app)/admin/layout.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-03 — Server Actions for mutations
- **Blocked by:** EPIC-04/STORY-02 — DAL functions for data fetching
- **Coordinate with:** ux-designer for admin UI patterns (data tables, forms, navigation)

#### Testing Requirements

- [ ] **E2E:** Admin can create a producer, add wines, and add photos end-to-end
- [ ] **E2E:** Non-admin user is blocked from admin routes
- [ ] **Accessibility:** axe-core clean on all admin pages (form labels, table headers, focus management)
- [ ] **Validation:** Form rejects invalid data and shows inline error messages

#### Implementation Notes

- Admin layout (`app/(app)/admin/layout.tsx`) should check user's platform org membership and role on the server. If not admin, redirect or show 403.
- Markdown editor: Use a simple textarea with a preview toggle (or a lightweight Markdown editor component). Don't over-engineer for V1.
- Photo upload: For V1, accept image URLs (pasted from Supabase Storage or external CDN). Drag-and-drop upload to Supabase Storage is a nice-to-have enhancement.
- Photo reorder: Use a drag-and-drop library (e.g., `@dnd-kit/sortable`) with client-side state, then call `reorderProducerPhotos` Server Action on save.
- Data table: Use Shadcn/ui DataTable with sorting, filtering, pagination.
- Character counter on tagline field: simple `'use client'` component.
