# Phase 3 Handoff — Next Backend Epic(s) Planning

> **Created**: 2026-03-08
> **Previous Phase**: QA Review & Fixes for EPIC-06 (PR #11 merged)
> **Current Branch**: `main` (up to date)

---

## Process Instructions (Mandatory)

These rules govern all implementation work going forward:

1. **Work on ONE task at a time, sequentially** — never parallelize feature work
2. **Delegate to specialized agents whenever possible** — use subagent types (`sr-backend`, `fullstack-1`, `qa`, etc.) to avoid filling the main context window
3. **Load context incrementally** — never load all docs at once (~17,500 lines total). Use `.claude/CONTEXT_GUIDE.md` and Tables of Contents to determine required reading per phase
4. **Subagents load their own context** — pass brief summaries and file paths, not full document contents
5. **Add pertinent lines of code to reference doc for all tasked issues** so you don't have to read each file in its entirety
6. **Avoid compacting unless absolutely necessary** — preemptively compact when assessing that a write command may cause compaction partway through

---

## Backend Completion Status

### Epics with Backend DONE

| Epic | PRD RICE | PR(s) | Stories Completed | Notes |
|------|----------|-------|-------------------|-------|
| EPIC-01: User Accounts | 10,000 | PR #2 | 01/01, 01/03, 01/04, 01/11 | Stories 01/02, 01/05 BLOCKED by EPIC-02/STORY-01 (wines table FK) |
| EPIC-02: Search & Browse | 7,500 | (in main) | Wine catalog schema, DAL, search, recent searches | Core schema + search infra done |
| EPIC-03: Taste Profile | 6,000 | (in main) | Migration, DAL, actions, summary engine | Backend complete |
| EPIC-04: Producer Storytelling | 6,000 | (in main) | Server actions, Medusa sync, wishlists, seed data | Backend complete; QA fixes applied |
| EPIC-06: Retailer Integration | 4,000 | PR #8, #10, #11 | All 13 stories | Backend complete; QA reviewed and fixed |

### Epics with Backend NOT STARTED

| Epic | PRD RICE | Source PRD | Dependency Notes |
|------|----------|------------|-----------------|
| EPIC-05: Order Placement | 5,400 | `docs/prds/prd-05-order-placement.md` | Depends on wines, retailers, inventory tables (all exist) |
| EPIC-07: Curation Engine | 6,000 | `docs/prds/prd-07-curation-engine.md` | Depends on taste profiles, wines, wishlists (all exist) |
| EPIC-08: Social Layer | 4,200 | `docs/prds/prd-08-social-layer.md` | Depends on user accounts, wines (exist) |
| EPIC-09: Retailer Dashboard | 27 | `docs/prds/prd-09-retailer-dashboard.md` | Depends on retailers, inventory, sync logs (all exist) |

### Blocked Stories from Completed Epics

| Story | Blocked By | Status |
|-------|-----------|--------|
| EPIC-01/STORY-02 | EPIC-02/STORY-01 (wines table FK dependency) | Now UNBLOCKED — wines table exists in migration `20260308000002` |
| EPIC-01/STORY-05 | EPIC-02/STORY-01 (wines table FK dependency) | Now UNBLOCKED — wines table exists in migration `20260308000002` |

---

## Existing Database Schema (Migrations)

19 migration files exist in `supabase/migrations/`:

| Migration | What It Creates |
|-----------|----------------|
| `000001_create_profiles_and_preferences` | User profiles, preferences |
| `000002_add_deletion_columns` | Soft-delete columns |
| `000003_fix_handle_new_user_nulls` | Auth trigger fix |
| `000001_create_organizations_memberships` | Orgs, memberships, invitations |
| `000002_create_producers_wines_catalog` | Producers, wines, vintages, reviews |
| `000003_create_recent_searches` | Recent searches with FIFO |
| `000004_create_taste_profiles` | Taste profile questionnaire + results |
| `000005_fix_rls_policies` | RLS policy corrections |
| `000006_add_missing_columns_and_triggers` | Schema gap fills |
| `000007_add_fk_indexes_and_delete_rls` | Performance indexes, delete policies |
| `000008_create_wishlists` | Wishlists + wishlist items |
| `000009_wine_sync_webhook_trigger` | Medusa webhook sync trigger |
| `000010_create_retailers` | Retailer profiles + onboarding |
| `000011_create_retailer_inventory` | Inventory items + import batches |
| `000012_create_retailer_sync_logs` | Sync logging + alerting |
| `000013_create_wine_match_queue` | Match queue + results |
| `100001_add_wine_matching_functions` | SQL matching functions |
| `100002_extend_sync_log_check_constraints` | Constraint hardening |

## Existing DAL / Actions / Services

**DAL** (`lib/dal/`): `inventory`, `preferences`, `producers`, `retailers`, `search`, `taste-profiles`, `types`, `users`, `wine-matching`, `wines`, `wishlists`

**Actions** (`lib/actions/`): `account`, `auth`, `csv-import`, `pos-sync`, `preferences`, `producers`, `retailer-onboarding`, `search`, `taste-profile`, `wine-matching`, `wines`, `wishlists`

**Services** (`lib/services/`): `sync-alerter`, `sync-orchestrator`, `wine-matcher`

---

## Recommended Next Epic(s) — RICE Priority Order

### Priority 1: EPIC-01 Blocked Stories (Quick Win)

Stories 01/02 and 01/05 were blocked by the wines table FK dependency. The wines table now exists (`20260308000002`), so these stories are **unblocked and ready**. Completing them finishes EPIC-01 entirely.

- **Read**: `.claude/work-plan/stories/epic-01/` — find stories 02 and 05
- **Effort**: Small — the FK dependency is resolved, likely just migrations + DAL additions
- **Impact**: Closes out the highest-RICE epic (10,000)

### Priority 2: EPIC-05 — Order Placement (RICE 5,400)

Next highest-RICE epic with all dependencies met (wines, retailers, inventory tables all exist). This is the core e-commerce transaction flow.

- **Read**: `.claude/work-plan/epics/epic-05-order-placement.md` for story index
- **Architecture ref**: `docs/architecture/MODULE_ECOMMERCE.md` (order/checkout sections)
- **Dependencies**: All satisfied — wines, retailers, inventory schemas exist

### Priority 3: EPIC-07 — Curation Engine (RICE 6,000)

Higher RICE than EPIC-05 but likely more complex (AI/ML components). Dependencies met: taste profiles, wines, wishlists all exist.

- **Read**: `.claude/work-plan/epics/epic-07-curation-engine.md` for story index
- **Architecture ref**: `docs/architecture/MODULE_INTEGRATIONS.md` (curation sections)
- **Dependencies**: All satisfied — taste profiles, wines, wishlists exist

### Priority 4: EPIC-08 — Social Layer (RICE 4,200)

Lower priority. Dependencies met but less critical for MVP.

### Priority 5: EPIC-09 — Retailer Dashboard (RICE 27)

Lowest RICE but strategically mandatory. All dependencies met (retailers, inventory, sync logs). Could be deferred to later.

---

## How to Start

1. **Read this document** for full context on what exists
2. **Consult** `.claude/CONTEXT_GUIDE.md` Phase 3 section for which docs to load
3. **Pick the next epic** (recommend: EPIC-01 blocked stories first, then EPIC-05)
4. **Open the epic file** from `.claude/work-plan/epics/` → find Story Index → open individual story files one at a time
5. **Delegate to `sr-backend`** agent for migration/DAL/action work, passing:
   - The story file path
   - A brief summary of existing schema (reference the migration table above)
   - The process instructions from this document
6. **After each story**: commit, verify, mark complete in story file
7. **After each epic**: QA review, PR, merge to main

---

## Key File Paths Quick Reference

| Resource | Path |
|----------|------|
| Context Guide | `.claude/CONTEXT_GUIDE.md` |
| Project Map | `.claude/PROJECT_MAP.md` |
| Epic Files | `.claude/work-plan/epics/epic-NN-*.md` |
| Story Files | `.claude/work-plan/stories/epic-NN/story-NN-*.md` |
| Migrations | `supabase/migrations/` |
| DAL Functions | `lib/dal/` |
| Server Actions | `lib/actions/` |
| Migration Rules | `.claude/rules/supabase-migrations.md` |
| Action Rules | `.claude/rules/server-actions.md` |
| Testing Rules | `.claude/rules/testing.md` |
