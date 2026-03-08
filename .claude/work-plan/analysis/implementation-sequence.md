# Implementation Sequence — Cru Wine Marketplace

**Generated:** Checkpoint 2 — Work Plan Decomposition
**Scope:** All 9 epics (95 stories, 461 story points)

---

## Sequencing Principles

1. **Dependencies first** — foundational schemas and utilities before consuming features
2. **Critical path optimization** — the longest dependency chain determines minimum timeline
3. **Parallel work where safe** — independent epics and stories run concurrently
4. **Backend before frontend** — within each epic, migrations → DAL → Actions → UI
5. **Risk frontloading** — tackle high-risk integrations early to surface problems

---

## Critical Path

The longest dependency chain through the system:

```
EPIC-01 (User Accounts)
    ↓
EPIC-04 (Producer Storytelling + Medusa Sync)  ← BOTTLENECK
    ↓
EPIC-02 (Search & Browse)  ←── parallel with EPIC-04 backend, blocked on wines table
    ↓
┌─── EPIC-03 (Taste Profile)
├─── EPIC-05 (Order Placement)
└─── EPIC-06 (Retailer Integration)
         ↓
    EPIC-07 (Curation Engine)
         ↓
    EPIC-08 (Social Layer)
         ↓
    EPIC-09 (Retailer Dashboard)
```

**Critical path length:** EPIC-01 → EPIC-04 → EPIC-05 → EPIC-06 → EPIC-09

---

## Phase 1: Foundation (EPIC-01)

**Stories:** 11 | **Points:** 46
**Duration estimate:** Sprint 1–2

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 01/01 — Database Schema | 3 | sr-backend | None |
| 01/02 — Auth Configuration | 5 | sr-backend | 01/01 |
| 01/03 — Profile DAL | 3 | sr-backend | 01/01 |
| 01/04 — Org & Membership DAL | 5 | sr-backend | 01/01 |
| 01/05 — Server Actions | 5 | sr-backend | 01/03, 01/04 |
| 01/06 — RLS Policies & Tests | 5 | sr-backend | 01/01 |
| 01/07 — Auth Pages | 5 | fullstack-2 | 01/02, 01/05 |
| 01/08 — Org Switcher & Settings | 5 | fullstack-1 | 01/05 |
| 01/09 — Invitation Flow | 5 | fullstack-2 | 01/05 |
| 01/10 — UX Design & Copy | 3 | ux-designer, marketing-writer | None (parallel) |
| 01/11 — E2E Tests | 2 | qa | 01/07, 01/08, 01/09 |

**Gate:** EPIC-01 backend complete (stories 01–06) unblocks Phase 2.

---

## Phase 2: Core Catalog (EPIC-02 + EPIC-04, parallel backend)

**Stories:** 19 | **Points:** 101
**Duration estimate:** Sprint 2–4

### EPIC-04: Producer Storytelling (Backend Priority)
*Must start early — Medusa sync pipeline is on the critical path.*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 04/01 — Database Schema | 3 | sr-backend | EPIC-01/01 |
| 04/02 — DAL Functions | 3 | sr-backend | 04/01 |
| 04/03 — Server Actions | 5 | sr-backend | 04/02 |
| 04/04 — RLS Policies & Tests | 5 | sr-backend | 04/01 |
| 04/05 — Medusa Sync Pipeline | 8 | fullstack-3 | 04/02 |
| 04/06 — Producer Profile Pages | 8 | fullstack-1 | 04/03, 04/05 |
| 04/07 — Producer Admin UI | 8 | fullstack-1 | 04/03 |
| 04/08 — UX Design & Copy | 3 | ux-designer, marketing-writer | None (parallel) |
| 04/09 — Integration Tests | 12 | qa | 04/05, 04/06 |

### EPIC-02: Search & Browse (Parallel with EPIC-04)
*Wines table schema can be created while EPIC-04 Medusa sync is built.*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 02/01 — Database Schema | 3 | sr-backend | EPIC-01/01 |
| 02/02 — FTS Configuration | 5 | sr-backend | 02/01 |
| 02/03 — DAL Functions | 3 | sr-backend | 02/01 |
| 02/04 — Server Actions | 3 | sr-backend | 02/03 |
| 02/05 — RLS Policies & Tests | 3 | sr-backend | 02/01 |
| 02/06 — Wine Detail Page | 5 | fullstack-1 | 02/04 |
| 02/07 — Search Interface | 8 | fullstack-1 | 02/04 |
| 02/08 — Filter & Browse UI | 5 | fullstack-4 | 02/04 |
| 02/09 — Wine Card Component | 5 | fullstack-4 | 02/04 |
| 02/10 — UX Design & Copy | 3 | ux-designer, marketing-writer | None (parallel) |

**Parallelism opportunity:** EPIC-02 backend (stories 01–05) and EPIC-04 backend (stories 01–04) can run concurrently using separate backend agents. EPIC-04/STORY-05 (Medusa sync) should start as soon as EPIC-04/02 completes.

**Gate:** EPIC-02 + EPIC-04 backend complete unblocks Phase 3.

---

## Phase 3: Core Features (EPIC-03, EPIC-05, EPIC-06 — parallel)

**Stories:** 33 | **Points:** 178
**Duration estimate:** Sprint 4–7

These three epics are largely independent and can proceed in parallel.

### EPIC-03: Taste Profile
*Depends on: wines table (EPIC-02), profiles (EPIC-01)*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 03/01 — Database Schema | 3 | sr-backend | EPIC-01/01, EPIC-02/01 |
| 03/02 — DAL Functions | 3 | sr-backend | 03/01 |
| 03/03 — Template Matching | 5 | sr-backend | 03/02 |
| 03/04 — Server Actions | 5 | sr-backend | 03/02 |
| 03/05 — RLS Policies & Tests | 3 | sr-backend | 03/01 |
| 03/06 — Onboarding Quiz UI | 8 | fullstack-2 | 03/04 |
| 03/07 — Profile Display UI | 5 | fullstack-4 | 03/04 |
| 03/08 — UX Design & Copy | 5 | ux-designer, marketing-writer | None (parallel) |
| 03/09 — Tests | 3 | qa | 03/06, 03/07 |

### EPIC-05: Order Placement
*Depends on: wines (EPIC-02), Medusa sync (EPIC-04), profiles (EPIC-01)*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 05/01 — Database Schema | 3 | sr-backend | EPIC-01/01 |
| 05/02 — DAL Functions | 5 | sr-backend | 05/01 |
| 05/03 — Medusa Cart Integration | 8 | fullstack-3 | 05/02, EPIC-04/05 |
| 05/04 — Stripe Checkout | 8 | fullstack-3 | 05/03 |
| 05/05 — Webhook Handlers | 8 | fullstack-3 | 05/04 |
| 05/06 — Server Actions | 5 | sr-backend | 05/02 |
| 05/07 — RLS Policies & Tests | 5 | sr-backend | 05/01 |
| 05/08 — Cart & Checkout UI | 8 | fullstack-2 | 05/06 |
| 05/09 — Order History UI | 5 | fullstack-4 | 05/06 |
| 05/10 — UX Design & Copy | 3 | ux-designer, marketing-writer | None (parallel) |
| 05/11 — E2E Tests | 8 | qa | 05/08, 05/09 |

### EPIC-06: Retailer Integration
*Depends on: wines (EPIC-02), profiles (EPIC-01)*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 06/01 — Database Schema + PostGIS | 5 | sr-backend | EPIC-01/01, EPIC-02/01 |
| 06/02 — DAL Functions | 5 | sr-backend | 06/01 |
| 06/03 — POSAdapter Interface | 5 | sr-backend | None |
| 06/04 — CSV Import Adapter | 5 | fullstack-3 | 06/03 |
| 06/05 — Square Adapter | 8 | fullstack-3 | 06/03 |
| 06/06 — Lightspeed Adapter | 8 | fullstack-3 | 06/03 |
| 06/07 — Server Actions | 5 | sr-backend | 06/02 |
| 06/08 — RLS Policies & Tests | 5 | sr-backend | 06/01 |
| 06/09 — Retailer Signup Flow | 5 | fullstack-2 | 06/07 |
| 06/10 — Inventory Management UI | 8 | fullstack-4 | 06/07 |
| 06/11 — Proximity Search UI | 5 | fullstack-1 | 06/07 |
| 06/12 — UX Design & Copy | 3 | ux-designer, marketing-writer | None (parallel) |
| 06/13 — Integration Tests | 5 | qa | 06/04, 06/05, 06/06 |

**Parallelism opportunity:** All three epics' backend stories can run concurrently. POS adapter implementations (06/04, 06/05, 06/06) are independent and can be built in parallel by different agents, but sequential implementation (Square first as reference) is recommended per risk mitigation.

**Gate:** Phase 3 backend complete unblocks Phase 4.

---

## Phase 4: Intelligence & Discovery (EPIC-07)

**Stories:** 11 | **Points:** 57
**Duration estimate:** Sprint 7–8

*Depends on: taste profiles (EPIC-03), wines (EPIC-02), retailer inventory (EPIC-06)*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 07/01 — Database Schema + PostHog Setup | 5 | sr-backend | EPIC-02/01, EPIC-03/01 |
| 07/02 — DAL Functions | 5 | sr-backend | 07/01 |
| 07/03 — Recommendation Engine | 8 | sr-backend | 07/02, EPIC-03 |
| 07/04 — Explanation Templates | 3 | sr-backend | 07/03 |
| 07/05 — Caching Strategy | 3 | sr-backend | 07/02 |
| 07/06 — Dismiss Action & PostHog Tracking | 2 | sr-backend | 07/01 |
| 07/07 — Curator Dashboard UI | 8 | fullstack-1 | 07/02, 07/05 |
| 07/08 — Home Page Curation Sections | 8 | fullstack-1 | 07/03, 07/07 |
| 07/09 — Collection Page | 5 | fullstack-4 | 07/03, 07/05 |
| 07/10 — Recommendation Card UI | 5 | fullstack-4 | 07/03, 07/06 |
| 07/11 — UX Design & Copy | 5 | ux-designer, marketing-writer | None (parallel) |

---

## Phase 5: Community (EPIC-08)

**Stories:** 10 | **Points:** 37
**Duration estimate:** Sprint 8–9

*Depends on: profiles (EPIC-01), wine detail pages (EPIC-02)*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 08/01 — Database Schema | 3 | sr-backend | EPIC-01/01 |
| 08/02 — Profile DAL Extension | 3 | sr-backend | 08/01, EPIC-01/03 |
| 08/03 — Follow DAL & Actions | 5 | sr-backend | 08/02 |
| 08/04 — Share Event DAL & Actions | 3 | sr-backend | 08/02 |
| 08/05 — Open Graph Tags | 3 | fullstack-1 | EPIC-02/06 |
| 08/06 — Profile Page | 5 | fullstack-1 | 08/03, 08/05 |
| 08/07 — Share Button & Dialog | 5 | fullstack-2 | 08/04 |
| 08/08 — Follow Button | 3 | fullstack-2 | 08/03 |
| 08/09 — Activity Feed | 5 | fullstack-4 | 08/03, 08/04 |
| 08/10 — Analytics Dashboard | 2 | fullstack-4 | 08/04 |

**Note:** EPIC-08 could potentially run in parallel with EPIC-07 since its only hard dependency is EPIC-01 (profiles) and EPIC-02 (wine pages), both of which complete in Phase 2.

---

## Phase 6: Retailer Operations (EPIC-09)

**Stories:** 11 | **Points:** 45
**Duration estimate:** Sprint 9–10

*Depends on: EPIC-01 (auth), EPIC-05 (orders), EPIC-06 (inventory/fulfillment)*

| Story | Points | Agent | Dependencies |
|-------|--------|-------|-------------|
| 09/01 — Database Schema | 3 | sr-backend | EPIC-06/01 |
| 09/02 — Order Management DAL | 5 | sr-backend | 09/01, EPIC-05/01 |
| 09/03 — Inventory Management DAL | 5 | sr-backend | 09/01, EPIC-06/01 |
| 09/04 — Analytics DAL + MV | 5 | sr-backend | 09/01, EPIC-05/01 |
| 09/05 — Settings DAL & Actions | 3 | sr-backend | 09/01 |
| 09/06 — Order Queue UI | 8 | fullstack-1 | 09/02, 09/11 |
| 09/07 — Inventory Health Monitor | 5 | fullstack-4 | 09/03, 09/11 |
| 09/08 — Analytics UI | 3 | fullstack-4 | 09/04, 09/11 |
| 09/09 — Settings Pages | 5 | fullstack-2 | 09/05, 09/11 |
| 09/10 — Email Notifications | 3 | fullstack-3 | 09/02 |
| 09/11 — UX Design & Copy | — | ux-designer, marketing-writer | None (parallel) |

---

## Agent Workload Distribution

| Agent | Primary Epics | Estimated Points | Role |
|-------|--------------|------------------|------|
| **sr-backend** | ALL (backend stories) | ~180 | Migrations, RLS, DAL, Actions |
| **fullstack-1** | 01, 02, 04, 06, 07, 08, 09 | ~90 | Lead frontend, complex pages, code review |
| **fullstack-2** | 01, 03, 05, 08, 09 | ~55 | Forms, state, real-time, auth UI |
| **fullstack-3** | 04, 05, 06, 09 | ~60 | Integrations, Medusa, Stripe, POS, email |
| **fullstack-4** | 02, 03, 05, 06, 07, 08, 09 | ~55 | Data tables, dashboards, catalogs |
| **ux-designer** | ALL (UX stories) | ~25 | Component design, interaction patterns |
| **marketing-writer** | ALL (copy stories) | ~15 | UI copy, microcopy, onboarding text |
| **qa** | ALL (test stories) | ~30 | Unit, integration, E2E, RLS, a11y |
| **devops** | Infrastructure | ~10 | CI/CD, migrations, env config |

---

## Sprint-Level View

| Sprint | Epics | Focus | Key Deliverables |
|--------|-------|-------|-----------------|
| **1–2** | 01 | Foundation | Auth, profiles, orgs, memberships, RLS |
| **2–4** | 02, 04 | Core Catalog | Wines schema, FTS, Medusa sync, producer pages |
| **4–5** | 03, 05 | User Features | Taste profiles, cart, checkout, Stripe |
| **5–7** | 06 | Retailer | POS adapters, inventory, proximity search |
| **7–8** | 07 | Intelligence | Curation engine, recommendations, collections |
| **8–9** | 08 | Community | Follows, sharing, OG tags, profiles |
| **9–10** | 09 | Operations | Retailer dashboard, analytics, notifications |

---

## Recommended Epic Ordering (Summary)

```
Priority  Epic   Title                    Points  Dependencies
───────── ────── ──────────────────────── ─────── ──────────────────
   1      01     User Accounts             46     None
   2      04     Producer Storytelling      55     EPIC-01
   2      02     Search & Browse            46     EPIC-01 (parallel w/ 04)
   3      03     Taste Profile              40     EPIC-01, EPIC-02
   3      05     Order Placement            66     EPIC-02, EPIC-04
   3      06     Retailer Integration       72     EPIC-01, EPIC-02
   4      07     Curation Engine            57     EPIC-02, EPIC-03, EPIC-06
   5      08     Social Layer               37     EPIC-01, EPIC-02
   6      09     Retailer Dashboard         45     EPIC-05, EPIC-06
                                           ═══
                 TOTAL                     461
```

---

## Risk-Adjusted Recommendations

1. **Start EPIC-04 Medusa sync early** — it's the highest-risk critical-path item. If sync doesn't work, the entire commerce pipeline is blocked.

2. **Implement Square POS adapter first** (EPIC-06) as the reference implementation. Other adapters follow the same pattern and can be parallelized once the interface is proven.

3. **Create comprehensive wine seed data** after EPIC-02 schema is finalized. This unblocks all downstream frontend work regardless of Medusa sync status.

4. **Run UX design and marketing copy as a continuous parallel stream** — these stories have no technical dependencies and can be ready before frontend sprints begin.

5. **Consider moving EPIC-08 earlier** — it only depends on EPIC-01 and EPIC-02, so its backend could start in Phase 3 alongside EPIC-03/05/06. However, it's the lowest RICE score (4,200) so it's correctly sequenced as lower priority.
