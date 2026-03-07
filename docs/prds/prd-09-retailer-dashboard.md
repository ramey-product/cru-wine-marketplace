# PRD: Retailer Dashboard

**Feature:** Retailer Dashboard
**Priority:** P0 — Launch Critical (RICE: 27 — strategically mandatory)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Cru's marketplace model depends entirely on retail partners. Without retailers, there's no inventory, no fulfillment, and no revenue. The 20 LA launch retailers are doing Cru a favor by onboarding — they're taking a bet on a new platform, uploading inventory, and agreeing to fulfill orders from an unproven channel. If their experience managing orders and inventory on Cru is painful, confusing, or invisible, they'll churn. And retailer churn at launch is existential.

The Retailer Dashboard is a low-RICE-score feature by the formula (small reach — only 20 users, though high impact and confidence), but it's strategically mandatory. Every retailer needs a place to see incoming orders, update order status, monitor their inventory sync health, and understand what's working. Without it, the operations team has to relay every order via email or phone — a process that breaks at 5 orders/day and collapses at 50.

This dashboard doesn't need to be beautiful at V1. It needs to be functional, reliable, and fast. Retailers are busy — they're running a shop, not staring at a dashboard. Every interaction should take under 10 seconds.

## 2. Goals

**User Goals (Retailer):**
- See new incoming orders immediately and act on them (confirm, prepare, mark ready) without logging into a separate system
- Know the health of their inventory sync — is their data current, or did something break?
- Understand which of their wines are getting the most traction on Cru so they can stock accordingly
- Feel that Cru is a partner, not a burden — the dashboard should reduce their workload, not add to it

**Business Goals:**
- Enable 20 retailers to self-serve order management without Cru operations team intervention
- Achieve < 30-minute average order confirmation time (retailer sees order → confirms it)
- Reduce retailer support requests to < 2 per retailer per week by Month 2
- Collect retailer satisfaction data (NPS > 40) to validate the partner model

## 3. Non-Goals

- **Full e-commerce back office** — Retailers have their own POS systems for managing their business. The Cru dashboard manages only Cru-specific activity (orders, inventory sync, Cru analytics).
- **Financial reporting or payout management** — Commission tracking and payout details are Phase 2. V1 retailers get paid via manual process (ACH/check) coordinated by ops.
- **Customer communication tools** — Retailers don't message customers through Cru at launch. Customer issues route through Cru support.
- **Multi-location management** — V1 assumes one dashboard per store location. Multi-store retailers are a growth-phase consideration.
- **Mobile-optimized retailer app** — V1 is a responsive web dashboard. Native mobile for retailers is P2.

## 4. User Stories

### Retailer Owner/Manager (Primary)
- As a retailer, I want to see a list of new orders that need my attention as soon as I log in so that I can act on them quickly.
- As a retailer, I want to confirm an order with one click so that the customer is notified that their wine is being prepared.
- As a retailer, I want to mark an order as "Ready for Pickup" or "Out for Delivery" so that the customer knows when to expect their wine.
- As a retailer, I want to cancel an order with a reason (out of stock, unable to fulfill) so that the customer and Cru are informed.
- As a retailer, I want to see the status of my inventory sync (last sync time, any errors) so that I know my Cru listings are accurate.
- As a retailer, I want to manually mark a wine as out of stock if my POS sync hasn't caught up so that customers aren't disappointed.

### Retailer Staff (Secondary)
- As a retail staff member, I want to view and manage orders without accessing the owner's full settings so that multiple people can process orders.
- As a retail staff member, I want to print or view an order summary for the pick/pack team so that I can pull the correct wines from the shelf.

### Cru Operations (Internal)
- As a Cru ops team member, I want to see a system-wide view of all retailer order queues so that I can identify bottlenecks and intervene if a retailer isn't responding.
- As a Cru ops team member, I want to be alerted if a retailer hasn't confirmed an order within 2 hours so that I can follow up manually.

### Edge Cases
- As a retailer who receives an order for a wine that's actually out of stock (sync lag), I want to cancel that item and suggest an alternative or cancel the full order with a clear reason.
- As a retailer whose POS sync has been failing for 48+ hours, I want a prominent alert on my dashboard explaining what happened and how to fix it.
- As a retailer logging in for the first time, I want a brief onboarding walkthrough of the dashboard so that I know where things are.

## 5. Requirements

### Must-Have (P0)

**Order Management**
- Order queue: list of orders sorted by newest first, filterable by status (pending, confirmed, ready, completed, cancelled)
- Order detail view: customer name (first name + last initial only), wines ordered (name, vintage, quantity), fulfillment type (pickup or delivery), delivery address (if applicable), order total, Cru commission amount, net payout amount
- Order actions: Confirm (pending → confirmed), Mark Ready for Pickup (confirmed → ready_for_pickup), Mark Out for Delivery (confirmed → out_for_delivery), Mark Completed (ready → completed), Cancel with reason (any active status → cancelled)
- Each status change triggers a customer notification (email) and updates the order record
- Order confirmation SLA indicator: orders pending > 1 hour show a yellow warning; > 2 hours show a red alert
- Acceptance criteria:
  - Given a retailer logs in and has 3 pending orders, when the dashboard loads, then all 3 orders appear in the queue with "Confirm" as the primary action
  - Given a retailer confirms an order, when they click "Confirm," then the status updates to "confirmed," the customer receives an email, and the order moves down the queue
  - Given an order has been pending for 90 minutes, when the retailer views the queue, then the order shows a yellow SLA warning badge

**Inventory Health Monitor**
- Sync status card: last successful sync timestamp, sync source (CSV, Lightspeed, Square), next scheduled sync
- Error alerts: if the last sync failed, show a red banner with the error type and a "Retry Sync" button (for manual CSV re-upload) or "Contact Support" (for POS API issues)
- Inventory summary: total wines listed, total in stock, total out of stock, total low stock
- Quick stock update: search for a wine by name, toggle stock status (in stock → low stock → out of stock) without waiting for the next POS sync
- Acceptance criteria:
  - Given a retailer's Lightspeed sync ran successfully 4 hours ago, when they view the inventory card, then it shows "Last synced: 4 hours ago via Lightspeed — Next sync: in 20 minutes"
  - Given a retailer's sync failed, when they view the dashboard, then a red banner says "Inventory sync failed [timestamp]. Your listings show the last known data. [Retry] or [Contact Support]"
  - Given a retailer searches for a wine and toggles it to "Out of Stock," when the update saves, then that wine immediately shows as unavailable on Cru for that retailer

**Basic Analytics**
- Top wines: list of the retailer's top 10 wines by Cru order volume (last 30 days)
- Order summary: total orders, total revenue (gross), total Cru commission, net payout — for current week + last 4 weeks
- Views: how many times each of the retailer's wines was viewed on Cru (top 10 by views)
- Acceptance criteria:
  - Given a retailer has fulfilled 25 orders in the last 30 days, when they view analytics, then the order summary shows 25 orders with correct revenue and commission totals
  - Given a retailer's "Domaine Tempier Bandol Rosé" was viewed 150 times this month, when they view the "Top Viewed" list, then it appears with "150 views"

**Retailer Settings**
- Store information: name, address, phone, email, hours of operation
- Fulfillment settings: pickup enabled (yes/no), delivery enabled (yes/no), delivery radius, delivery fee, estimated delivery time
- POS connection status: connected/disconnected for Lightspeed or Square, with "Reconnect" option
- Notification preferences: email alerts for new orders (on/off), daily summary email (on/off)
- Acceptance criteria:
  - Given a retailer updates their delivery radius from 5 miles to 10 miles, when the setting saves, then users within the expanded radius begin seeing this retailer's inventory
  - Given a retailer disables delivery, when a user views wines from this retailer, then only "Pickup" appears as a fulfillment option

**Technical Requirements**
- Retailer dashboard lives at `app/(app)/[orgSlug]/retailer/` — separate layout from consumer-facing pages
- Retailer auth: retailers are users with a `retailer` role in the org membership, authenticated via the same Supabase Auth as consumers
- `retailer_members` table (or role in existing membership model): retailer_id, user_id, role (owner, staff), org_id
- RLS: retailers can only see their own orders, inventory, and analytics — never another retailer's data
- Order status updates via Server Actions in `lib/actions/retailer-orders.ts` — Zod validate → auth check → role check (retailer role) → DAL call → trigger customer notification → revalidatePath
- DAL functions in `lib/dal/retailer-dashboard.ts`
- Email notifications for order status changes via a transactional email service (Resend, Postmark, or Supabase Edge Functions)
- Dashboard data queries should be optimized with materialized views or indexed aggregations for analytics (not real-time full-table scans)

### Nice-to-Have (P1)

- Real-time order notifications: push notification or browser notification when a new order arrives
- Order printout: generate a PDF or printable HTML summary for pick/pack
- Detailed analytics: conversion funnel (views → cart → order) per wine, comparison to platform averages
- Commission and payout reports: detailed transaction history with downloadable CSV
- Multi-user access management: retailer owner invites staff, manages permissions

### Future Considerations (P2)

- Retailer mobile app (React Native) for on-the-go order management
- Automated payout via Stripe Connect
- Inventory recommendations: "Wine X is trending on Cru — consider restocking"
- Multi-location dashboard for retailers with several stores
- API for retailers to integrate Cru orders into their own systems

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Retailer dashboard adoption | 100% of onboarded retailers log in within first week | — | Login event tracking |
| Order confirmation time | < 30 minutes average (order placed → retailer confirms) | < 15 minutes | Order status timestamps |
| Daily active retailer rate | 80% of retailers log in daily during Week 1-2 | 90% | Session analytics |
| Quick stock updates | < 5% of inventory changes require support intervention | < 2% | Support ticket tracking |
| Dashboard load time | < 2 seconds for order queue page | < 1.5 seconds | Performance monitoring |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Retailer NPS | > 40 | > 50 | Retailer survey (monthly) |
| Retailer support tickets | < 2 per retailer per week | < 1 | Support system tracking |
| Retailer churn | < 10% of onboarded retailers churn in 3 months | < 5% | Retailer status tracking |
| Order fulfillment rate | 95% of orders fulfilled without retailer-side cancellation | 98% | Order status data |
| Time from order to fulfillment | < 2 hours average for pickup orders | < 1 hour | Order lifecycle timestamps |

## 7. Open Questions

- **[Operations — blocking]** What's the onboarding flow for retailer users? Do they receive a Cru-generated invite, or does the ops team create their accounts? Need to define the retailer signup experience.
- **[Engineering — blocking]** Retailer auth model: separate user type with role-based access, or a flag on existing user accounts? Proposed: same user model, `retailer` role in org membership with retailer_id linkage.
- **[Product — non-blocking]** Should retailers see customer names on orders? Privacy considerations — proposed: first name + last initial only, no email or phone displayed (Cru handles customer communication).
- **[Design — non-blocking]** Dashboard layout priority: should the order queue dominate (retailers are here to process orders) or should analytics be equally prominent? Proposed: order queue is 70% of the viewport; analytics and inventory are secondary tabs.
- **[Legal — non-blocking]** Do we need a formal retailer agreement / terms of service before they access the dashboard? What are the minimum contractual requirements?

## 8. Timeline Considerations

- **Build order: #9** — Last in the build sequence, but design and data model can start in Week 6.
- **Weeks 8-10 of pre-launch sprint** (Track B)
- **Hard dependency:** Local Retailer Integration (#6) for inventory data and retailer records. Order Placement (#5) for order data flowing into the dashboard.
- **Parallel coordination:** Retailer onboarding (operations task) should provide feedback on dashboard requirements by Week 7. First retailers should beta-test the dashboard in Week 9.
- **Downstream dependents:** Retailer Analytics (P1) extends the basic analytics here. Automated Payouts (P2) builds on the commission tracking.
- **Risk mitigation:** If the dashboard isn't ready by launch, the operations team can relay orders to retailers via email + phone as a manual fallback. This is unsustainable past Week 2 of launch but buys time for a 1-2 week slip.
