### [EPIC-02/STORY-10] — SEO metadata and sitemap generation

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a platform, I need browse pages to be discoverable by search engines so that we drive organic traffic from wine-related searches.

#### Acceptance Criteria

```gherkin
Given a browse page at /wines/region/france
When a search engine crawls the page
Then it finds: proper <title>, <meta description>, canonical URL, and JSON-LD BreadcrumbList

Given all wine detail pages exist
When the sitemap is generated
Then /sitemap.xml includes all active wine detail URLs, region pages, and varietal pages

Given OG tags are set on a wine page
When the URL is shared on social media
Then the preview shows wine name, producer, image, and description
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Sitemap | `app/sitemap.ts` | Create |
| Metadata | All browse page files | Modify (add generateMetadata) |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-08 (browse pages exist), EPIC-02/STORY-09 (wine detail exists)
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** sitemap.ts generates valid XML with all expected URLs
- [ ] **Unit:** generateMetadata returns correct title/description for each page type

#### Implementation Notes

- Use Next.js built-in `sitemap.ts` convention for `/sitemap.xml`.
- Fetch all active wine slugs, region slugs, and varietal slugs from DAL.
- Set `changefreq: 'weekly'` for browse pages, `'monthly'` for wine detail.
- Canonical URLs prevent duplicate content issues between filtered/unfiltered views.
- robots.txt: allow all browse pages, block search results page (`/wines/search?q=*`).
