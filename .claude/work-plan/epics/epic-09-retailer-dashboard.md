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

> Individual story files are located in `.claude/work-plan/stories/epic-09/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-09/story-01-retailer-dashboard-database-schema-rls.md) | Retailer Dashboard Database Schema & RLS Policies | backend | 5 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-09/story-02-retailer-order-management-dal-server-actions.md) | Retailer Order Management DAL & Server Actions | backend | 5 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-09/story-03-inventory-management-dal-server-actions.md) | Inventory Management DAL & Server Actions | backend | 3 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-09/story-04-analytics-dal-functions.md) | Analytics DAL Functions | backend | 3 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-09/story-05-retailer-settings-dal-server-actions.md) | Retailer Settings DAL & Server Actions | backend | 2 | sr-backend | CP3 | pending |
| [STORY-06](../stories/epic-09/story-06-dashboard-layout-order-queue-ui.md) | Dashboard Layout & Order Queue UI | frontend | 8 | fullstack-1 | CP4 | pending |
| [STORY-07](../stories/epic-09/story-07-inventory-health-monitor-ui.md) | Inventory Health Monitor UI | frontend | 5 | fullstack-4 | CP4 | pending |
| [STORY-08](../stories/epic-09/story-08-basic-analytics-ui.md) | Basic Analytics UI | frontend | 3 | fullstack-4 | CP4 | pending |
| [STORY-09](../stories/epic-09/story-09-retailer-settings-pages.md) | Retailer Settings Pages | frontend | 5 | fullstack-2 | CP4 | pending |
| [STORY-10](../stories/epic-09/story-10-customer-email-notifications.md) | Customer Email Notifications for Order Status Changes | fullstack | 3 | fullstack-3 | CP4 | pending |
| [STORY-11](../stories/epic-09/story-11-ux-design-retailer-copy-onboarding.md) | UX Design, Retailer Copy & Onboarding | design | 3 | ux-designer | CP4 | pending |

**Total: 11 stories, 45 story points**
