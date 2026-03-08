### [EPIC-09/STORY-06] — Dashboard Layout & Order Queue UI

**Type:** frontend
**Story Points:** 8
**Assigned Agent:** fullstack-1
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want a clean dashboard that shows my pending orders front-and-center so that I can quickly confirm and manage orders without wasting time navigating.

#### Acceptance Criteria

```gherkin
Given a retailer logs in with 3 pending orders
When the dashboard loads
Then all 3 orders appear in the queue with "Confirm" as the primary action button

Given a retailer clicks "Confirm" on a pending order
When the action succeeds
Then the order status updates to "confirmed" with optimistic UI feedback

Given an order has been pending for 90 minutes
When the retailer views the queue
Then a yellow SLA warning badge appears on that order

Given an order has been pending for > 2 hours
When the retailer views the queue
Then a red critical SLA badge appears on that order

Given a retailer clicks on an order row
When the detail view opens
Then it shows customer name (first + last initial), items, quantities, fulfillment type, and total

Given a retailer filters orders by "completed" status
When the filter applies
Then only completed orders appear in the queue
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/retailer/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/retailer/layout.tsx` | Create |
| Page | `app/(app)/[orgSlug]/retailer/orders/page.tsx` | Create |
| Page | `app/(app)/[orgSlug]/retailer/orders/[orderId]/page.tsx` | Create |
| Component | `components/features/retailer/OrderQueue.tsx` | Create |
| Component | `components/features/retailer/OrderDetail.tsx` | Create |
| Component | `components/features/retailer/OrderStatusActions.tsx` | Create |
| Component | `components/features/retailer/SlaBadge.tsx` | Create |
| Component | `components/features/retailer/RetailerDashboardNav.tsx` | Create |
| Page | `app/(app)/[orgSlug]/retailer/loading.tsx` | Create |
| Page | `app/(app)/[orgSlug]/retailer/error.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-02] — Needs order management DAL and Server Actions
- **Blocked by:** [EPIC-09/STORY-11] — UX design should inform layout decisions
- **Blocks:** Nothing — final consumer of backend stories

#### Testing Requirements

- [ ] **Unit:** SLA badge renders correctly for ok/warning/critical states
- [ ] **Integration:** Order status transition via button click → Server Action → UI update
- [ ] **E2E:** Retailer logs in → sees pending orders → confirms one → status updates
- [ ] **Accessibility:** All interactive elements have aria-labels, order queue is keyboard-navigable

#### Implementation Notes

**Layout:** Retailer dashboard has its own layout (`layout.tsx`) separate from consumer-facing pages. Sidebar/top nav with tabs: Orders (default), Inventory, Analytics, Settings. Orders tab gets a badge showing pending order count.

**Order queue design:**
- Server Component wraps the queue, passing data to client components
- `OrderQueue` is a `'use client'` component for filter/sort interactivity
- Each order row shows: order # (truncated), customer first name + last initial, item count, total, fulfillment type, SLA badge, primary action button
- Click row → navigate to `/retailer/orders/[orderId]` detail page
- Primary action button is contextual: "Confirm" for pending, "Mark Ready" for confirmed (pickup), "Mark Shipped" for confirmed (delivery), "Complete" for ready/shipped

**SLA badge logic:** Pure client-side calculation from `order.created_at`:
- `< 60 min pending`: no badge
- `60-120 min pending`: yellow "Warning" badge with minutes
- `> 120 min pending`: red "Urgent" badge with minutes

**Optimistic updates:** Use `useOptimistic` for status transitions. Button shows spinner during Server Action, reverts on error.

**Order detail page:** Server Component. Shows full order info with status timeline (breadcrumb-style showing progression through states). Customer privacy: show first name + last initial only, no email or phone.
