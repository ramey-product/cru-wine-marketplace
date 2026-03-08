### [EPIC-02/STORY-09] — Build wine detail page

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want to see all details about a wine — its story, tasting notes, food pairings, and where to buy it — so that I can decide whether this is the right bottle for me.

#### Acceptance Criteria

```gherkin
Given I navigate to /wines/[slug]
When the page loads
Then I see: wine name, producer name (linked to producer page), varietal, region, vintage, full tasting description, food pairings, flavor profile, producer story hook with "Full Story →" link, price/availability section, wishlist toggle, share button

Given the wine has food pairing data
When the page renders
Then 2-3 dish pairings are displayed with friendly formatting

Given the wine is available at nearby retailers
When the availability section renders
Then retailers are listed with price, distance, and stock status

Given the page is shared via URL
When someone opens the shared link
Then OG meta tags (title, description, image) are properly set for social previews

Given I view the page on mobile
When the layout renders
Then content stacks vertically with the CTA (buy/wishlist) prominently visible
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/wines/[slug]/page.tsx` | Create |
| Component | `components/features/wines/WineDetail.tsx` | Create |
| Component | `components/features/wines/TastingNotes.tsx` | Create |
| Component | `components/features/wines/FoodPairings.tsx` | Create |
| Component | `components/features/wines/WineAvailability.tsx` | Create |
| Loading | `app/(app)/[orgSlug]/wines/[slug]/loading.tsx` | Create |
| Error | `app/(app)/[orgSlug]/wines/[slug]/error.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-02 (wines DAL for getWineBySlug), EPIC-02/STORY-06 (Wine Card patterns), EPIC-04/STORY-04 (producer story content)
- **Blocks:** EPIC-05 (order placement links from wine detail "Buy" button), EPIC-08 (share button)

#### Testing Requirements

- [ ] **E2E:** Navigate to wine detail → all sections render
- [ ] **Accessibility:** axe-core scan, heading hierarchy, image alt text
- [ ] **Unit:** OG metadata generated correctly via generateMetadata()
- [ ] **Unit:** Missing data handled gracefully (no food pairings → section hidden)

#### Implementation Notes

- Server Component. Fetch wine by slug via DAL.
- OG tags via `generateMetadata()`: title = "Wine Name — Producer | Cru", description = story_hook or tasting_description truncated, image = wine image_url.
- JSON-LD: Schema.org `Product` with `Offer` entries from retailer inventory (when EPIC-06 is live).
- Availability section: initially shows "Coming soon — availability info" until EPIC-06 provides inventory data. Design the component to accept retailer data as optional prop.
- "Buy" button: navigates to retailer selection flow (EPIC-05). Until EPIC-05 exists, show wishlist CTA.
- Share button: EPIC-08 provides the ShareButton component. Until then, show a simple "Copy link" button.
