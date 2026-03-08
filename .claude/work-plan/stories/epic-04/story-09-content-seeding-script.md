### [EPIC-04/STORY-09] — Content seeding script and sample data

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a content team member, I want seed scripts that populate sample producers and wines so that I can test the platform with realistic data and use the scripts as templates for production content seeding.

#### Acceptance Criteria

```gherkin
Given a developer runs the seed script
When it completes
Then at least 5 sample producers are created with complete profiles (name, slug, region, country, tagline, story_content, farming_practices, hero_image_url)

Given the seed script runs
When producers are created
Then each producer has 2-4 sample wines with tasting descriptions, food pairings, and flavor profiles

Given the seed script runs
When producers are created
Then each producer has 2-3 sample photos with captions

Given the seed script is run twice
When it encounters existing data (matching slugs)
Then it upserts rather than duplicating

Given a developer wants to add real launch content
When they look at the seed script
Then the structure is clear enough to use as a template for real producer data entry
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Seed | `supabase/seed-producers.sql` | Create |
| Script | `scripts/seed-producers.ts` | Create (TypeScript alternative using DAL) |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-01 — tables must exist
- **Blocks:** EPIC-04/STORY-05, STORY-06 — frontend pages need data to render during development

#### Testing Requirements

- [ ] **Integration:** Seed script runs without errors against local Supabase
- [ ] **Idempotency:** Running the script twice does not create duplicate data

#### Implementation Notes

- Two options: SQL seed file (`supabase/seed-producers.sql`) for simplicity, or TypeScript script (`scripts/seed-producers.ts`) using DAL functions for type safety and reuse. Prefer TypeScript if DAL functions are ready.
- Sample content should be realistic but clearly fake (e.g., "Domaine des Tests", "Sample Vineyard"). Use placeholder images from a free service.
- Include sample `flavor_profile` JSONB on wines for EPIC-03 taste matching development.
- The `org_id` for all seeded content should reference the platform organization.
