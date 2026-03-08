### [EPIC-05/STORY-07] — Retailer selection and cart UI

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As an Explorer, I want to tap "Buy" on a wine and see which nearby stores have it in stock with their prices so that I can choose where to buy and build my order.

#### Acceptance Criteria

```gherkin
Given a wine is available at 3 nearby retailers
When the user taps "Buy"
Then a bottom sheet opens showing all 3 retailers sorted by distance

Given a retailer in the sheet
When the user views it
Then they see: store name, distance, price, stock status (in stock / low stock / out of stock), fulfillment options (pickup, delivery, or both)

Given the user selects a retailer and taps "Add to Cart"
When the wine is added
Then the cart indicator updates and the user can continue browsing

Given the user opens the cart
When they view it
Then they see: wine(s), quantity controls, unit price per wine, subtotal, and a "Checkout" button

Given the cart has items from Retailer A
When the user tries to buy a wine from Retailer B via the Buy button
Then a message explains the single-retailer limitation and offers to start a new order

Given no retailers have the wine in stock
When the user taps "Buy"
Then a "Notify me" / "Wishlist" CTA is shown instead of the retailer sheet
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | `components/features/orders/RetailerSelectionSheet.tsx` | Create |
| Component | `components/features/orders/RetailerCard.tsx` | Create |
| Component | `components/features/orders/CartSheet.tsx` | Create |
| Component | `components/features/orders/CartItem.tsx` | Create |
| Component | `components/features/orders/BuyButton.tsx` | Create |
| Component | `components/features/orders/CartIndicator.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-03 — needs cart Server Actions
- **Blocked by:** EPIC-06 — needs retailer inventory + location data for the selection sheet
- **Blocked by:** EPIC-05/STORY-11 — needs UX wireframes and copy
- **Blocks:** EPIC-05/STORY-08 — checkout UI needs cart to exist

#### Testing Requirements

- [ ] **Unit:** RetailerSelectionSheet sorts retailers by distance
- [ ] **Unit:** Out-of-stock retailers show disabled state
- [ ] **Unit:** CartSheet renders correct subtotal from items
- [ ] **Accessibility:** Bottom sheet is keyboard-navigable, focus-trapped, aria-labeled
- [ ] **Accessibility:** Cart quantity controls have aria-labels
- [ ] **E2E:** Add wine to cart → cart indicator shows count → open cart → items visible

#### Implementation Notes

**RetailerSelectionSheet:** Uses Shadcn `Sheet` component (bottom sheet on mobile, side sheet on desktop). Receives a `wineId` prop. Fetches nearby retailers with stock via a DAL query (EPIC-06 provides `retailer_inventory` lookup). Each retailer row shows:
- Store name + distance (from CG-5 PostGIS proximity query)
- Price (from retailer inventory)
- Stock indicator: "In stock" (green), "Low stock" (amber), "Out of stock" (gray/disabled)
- Fulfillment badges: "Pickup" / "Delivery" / both
- "Add to Cart" button (disabled if out of stock)

**CartSheet:** Slide-over panel showing current cart state. Fetches cart from Medusa via `getActiveCart()` action. Each `CartItem` has quantity +/- controls (calls `updateCartItemQuantity`) and a remove button (calls `removeFromCart`). Shows subtotal. "Checkout" button navigates to checkout page.

**BuyButton:** Appears on wine cards and wine detail pages. Calls `RetailerSelectionSheet` on click. Shows "Buy · $XX" with the lowest available price if known, or "Buy" if price varies by retailer.

**CartIndicator:** Small badge on the navigation bar showing cart item count. Reads from cart cookie/state. Clicking opens CartSheet.

**State management:** Cart state lives in Medusa (server) and is fetched on demand. Use React `useOptimistic` for quantity changes to avoid flicker. No client-side cart store needed for V1.
