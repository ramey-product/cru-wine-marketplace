# Technical Risks & Open Questions — Cru Wine Marketplace

**Generated:** Checkpoint 2 — Work Plan Decomposition
**Scope:** All 9 epics (95 stories, 461 story points)

---

## Risk Severity Legend

| Severity | Definition | Action |
|----------|-----------|--------|
| **Blocking** | Could halt implementation of multiple stories/epics | Must resolve before Checkpoint 3 |
| **High** | Could cause significant rework or scope changes | Must have mitigation plan before Checkpoint 3 |
| **Medium** | Could impact timeline or quality | Monitor and address during implementation |
| **Low** | Minor impact, workarounds available | Address opportunistically |

---

## Blocking Risks

### RISK-01: Medusa.js V2 Sync Stability
**Epics:** 04, 05, 06
**Probability:** Medium | **Impact:** Critical

Medusa.js V2 is the commerce engine. The Supabase-to-Medusa sync pipeline (EPIC-04) is on the critical path — without it, wines can't be purchased (EPIC-05) or fulfilled (EPIC-06).

**Specific concerns:**
- Medusa V2 API may have breaking changes during development
- Webhook payload format may differ from documentation
- Sync failures could leave Supabase and Medusa in inconsistent states

**Mitigation:**
- Pin Medusa.js version at project start; don't upgrade mid-sprint
- Build comprehensive integration tests for the sync pipeline
- Implement sync reconciliation job (detect and repair drift)
- Design the system to degrade gracefully if Medusa is temporarily unavailable

---

### RISK-02: Wines Table as Architecture Bottleneck
**Epics:** 02, 03, 04, 05, 06, 07, 08
**Probability:** High | **Impact:** High

The `wines` table is referenced by 7 of 9 epics. Its schema must be finalized early, and any late changes cascade across the entire system.

**Specific concerns:**
- Schema changes to `wines` after downstream tables exist require coordinated migrations
- Full-text search (`tsvector`) column requires careful indexing
- Performance under large catalog sizes (10K+ wines) needs testing

**Mitigation:**
- Finalize wines schema in EPIC-02/STORY-01 with explicit approval before proceeding
- Create comprehensive seed data (1K+ wines) for performance testing
- Use database views or materialized views for complex wine queries to isolate schema changes

---

### RISK-03: Supabase Auth + Multi-Tenancy Integration
**Epics:** 01, ALL downstream
**Probability:** Medium | **Impact:** Critical

Every authenticated request must resolve the current user's org membership and role. The `profiles` table links Supabase Auth users to org memberships. If this foundation is flawed, every downstream feature breaks.

**Specific concerns:**
- `supabase.auth.getUser()` vs `getSession()` — must use `getUser()` for security
- Cookie-based sessions via `@supabase/ssr` may have edge cases with middleware
- Profile creation must be atomic with auth signup (trigger or post-signup hook)

**Mitigation:**
- Implement and thoroughly test the auth → profile → membership chain in EPIC-01 first
- Create a shared `getCurrentUserWithOrg()` utility used by all Server Actions
- Test edge cases: expired sessions, concurrent logins, org switching

---

## High Risks

### RISK-04: POS API Integration Complexity
**Epics:** 06, 09
**Probability:** High | **Impact:** High

Four POS integrations (Square, Lightspeed, Shopify, Clover) each have different:
- Authentication flows (OAuth 2.0 variants)
- Inventory data models
- Rate limits and retry policies
- Webhook formats

**Specific concerns:**
- Each adapter requires dedicated development and testing time
- OAuth token refresh lifecycle varies by provider
- Inventory data normalization across different POS schemas
- Error handling standardization across 4 different API error formats

**Mitigation:**
- Define the `POSAdapter` TypeScript interface first; validate it against all 4 APIs before coding
- Implement adapters sequentially (Square first as reference), not in parallel
- Build adapter-specific integration test suites with recorded API responses
- Budget extra time for OAuth debugging (historically unpredictable)

---

### RISK-05: Stripe Webhook Reliability
**Epics:** 05, 09
**Probability:** Medium | **Impact:** High

Order finalization depends on Stripe webhooks arriving and being processed correctly. Webhook failures mean orders get stuck in limbo.

**Specific concerns:**
- Webhook delivery can be delayed or retried, causing duplicate processing
- Signature verification must work in all deployment environments (dev, preview, prod)
- Stripe test mode vs live mode behavior differences

**Mitigation:**
- Implement idempotency keys on all webhook handlers
- Use Stripe CLI for local webhook testing during development
- Build a webhook event log for debugging and replay
- Implement a reconciliation job that detects "stuck" orders

---

### RISK-06: Row-Level Security Policy Correctness
**Epics:** ALL
**Probability:** Medium | **Impact:** Critical

RLS is the primary security boundary. Incorrect policies could leak data between tenants or block legitimate access.

**Specific concerns:**
- Three different tenancy patterns (user-scoped, org-scoped, content-scoped) increase policy complexity
- Two-layer RLS in EPIC-09 (org + retailer isolation) is novel and complex
- Policy errors are silent — data simply doesn't appear, making debugging difficult
- Dual-access patterns (EPIC-05: both consumer and retailer can access orders) require careful policy design

**Mitigation:**
- Write RLS policies AND pgTAP tests for every table before building DAL functions
- Create negative test cases (cross-tenant access must fail) for every policy
- Establish a peer-review checklist for all RLS policy changes
- Test with multi-org seed data from day one

---

### RISK-07: Recommendation Engine Accuracy (EPIC-07)
**Epics:** 07
**Probability:** Medium | **Impact:** Medium

The curation engine's recommendation scoring formula determines what wines users see. Poor recommendations damage user trust.

**Specific concerns:**
- Scoring formula requires iterative tuning based on user behavior data
- Cold-start problem: new users have no taste profile data
- A/B testing infrastructure needed but not explicitly scoped
- Catalog sparsity: some regions may have few matching wines

**Mitigation:**
- Start with rules-based recommendations (V1) before any ML-based scoring
- Define fallback strategies for cold-start users (popular wines, editor picks)
- Track recommendation click-through rates from launch for future optimization
- Use PostHog feature flags and event funnels for A/B analysis of recommendation algorithms

---

### RISK-08: Order Lifecycle State Machine Consistency
**Epics:** 05, 06, 09
**Probability:** Medium | **Impact:** High

The order status state machine spans three epics. Inconsistent transitions could strand orders or confuse users.

**Specific concerns:**
- Multiple systems can update order status (Stripe webhooks, retailer actions, automated timeouts)
- Race conditions possible when multiple actors update simultaneously
- Status change notifications must fire reliably

**Mitigation:**
- Implement status transition validation at the database level (CHECK constraint or trigger)
- Define the complete state machine diagram before implementation
- Use `order_status_history` table for audit trail and debugging
- Test concurrent status update scenarios

---

## Medium Risks

### RISK-09: PostGIS Extension Availability
**Epics:** 06
**Probability:** Low | **Impact:** Medium

PostGIS is required for retailer proximity queries. Supabase supports PostGIS, but extension availability varies by plan.

**Mitigation:**
- Verify PostGIS availability on the target Supabase plan during project setup
- **RESOLVED (OQ-1):** Supabase Pro upgrade is planned before Phase 3 (Sprint 4), when PostGIS is first needed. PostGIS is included with Supabase Pro.
- Have a fallback plan using bounding-box queries if PostGIS is unavailable

---

### RISK-10: Materialized View Refresh Performance (EPIC-09)
**Epics:** 09
**Probability:** Medium | **Impact:** Medium

The `retailer_order_analytics` materialized view refreshes every 15 minutes via pg_cron. `REFRESH MATERIALIZED VIEW CONCURRENTLY` requires a unique index and holds locks briefly.

**Specific concerns:**
- Refresh may be slow with large order volumes
- `CONCURRENTLY` requires a unique index on the MV
- pg_cron availability and configuration on Supabase

**Mitigation:**
- Test refresh performance with realistic data volumes (10K+ orders)
- Ensure pg_cron is enabled on the Supabase plan (**RESOLVED (OQ-1):** pg_cron is included with Supabase Pro, which will be active before Phase 5 when EPIC-09 begins)
- Monitor refresh duration and alert if exceeding thresholds

---

### RISK-11: Web Share API Browser Support (EPIC-08)
**Epics:** 08
**Probability:** Low | **Impact:** Low

Web Share API is not universally supported. Desktop browsers have limited support.

**Mitigation:**
- Implement feature detection with graceful fallback to clipboard copy
- Test across Chrome, Safari, Firefox (mobile and desktop)

---

### RISK-12: Open Graph Image Generation Performance (EPIC-08)
**Epics:** 08
**Probability:** Medium | **Impact:** Low

Dynamic OG image generation for wine shares may be slow, affecting link preview quality.

**Mitigation:**
- Use Vercel OG (`@vercel/og`) for edge-optimized image generation
- Cache generated images by wine ID
- Pre-generate OG images for popular wines

---

### RISK-13: Username Uniqueness at Scale (EPIC-08)
**Epics:** 08
**Probability:** Low | **Impact:** Medium

Case-insensitive username uniqueness requires careful handling. `"JohnDoe"` and `"johndoe"` must be treated as the same username.

**Mitigation:**
- Use `LOWER()` in the unique index: `CREATE UNIQUE INDEX ON profiles (LOWER(username))`
- Validate usernames at the Zod schema level (alphanumeric + hyphens, 3-30 chars)
- Reserve common usernames (admin, support, help, etc.)

---

### RISK-14: Follow Count Denormalization Drift (EPIC-08)
**Epics:** 08
**Probability:** Medium | **Impact:** Medium

`following_count` and `followers_count` on the profiles table must stay in sync with the `follows` table. Application-level sync is fragile.

**Mitigation:**
- Use PostgreSQL triggers (not application logic) for count updates
- Include a reconciliation query that can detect and fix drift
- Test concurrent follow/unfollow scenarios

---

### RISK-15: POS Sync Error Recovery
**Epics:** 06, 09
**Probability:** High | **Impact:** Medium

POS sync failures (network errors, API rate limits, data validation errors) are inevitable. Users need clear feedback and recovery options.

**Mitigation:**
- Implement `retailer_sync_logs` table for audit trail and error diagnostics
- Design retry strategy with exponential backoff
- Build sync status dashboard in EPIC-09 showing last successful sync, error count, retry schedule
- CSV fallback for retailers whose POS API is unreliable

---

## Low Risks

### RISK-16: Multi-Currency Support (Future)
**Epics:** 05, 09
**Probability:** Low | **Impact:** Low (for V1)

Current design assumes single currency (USD). Multi-currency would require significant schema changes.

**Mitigation:**
- Store amounts in cents with explicit currency code column (future-proofing)
- Don't hardcode currency formatting in UI components
- Document as a known limitation for V1

---

### RISK-17: Caching Invalidation Complexity (EPIC-07)
**Epics:** 07
**Probability:** Medium | **Impact:** Low

Curator edits must invalidate cached collection renders. Event-driven invalidation adds complexity.

**Mitigation:**
- Use Next.js `revalidateTag()` for targeted cache invalidation
- Tag cached collections by collection ID for granular invalidation
- Monitor cache hit rates after launch

---

## Open Questions — All Resolved

| # | Question | Status | Resolution |
|---|----------|--------|------------|
| OQ-1 | What Supabase plan is the production deployment targeting? | ✅ RESOLVED | Free tier during dev; upgrade to Supabase Pro before Phase 3 (Sprint 4) when PostGIS and pg_cron are needed. |
| OQ-2 | Are all 4 POS integrations required for launch? | ✅ RESOLVED | Yes — all 4 POS adapters (Square, Lightspeed, Shopify, Clover) + CSV fallback required at launch. EPIC-06 stays at 72 points. |
| OQ-3 | What is the expected wine catalog size at launch? | ✅ RESOLVED | ≤50K wines at launch. Postgres full-text search (tsvector) is sufficient; no external search engine needed. |
| OQ-4 | Should recommendation_events be stored in Supabase or a separate analytics pipeline? | ✅ RESOLVED | PostHog Cloud free tier (1M events/month, unlimited seats, no credit card). Lightweight `user_wine_dismissals` table stays in Supabase for synchronous engine exclusion queries. EPIC-07 reduced from 61→57 points. |
| OQ-5 | What email sender domain will be used for Resend? | ✅ RESOLVED | crumarket.com domain purchased via Hostinger. DNS verification for Resend will use this domain. |
| OQ-6 | Is Apple Sign-In required for V1 launch? | ✅ RESOLVED | Deferred post-launch. V1 ships with Google OAuth + email/password only. EPIC-01 unchanged. |

---

## Risk Summary by Epic

| Epic | Blocking | High | Medium | Low |
|------|----------|------|--------|-----|
| EPIC-01 | RISK-03 | — | — | — |
| EPIC-02 | RISK-02 | — | — | — |
| EPIC-03 | — | — | — | — |
| EPIC-04 | RISK-01, RISK-02 | — | — | — |
| EPIC-05 | — | RISK-05, RISK-08 | — | RISK-16 |
| EPIC-06 | — | RISK-04, RISK-06 | RISK-09, RISK-15 | — |
| EPIC-07 | — | RISK-07 | — | RISK-17 |
| EPIC-08 | — | — | RISK-11, RISK-13, RISK-14 | RISK-12 |
| EPIC-09 | — | RISK-06 | RISK-10 | RISK-16 |
| ALL | RISK-03 | RISK-06 | — | — |
