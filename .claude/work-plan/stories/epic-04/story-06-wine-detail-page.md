### [EPIC-04/STORY-06] — Wine Detail Page (frontend)

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to visit a wine detail page and see the tasting description, food pairings, producer story hook, and local availability so that I can decide whether to buy it.

#### Acceptance Criteria

```gherkin
Given a user navigates to /wines/[slug]
When the page loads
Then they see wine name, vintage, varietal, region, appellation, tasting description (plain language), food pairings, producer story hook (2-3 sentences + "Read full story →" link), price, and availability section

Given a wine is in stock at 2 local retailers
When the availability section renders
Then both retailers appear with their price and a "Buy from [store name]" button linking to Order Placement

Given a wine has no local availability
When the page renders
Then a "Wishlist + Notify me when available nearby" CTA replaces the buy buttons

Given the user clicks "Read full story →"
When the link is followed
Then they navigate to /producers/[producer-slug]

Given the user clicks the Wishlist button
When they are authenticated
Then the wine is added to their wishlist (or removed if already wishlisted)

Given the user clicks the Share button
When the share dialog opens
Then they can share the wine page URL via native share or copy link

Given a wine's slug does not exist
When the user navigates to /wines/[nonexistent-slug]
Then a 404 page renders with a "Browse all wines" link

Given a search engine crawls /wines/[slug]
When it parses the page
Then it finds valid JSON-LD structured data (Product + Offer schema)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/wines/[slug]/page.tsx` | Create |
| Page | `app/(app)/wines/[slug]/loading.tsx` | Create |
| Page | `app/(app)/wines/[slug]/error.tsx` | Create |
| Component | `components/features/wines/WineDetailHero.tsx` | Create |
| Component | `components/features/wines/TastingDescription.tsx` | Create |
| Component | `components/features/wines/FoodPairings.tsx` | Create |
| Component | `components/features/wines/ProducerHook.tsx` | Create |
| Component | `components/features/wines/AvailabilitySection.tsx` | Create |
| Component | `components/features/wines/WishlistButton.tsx` | Create |
| Component | `components/features/wines/ShareButton.tsx` | Create |
| Metadata | `app/(app)/wines/[slug]/opengraph-image.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-04/STORY-02 — DAL functions for data fetching
- **Blocked by:** EPIC-04/STORY-08 — marketing-writer provides all page copy and microcopy
- **Coordinate with:** EPIC-05 Order Placement for "Buy from [store name]" button behavior and retailer availability data model
- **Coordinate with:** EPIC-03 for wishlist data model (wishlist_items table)

#### Testing Requirements

- [ ] **E2E:** Wine detail page loads with correct data for all sections
- [ ] **E2E:** "Buy from [store name]" button links correctly to Order Placement flow
- [ ] **E2E:** Wishlist button toggles correctly and persists state
- [ ] **Accessibility:** axe-core clean (heading hierarchy, button labels, image alt text)
- [ ] **SEO:** JSON-LD validates against Schema.org Product + Offer types
- [ ] **SEO:** OG tags include wine image, name, and description
- [ ] **404:** Non-existent slug renders 404
- [ ] **Responsive:** Page renders correctly on mobile, tablet, desktop

#### Implementation Notes

- Server Component for data fetching; WishlistButton and ShareButton are `'use client'` components.
- Availability section depends on EPIC-06 retailer inventory data. For initial build, accept an `availability` prop and render conditionally. The actual data source (retailer_inventory table + location query) will come from EPIC-06.
- JSON-LD for Product + Offer: include `name`, `description`, `image`, `offers` (with price, availability, seller info per Schema.org spec).
- Share button: Use `navigator.share()` API with fallback to clipboard copy.
- Wishlist: If wishlist_items table isn't built yet (EPIC-03 dependency), stub the button with a placeholder action and connect later.
- `generateMetadata()` for dynamic OG tags per wine.
