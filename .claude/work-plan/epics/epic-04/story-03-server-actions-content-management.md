### [EPIC-04/STORY-03] — Server Actions for producer and wine content management

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform admin, I want Server Actions for creating and updating producers, wines, and photos so that the admin interface can manage content through validated, authorized mutations.

#### Acceptance Criteria

```gherkin
Given a platform admin calls createProducerAction with valid data
When the action executes
Then it validates with Zod, checks auth (getUser), checks platform org admin permission, calls DAL createProducer, revalidates /producers and /producers/[slug], and returns { data: producer }

Given a non-admin calls createProducerAction
When the action executes
Then it returns { error: 'Unauthorized' } without modifying data

Given a platform admin calls updateWineAction with partial update
When the action executes
Then it validates partial data, checks auth + permission, calls DAL updateWine, revalidates /wines/[slug], and returns { data: wine }

Given invalid data is submitted (e.g., tagline > 150 chars)
When the action executes
Then Zod validation fails and returns { error: 'Validation failed: ...' }

Given a platform admin calls addProducerPhotoAction
When the action executes with producer_id and image_url
Then it validates, checks auth + permission, calls DAL addProducerPhoto, revalidates /producers/[slug], and returns { data: photo }

Given a platform admin calls deleteProducerPhotoAction
When the action executes with a valid photo id
Then it checks auth + permission, calls DAL deleteProducerPhoto, revalidates, and returns { data: { success: true } }
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/producers.ts` | Create |
| Action | `lib/actions/wines.ts` | Create |
| Validation | `lib/validations/producers.ts` | Create |
| Validation | `lib/validations/wines.ts` | Create |
| Test | `lib/actions/__tests__/producers.test.ts` | Create |
| Test | `lib/actions/__tests__/wines.test.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-02 — DAL functions must exist
- **Blocks:** EPIC-04/STORY-07 (Admin Content Management UI)

#### Testing Requirements

- [ ] **Unit:** Zod schemas reject invalid data (tagline too long, missing required fields, invalid vintage year)
- [ ] **Integration:** Server Actions succeed with valid data + platform admin auth, fail with non-admin auth
- [ ] **Edge cases:** Duplicate slug returns appropriate error; updating non-existent producer returns error

#### Implementation Notes

- Pattern: `'use server'` → Zod validate → `supabase.auth.getUser()` → check membership role in platform org → DAL call → `revalidatePath()` → return `{ data }` or `{ error }`.
- Zod schemas: `createProducerSchema`, `updateProducerSchema` (partial), `createWineSchema`, `updateWineSchema` (partial), `producerPhotoSchema`.
- Slug generation: auto-generate from name using `slugify()` on create if not provided. Ensure uniqueness (append -2, -3 if needed).
- `revalidatePath` targets: `/producers`, `/producers/[slug]`, `/wines`, `/wines/[slug]` as appropriate.
