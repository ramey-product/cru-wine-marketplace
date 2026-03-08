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
