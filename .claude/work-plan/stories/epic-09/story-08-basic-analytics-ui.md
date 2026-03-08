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
