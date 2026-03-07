# PRD: Producer Storytelling

**Feature:** Producer Storytelling
**Priority:** P0 — Launch Critical (RICE: 6,000)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

The most interesting wines in the world are invisible. Small-production winemakers — the farmer with 5 acres of old-vine Grenache, the third-generation family in the Langhe, the first-generation couple in the Willamette Valley — compete for shelf space against brands that spend millions on marketing. On platforms like Wine.com or Vivino, these producers are buried under search algorithms that favor volume, ratings, and advertising spend.

Meanwhile, the thing that actually converts an Explorer from a casual buyer into a repeat customer isn't a score or a discount — it's a story. "This wine was made by a woman who left finance to farm 3 hectares in Bandol" changes a $22 bottle from a commodity into an experience. Every wine on Cru needs a story, and every producer needs a profile that does their work justice.

This feature directly serves Product Principle #5 (The farmer earns the spotlight) and Product Principle #2 (Stories over scores). Without it, Cru is just another online wine shop.

## 2. Goals

**User Goals:**
- Understand who made a wine and why it's worth trying — in plain, non-pretentious language — before purchasing
- Feel a connection to the person behind the bottle that transforms a transactional purchase into a meaningful one
- Discover new producers through stories, not just search filters

**Business Goals:**
- Populate 30-50 producer profiles with compelling content before LA launch
- Generate SEO-indexable producer and wine pages that drive organic traffic (target: 500+ organic sessions/month by Month 3)
- Create the content foundation that the Curation Engine references when explaining "why this wine for you"
- Enable Editorial Content (P1) by establishing the CMS patterns and content model

## 3. Non-Goals

- **User-generated producer reviews or ratings** — No UGC on producer profiles at launch. Cru editorial team controls the narrative.
- **Producer self-service content management** — Producers don't edit their own profiles at launch. Content is created and managed by Cru (editorial/curator team). Producer self-serve is a P1 DTC feature.
- **E-commerce on the producer page** — Buying happens through Order Placement via local retailers. Producer pages link to wines, which link to purchase options.
- **Video content or virtual tours** — Text + photos at V1. Video support is a P1 Editorial Content enhancement.
- **Wine scoring or rating display** — Cru does not surface numerical scores on any page (Product Principle #2).

## 4. User Stories

### Explorer (Primary)
- As an Explorer, I want to read a short, engaging story about who made this wine so that I feel good about buying it.
- As an Explorer, I want to see a producer's full portfolio of wines available on Cru so that I can explore more from someone I like.
- As an Explorer, I want producer stories to be written in plain language — no "terroir-driven expressions of limestone" jargon — so that I understand and connect without feeling excluded.
- As an Explorer browsing a wine card, I want to see a one-line story hook so that I'm compelled to click through to the full profile.

### Enthusiast (Secondary)
- As an Enthusiast, I want to see detailed information about a producer's farming practices, winemaking philosophy, and vineyard details so that I can evaluate quality by my own criteria.
- As an Enthusiast, I want to filter producers by attributes (natural, biodynamic, organic, women-owned, BIPOC-owned) so that I can shop my values.

### Content Team (Internal)
- As a content creator, I want a structured CMS template for producer profiles so that all profiles have consistent quality and format.
- As a content creator, I want to add wines to a producer's portfolio with minimal friction so that I can seed content quickly.

### Edge Cases
- As a user viewing a producer with only one wine on the platform, I want the page to still feel complete and not empty.
- As a user visiting a producer page for a wine that's currently out of stock everywhere, I want to wishlist it and see a "Notify me" option.

## 5. Requirements

### Must-Have (P0)

**Producer Profile Page**
- Hero section: producer name, location (region + country), hero photo, tagline (≤ 150 chars)
- Story section: 300-800 word narrative covering who they are, their philosophy, what makes their wines special. Written in second person ("When you taste their Grenache, you're tasting 80 years of rootstock...")
- Quick facts sidebar: farming practices (conventional, organic, biodynamic, natural), vineyard size, year established, annual production volume, notable certifications
- Wine portfolio: grid of all wines by this producer available on Cru, each showing wine name, vintage, varietal, price, and local availability
- Photo gallery: 3-6 images (vineyard, cellar, bottles, people) displayed as a scrollable gallery
- Acceptance criteria:
  - Given a user navigates to a producer profile, when the page loads, then they see the hero, story, quick facts, wine portfolio, and photo gallery — all within a single scroll on desktop
  - Given a producer has 5 wines on Cru, when the portfolio section renders, then all 5 wines display with correct pricing and availability

**Wine Detail Page**
- Wine name, vintage, varietal, region, appellation
- Producer story hook (2-3 sentences) with "Read full story →" link to producer profile
- Tasting description: plain-language description of what to expect ("Think ripe blackberry, a hint of dried herbs, and a finish that lingers like a campfire") — written by Cru editorial, not scraped
- Food pairing suggestions: 2-3 dishes in plain language
- Price and availability section: links to Order Placement for in-stock retailers nearby
- Wishlist button and Share button
- Acceptance criteria:
  - Given a wine is in stock at 2 local retailers, when the availability section renders, then both retailers appear with their price and a "Buy from [store name]" button
  - Given a wine has no local availability, when the page renders, then a "Wishlist + Notify me when available nearby" CTA replaces the buy button

**CMS / Content Model**
- `producers` table: id, name, slug, region, country, tagline, story_content (rich text/markdown), farming_practices (JSONB array), vineyard_size, year_established, annual_production, hero_image_url, org_id
- `producer_photos` table: producer_id, image_url, caption, display_order, org_id
- `wines` table: id, producer_id, name, vintage, varietal, region, appellation, tasting_description, food_pairings (JSONB), flavor_profile (JSONB for taste matching), slug, org_id
- Content entry via admin interface or seed scripts (no public-facing CMS)
- All tables with RLS, org_id, updated_at triggers, indexes on slug and producer_id
- DAL functions in `lib/dal/producers.ts` and `lib/dal/wines.ts`

**SEO**
- Producer pages at `/producers/[slug]` — statically generated or ISR
- Wine pages at `/wines/[slug]` — statically generated or ISR
- Open Graph tags with producer photo and wine image for social sharing
- Structured data (JSON-LD) for wine products (Schema.org Product + Offer)
- Acceptance criteria:
  - Given a producer page URL is shared on social media, when the link preview renders, then it shows the producer's hero photo, name, and tagline

### Nice-to-Have (P1)

- Producer video embeds (YouTube/Vimeo)
- "Meet the Maker" interview format as a content type
- Related producers: "If you like [this producer], you might enjoy..."
- Producer self-service portal for content updates and photo uploads

### Future Considerations (P2)

- Producer DTC integration: direct sales from the producer profile page
- Interactive vineyard maps
- Producer-hosted virtual tastings with calendar integration

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Producer profiles seeded at launch | 30-50 complete profiles | 60+ | Content audit |
| Wines per producer average | 3+ wines per producer | 5+ | wines table count / producers count |
| Producer page views per session | 0.5 producer pages viewed per session | 0.8 | Page view analytics |
| Time on producer page | > 45 seconds average | > 60 seconds | Analytics |
| Story-to-wine-click rate | 30% of producer page visitors click through to a wine | 40% | Click tracking |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| SEO organic sessions | 500+ sessions/month by Month 3 from producer/wine pages | 1,000+ | Google Search Console |
| Producer page → purchase conversion | 8% of producer page visitors purchase within same session | 12% | Funnel analytics |
| Social shares from wine/producer pages | 200+ shares/month by Month 3 | 500+ | Share button events |

## 7. Open Questions

- **[Content — blocking]** Who writes the 30-50 launch producer profiles? Founding curators? Contracted wine writers? AI-assisted with human editing? Budget and timeline implications differ significantly.
- **[Design — blocking]** Wine detail page and producer profile page layouts — UX designer needs to define these before frontend build. These are brand-critical screens.
- **[Product — non-blocking]** Should wine tasting descriptions use a structured format (e.g., "Aroma: X, Palate: Y, Finish: Z") or pure narrative? Proposed: pure narrative for Explorers, with structured data in the backend for curation matching.
- **[Engineering — non-blocking]** Rich text storage: Markdown in the database or a structured content format (e.g., ProseMirror JSON)? Markdown is simpler; structured content enables richer rendering later.

## 8. Timeline Considerations

- **Build order: #4 (but can start Week 1)** — Producer Storytelling is independent of the auth/search chain. CMS and data model work can begin in Week 1 in parallel with User Accounts.
- **Weeks 1-5 of pre-launch sprint** (Track C)
- **Hard dependency:** None for the CMS/data layer. Wine Detail Page depends on Search & Browse for navigation context.
- **Parallel coordination:** Content seeding (30-50 producer profiles) happens Weeks 4-8 and requires human writing effort. This is the longest lead-time item outside of engineering.
- **Downstream dependents:** AI Curation Engine (#7) references producer content in recommendation explanations. Search & Browse (#2) indexes producer and wine content. Taste Profile (#3) uses wine flavor_profile data for matching.
