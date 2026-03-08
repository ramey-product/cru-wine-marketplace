### [EPIC-05/STORY-09] — Order history and detail pages

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a consumer, I want to view my past orders and check the status of current orders so that I know when my wine will be ready and can reference what I've purchased.

#### Acceptance Criteria

```gherkin
Given a consumer has placed 5 orders
When they navigate to order history
Then all 5 orders appear sorted by date (newest first) with: date, retailer, item count, total, and status badge

Given a consumer clicks on an order
When the detail page loads
Then they see: full item list, prices, fulfillment details, status timeline, and retailer contact

Given an order has status "Ready for Pickup"
When the consumer views it
Then the status badge shows "Ready for Pickup" in a prominent color and the store address is highlighted

Given a consumer has no orders
When they navigate to order history
Then they see an empty state with a CTA to browse wines
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/orders/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/loading.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/error.tsx` | Create |
| Page | `app/(app)/[orgSlug]/orders/[orderId]/page.tsx` | Create |
| Component | `components/features/orders/OrderList.tsx` | Create |
| Component | `components/features/orders/OrderCard.tsx` | Create |
| Component | `components/features/orders/OrderDetail.tsx` | Create |
| Component | `components/features/orders/OrderStatusTimeline.tsx` | Create |

#### Dependencies

- **Blocked by:** EPIC-05/STORY-02 — needs orders DAL (getOrdersByUser, getOrderById)
- **Blocked by:** EPIC-05/STORY-11 — needs UX wireframes and copy for empty states, status badges

#### Testing Requirements

- [ ] **Unit:** OrderList renders orders sorted by date
- [ ] **Unit:** OrderCard shows correct status badge color
- [ ] **Unit:** OrderStatusTimeline renders all status history entries
- [ ] **Unit:** Empty state renders when no orders exist
- [ ] **Accessibility:** Status badges have aria-labels, timeline is screen-reader friendly
- [ ] **E2E:** Navigate to order history → click order → see detail with status timeline

#### Implementation Notes

**Order history page** (`app/(app)/[orgSlug]/orders/page.tsx`):
- Server Component fetching orders via `getOrdersByUser` DAL function
- Renders `OrderList` with `OrderCard` items
- Each `OrderCard` shows: order date, retailer name, wine count, total, status badge
- Status badge colors: pending (gray), confirmed (blue), ready_for_pickup (green), out_for_delivery (amber), completed (green), cancelled (red)

**Order detail page** (`app/(app)/[orgSlug]/orders/[orderId]/page.tsx`):
- Server Component fetching single order via `getOrderById` DAL function
- `OrderDetail` shows itemized receipt: wine name, quantity, unit price, subtotal per item
- `OrderStatusTimeline` shows vertical timeline of all status transitions from `order_status_history`
- Fulfillment details section: pickup address + map link (if pickup) or delivery address (if delivery)
- Retailer contact: store name, phone number, "Contact" link
- If order is in-progress (not completed/cancelled), show estimated completion time prominently

**Empty state:** Use marketing-writer copy. "Your wine journey starts here" type messaging with CTA button to browse/discover page (EPIC-02).
