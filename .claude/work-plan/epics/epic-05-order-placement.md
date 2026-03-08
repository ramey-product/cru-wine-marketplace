# Epic: [EPIC-05] — Order Placement

**Source PRD:** `docs/prds/prd-05-order-placement.md`
**Priority:** P0 — Launch Critical
**RICE Score:** 5,400
**Epic Owner:** pm-orchestrator
**Primary Agents:** sr-backend, fullstack-1, fullstack-3, fullstack-4, ux-designer, marketing-writer

## Epic Summary

Order Placement is the revenue engine of Cru — it converts wine discovery into actual purchase. This epic delivers the complete purchase flow: retailer selection (showing nearby stores with price, stock status, and fulfillment options), retailer-scoped cart management (via Medusa.js v2), checkout with age verification, Stripe payment processing, order lifecycle management (pending → confirmed → ready/out-for-delivery → completed), inventory holds to prevent overselling, order status notifications, and order history. Without this epic, Cru generates zero revenue.

## Success Criteria

- [ ] User can go from "Buy" tap on a wine to payment completion in under 2 minutes
- [ ] Cart is scoped to a single retailer (multi-retailer cart is P2)
- [ ] Stripe Checkout handles payment with idempotent webhook processing
- [ ] Order statuses transition correctly: pending → confirmed → ready_for_pickup / out_for_delivery → completed / cancelled
- [ ] Users can view full order history with status, date, wines, retailer, and total
- [ ] Retailers receive order notification immediately upon successful payment
- [ ] Inventory hold (10 min) prevents overselling during checkout
- [ ] Age verification (21+) enforced before payment
- [ ] All order tables have RLS with dual-access pattern (consumer by user_id, retailer by org_id)

## Architecture Dependencies

- **Database tables:** `orders`, `order_items`, `order_status_history` (org-scoped to retailer org, with dual-access RLS for consumer + retailer)
- **Medusa.js v2:** Cart management, order lifecycle, inventory holds. Medusa Cart → Medusa Order on payment success. Cart scoped to a single retailer's store.
- **Stripe:** Checkout Sessions for payment, webhooks for payment confirmation (checkout.session.completed) and refunds (charge.refunded)
- **Hard dependency on EPIC-06 (Retailer Integration):** Needs `retailer_inventory` table, retailer pricing, and POS sync for real-time stock/price data. Retailer org and location data needed for the retailer selection sheet.
- **Depends on:** EPIC-01 `profiles` table (user auth, delivery address); `organizations` table for retailer orgs; EPIC-04 `wines` table (wine references in order items)
- **Downstream:** Push Notifications (P1) builds on order status events; Secondary Marketplace (P1) reuses order/payment infrastructure; EPIC-03 Taste Profile updates from purchase history
- **Shared components:** Wine card (shared with EPIC-02 Search & Browse), retailer card (shared with EPIC-06)

## Cross-Cutting Concerns

- **CG-2 Table Categorization — Dual-Access Pattern:** Orders are org-scoped to the retailer but also accessible by the consumer. RLS needs two SELECT paths: (1) consumer reads own orders via `user_id = auth.uid()`, (2) retailer org members read their org's orders via standard org_id membership subquery. Write access for retailers (status updates) requires org membership. Platform admins can read all orders.
- **CG-1 Medusa Sync — Bidirectional for Orders:** Unlike wine content (Supabase → Medusa one-way), orders involve bidirectional flow: cart operations go through Medusa API, but order records are persisted to Supabase on payment confirmation. `medusa_cart_id` and `medusa_order_id` stored on the Supabase `orders` row for cross-reference.
- **Stripe Webhook Security:** Webhook handler at `app/api/webhooks/stripe/route.ts` MUST verify Stripe signature before processing. Uses `supabaseAdmin` (service role) since there's no user session in webhook context. Must handle duplicate deliveries (idempotent by `stripe_payment_intent_id`).
- **Inventory Hold Coordination:** When checkout begins, a 10-minute inventory hold must be placed. This could be Medusa-level (Medusa cart reserves stock) or application-level (hold record in Supabase). Must coordinate with EPIC-06 retailer inventory sync to avoid phantom stock.
- **Email Notifications:** Order confirmation emails to consumer, order notification emails to retailer. Transactional email service needed (Resend, SendGrid, or Supabase Edge Function + SMTP). Shares email infrastructure with EPIC-01 (auth emails) and future notification features.

## Technical Risks & Open Questions

- [ ] **Medusa cart model fit:** Does Medusa.js v2's cart model support retailer-scoped carts out of the box, or do we need a custom layer? The Medusa `SalesChannel` concept may map to retailers, but needs validation.
- [ ] **Inventory hold implementation:** Medusa-level stock reservation vs. Supabase-level hold record? Medusa's inventory module has stock reservation capabilities, but they may not integrate with external POS inventory (EPIC-06).
- [ ] **California delivery compliance:** Legal review needed — does Cru need a license for marketplace-facilitated delivery, or does the retailer's license cover it? This is a blocker for enabling the delivery fulfillment option.
- [ ] **Stripe Checkout mode:** Hosted Checkout (redirect to Stripe) vs. Embedded Checkout (Stripe Elements in-app)? Hosted is simpler and handles PCI compliance, but embedded provides a better UX. Recommend hosted for V1.
- [ ] **Race condition on payment:** If Stripe webhook arrives before the client redirect callback, the order must still be created correctly. Need to handle both webhook-first and redirect-first flows.
- [ ] **Delivery fee calculation:** How are delivery fees determined? Flat fee per retailer? Distance-based? Retailer-set? This affects the checkout summary UI and order total calculation.
- [ ] **Tax calculation:** Stripe Tax, a third-party tax API (TaxJar, Avalara), or retailer-provided tax rate? V1 LA-only simplifies this (single jurisdiction), but needs a path to multi-state.

---

## Developer Stories

> Individual story files are located in `.claude/work-plan/stories/epic-05/`.

| Story | Title | Type | Points | Agent | Phase | Status |
|-------|-------|------|--------|-------|-------|--------|
| [STORY-01](../stories/epic-05/story-01-create-orders-tables-rls.md) | Create orders, order_items, and order_status_history tables with RLS | backend | 8 | sr-backend | CP3 | pending |
| [STORY-02](../stories/epic-05/story-02-dal-functions-cart-orders.md) | DAL functions for cart and orders | backend | 5 | sr-backend | CP3 | pending |
| [STORY-03](../stories/epic-05/story-03-cart-management-server-actions.md) | Cart management Server Actions | backend | 5 | sr-backend | CP3 | pending |
| [STORY-04](../stories/epic-05/story-04-order-placement-lifecycle-actions.md) | Order placement and lifecycle Server Actions | backend | 8 | sr-backend | CP3 | pending |
| [STORY-05](../stories/epic-05/story-05-stripe-webhook-order-finalization.md) | Stripe webhook handler and order finalization | fullstack | 8 | fullstack-3 | CP4 | pending |
| [STORY-06](../stories/epic-05/story-06-inventory-hold-mechanism.md) | Inventory hold mechanism | backend | 3 | sr-backend | CP3 | pending |
| [STORY-07](../stories/epic-05/story-07-retailer-selection-cart-ui.md) | Retailer selection and cart UI | frontend | 8 | fullstack-1 | CP4 | pending |
| [STORY-08](../stories/epic-05/story-08-checkout-flow-order-confirmation-ui.md) | Checkout flow and order confirmation UI | frontend | 8 | fullstack-4 | CP4 | pending |
| [STORY-09](../stories/epic-05/story-09-order-history-detail-pages.md) | Order history and detail pages | frontend | 5 | fullstack-4 | CP4 | pending |
| [STORY-10](../stories/epic-05/story-10-order-notification-emails.md) | Order notification emails | fullstack | 3 | fullstack-1 | CP4 | pending |
| [STORY-11](../stories/epic-05/story-11-ux-design-user-facing-copy.md) | UX design and user-facing copy | design | 5 | ux-designer | CP4 | pending |

**Total: 11 stories, 66 story points**
