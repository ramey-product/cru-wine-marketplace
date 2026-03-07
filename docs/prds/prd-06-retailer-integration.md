# PRD: Local Retailer Integration

**Feature:** Local Retailer Integration
**Priority:** P0 — Launch Critical (RICE: 4,000)
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

## 1. Problem Statement

Cru's "local first" model (Product Principle #4) only works if we know what wines are available at nearby stores, at what price, and in real time. Without live retailer inventory data, every recommendation is hypothetical — "You'd love this wine, but we have no idea if you can actually buy it." That's a worse experience than the status quo.

Independent wine shops — Cru's target retail partners — use a chaotic patchwork of POS systems (Lightspeed, Square, POSIM, custom spreadsheets) with no standardized inventory API. The biggest risk in this feature is integration complexity: every retailer is a snowflake. The roadmap's Risk Register flags "Retailer POS integration harder than expected" as high likelihood.

The mitigation strategy is phased: start with manual CSV upload for onboarding, then automate per-POS-type as patterns emerge. But even the CSV path must feed into a unified inventory data model that the rest of Cru (Search, Curation, Order Placement) can query consistently.

This feature serves every user who wants to buy wine (100% of commerce-engaged users) and every retail partner (20 at launch). It's the commerce backbone.

## 2. Goals

**User Goals:**
- See accurate, up-to-date pricing and stock status for wines at stores near them
- Know which specific stores carry a wine they're interested in, with distance and price
- Trust that "in stock" means actually in stock — not a stale feed from three days ago

**Business Goals:**
- Onboard 20 LA retail partners with live (or near-live) inventory by launch
- Achieve < 5% inventory discrepancy rate (wine shown as "in stock" but actually out of stock)
- Establish the integration patterns that scale from 20 to 200+ retailers
- Create the data layer that Order Placement, Search, and Curation all depend on

## 3. Non-Goals

- **Building POS integrations for every system** — V1 supports CSV upload universally and 1-2 automated POS integrations (likely Lightspeed and Square, as they're most common among LA indie shops). Others added iteratively.
- **Price comparison or deal-finding features** — Cru shows retailer prices; it doesn't recommend the cheapest option or run price wars between partners.
- **Retailer e-commerce website** — Retailers sell through Cru's Order Placement flow, not through a white-label storefront.
- **National retailer chains** — Launch focuses on independent wine shops in LA. Chain retailer integration (Total Wine, BevMo) is a growth phase consideration.
- **Delivery logistics management** — Cru routes orders to retailers. Retailers manage their own delivery operations.

## 4. User Stories

### Explorer (Primary)
- As an Explorer viewing a wine, I want to see which stores near me have it in stock and at what price so that I can buy it locally.
- As an Explorer, I want the "Available nearby" indicator on wine cards to be accurate so that I don't get excited about a wine I can't actually get.

### Retailer Partner
- As a retailer, I want to upload my wine inventory via CSV so that my stock appears on Cru without complex technical setup.
- As a retailer, I want Cru to automatically sync my inventory from my POS system so that I don't have to manually update stock levels.
- As a retailer, I want to see which of my wines are getting the most views and purchases on Cru so that I can optimize my inventory for Cru customers.
- As a retailer, I want to set my own prices on Cru so that I control my margins.
- As a retailer, I want to mark items as "low stock" or "out of stock" quickly if my POS sync lags so that customers aren't disappointed.

### All Users
- As any user, I want inventory data to refresh at least daily so that I'm not seeing stale information.

### Edge Cases
- As a user viewing a wine that no local retailer stocks, I want to see "Not available nearby — wishlist for notification" rather than a dead end.
- As a retailer whose POS sync fails, I want Cru to show my last known inventory (not hide my store) and alert me to re-sync.
- As a user in a new city where Cru is expanding, I want to see wines available nationally (via DTC, when launched) even before local retailers are onboarded.

## 5. Requirements

### Must-Have (P0)

**Retailer Onboarding**
- Retailer signup form: store name, address, contact info, POS type, fulfillment capabilities (pickup only, pickup + delivery, delivery radius)
- CSV import: standardized template with columns for wine name, producer, vintage, varietal, SKU, price, quantity
- CSV mapping tool: handle common variations (column order, naming differences) with a preview-before-import step
- Acceptance criteria:
  - Given a retailer uploads a CSV with 500 wines, when the import completes, then all wines are matched to existing Cru wine records (or flagged for manual review if no match) within 5 minutes
  - Given a CSV contains a wine not in the Cru database, when the import runs, then the unmatched wine is flagged in a review queue for the Cru content team

**Wine Matching**
- Fuzzy matching algorithm: match retailer CSV wine entries to canonical Cru wine records using name, producer, vintage, varietal
- Match confidence scores: auto-match above 90% confidence, queue for manual review between 70-90%, flag as unmatched below 70%
- Manual review interface (admin only): approve, reject, or create new wine records for unmatched entries
- Acceptance criteria:
  - Given a retailer lists "Dom. Tempier Bandol Rose 2023," when the matcher runs, then it matches to the canonical record "Domaine Tempier Bandol Rosé 2023" with >90% confidence
  - Given a retailer lists a wine with no match in the Cru database, when flagged, then a content admin can create a new wine record from the CSV data with one click

**Inventory Data Model**
- `retailer_inventory` table: retailer_id, wine_id, price (decimal), quantity (integer), stock_status (enum: in_stock, low_stock, out_of_stock), last_synced_at (timestamptz), sync_source (enum: csv, pos_api, manual), org_id
- `retailers` table: id, name, slug, address, city, state, zip, latitude, longitude, phone, email, pos_type, fulfillment_capabilities (JSONB), delivery_radius_miles, commission_rate, org_id
- Location-based queries: given a user's zip code, return retailers within X miles using PostGIS distance calculations
- All tables with RLS, org_id, updated_at triggers, indexes on wine_id, retailer_id, and geographic coordinates
- DAL functions in `lib/dal/retailers.ts`, `lib/dal/inventory.ts`

**Automated POS Sync (1-2 integrations)**
- Lightspeed Retail API integration (most common among LA indie wine shops): pull inventory daily + webhook for real-time stock changes
- Square for Retail API integration: pull inventory daily
- Sync schedule: full inventory pull nightly, incremental updates via webhook or polling every 4 hours
- Error handling: if sync fails, retain last known inventory, alert retailer via email, flag in admin dashboard
- Acceptance criteria:
  - Given a Lightspeed-connected retailer sells a wine in-store, when the webhook fires, then Cru's inventory record updates within 5 minutes
  - Given a nightly sync fails, when the next day's browse shows the retailer's inventory, then last-known data is displayed with a "Last updated X hours ago" indicator

**Availability Display (consumed by other features)**
- Search & Browse: wine cards show green/gray availability dot
- Wine Detail Page: list of retailers carrying this wine with price, distance, and fulfillment options
- Curation: recommendations factor in local availability (prefer in-stock wines)
- API: `GET /api/v1/inventory/check?wine_id=X&lat=Y&lng=Z&radius=R` — consumed by frontend components
- Acceptance criteria:
  - Given a wine is in stock at 2 retailers within 10 miles of the user, when the wine card renders, then the green availability dot appears
  - Given the inventory API is called, when it responds, then the response time is < 200ms for a 15-mile radius query

### Nice-to-Have (P1)

- Retailer self-serve inventory management (web dashboard for manual stock adjustments)
- Additional POS integrations: POSIM, Clover, Shopify POS
- Real-time inventory webhooks from all supported POS systems
- Inventory analytics: which wines are frequently out of stock, which have growing demand
- Automatic inventory alerts: "Wine X is running low at 3 stores — consider restocking"

### Future Considerations (P2)

- National retailer chain integrations (Total Wine, BevMo, etc.)
- Producer-direct inventory for DTC fulfillment
- Warehouse/distribution center inventory for Cru-operated fulfillment
- Dynamic pricing suggestions based on demand signals

## 6. Success Metrics

### Leading Indicators (Week 1-4)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Retailers onboarded at launch | 20 | 25 | retailers table count |
| Wines with local availability | 500+ unique wines in inventory | 750+ | retailer_inventory distinct wine_ids |
| Inventory match rate | 85% of CSV wines auto-matched to Cru records | 90% | Match algorithm logs |
| Sync freshness | 90% of inventory data < 24 hours old | 95% | last_synced_at analysis |
| Availability API latency | < 200ms p95 | < 100ms p95 | API monitoring |

### Lagging Indicators (Month 1-3)
| Metric | Target | Stretch | Measurement |
|--------|--------|---------|-------------|
| Inventory discrepancy rate | < 5% (shown "in stock" but actually out) | < 3% | Order cancellation reasons |
| Retailer churn | < 10% of onboarded retailers churn in first 3 months | < 5% | Retailer status tracking |
| Orders per retailer per week | 10+ average | 15+ | Order data by retailer |
| Retailer NPS | > 40 | > 50 | Retailer survey |

## 7. Open Questions

- **[Engineering — blocking]** PostGIS vs. application-level distance calculation: Supabase supports PostGIS extensions. Is it performant enough for location queries at scale, or do we need a separate geo index?
- **[Operations — blocking]** Which specific POS systems do the first 20 LA target retailers use? Need a census before committing to Lightspeed + Square. If 15 of 20 use POSIM, priorities shift.
- **[Product — non-blocking]** How do we handle price discrepancies between what the CSV says and what the retailer actually charges in-store? Cru shows the Cru price (from inventory feed); in-store may differ.
- **[Legal — non-blocking]** Do we need retailer contracts/agreements before displaying their inventory and routing orders? What's the minimum legal framework?

## 8. Timeline Considerations

- **Build order: #6** — But Track B starts the commerce engine scaffolding in Week 1-2 in parallel with Track A's User Accounts.
- **Weeks 3-6 of pre-launch sprint** (Track B)
- **Hard dependency:** User Accounts (#1) and Search (#2) for user context and browse integration.
- **External dependency:** Retailer onboarding is a business/operations task that runs in parallel with engineering. Need 10+ retailers with CSV uploads by Week 5 for Order Placement testing.
- **Downstream dependents:** Order Placement (#5) cannot function without live inventory data. Retailer Dashboard (#9) builds on this data layer. Search & Browse (#2) consumes availability for display.
- **Risk mitigation:** CSV upload is the fallback for any retailer whose POS integration isn't ready. This ensures all 20 retailers can go live even if automated sync only works for a subset.
