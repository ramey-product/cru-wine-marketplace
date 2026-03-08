### [EPIC-05/STORY-11] — UX design and user-facing copy

**Type:** design
**Story Points:** 5
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 4: Frontend (consulted before frontend build)

#### User Story

As the product team, I want polished UX wireframes and compelling copy for the entire purchase flow so that the checkout experience feels effortless, trustworthy, and on-brand.

#### Acceptance Criteria

```gherkin
Given the purchase flow design
When reviewed
Then wireframes cover: Buy button states, retailer selection sheet, cart sheet, checkout page, order confirmation, order history, order detail, and all error/empty states

Given the copy is written
When reviewed
Then it covers: all button labels, form labels, status badge text, notification messages, error messages, empty states, age verification language, and email subject lines

Given the design system
When new components are reviewed
Then they use existing Shadcn/ui primitives and follow established color/spacing patterns

Given the checkout flow
When tested for accessibility
Then all interactive elements meet WCAG 2.1 AA standards in the wireframes
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Design | (design output — Figma, wireframe specs, or design tokens doc) | Create |
| Copy | (copy doc delivered to fullstack agents) | Create |

#### Dependencies

- **Blocked by:** None — UX and copy can begin immediately based on PRD
- **Blocks:** EPIC-05/STORY-07, STORY-08, STORY-09 — frontend build needs wireframes and copy

#### Testing Requirements

- [ ] **Accessibility:** Wireframes reviewed for color contrast, tap target sizes, keyboard navigation
- [ ] **Accessibility:** Copy reviewed for plain-language clarity and inclusive phrasing
- [ ] **Design review:** fullstack-1 reviews wireframes for technical feasibility

#### Implementation Notes

**UX focus areas:**
1. **Buy button → retailer sheet:** One-tap entry point. Sheet should feel lightweight, not like a separate page. Mobile-first: bottom sheet. Desktop: side panel or modal.
2. **Cart interaction:** Non-blocking — user can add to cart and continue browsing. Cart indicator (badge count) in nav. Cart opens as a sheet/drawer, not a full page.
3. **Checkout page:** Single-page checkout. Fulfillment toggle at top. Order summary always visible. Age verification above payment button. Minimal fields — don't ask for info we already have.
4. **Order confirmation:** Celebration moment. Clear "what happens next" with timeline. Retailer contact info prominent.
5. **Order status:** Visual timeline component. Color-coded status badges. Active state should feel reassuring ("Your wine is being prepared").
6. **Error states:** Out-of-stock mid-checkout (gentle redirect). Payment failed (clear retry path). Network error (retry with saved state).
7. **Empty states:** No orders yet → warm CTA to browse. No retailers nearby → location prompt.

**Copy focus areas (marketing-writer):**
- Button labels: "Buy · $XX" / "Add to Cart" / "Checkout" / "Pay $XX.XX" — action-oriented, price-visible
- Age verification: Legal-compliant but not clinical. "I confirm I'm 21 or older" not "By checking this box you certify under penalty of perjury..."
- Status labels: Human-readable. "Getting ready" not "confirmed". "On its way" not "out_for_delivery".
- Error messages: Empathetic, solution-focused. "This wine just sold out — check nearby stores?" not "Error: insufficient stock".
- Email subject lines: "Your Cru order is confirmed" / "Your wine is ready for pickup at [Store]" / "Your wine is on its way"
- Empty state: "Your wine story starts with a first sip. Browse our collection →"
