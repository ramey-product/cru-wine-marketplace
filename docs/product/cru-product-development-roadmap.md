# Product Development Roadmap: Cru

**Version:** 1.0 — Seed Stage
**Author:** Matt Ramey
**Date:** March 6, 2026
**Status:** Draft
**Parent:** [Cru — Product Spec](https://www.notion.so/31c6d459228481d9bdfecf8d36b58989)

---

# 1. Roadmap Overview

This roadmap translates the Cru Product Spec into a sequenced, dependency-aware execution plan. It is designed for two audiences: seed investors who need to see a credible path from zero to Series A, and the agentic development team (Claude agent squad + 1-2 human reviewers) that will build it.

The roadmap is organized around three core constraints: GTM milestones (what the market needs to see and when), technical dependencies (what must exist before other things can be built), and team capacity (an agentic dev team with human checkpoint gates).

**GTM Milestones (from Product Spec):**
- **Month 3:** LA launch — 5K active users, 200+ orders/week, 20 retail partners, NPS >50
- **Month 8:** 3-city expansion (SF + NYC) — 25K users, 1K+ orders/week, 60 retailers, 100+ producers
- **Month 18:** Series A ready — 100K+ users, 5K+ orders/week, 200+ retailers, 500+ producers, $2M+ ARR

---

# 2. RICE Prioritization

Every feature is scored using RICE: (Reach x Impact x Confidence) / Effort. Reach is calibrated to GTM milestones. Impact uses a 0.25-3 scale (3 = massive). Confidence is a percentage. Effort is in person-months equivalent.

## P0 — Launch Critical

| Rank | Feature | Reach | Impact | Confidence | Effort | RICE | Notes |
|------|---------|-------|--------|------------|--------|------|-------|
| 1 | User Accounts & Preferences | 5,000 | 3 | 100% | 1.5 | 10,000 | Foundation — everything depends on this |
| 2 | Search & Browse | 5,000 | 3 | 100% | 2 | 7,500 | Core navigation, browse by region/varietal/mood |
| 3 | Taste Profile Onboarding | 5,000 | 3 | 80% | 2 | 6,000 | Key differentiator — language-based, no jargon |
| 3 | Producer Storytelling | 5,000 | 2 | 90% | 1.5 | 6,000 | Content CMS, can build in parallel |
| 5 | Order Placement | 5,000 | 3 | 90% | 2.5 | 5,400 | Revenue unlock — pickup/delivery via retailers |
| 6 | Local Retailer Integration | 5,000 | 3 | 80% | 3 | 4,000 | Commerce backbone — live pricing/inventory |
| 7 | AI + Human Curation Engine | 5,000 | 3 | 80% | 2* | 6,000* | *MVP scope: rules-based + human picks. ML layers in P1 |
| 8 | Social/Community Layer | 3,000 | 2 | 70% | 1* | 4,200* | *V0 scope: follow + share only. Full social in P1 |
| 9 | Retailer Dashboard | 20 | 3 | 90% | 2 | 27 | Low RICE but strategically mandatory — supply-side enabler |

**MVP Trade-offs (locked decisions):**
- AI Curation launches as rules-based taste matching + human-curated staff picks. ML personalization layers in during Months 3-5 as user data grows.
- Social/Community launches as V0: follow users, share bottles, basic activity feed. No feed algorithm, no groups. Full community build in Month 4-5.
- These trade-offs reduce pre-launch effort by approximately 3.5 person-months equivalent.

## P1 — Fast Follow (Months 2-3 post-launch)

| Rank | Feature | Reach | Impact | Confidence | Effort | RICE | Notes |
|------|---------|-------|--------|------------|--------|------|-------|
| 1 | Push Notifications & Alerts | 20,000 | 1 | 90% | 1 | 18,000 | Quick win — stock alerts, price drops, drinking windows |
| 2 | Advanced Taste Learning | 15,000 | 2 | 80% | 1.5 | 16,000 | Deepens core loop, improves curation quality |
| 3 | Editorial Content | 20,000 | 1 | 80% | 2 | 8,000 | SEO play + engagement. Guides, seasonal picks, interviews |
| 4 | ML Curation Upgrade | 15,000 | 2 | 70% | 2.5 | 8,400 | Upgrade rules engine to full ML pipeline |
| 5 | Full Social/Community | 15,000 | 1.5 | 70% | 2 | 7,875 | Feed algorithm, groups, community features |
| 6 | Producer DTC | 8,000 | 2 | 70% | 3.5 | 3,200 | Mini-Shopify for winemakers. New revenue stream |
| 7 | Cellar Management | 5,000 | 2 | 80% | 3 | 2,667 | Enthusiast persona unlock, P2 prerequisite |
| 8 | Secondary Marketplace (P2P) | 3,000 | 2 | 60% | 4 | 900 | Liquid marketplace differentiator |
| 9 | Auction System | 1,500 | 2 | 50% | 4 | 375 | Premium niche, builds on marketplace infra |

## P2 — Growth Phase (Months 9-18)

| Rank | Feature | Reach | Impact | Confidence | Effort | RICE | Notes |
|------|---------|-------|--------|------------|--------|------|-------|
| 1 | Premium Subscription Tier | 50,000 | 1 | 70% | 2 | 17,500 | Monetization proof for Series A |
| 2 | Consignment | 2,000 | 2 | 60% | 3 | 800 | Marketplace GMV growth |
| 3 | Cellaring Metrics & Alerts | 1,500 | 1.5 | 50% | 2 | 563 | Collector retention + upsell |
| 4 | Professional Cellaring | 1,500 | 2 | 50% | 3.5 | 429 | Partner integrations with storage facilities |

## P3 — Vision (Post-Series A)

| Rank | Feature | Reach | Impact | Confidence | Effort | RICE | Notes |
|------|---------|-------|--------|------------|--------|------|-------|
| 1 | Physical Retail / Warehouse | 50,000 | 2 | 30% | 12 | 2,500 | Capital-intensive, post-PMF |
| 2 | Wine Club / Collection Co-ops | 10,000 | 1.5 | 40% | 4 | 1,500 | Community-driven |
| 3 | Wine Investment Analytics | 3,000 | 1.5 | 40% | 3 | 600 | Data dependency on cellaring + marketplace |
| 4 | Fractional Bottle Investments | 5,000 | 2 | 30% | 6 | 500 | Requires regulatory groundwork (6+ months) |

---

# 3. Dependency Map

Features are organized into dependency chains. Nothing in a chain can start until its predecessor ships (or reaches a defined integration point).

## Foundation Layer

User Accounts & Preferences (#1) is the root dependency. Every other feature requires authenticated users with stored preferences.

## Discovery Chain

Search & Browse (#2) requires User Accounts (#1) for personalized context. Taste Profile Onboarding (#3) requires Search (#2) because it needs content to build profiles against. AI + Human Curation (#7) requires Taste Profile (#3) because it needs taste data to generate recommendations. Advanced Taste Learning (P1) extends the curation engine with feedback loops. ML Curation Upgrade (P1) replaces the rules engine with a trained model once sufficient data exists.

## Commerce Chain

Local Retailer Integration (#6) requires User Accounts (#1) and Search (#2) for user and browse context. Retailer Dashboard (#9) requires Retailer Integration (#6) as its data source. Order Placement (#5) requires Retailer Integration (#6) for inventory and pricing. Push Notifications (P1) requires Order Placement (#5) for transactional alerts.

## Content Chain

Producer Storytelling (#4) is independent and can be built in parallel from Week 1. It only requires the CMS framework. Editorial Content (P1) extends Producer Storytelling's content infrastructure.

## Social Chain

Social/Community V0 (#8) requires User Accounts (#1) and Curation (#7) so users have content to share and people to follow. Full Social (P1) extends V0 with feed algorithms and groups.

## Advanced Commerce Chain (P1+)

Cellar Management (P1) requires User Accounts (#1). Secondary Marketplace (P1) requires User Accounts, Order Placement, and Cellar Management (users need collections to trade). Auction System (P1) builds on Secondary Marketplace infrastructure. Consignment (P2) builds on Secondary Marketplace with verification. Producer DTC (P1) requires Producer Storytelling, Retailer Integration (shared commerce patterns), and Order Placement.

## Collector Chain (P2+)

Professional Cellaring (P2) requires Cellar Management (P1). Cellaring Metrics (P2) requires Professional Cellaring. Premium Subscription (P2) requires Cellar Management and Advanced Taste Learning as value propositions.

## Critical Paths

The two longest dependency chains determine minimum timeline:

**Discovery Critical Path (6 features):** User Accounts > Search > Taste Profile > AI Curation > Advanced Taste Learning > Premium Subscription

**Commerce Critical Path (6 features):** User Accounts > Search > Retailer Integration > Order Placement > Secondary Marketplace > Auction System

Both converge at User Accounts, confirming it as Build Order #1 with zero flexibility.

---

# 4. Execution Timeline

## Team Model: Agentic Development

Cru is built by the Claude agent team defined in CLAUDE.md, with 1-2 human reviewers (Matt + optional technical co-founder) at checkpoint gates.

**Agent squad:** pm-orchestrator (Opus), architect (Opus), sr-backend (Opus), fullstack-1 (Opus, lead), fullstack-2 (Sonnet), fullstack-3 (Sonnet), ux-designer (Opus), devops (Sonnet), qa (Sonnet)

**Advantages over traditional team:**
- Massive parallelization — agents work simultaneously across tracks
- No context-switching overhead or meetings
- Consistent code quality via automated review (fullstack-1 reviews fullstack-2/3)
- 24/7 availability between checkpoints

**Bottlenecks shift to:**
- Human review at 4 checkpoints per feature (architecture, backend, frontend, QA)
- External integration complexity (retailer POS systems, payment providers, third-party APIs)
- Content creation that requires human judgment (producer stories, editorial voice, curator recruitment)
- Design decisions requiring user empathy and brand sensibility

## Pre-Launch Sprint: Weeks 1-10

Three parallel tracks, with the agent team distributing work across all tracks simultaneously.

### Track A: Discovery (architect + fullstack-1 + fullstack-2)

| Week | Deliverable | Checkpoint |
|------|-------------|------------|
| 1-2 | User Accounts & Preferences — schema, auth, RLS, UI | CP1: Architecture Review |
| 2-3 | User Accounts ships. Search & Browse begins — schema, filters, browse modes | CP2: Backend Complete |
| 3-4 | Search & Browse ships. Taste Profile Onboarding begins | CP3: Frontend Complete |
| 5-6 | Taste Profile ships. AI Curation MVP (rules-based) begins | CP4: QA Complete |
| 7-8 | AI Curation MVP ships with human-curated staff picks | Full QA pass |

### Track B: Commerce (sr-backend + fullstack-3 + devops)

| Week | Deliverable | Checkpoint |
|------|-------------|------------|
| 1-2 | Medusa.js commerce engine setup, Stripe integration scaffolding | CP1 |
| 3-4 | Local Retailer Integration — POS sync, inventory feed, pricing | CP2 |
| 5-6 | Retailer Dashboard — partner portal, analytics, demand signals | CP3 |
| 7-8 | Order Placement — cart, checkout, pickup/delivery routing | CP4 |
| 9-10 | Commerce QA, payment flow testing, retailer UAT | Full QA pass |

### Track C: Content + Social (ux-designer + fullstack-2)

| Week | Deliverable | Checkpoint |
|------|-------------|------------|
| 1-3 | Producer Storytelling — CMS, producer profiles, story templates | CP1-CP2 |
| 4-5 | Producer Storytelling ships. Content seeding begins (30-50 producers) | — |
| 6-8 | Social/Community V0 — follow, share, basic activity | CP3-CP4 |
| 9-10 | Social V0 ships. Launch prep, content QA, onboarding polish | Full QA pass |

### Cross-Track: QA + DevOps

qa agent runs continuous testing from Week 3 onward. devops handles CI/CD, preview deploys, migration management, and production environment setup throughout.

**Week 10: LA Launch** — All P0 features live. 20 retail partners onboarded. 30-50 producer profiles seeded.

## Phase 2: Fast Follow — Months 4-8

Features ordered by RICE score, adjusted for dependencies and GTM needs.

| Month | Feature | Strategic Purpose | Depends On |
|-------|---------|-------------------|------------|
| 4 | Push Notifications & Alerts | Retention for SF launch | Order Placement |
| 4 | Advanced Taste Learning | Improves curation, generates ML training data | AI Curation MVP |
| 5 | Full Social/Community Build | Organic growth engine | Social V0 |
| 5-6 | ML Curation Upgrade | Replaces rules engine with trained model | Advanced Taste Learning live 4+ weeks + sufficient user data |
| 5-6 | Editorial Content | SEO, engagement, NYC launch support | Producer Storytelling CMS |
| 5-7 | Cellar Management | Enthusiast unlock, P2 prerequisite | User Accounts |
| 6-8 | Producer DTC | National reach, new revenue | Producer Storytelling + Order Placement |
| 7-8 | Secondary Marketplace (P2P) | Liquid marketplace differentiator | Cellar Management + Order Placement |
| 8 | Auction System | Premium positioning | Secondary Marketplace infra |

> **ML Curation Sequencing Note:** Advanced Taste Learning must be live for 4+ weeks before ML Curation Upgrade can ship. Correct sequence: Advanced Taste Learning feature-complete by Month 4 Week 2, ML model development begins Month 5 Week 1, ML Curation ships Month 6. Success criteria for ML launch: 1,000+ rated bottles, 500+ active taste learners, >75% validation accuracy on holdout set.

**Month 8 Milestone Check:** 25K active users, 1K+ orders/week, 60 retailers, 100+ producers, SF and NYC live.

## Phase 3: Growth — Months 9-18

| Quarter | Feature | Strategic Purpose | Series A Signal |
|---------|---------|-------------------|-----------------|
| Q4 (9-11) | Premium Subscription Tier | Monetization proof | Subscription revenue growing MoM |
| Q4 (10-12) | Consignment | GMV growth | Marketplace take rate expanding |
| Q5 (12-15) | Professional Cellaring | Collector value prop | High-value user retention |
| Q5-Q6 (14-18) | Cellaring Metrics & Alerts | Collector retention | Engagement metrics in Collector segment |

**Month 18 Milestone:** 100K+ active users, 5K+ orders/week, 200+ retailers, 500+ producers, $2M+ ARR, Series A ready.

## Phase 4: Vision — Post-Series A

P3 features are directional, not committed. Sequencing depends on post-PMF learnings.

| Feature | Lead Time | Prerequisite |
|---------|-----------|-------------|
| Fractional Investments | 6+ months regulatory | Start legal groundwork in Phase 3 if Collector traction is strong |
| Wine Club / Co-ops | 3-4 months | Strong community engagement metrics |
| Physical Retail | 9-12 months + capital | Proven unit economics, Series A+ funding |
| Investment Analytics | 3 months | Cellaring + marketplace price data at scale |

---

# 5. Capacity Model

## Agentic Team Allocation

### Pre-Launch (Months 1-3)

| Allocation | % | Rationale |
|-----------|---|-----------|
| Feature development | 80% | Ship or die. All energy on P0. |
| Infrastructure & DevOps | 15% | CI/CD, monitoring, production readiness |
| Buffer | 5% | Retailer POS integration surprises |

### Fast Follow (Months 4-8)

| Allocation | % | Rationale |
|-----------|---|-----------|
| Feature development | 75% | P1 features + ML pipeline |
| Technical health | 15% | Scale infra for multi-city, ML training pipeline |
| Buffer | 10% | Compliance issues, partner integration complexity |

### Growth (Months 9-18)

| Allocation | % | Rationale |
|-----------|---|-----------|
| Feature development | 65% | P2 features, marketplace depth |
| Technical health | 20% | Security hardening, scale testing, data pipeline maturity |
| Buffer | 15% | Regulatory prep (fractional investments), incident response |

## Human Checkpoint Cadence

The agentic team follows the execution flow from CLAUDE.md. Each feature goes through 4 checkpoints requiring human approval:

1. **Architecture Review** — Schema, API design, integration approach
2. **Backend Complete** — Migrations, RLS, DAL, Server Actions working
3. **Frontend Complete** — UI built, reviewed by fullstack-1, accessible
4. **QA & Polish** — Tests passing, accessibility scans clean, ready to ship

At pre-launch velocity with 3 tracks running in parallel, Matt should expect to review 2-4 checkpoints per day during peak sprint weeks. Batching reviews into morning and evening sessions is recommended.

---

# 6. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Retailer POS integration harder than expected | High | Medium | Start with manual CSV inventory upload. Automate per-retailer as each POS type is solved. |
| Rules-based curation feels generic at launch | Medium | High | Invest heavily in human curation quality. Recruit strong founding curators. ML upgrade is Month 5-6 priority. |
| Alcohol shipping compliance blocks expansion | Medium | High | LA-only at launch (CA has favorable DTC laws). Legal groundwork for CA statewide during Phase 1. SF/NYC compliance work starts Month 2. |
| Agentic team hits quality ceiling on UX/design | Medium | Medium | Human design review at every frontend checkpoint. Consider contracting a senior UX designer for brand-critical screens. |
| Secondary marketplace liquidity chicken-and-egg | High | Medium | Seed marketplace with consignment inventory from retail partners. Incentivize early sellers with reduced fees. |
| Content moat takes longer to build than expected | Medium | Low | Partner with wine media (VinePair, Punch) for content licensing. Recruit curator-influencers who bring audience. |
| Single-person human reviewer bottleneck | High | High | Establish clear checkpoint criteria so reviews are fast. Consider adding a technical co-founder or fractional CTO by Month 3. |

---

# 7. Success Metrics by Phase

## Phase 1: LA Launch (Month 3)

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Active users | 5,000 | Market traction proof |
| Weekly orders | 200+ | Commerce engine works |
| Retail partners live | 20 | Supply side healthy |
| NPS | >50 | Product-market fit signal |
| Taste profiles created | 3,000+ | Core loop adoption |
| DAU/MAU | >25% | Engagement quality |

## Phase 2: 3-City Expansion (Month 8)

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Active users | 25,000 | Growth trajectory |
| Weekly orders | 1,000+ | Revenue scaling |
| Retail partners | 60 | Multi-city supply |
| Producers on platform | 100+ | Content depth |
| Cellar Management users | 2,000+ | Enthusiast adoption |
| Organic acquisition % | >30% | Sustainable growth signal |

## Phase 3: Series A Ready (Month 18)

| Metric | Target | Why It Matters |
|--------|--------|---------------|
| Active users | 100,000+ | Scale proof |
| Weekly orders | 5,000+ | Revenue engine |
| ARR run rate | $2M+ | Business viability |
| Retail partners | 200+ | National supply |
| Producers | 500+ | Content moat |
| Marketplace GMV (monthly) | $500K+ | Platform economics |
| LTV/CAC ratio | >3x | Unit economics work |
| Premium subscribers | 5,000+ | Monetization diversification |

---

# 8. What's Next

**Session 3:** PRDs for all P0 features — detailed problem statements, user stories, acceptance criteria, technical requirements, and success metrics for each of the 9 launch-critical features.

**Session 4:** PRDs for P1 and P2 features — detailed specs for fast-follow and growth phase features.
