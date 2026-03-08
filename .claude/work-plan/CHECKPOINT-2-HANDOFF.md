# Checkpoint 2 Handoff — Backend Implementation Phase

**Status:** Checkpoint 2 APPROVED (2026-03-07)
**Next Phase:** Checkpoint 3 — Backend Implementation (Phase 1: EPIC-01)

---

## What Was Decided

### Checkpoint 2 Scope
- 9 PRDs decomposed into 9 Epics, 95 Developer Stories, 461 story points
- 6-phase implementation sequence across ~10 sprints (~20 weeks)
- All Open Questions resolved, all analysis docs finalized

### Resolved Open Questions

| OQ | Question | Decision | Impact |
|----|----------|----------|--------|
| OQ-1 | Supabase tier | Free during dev; upgrade to **Pro before Phase 3** (Sprint 4) for PostGIS + pg_cron | EPIC-06 needs PostGIS for proximity search |
| OQ-2 | POS adapters at launch | All **4 adapters** (Square, Lightspeed, Shopify, Clover) + CSV at launch | EPIC-06 stays at 72 points |
| OQ-3 | Wine catalog scale | **≤50K wines** at launch; Postgres FTS (`tsvector`) sufficient, no Typesense needed | EPIC-02 search approach confirmed |
| OQ-4 | Recommendation analytics | **PostHog Cloud free tier** (1M events/month); `user_wine_dismissals` stays in Supabase | EPIC-07 reduced from 61 to 57 points |
| OQ-5 | Email domain | **crumarket.com** (Hostinger) for Resend DNS verification | Transactional email ready |
| OQ-6 | Apple Sign-In | **Deferred post-launch**; V1 = Google OAuth + email/password only | Simplifies EPIC-01 auth setup |

### PostHog Integration Pattern (OQ-4)
- **PostHog Cloud free tier**: 1M events/month, no self-hosting
- **Dual tracking**: PostHog for analytics (impressions, clicks, dismissals) + `user_wine_dismissals` in Supabase for recommendation engine exclusion
- **Fire-and-forget**: `posthog.capture()` failures never block user actions
- **Server Action pattern**: Dismiss action writes to Supabase (source of truth) AND fires PostHog event (analytics)
- **No `recommendation_events` table** — PostHog replaces it entirely

---

## Project Scope Summary

| Epic | Title | Stories | Points | Phase |
|------|-------|---------|--------|-------|
| EPIC-01 | User Accounts & Preferences | 11 | 46 | 1 (Sprint 1-2) |
| EPIC-02 | Search & Browse | 10 | 46 | 2 (Sprint 2-4) |
| EPIC-03 | Taste Profile Onboarding | 9 | 40 | 3 (Sprint 4-7) |
| EPIC-04 | Producer Storytelling | 9 | 55 | 2 (Sprint 2-4) |
| EPIC-05 | Order Placement | 11 | 66 | 3 (Sprint 4-7) |
| EPIC-06 | Retailer Integration | 13 | 72 | 3 (Sprint 4-7) |
| EPIC-07 | AI + Human Curation Engine | 11 | 57 | 4 (Sprint 7-8) |
| EPIC-08 | Social/Community Layer | 10 | 37 | 5 (Sprint 8-9) |
| EPIC-09 | Retailer Dashboard | 11 | 45 | 6 (Sprint 9-10) |
| **TOTAL** | | **95** | **461** | **~10 sprints** |

### Critical Path
```
EPIC-01 → EPIC-04 → EPIC-05 → EPIC-06 → EPIC-09
```
EPIC-04 Medusa sync pipeline is the biggest bottleneck — start early.

---

## Where to Start: Phase 1 — EPIC-01 (User Accounts)

**Sprint 1-2 | 11 stories | 46 points**

### Backend Stories (sr-backend agent, do these first)
1. **01/01** — Database Schema (3 pts) — `profiles`, `organizations`, `memberships` tables
2. **01/02** — Auth Configuration (5 pts) — Supabase Auth, Google OAuth, email/password
3. **01/03** — Profile DAL (3 pts) — `lib/dal/profiles.ts`
4. **01/04** — Org & Membership DAL (5 pts) — `lib/dal/organizations.ts`, `lib/dal/memberships.ts`
5. **01/05** — Server Actions (5 pts) — `lib/actions/profiles.ts`, `lib/actions/organizations.ts`
6. **01/06** — RLS Policies & Tests (5 pts) — pgTAP tests in `supabase/tests/`

### Frontend Stories (after backend gate)
7. **01/07** — Auth Pages (5 pts) — fullstack-2
8. **01/08** — Org Switcher & Settings (5 pts) — fullstack-1
9. **01/09** — Invitation Flow (5 pts) — fullstack-2

### Parallel
10. **01/10** — UX Design & Copy (3 pts) — ux-designer + marketing-writer
11. **01/11** — E2E Tests (2 pts) — qa

### Pattern for Every Epic
Within each epic, follow: **migrations → RLS → DAL → Server Actions → UI → Tests**

---

## Key Technical Patterns

### Three RLS Patterns
1. **User-scoped** (no `org_id`): `profiles`, `user_taste_profiles`, `user_wine_dismissals` — `auth.uid() = user_id`
2. **Org-scoped** (has `org_id`): Most tables — `org_id` matches user's membership
3. **Content-scoped** (`org_id` = platform org): `wines`, `producers` — readable by all authenticated users

### Two-Layer RLS (EPIC-09)
- `org_id` for platform tenancy + `retailer_id` for retailer-specific data isolation

### Medusa Sync Direction
- Wine/producer data flows **Supabase → Medusa** (one-directional)
- Orders are bidirectional via Stripe webhooks

### Backend-Before-Frontend Within Each Epic
- Migrations → RLS policies → DAL functions → Server Actions → UI components → Tests
- Backend gate: stories 01-06 in each epic must complete before frontend begins

---

## File Locations

### Epic Files (Source of Truth for Stories)

**Worktree path** (Epics 01-06):
```
.claude/worktrees/unruffled-clarke/.claude/work-plan/epics/
  epic-01-user-accounts.md
  epic-02-search-browse.md
  epic-03-taste-profile.md
  epic-04-producer-storytelling.md
  epic-05-order-placement.md
  epic-06-retailer-integration.md
```

**Main repo path** (Epics 07-09):
```
.claude/work-plan/epics/
  epic-07-curation-engine.md
  epic-08-social-layer.md
  epic-09-retailer-dashboard.md
```

### Analysis Documents
```
.claude/worktrees/unruffled-clarke/.claude/work-plan/analysis/
  architecture-review.md
  checkpoint-1-resolution.md
  cross-cutting-concerns.md      # 13 cross-cutting concerns
  implementation-sequence.md      # 6-phase plan, sprint timeline
  technical-risks.md              # 17 risks, all OQs resolved
```

### Key Project Files
| Resource | Path |
|----------|------|
| Project Map | `.claude/PROJECT_MAP.md` |
| Context Guide | `.claude/CONTEXT_GUIDE.md` |
| Agent Log | `.claude/agent-log.md` |
| Product Spec | `docs/product/cru-product-spec.md` |
| System Architecture | `docs/architecture/SYSTEM_ARCHITECTURE.md` |
| E-Commerce Module | `docs/architecture/MODULE_ECOMMERCE.md` |
| Integrations Module | `docs/architecture/MODULE_INTEGRATIONS.md` |

### Codebase Structure (Where Code Goes)
| Convention | Path |
|------------|------|
| Migrations | `supabase/migrations/` |
| RLS Tests | `supabase/tests/` |
| Data Access Layer | `lib/dal/` |
| Server Actions | `lib/actions/` |
| Validation Schemas | `lib/validations/` |
| Supabase Clients | `lib/supabase/` |
| Stripe Helpers | `lib/stripe/` |
| Medusa Client | `lib/medusa/` |
| UI Primitives | `components/ui/` |
| Feature Components | `components/features/` |
| Org-Scoped Routes | `app/(app)/[orgSlug]/` |
| Auth Routes | `app/(auth)/` |
| API / Webhooks | `app/api/` |
| Generated Types | `types/database.ts` |

---

## Technical Risks to Watch

### High Priority (Phase 1-2)
- **RISK-01**: Medusa.js v2 breaking changes — pin exact versions, test sync pipeline early
- **RISK-04**: Multi-tenant RLS complexity — pgTAP tests on every table, test cross-org isolation
- **RISK-06**: Supabase Auth SSO complexity — deferred (Google OAuth + email/password for V1)

### Medium Priority (Phase 3+)
- **RISK-02**: POS API instability — build `POSAdapter` interface first, Square as reference implementation
- **RISK-03**: PostGIS performance — needs Supabase Pro tier upgrade before Sprint 4
- **RISK-09**: Stripe webhook reliability — idempotent handlers, signature verification

### Full List
17 technical risks documented in `technical-risks.md` with mitigations.

---

## Cross-Cutting Concerns

13 concerns documented in `cross-cutting-concerns.md`. Key ones for backend phase:

1. **Multi-Tenant Data Isolation** — `org_id` on every table, RLS everywhere
2. **Authentication & Session Management** — `@supabase/ssr` for cookie-based sessions
3. **Permission Model** — Role-based: `owner > admin > member > viewer`
4. **Data Access Layer** — Centralized in `lib/dal/`, typed Supabase client
5. **Error Handling** — `{ data }` / `{ error: string }` pattern, never throw
6. **PostHog Analytics** — Fire-and-forget `capture()`, dual-tracking for dismissals
7. **Audit Logging** — `audit_logs` table, populated by Server Actions

---

## Agent Team Quick Reference

| Agent | Model | Primary Role |
|-------|-------|-------------|
| pm-orchestrator | opus | Leads execution, delegates, enforces checkpoints |
| architect | opus | Schema design, API contracts, architecture decisions |
| sr-backend | opus | SQL, RLS, DAL, Server Actions, Medusa modules |
| fullstack-1 | opus | Lead frontend, complex pages, reviews fullstack-2/3/4 |
| fullstack-2 | sonnet | Forms, validation, state, auth UI |
| fullstack-3 | sonnet | Integrations, Medusa, Stripe, POS adapters |
| fullstack-4 | sonnet | Data tables, dashboards, catalogs |
| ux-designer | opus | Component design, interaction patterns |
| marketing-writer | opus | All user-facing copy |
| devops | sonnet | CI/CD, migrations, deployment |
| qa | sonnet | Unit, integration, E2E, RLS, a11y tests |

---

## How to Begin the Next Session

1. **Read** `CLAUDE.md` + `.claude/CONTEXT_GUIDE.md` (context loading strategy)
2. **Read** this handoff document for full context
3. **Read** `epic-01-user-accounts.md` (worktree path) for detailed story specs
4. **Read** `docs/architecture/SYSTEM_ARCHITECTURE.md` for schema design reference
5. **Begin** with sr-backend agent on Story 01/01 (Database Schema)
6. **Follow** the execution flow: sr-backend → devops → Checkpoint 3 → frontend agents

### Checkpoint 3 Gate
Backend is "complete" when all backend stories across Phase 1 (EPIC-01 stories 01-06) are implemented, tested with pgTAP RLS tests, and the DAL + Server Actions layer is operational. Present status report for human approval before starting frontend work.
