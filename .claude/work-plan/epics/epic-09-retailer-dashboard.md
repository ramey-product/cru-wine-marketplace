# Epic: [EPIC-09] — Retailer Dashboard

**Source PRD:** `docs/prds/prd-09-retailer-dashboard.md`
**Priority:** P0 — Launch Critical (RICE: 27 — strategically mandatory)
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-2, fullstack-3, fullstack-4, ux-designer, marketing-writer

## Epic Summary

The Retailer Dashboard gives Cru's 20 LA launch retailers a self-service interface to manage incoming orders, monitor inventory sync health, view basic analytics, and configure store settings — eliminating the need for the Cru ops team to manually relay every order via email or phone. This is strategically mandatory: if retailers can't efficiently manage their Cru presence, they'll churn, and retailer churn at launch is existential for the marketplace model.

## Success Criteria

- [ ] Retailers can view, confirm, and manage orders entirely within the dashboard (no ops intervention needed)
- [ ] Inventory sync status is visible with clear error states and manual override capability
- [ ] Basic analytics show top wines, order summary, and view counts for the last 30 days
- [ ] Retailer settings (fulfillment options, notifications) are self-service editable
- [ ] All retailer data is isolated via RLS — retailers see only their own orders, inventory, and analytics
- [ ] Dashboard pages load in < 2 seconds with 30 days of order data

## Architecture Dependencies

- **Database tables:** `retailer_members` (new), extends `retailers` with fulfillment columns, `retailer_notification_preferences` (new), `retailer_stock_overrides` (new), materialized view for analytics
- **Existing tables (from prior epics):** `retailers`, `retailer_inventories`, `retailer_pos_connections` (Epic 06), `orders`, `order_items` (Epic 05), `memberships` (Epic 01)
- **External integrations:** Transactional email service (Resend/Postmark) for order status notifications
- **Shared components:** Data table, stats cards, status badges (Shadcn/ui primitives)

## Cross-Cutting Concerns

- **Auth & Roles:** Retailers authenticate via the same Supabase Auth as consumers. A `retailer_members` linking table connects user accounts to specific retailers with retailer-specific roles (owner vs staff). The membership `role` in the org membership model gains a `retailer` value.
- **Order State Machine:** Order status transitions must align with Epic 05's order model. The retailer dashboard adds the retailer-side transitions (confirm, ready, deliver, complete, cancel) which trigger customer notifications.
- **RLS Complexity:** Retailer dashboard RLS is two-layered: `org_id` for platform tenant isolation PLUS `retailer_id` for retailer-specific data isolation within the platform. Every retailer dashboard query filters by the authenticated user's linked retailer.
- **Email Notifications:** Order status changes trigger customer-facing transactional emails. This introduces the platform's first transactional email capability, which will be reused by other features.
- **POS Sync Status:** Inventory health monitor reads from `retailer_pos_connections` and `retailer_inventories` created in Epic 06. Manual stock overrides must interact correctly with automated POS sync (overrides should persist until next successful sync or until manually cleared).

## Technical Risks & Open Questions

- [ ] Retailer onboarding flow: How do retailers get their accounts? Invite-based (Cru ops creates account + sends invite link) vs self-service signup. Proposed: invite-based for V1 (ops creates retailer → adds retailer_member → sends magic link).
- [ ] Email service selection: Resend, Postmark, or Supabase Edge Functions? Decision needed before STORY-10. Proposed: Resend (developer-friendly, good Next.js integration, generous free tier).
- [ ] Materialized view refresh strategy: How often do analytics MVs refresh? On-demand (slow first load), scheduled (cron), or triggered (on order status change)? Proposed: scheduled refresh every 15 minutes via Supabase pg_cron.
- [ ] Stock override conflict resolution: When a POS sync runs after a manual override, does the POS data win? Proposed: manual overrides are sticky until the retailer clears them or until the next POS sync brings a quantity > 0 for a manually-zeroed item.
- [ ] Order status email template design: plain text vs HTML branded? Proposed: simple HTML with Cru branding, wine name, status, and next steps.

---

## Developer Stories

---

### [EPIC-09/STORY-01] — Retailer Dashboard Database Schema & RLS Policies

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a system, I need the database schema to support retailer-specific roles, settings, stock overrides, and analytics so that the retailer dashboard can query and display data securely.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When a user is linked as a retailer member
Then their retailer_members row connects their user_id to a retailer_id with a role (owner/staff)

Given a retailer member queries order data
When RLS evaluates the query
Then only orders belonging to that member's linked retailer are returned

Given a retailer member queries another retailer's data
When RLS evaluates the query
Then zero rows are returned (no cross-retailer data leakage)

Given a retailer owner queries the dashboard
When they access settings and analytics
Then they see full data for their retailer

Given a retailer staff member queries the dashboard
When they access orders and inventory
Then they see operational data but not revenue/commission details
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_retailer_dashboard_schema.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_retailer_analytics_views.sql` | Create |
| Test | `supabase/tests/retailer-dashboard-rls.test.sql` | Create |

#### Dependencies

- **Blocked by:** [EPIC-01/STORY-01] — Needs `memberships` table and auth infrastructure
- **Blocked by:** [EPIC-06/STORY-01] — Needs `retailers`, `retailer_inventories`, `retailer_pos_connections` tables
- **Blocked by:** [EPIC-05/STORY-01] — Needs `orders` and `order_items` tables
- **Blocks:** [EPIC-09/STORY-02] through [EPIC-09/STORY-05] — All DAL functions depend on schema

#### Testing Requirements

- [ ] **RLS (positive):** Retailer member can read their own retailer's orders, inventory, settings
- [ ] **RLS (negative):** Retailer member cannot read another retailer's orders, inventory, settings
- [ ] **RLS (staff vs owner):** Staff can read orders but cannot access revenue/commission analytics
- [ ] **Schema:** All columns, constraints, indexes, and triggers are correctly created
- [ ] **Migration:** Migration is idempotent and rolls back cleanly

#### Implementation Notes

**New tables:**

```sql
-- Org-scoped: links users to specific retailers with retailer roles
CREATE TABLE retailer_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')) DEFAULT 'staff',
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, user_id)
);

-- Org-scoped: per-user notification settings for retailer context
CREATE TABLE retailer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_member_id UUID NOT NULL REFERENCES retailer_members(id) ON DELETE CASCADE,
  new_order_email BOOLEAN NOT NULL DEFAULT true,
  daily_summary_email BOOLEAN NOT NULL DEFAULT true,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_member_id)
);

-- Org-scoped: manual stock overrides that take precedence over POS sync
CREATE TABLE retailer_stock_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  wine_id UUID NOT NULL,  -- FK to wines table from Epic 04
  override_status TEXT NOT NULL CHECK (override_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  overridden_by UUID NOT NULL REFERENCES auth.users(id),
  cleared_at TIMESTAMPTZ,  -- NULL = active override, set = cleared by sync or user
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, wine_id) WHERE cleared_at IS NULL  -- Only one active override per wine per retailer
);
```

**Extend `retailers` table (from Epic 06):**
```sql
ALTER TABLE retailers
  ADD COLUMN IF NOT EXISTS pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivery_radius_miles NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS delivery_fee_cents INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS hours_of_operation JSONB;  -- { "mon": "10:00-20:00", ... }
```

**Analytics materialized view:**
```sql
CREATE MATERIALIZED VIEW retailer_order_analytics AS
SELECT
  r.id AS retailer_id,
  r.org_id,
  COUNT(o.id) AS total_orders_30d,
  SUM(o.total_cents) AS gross_revenue_30d,
  SUM(o.commission_cents) AS commission_30d,
  SUM(o.total_cents - o.commission_cents) AS net_payout_30d,
  DATE_TRUNC('week', o.created_at) AS week
FROM retailers r
LEFT JOIN orders o ON o.retailer_id = r.id
  AND o.created_at >= now() - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY r.id, r.org_id, DATE_TRUNC('week', o.created_at);

CREATE UNIQUE INDEX idx_retailer_order_analytics ON retailer_order_analytics(retailer_id, week);
```

RLS on `retailer_members`, `retailer_notification_preferences`, `retailer_stock_overrides`: user must be an active retailer member for the given retailer. RLS on analytics MV: user must be a retailer member with `owner` role to see revenue/commission data.

Standard indexes: `org_id` on all tables, `retailer_id` on `retailer_members`, `retailer_stock_overrides`.

---

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

---

### [EPIC-09/STORY-03] — Inventory Management DAL & Server Actions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer, I want to view my inventory sync health, see error alerts, and manually override stock status so that my Cru listings are always accurate.

#### Acceptance Criteria

```gherkin
Given a retailer calls getInventoryHealth()
When their POS sync last ran successfully 4 hours ago
Then the response includes lastSyncAt, syncSource, and nextScheduledSync

Given a retailer's POS sync has failed
When they view inventory health
Then the response includes error details and available actions (retry for CSV, contact support for API)

Given a retailer manually marks a wine as out_of_stock
When the override saves
Then that wine shows as unavailable on Cru immediately for that retailer

Given a POS sync runs after a manual override
When the sync brings quantity > 0 for an overridden wine
Then the override is automatically cleared and POS data takes precedence
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailer-inventory.ts` | Create |
| Action | `lib/actions/retailer-inventory.ts` | Create |
| Validation | `lib/validations/retailer-inventory.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-01] — Needs `retailer_stock_overrides` table
- **Blocked by:** [EPIC-06/STORY-03] — Needs POS sync infrastructure and `retailer_inventories`
- **Blocks:** [EPIC-09/STORY-07] — Inventory health monitor UI needs these DAL functions

#### Testing Requirements

- [ ] **Unit:** Zod validation for stock override status enum
- [ ] **Integration:** Manual stock override creates row in `retailer_stock_overrides` and updates effective availability
- [ ] **Integration:** POS sync clears override when new stock data arrives
- [ ] **RLS:** Retailer can only override stock for their own wines

#### Implementation Notes

**DAL functions:**
- `getInventoryHealth(client, retailerId)` — last sync time, source, errors, next scheduled sync from `retailer_pos_connections`
- `getInventorySummary(client, retailerId)` — counts: total listed, in stock, low stock, out of stock (joining `retailer_inventories` with active `retailer_stock_overrides`)
- `searchRetailerWines(client, retailerId, query)` — search wines in retailer's inventory by name for the quick stock toggle
- `getActiveOverrides(client, retailerId)` — list of currently active manual overrides

**Server Actions:**
- `overrideStockStatus(retailerId, wineId, status)` — upsert into `retailer_stock_overrides`, revalidate wine availability
- `clearStockOverride(retailerId, wineId)` — set `cleared_at = now()` on the override
- `retrySync(retailerId)` — trigger a manual sync attempt (for CSV-based retailers, this is a re-upload prompt; for API-based, it queues a sync job)

The effective stock status for any wine = `retailer_stock_overrides` (if active) ?? `retailer_inventories.status`. This join logic should be encapsulated in a DAL helper.

---

### [EPIC-09/STORY-04] — Analytics DAL Functions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer owner, I want to see which of my wines are performing best on Cru and understand my order/revenue trends so that I can make better stocking decisions.

#### Acceptance Criteria

```gherkin
Given a retailer owner calls getTopWinesByOrders()
When they have 50 unique wines ordered in the last 30 days
Then the top 10 are returned sorted by order volume descending

Given a retailer owner calls getOrderSummary()
When they request the last 4 weeks
Then each week shows total orders, gross revenue, commission, and net payout

Given a retailer owner calls getTopWinesByViews()
When wine view tracking data exists
Then the top 10 most-viewed wines for this retailer are returned with view counts

Given a retailer staff member calls getOrderSummary()
When the role check runs
Then revenue/commission/payout fields are null (staff sees order counts only)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailer-analytics.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-01] — Needs analytics materialized view and retailer_members for role checks
- **Blocked by:** [EPIC-05/STORY-01] — Needs orders data
- **Blocks:** [EPIC-09/STORY-08] — Analytics UI needs these DAL functions

#### Testing Requirements

- [ ] **Unit:** Analytics queries return correct aggregations with test data
- [ ] **Unit:** Staff role filtering correctly nulls financial fields
- [ ] **Integration:** Materialized view refreshes correctly and returns current data

#### Implementation Notes

**DAL functions:**
- `getTopWinesByOrders(client, retailerId, days = 30, limit = 10)` — from materialized view or direct query with fallback
- `getOrderSummaryByWeek(client, retailerId, weeks = 4)` — weekly breakdown of orders, revenue, commission, net payout
- `getTopWinesByViews(client, retailerId, days = 30, limit = 10)` — requires wine page view tracking (may need a `wine_page_views` or similar analytics table; if not available from Epic 02, use placeholder with TODO)
- `getRetailerDashboardStats(client, retailerId)` — quick stats for the dashboard header: pending orders count, total orders today, revenue today

**Role-based data masking:** Financial fields (revenue, commission, payout) are only returned if the calling user has `owner` role in `retailer_members`. Staff users get `null` for these fields. This check happens in the DAL function, not at the RLS level (RLS controls row access; role masking controls column visibility).

**Materialized view refresh:** Schedule `REFRESH MATERIALIZED VIEW CONCURRENTLY retailer_order_analytics` via pg_cron every 15 minutes. The `CONCURRENTLY` keyword allows reads during refresh. The DAL should handle the case where the MV is empty (first-time load) by falling back to a direct query.

---

### [EPIC-09/STORY-05] — Retailer Settings DAL & Server Actions

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a retailer owner, I want to update my store information, fulfillment options, and notification preferences so that my Cru presence accurately reflects my business.

#### Acceptance Criteria

```gherkin
Given a retailer owner updates delivery_radius from 5 to 10 miles
When the update saves
Then users within the expanded radius begin seeing this retailer's wines

Given a retailer disables delivery
When the setting saves
Then only "Pickup" appears as a fulfillment option for this retailer's wines

Given a retailer staff member tries to update store settings
When the role check runs
Then it returns { error: 'Owner access required' }

Given a retailer member updates their notification preferences
When they toggle new_order_email to false
Then they no longer receive new order notification emails
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/retailer-settings.ts` | Create |
| Action | `lib/actions/retailer-settings.ts` | Create |
| Validation | `lib/validations/retailer-settings.ts` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-01] — Needs retailer fulfillment columns and notification_preferences table
- **Blocks:** [EPIC-09/STORY-09] — Settings UI needs these DAL functions

#### Testing Requirements

- [ ] **Unit:** Zod validation for settings schemas (delivery_radius must be positive, hours format validation)
- [ ] **Integration:** updateRetailerSettings() correctly updates fulfillment columns on retailers table
- [ ] **Integration:** updateNotificationPreferences() correctly updates per-member preferences
- [ ] **RLS:** Only owner role can update store settings; any member can update their own notification preferences

#### Implementation Notes

**DAL functions:**
- `getRetailerSettings(client, retailerId)` — returns store info, fulfillment config, POS connection status
- `getNotificationPreferences(client, retailerMemberId)` — returns per-member notification settings
- `getPosConnectionStatus(client, retailerId)` — returns connection status, last sync, errors from `retailer_pos_connections`

**Server Actions:**
- `updateRetailerSettings(retailerId, data)` — Zod validate → auth → owner role check → DAL update → revalidatePath. Covers: store name, address, phone, email, hours, fulfillment settings.
- `updateNotificationPreferences(retailerMemberId, data)` — Zod validate → auth → member check (own prefs only) → DAL update → revalidatePath
- `reconnectPos(retailerId)` — initiates POS reconnection flow (redirect to OAuth for API-based, or prompt for new CSV)

**Hours of operation** stored as JSONB: `{ "mon": "10:00-20:00", "tue": "10:00-20:00", ... }`. Validate format in Zod schema.

---

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

---

### [EPIC-09/STORY-07] — Inventory Health Monitor UI

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer, I want to see the health of my inventory sync and quickly update stock status for individual wines so that my Cru listings are always accurate.

#### Acceptance Criteria

```gherkin
Given a retailer's POS sync ran successfully 4 hours ago
When they view the inventory tab
Then the sync card shows "Last synced: 4 hours ago via Lightspeed — Next sync: in 20 minutes"

Given a retailer's sync has failed
When they view the inventory tab
Then a red error banner shows with error details and action buttons (Retry / Contact Support)

Given a retailer searches for "Bandol Rosé" in the quick stock update
When matches appear
Then they can toggle stock status (in stock ↔ low stock ↔ out of stock) inline

Given a retailer toggles a wine to out_of_stock
When the update saves
Then a success toast appears and the wine is immediately unavailable on Cru for that retailer
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/retailer/inventory/page.tsx` | Create |
| Component | `components/features/retailer/SyncStatusCard.tsx` | Create |
| Component | `components/features/retailer/SyncErrorBanner.tsx` | Create |
| Component | `components/features/retailer/InventorySummary.tsx` | Create |
| Component | `components/features/retailer/QuickStockSearch.tsx` | Create |
| Component | `components/features/retailer/StockStatusToggle.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-03] — Needs inventory DAL and Server Actions
- **Blocked by:** [EPIC-09/STORY-11] — UX design for inventory health states

#### Testing Requirements

- [ ] **Unit:** SyncStatusCard renders correct relative time and source label
- [ ] **Unit:** SyncErrorBanner renders appropriate action buttons based on sync source type
- [ ] **Integration:** Stock toggle → Server Action → toast confirmation → availability update
- [ ] **Accessibility:** Error banner has `role="alert"`, stock toggles have descriptive labels

#### Implementation Notes

**Sync status card:** Server Component reading from `retailer_pos_connections`. Shows:
- Sync source icon (CSV, Lightspeed, Square, etc.)
- Last sync timestamp (relative: "4 hours ago")
- Next scheduled sync (if API-based)
- Connection health indicator (green checkmark / yellow warning / red error)

**Error banner:** Shows only when last sync failed. Content varies by sync source:
- CSV: "Your last CSV upload failed. [Re-upload CSV]"
- API (Lightspeed/Square): "Connection issue with [source]. [Reconnect] or [Contact Support]"
- 48+ hours since last sync: escalated messaging with prominent styling

**Inventory summary:** Stats cards showing total listed / in stock / low stock / out of stock. These are aggregate counts from `getInventorySummary()`.

**Quick stock search:** `'use client'` component with debounced search input. Results appear as a list with inline `StockStatusToggle` (three-state: in_stock → low_stock → out_of_stock → in_stock). Toggle calls Server Action with optimistic UI.

---

### [EPIC-09/STORY-08] — Basic Analytics UI

**Type:** frontend
**Story Points:** 3
**Assigned Agent:** fullstack-4
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer owner, I want to see which of my wines are performing best and understand my revenue trends so that I can make better business decisions about my Cru presence.

#### Acceptance Criteria

```gherkin
Given a retailer owner views analytics
When the page loads
Then they see top 10 wines by order volume, top 10 by views, and weekly order/revenue summary

Given a retailer has fulfilled 25 orders in the last 30 days
When they view the order summary
Then it shows 25 total orders with correct gross revenue, commission, and net payout

Given a retailer staff member views analytics
When revenue data would normally appear
Then financial fields show "Owner access required" placeholder instead of dollar amounts

Given a retailer has no orders yet
When they view analytics
Then a friendly empty state appears: "Your analytics will appear here once you start receiving orders on Cru"
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/retailer/analytics/page.tsx` | Create |
| Component | `components/features/retailer/TopWinesList.tsx` | Create |
| Component | `components/features/retailer/OrderSummaryTable.tsx` | Create |
| Component | `components/features/retailer/RevenueCards.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-04] — Needs analytics DAL functions
- **Blocked by:** [EPIC-09/STORY-11] — UX design for analytics layout and empty states

#### Testing Requirements

- [ ] **Unit:** OrderSummaryTable renders weekly rows with correct formatting (currency, counts)
- [ ] **Unit:** Staff role correctly masks financial data
- [ ] **Accessibility:** Data tables have proper table semantics and scope attributes

#### Implementation Notes

**Page layout:** Server Component. Three sections:
1. **Revenue cards** (top) — This week: orders, gross revenue, commission, net payout. Each card shows a small trend indicator vs. prior week (up/down/flat arrow + percentage).
2. **Top wines lists** (middle) — Two side-by-side lists: "Top by Orders" and "Top by Views." Each shows rank, wine name, producer, count. Simple ordered list, no charts in V1.
3. **Weekly summary table** (bottom) — Last 4 weeks. Columns: week label, orders, gross revenue, commission, net payout. Simple Shadcn/ui Table component.

**Role masking in UI:** Check retailer member role. If `staff`, render revenue/commission/payout cells as "—" with tooltip "Owner access required."

**Empty states:** Use marketing-writer copy (from STORY-11). Each section has its own empty state messaging.

---

### [EPIC-09/STORY-09] — Retailer Settings Pages

**Type:** frontend
**Story Points:** 5
**Assigned Agent:** fullstack-2
**Phase:** Checkpoint 4: Frontend

#### User Story

As a retailer owner, I want to manage my store information, fulfillment options, and notification preferences so that my Cru presence is always up to date.

#### Acceptance Criteria

```gherkin
Given a retailer owner views Settings
When the page loads
Then they see sections for Store Information, Fulfillment, POS Connection, and Notifications

Given a retailer updates delivery radius from 5 to 10 miles
When they save the form
Then a success toast appears and the new radius takes effect

Given a retailer disables delivery
When they toggle delivery to off
Then the delivery radius and fee fields are disabled/hidden

Given a retailer's POS connection shows "Disconnected"
When they click "Reconnect"
Then they are redirected to the POS OAuth flow (or prompted for CSV re-upload)

Given a retailer staff member views Settings
When the page loads
Then they see only the Notifications section (store settings are owner-only)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Page | `app/(app)/[orgSlug]/retailer/settings/page.tsx` | Create |
| Component | `components/features/retailer/StoreInfoForm.tsx` | Create |
| Component | `components/features/retailer/FulfillmentSettingsForm.tsx` | Create |
| Component | `components/features/retailer/PosConnectionStatus.tsx` | Create |
| Component | `components/features/retailer/NotificationPreferencesForm.tsx` | Create |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-05] — Needs settings DAL and Server Actions
- **Blocked by:** [EPIC-09/STORY-11] — UX design for settings forms

#### Testing Requirements

- [ ] **Unit:** Form validation matches Zod schemas (delivery radius positive, hours format)
- [ ] **Integration:** Save store info form → Server Action → success toast → data persisted
- [ ] **Integration:** Toggle delivery off → delivery-specific fields disabled
- [ ] **Accessibility:** All form fields have labels, error states are announced to screen readers

#### Implementation Notes

**Settings page layout:** Tabbed or sectioned layout with clear groupings:
1. **Store Information** — Name, address, phone, email, hours of operation. Hours input as a structured form (day → open time → close time) that serializes to JSONB.
2. **Fulfillment** — Toggle: pickup (on/off), delivery (on/off). When delivery is on: radius (miles), fee ($), estimated time (minutes). Conditional rendering: delivery fields only show when delivery is enabled.
3. **POS Connection** — Read-only status card showing: connection type, last sync, status (connected/disconnected/error). Action button: "Reconnect" (disconnected) or "Disconnect" (connected). This delegates to the POS connection flow from Epic 06.
4. **Notifications** — Toggles: new order email alerts (on/off), daily summary email (on/off). Available to all retailer members (owner + staff).

**Role-based visibility:** Wrap owner-only sections in a role check. Staff members see only the Notifications section. If a staff member navigates directly to a settings URL, show a "You need owner access" message for restricted sections.

**Form state:** Use React Hook Form + Zod resolver for validation. Forms are `'use client'` components with `useTransition` for the save action. Show dirty state indicator ("Unsaved changes") and confirmation on navigation away.

---

### [EPIC-09/STORY-10] — Customer Email Notifications for Order Status Changes

**Type:** fullstack
**Story Points:** 3
**Assigned Agent:** fullstack-3
**Phase:** Checkpoint 4: Frontend

#### User Story

As a customer, I want to receive email notifications when my order status changes so that I know when my wine is being prepared and when it's ready for pickup or delivery.

#### Acceptance Criteria

```gherkin
Given a retailer confirms an order
When the status changes to 'confirmed'
Then the customer receives an email: "Your order is confirmed — [Retailer Name] is preparing your wine"

Given a retailer marks an order as ready_for_pickup
When the status changes
Then the customer receives an email: "Your wine is ready for pickup at [Retailer Name]"

Given a retailer cancels an order
When the status changes to 'cancelled'
Then the customer receives an email with the cancellation reason and next steps

Given the email service is temporarily unavailable
When a status change triggers a notification
Then the status change still succeeds and the email is queued for retry
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Integration | `lib/integrations/email.ts` | Create |
| Integration | `lib/integrations/email-templates/order-confirmed.tsx` | Create |
| Integration | `lib/integrations/email-templates/order-ready.tsx` | Create |
| Integration | `lib/integrations/email-templates/order-cancelled.tsx` | Create |
| Action | `lib/actions/retailer-orders.ts` | Modify (add notification trigger) |

#### Dependencies

- **Blocked by:** [EPIC-09/STORY-02] — Email notifications are triggered by order status change actions
- **Blocks:** Nothing

#### Testing Requirements

- [ ] **Unit:** Email template renders correct content for each status change
- [ ] **Integration:** Status change Server Action triggers email send (mock email service in tests)
- [ ] **Integration:** Email send failure does not block status change

#### Implementation Notes

**Email service:** Use Resend (`@resend/node`) for transactional emails. Simple setup:
```typescript
import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)
```

**Email templates:** Use React Email (`@react-email/components`) for type-safe, previewable email templates. Each template is a React component that renders to HTML.

**Template content (to be finalized by marketing-writer in STORY-11):**
- **Order Confirmed:** Subject: "Your Cru order is confirmed." Body: wine names, retailer name, estimated time.
- **Ready for Pickup:** Subject: "Your wine is ready for pickup." Body: retailer name, address, hours.
- **Out for Delivery:** Subject: "Your wine is on its way." Body: estimated delivery time.
- **Completed:** Subject: "Order complete — enjoy your wine!" Body: summary, link to rate experience (future).
- **Cancelled:** Subject: "Your order has been cancelled." Body: reason, next steps, link to re-browse.

**Error handling:** Wrap email send in try/catch. If send fails, log the error and continue (don't throw). Consider a simple retry queue (e.g., Supabase Edge Function triggered by a database insert) for failed sends — but for V1, logging the failure and alerting ops is sufficient.

**Async trigger:** The order status Server Actions call a `sendOrderStatusEmail(order, newStatus)` helper after the DAL update succeeds. This helper is non-blocking (fire-and-forget with error logging).

---

### [EPIC-09/STORY-11] — UX Design, Retailer Copy & Onboarding

**Type:** design
**Story Points:** 3
**Assigned Agent:** ux-designer + marketing-writer
**Phase:** Checkpoint 3: Backend (design runs parallel to backend)

#### User Story

As a retailer using the dashboard for the first time, I want clear navigation, helpful empty states, and professional copy so that I feel confident managing my Cru presence.

#### Acceptance Criteria

```gherkin
Given a new retailer logs in for the first time
When the dashboard loads
Then they see a brief onboarding guide highlighting key areas (orders, inventory, analytics, settings)

Given a retailer has no pending orders
When they view the order queue
Then a friendly empty state says "No orders yet — your wines are live on Cru. Orders will appear here as they come in."

Given a retailer's POS sync has failed
When the error banner appears
Then the copy is clear, non-technical, and includes specific next steps

Given a retailer reads an order status email
When they see the email content
Then the tone is professional, warm, and branded (consistent with Cru's voice)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Component | UX specs for all retailer dashboard components | Create |
| Component | Copy document for all retailer-facing text | Create |
| Component | Email template copy for order status notifications | Create |

#### Dependencies

- **Blocked by:** Nothing — design and copy work can begin as soon as the PRD is understood
- **Blocks:** [EPIC-09/STORY-06] through [EPIC-09/STORY-10] — Frontend stories consume UX specs and copy

#### Testing Requirements

- [ ] **Accessibility:** All UX designs pass contrast ratio checks and include focus state specifications
- [ ] **Accessibility:** Interaction patterns are keyboard-navigable

#### Implementation Notes

**UX deliverables:**
- Dashboard layout wireframe: order queue dominant (70% viewport on desktop), analytics/inventory/settings as tabs
- Order queue interaction patterns: row click → detail, inline action buttons, SLA badge placement
- Inventory health monitor: sync status card design, error banner hierarchy, quick stock search UX
- Analytics page: cards + lists layout, empty state designs
- Settings forms: section grouping, conditional field visibility, save/discard patterns
- Mobile responsive breakpoints: single-column layout for tablet/phone (retailers may check on mobile)

**Copy deliverables:**
- All empty state messages (orders, analytics, inventory)
- Error banner copy for sync failures (CSV vs API, with specific remediation steps)
- SLA warning/critical badge tooltip text
- Settings section headers and help text
- Onboarding walkthrough step text (3-4 steps: "Here's your order queue," "Monitor your inventory," "Check your analytics," "Update your settings")
- Email template copy for all order status change notifications (confirmed, ready, out for delivery, completed, cancelled)
- Dashboard header welcome message: "Welcome back, [Name]. Here's what's happening at [Store Name]."

**Brand voice:** The retailer dashboard tone is **partner-to-partner** — professional, efficient, respectful of the retailer's time. Not cutesy. Not corporate. Direct and helpful. The retailer is a business partner, not a consumer being delighted.

---

## Epic Summary

| Story | Title | Points | Agent | Phase |
|-------|-------|--------|-------|-------|
| STORY-01 | Database Schema & RLS | 5 | sr-backend | Backend |
| STORY-02 | Order Management DAL & Actions | 5 | sr-backend | Backend |
| STORY-03 | Inventory Management DAL & Actions | 3 | sr-backend | Backend |
| STORY-04 | Analytics DAL Functions | 3 | sr-backend | Backend |
| STORY-05 | Settings DAL & Actions | 2 | sr-backend | Backend |
| STORY-06 | Dashboard Layout & Order Queue UI | 8 | fullstack-1 | Frontend |
| STORY-07 | Inventory Health Monitor UI | 5 | fullstack-4 | Frontend |
| STORY-08 | Analytics UI | 3 | fullstack-4 | Frontend |
| STORY-09 | Settings Pages | 5 | fullstack-2 | Frontend |
| STORY-10 | Email Notifications | 3 | fullstack-3 | Frontend |
| STORY-11 | UX Design & Copy | 3 | ux-designer + marketing-writer | Backend (parallel) |
| **Total** | | **45** | | |
