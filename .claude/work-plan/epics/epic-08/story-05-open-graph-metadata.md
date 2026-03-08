### [EPIC-08/STORY-05] — Open Graph Metadata for Shareable Pages

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a user sharing a wine link, I want the shared link to display a rich preview card (wine image, name, producer, price) so that my friends are compelled to click through.

#### Acceptance Criteria

```gherkin
Given a wine detail page URL is pasted into iMessage
When the link preview renders
Then it shows the wine's hero image, wine name, producer name, and price (if available)

Given a producer profile page URL is shared on Twitter/X
When the link card renders
Then it shows the producer's image, name, region, and tagline

Given a wine page URL is shared
When the Open Graph tags are inspected
Then og:title, og:description, og:image, og:url, og:type, and twitter:card meta tags are present

Given a shared URL includes UTM parameters
When the page loads
Then the UTM params do not affect page content or rendering
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/wines/[slug]/page.tsx` | Modify (add generateMetadata) |
| Page | `app/(app)/producers/[slug]/page.tsx` | Modify (add generateMetadata) |
| Component | `components/shared/OGMetaTags.tsx` | Create (optional helper) |

#### Dependencies

- **Blocked by:** [EPIC-04/STORY-08] — Wine detail page must exist with slug routing
- **Blocked by:** [EPIC-04/STORY-07] — Producer profile page must exist
- **Blocks:** [EPIC-08/STORY-06] — ShareButton UX is better when previews look good

#### Testing Requirements

- [ ] **Integration:** Wine page generateMetadata returns correct og:title, og:image, og:description
- [ ] **Integration:** Producer page generateMetadata returns correct og:title, og:image, og:description
- [ ] **Integration:** twitter:card is set to "summary_large_image"
- [ ] **Integration:** og:url does not include UTM parameters (canonical URL only)

#### Implementation Notes

Use Next.js `generateMetadata()` export in the page file. This is the standard approach for dynamic OG tags in App Router.

**Wine page metadata:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wine = await getWineBySlug(client, params.slug)
  return {
    title: `${wine.name} — ${wine.producer.name} | Cru`,
    description: wine.tagline || `${wine.varietal} from ${wine.region}`,
    openGraph: {
      title: wine.name,
      description: wine.tagline,
      images: [{ url: wine.hero_image_url, width: 1200, height: 630 }],
      type: 'product',
      url: `https://cru.wine/wines/${wine.slug}`,
    },
    twitter: { card: 'summary_large_image' },
  }
}
```

**Producer page metadata** — similar pattern with producer fields.

V0: Use existing wine/producer images. V1 enhancement: generate branded OG images via `@vercel/og` for a more polished social card.

Ensure `og:url` is the canonical URL (no UTM params) — UTM params are only appended by the share button client-side.
