### [EPIC-05/STORY-03] — Cart management Server Actions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a consumer, I want to add wines to my cart, adjust quantities, and remove items so that I can build my order before checking out.

#### Acceptance Criteria

```gherkin
Given a wine available at a retailer
When the consumer calls addToCart
Then a Medusa cart is created (if none exists) scoped to that retailer, and the wine is added

Given a cart with items from Retailer A
When the consumer tries to add a wine from Retailer B
Then the action returns an error explaining that only one retailer per order is supported

Given a cart with 2 units of a wine
When the consumer calls updateCartItemQuantity to 3
Then the cart item quantity updates to 3 and the totals recalculate

Given a cart with one item
When the consumer calls removeFromCart
Then the item is removed and the cart is empty

Given a consumer is not authenticated
When any cart action is called
Then the action returns an authentication error
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/cart.ts` | Create |
| Validation | `lib/validations/cart.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-02 — needs cart DAL functions
- **Blocked by:** EPIC-06 — needs retailer inventory data for stock check on add
- **Blocks:** EPIC-05/STORY-07 — cart UI calls these actions

#### Testing Requirements

- [ ] **Unit:** Zod validation rejects invalid input (negative quantity, missing wine_id)
- [ ] **Integration:** addToCart creates a Medusa cart and adds item
- [ ] **Integration:** addToCart rejects cross-retailer items
- [ ] **Integration:** updateCartItemQuantity updates Medusa cart
- [ ] **Integration:** removeFromCart removes item from Medusa cart
- [ ] **Unit:** Unauthenticated calls return error

#### Implementation Notes

**`lib/actions/cart.ts`** Server Actions:
- `addToCart(formData)` — Zod validate → auth → check retailer scope → inventory check → createMedusaCart (if new) → addItemToCart → return cart
- `updateCartItemQuantity(formData)` — Zod validate → auth → inventory check → updateCartItem → return cart
- `removeFromCart(formData)` — Zod validate → auth → removeCartItem → return cart
- `getActiveCart()` — auth → getCart → return cart or null

**Cart session management:** Store `medusa_cart_id` in an HTTP-only cookie or in the user's `profiles` row (`active_cart_id`). Cookie approach is simpler for V1. Cart expires after 24 hours of inactivity.

**Retailer scope enforcement:** Each cart has a single `sales_channel_id` (mapped to a retailer). If the consumer already has a cart for Retailer A and tries to add from Retailer B, the action returns `{ error: "Your cart contains items from [Retailer A]. Start a new order to buy from [Retailer B]." }`.

**Zod schemas in `lib/validations/cart.ts`:**
- `addToCartSchema: z.object({ wineId: z.string().uuid(), retailerOrgId: z.string().uuid(), quantity: z.number().int().min(1).max(24) })`
- `updateCartItemSchema: z.object({ lineItemId: z.string(), quantity: z.number().int().min(1).max(24) })`
- `removeFromCartSchema: z.object({ lineItemId: z.string() })`
