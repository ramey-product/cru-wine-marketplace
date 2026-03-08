### [EPIC-09/STORY-02] — Retailer Order Management DAL & Server Actions

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer, I want to view my order queue, see order details, and change order statuses so that I can efficiently manage incoming orders from Cru.

#### Acceptance Criteria

```gherkin
Given a retailer member calls getRetailerOrders()
When they pass filters for status = 'pending'
Then only pending orders for their retailer are returned, sorted newest first

Given a retailer confirms an order via confirmOrder() Server Action
When the action succeeds
Then the order status changes to 'confirmed' and a customer notification is triggered

Given a retailer tries to confirm an order belonging to another retailer
When the Server Action runs auth checks
Then it returns { error: 'Not authorized' } and no status change occurs

Given a retailer cancels an order via cancelOrder()
When they provide a cancellation reason
Then the order status changes to 'cancelled', the reason is stored, and the customer is notified

Given an order has been pending for > 60 minutes
When the SLA calculation runs
Then the order is flagged with 'warning' status; > 120 minutes = 'critical'
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailer-orders.ts` | Create |
| Action | `lib/actions/retailer-orders.ts` | Create |
| Validation | `lib/validations/retailer-orders.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-01] — Needs retailer_members table for auth/role checks
- **Blocked by:** [EPIC-05/STORY-02] — Needs order DAL functions and order status enum
- **Blocks:** [EPIC-09/STORY-06] — Dashboard order queue UI needs these DAL functions
- **Blocks:** [EPIC-09/STORY-10] — Email notifications triggered by status change actions

#### Testing Requirements

- [ ] **Unit:** Zod schema validation for order status transitions (valid transitions only)
- [ ] **Unit:** SLA calculation logic (pending duration → warning/critical thresholds)
- [ ] **Integration:** confirmOrder() Server Action end-to-end (auth → role check → status update → notification trigger)
- [ ] **Integration:** cancelOrder() with reason storage and notification
- [ ] **RLS:** Retailer A cannot confirm Retailer B's orders

#### Implementation Notes

**Order state machine (retailer-side transitions):**
```
pending → confirmed (retailer confirms)
confirmed → ready_for_pickup (retailer prepares, pickup orders)
confirmed → out_for_delivery (retailer dispatches, delivery orders)
ready_for_pickup → completed (customer picks up)
out_for_delivery → completed (delivery confirmed)
[any active] → cancelled (retailer cancels with reason)
```

**DAL functions:**
- `getRetailerOrders(client, retailerId, filters)` — paginated, filterable by status, sortable
- `getRetailerOrderDetail(client, retailerId, orderId)` — single order with items, customer info (first name + last initial only)
- `getRetailerOrderStats(client, retailerId)` — counts by status for dashboard badges
- `getOrderSlaStatus(order)` — pure function: calculates minutes pending, returns 'ok' | 'warning' | 'critical'

**Server Actions:**
- `confirmOrder(orderId)` — Zod validate → auth → retailer role check → valid transition check → DAL update → trigger notification → revalidatePath
- `markReadyForPickup(orderId)` — same pattern
- `markOutForDelivery(orderId)` — same pattern
- `markCompleted(orderId)` — same pattern
- `cancelOrder(orderId, reason)` — same pattern + store cancellation reason

All actions follow the standard pattern: Zod validate → `supabase.auth.getUser()` → check retailer_members linkage → validate status transition → DAL call → revalidatePath. Customer notification is triggered asynchronously (don't block the action on email send).
