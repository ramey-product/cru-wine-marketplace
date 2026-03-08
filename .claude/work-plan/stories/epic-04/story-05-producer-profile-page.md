### [EPIC-04/STORY-05] — Producer Profile Page (frontend)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to visit a producer's profile page and see their story, quick facts, wine portfolio, and photo gallery so that I feel a connection to the person behind the wine.

#### Acceptance Criteria

```gherkin
Given a user navigates to /producers/[slug]
When the page loads
Then they see the hero section (name, region/country, hero photo, tagline), story section (rendered Markdown), quick facts sidebar, wine portfolio grid, and photo gallery — all within a single scroll on desktop

Given the producer has 5 wines on Cru
When the portfolio section renders
Then all 5 active wines display with wine name, vintage, varietal, price range, and a link to the wine detail page

Given the producer has 4 photos
When the gallery section renders
Then photos display as a horizontally scrollable gallery with captions, ordered by display_order

Given a producer's slug does not exist
When the user navigates to /producers/[nonexistent-slug]
Then a 404 page renders with a "Browse all producers" link

Given the page URL is shared on social media
When the link preview renders
Then it shows the producer's hero photo, name, and tagline via Open Graph meta tags

Given a search engine crawls /producers/[slug]
When it parses the page
Then it finds valid JSON-LD structured data (Organization schema type for the producer)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/producers/[slug]/page.tsx` | Create |
| Page | `app/(app)/producers/[slug]/loading.tsx` | Create |
| Page | `app/(app)/producers/[slug]/error.tsx` | Create |
| Component | `components/features/producers/ProducerHero.tsx` | Create |
| Component | `components/features/producers/ProducerStory.tsx` | Create |
| Component | `components/features/producers/ProducerQuickFacts.tsx` | Create |
| Component | `components/features/producers/ProducerWineGrid.tsx` | Create |
| Component | `components/features/producers/PhotoGallery.tsx` | Create |
| Metadata | `app/(app)/producers/[slug]/opengraph-image.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-02 — DAL functions for data fetching
- **Blocked by:** EPIC-04/STORY-08 — marketing-writer provides all page copy and microcopy
- **Coordinate with:** EPIC-02 for shared WineCard component interface
- **Blocks:** None directly, but UX-designer should review before CHECKPOINT 4 approval

#### Testing Requirements

- [ ] **E2E:** Producer page loads with all 5 sections visible and correct data
- [ ] **Accessibility:** axe-core clean on producer profile page (focus management, alt text on images, heading hierarchy)
- [ ] **SEO:** JSON-LD validates against Schema.org Organization type
- [ ] **SEO:** Open Graph tags include og:title, og:description, og:image
- [ ] **404:** Non-existent slug renders 404 with navigation options
- [ ] **Responsive:** Page renders correctly on mobile (single column), tablet, desktop

#### Implementation Notes

- This is a Server Component — fetch data with DAL functions in the page component, no client-side data fetching.
- Use `generateMetadata()` for dynamic OG tags per producer.
- Markdown rendering: Use a library like `react-markdown` with `rehype-sanitize` for XSS prevention. Never use `dangerouslySetInnerHTML`.
- Photo gallery: Consider a lightweight component (not a heavy carousel library). Horizontal scroll with CSS `overflow-x: auto` and snap points is simplest.
- ISR: Use `export const revalidate = 3600` (1 hour) or on-demand revalidation via the admin update Server Action.
- Producer page route is outside `[orgSlug]` — this is public content, not org-scoped. Route: `app/(app)/producers/[slug]/page.tsx`.
- Wine portfolio grid reuses the WineCard component from EPIC-02. If EPIC-02 hasn't built it yet, define the interface here and let EPIC-02 adopt it.
