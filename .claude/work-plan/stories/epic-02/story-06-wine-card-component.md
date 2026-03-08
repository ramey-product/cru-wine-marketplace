### [EPIC-02/STORY-06] — Build Wine Card component

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As an explorer, I want each wine in browse results to show me at a glance what the wine is, who made it, what it costs, and whether I can get it nearby so that I can quickly decide which wines to explore further.

#### Acceptance Criteria

```gherkin
Given a wine with full data
When the Wine Card renders
Then it displays: wine name, producer name (linked), varietal, region, vintage, price or price range, story hook (≤120 chars with "Read more →"), and availability indicator

Given a wine is in stock at a nearby retailer
When the Wine Card renders
Then a green dot availability indicator is visible with aria-label "Available nearby"

Given the user is on mobile (375px viewport)
When Wine Cards render
Then they display in a single-column layout with adequate touch targets

Given the user hovers over a Wine Card on desktop
When the hover state activates
Then a subtle elevation/shadow change indicates interactivity

Given the Wine Card is clicked
When navigation occurs
Then the user is taken to /wines/[slug]
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/wines/WineCard.tsx` | Create |
| Component | `components/features/wines/WineCardSkeleton.tsx` | Create |
| Component | `components/features/wines/AvailabilityIndicator.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-02/STORY-04 (design spec), EPIC-02/STORY-05 (copy)
- **Blocks:** EPIC-02/STORY-08 (browse pages use Wine Card), EPIC-01/STORY-07 (wishlist uses Wine Card), EPIC-07 (curation uses Wine Card)

#### Testing Requirements

- [ ] **Unit:** WineCard renders all data fields correctly
- [ ] **Unit:** Story hook truncates at 120 chars with ellipsis
- [ ] **Accessibility:** aria-labels on availability indicator, proper heading hierarchy, link is focusable
- [ ] **Visual:** Responsive at 375px, 768px, 1280px breakpoints

#### Implementation Notes

- This is a Server Component (no interactivity beyond navigation). The WishlistToggleButton (EPIC-01/STORY-07) is a separate Client Component overlaid on the card.
- Use Shadcn `<Card>` as the base primitive.
- Props interface: `{ wine: Wine, showAvailability?: boolean, showStoryHook?: boolean }` — different contexts may hide certain fields.
- Skeleton component (`WineCardSkeleton`) mirrors the card layout for Suspense fallbacks.
- Price display: if `price_min === price_max`, show single price. If different, show range "$20 - $28". If null, show "Check availability."
