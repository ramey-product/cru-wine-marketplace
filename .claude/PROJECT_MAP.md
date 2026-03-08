# Project Map

> **Single source of truth for all project resource locations.**
> All agents MUST read this file at the start of every task instead of hardcoding paths.
> When the filesystem changes, update THIS file — not individual agent definitions.
>
> Last updated: 2026-03-07

---

## How Agents Use This File

1. Every agent reads `PROJECT_MAP.md` at task start to resolve resource locations
2. Agents reference resources by their **map key** (e.g., "product spec"), not by path
3. When files move, only this map is updated — agent definitions remain untouched
4. The `update-project-map.sh` script can regenerate the inventory sections automatically

---

## Product & Strategy

| Resource | Path | ~Lines | Description |
|----------|------|--------|-------------|
| Product Spec | `docs/product/cru-product-spec.md` | 310 | Product vision, target users, core value proposition, feature overview |
| Development Roadmap | `docs/product/cru-product-development-roadmap.md` | 326 | Development phases, milestone targets, release planning |

## Architecture

| Resource | Path | ~Lines | Description |
|----------|------|--------|-------------|
| System Architecture | `docs/architecture/SYSTEM_ARCHITECTURE.md` | 1155 | Core platform: multi-tenancy, schema, auth, API layer, DAL, frontend, billing, deployment |
| E-Commerce Module | `docs/architecture/MODULE_ECOMMERCE.md` | 1531 | Wine marketplace: Medusa.js v2 modules, auctions, P2P trading, delivery |
| Integrations Module | `docs/architecture/MODULE_INTEGRATIONS.md` | 1719 | Third-party services: wine pricing, shipping, age verification, search |

## PRDs (P0 — Launch Critical)

| Resource | Path | ~Lines | RICE |
|----------|------|--------|------|
| PRD-01: User Accounts & Preferences | `docs/prds/prd-01-user-accounts.md` | 148 | 10,000 |
| PRD-02: Search & Browse | `docs/prds/prd-02-search-browse.md` | 160 | 7,500 |
| PRD-03: Taste Profile Onboarding | `docs/prds/prd-03-taste-profile.md` | 164 | 6,000 |
| PRD-04: Producer Storytelling | `docs/prds/prd-04-producer-storytelling.md` | 146 | 6,000 |
| PRD-05: Order Placement | `docs/prds/prd-05-order-placement.md` | 157 | 5,400 |
| PRD-06: Local Retailer Integration | `docs/prds/prd-06-retailer-integration.md` | 157 | 4,000 |
| PRD-07: AI + Human Curation Engine | `docs/prds/prd-07-curation-engine.md` | 170 | 6,000 |
| PRD-08: Social/Community Layer | `docs/prds/prd-08-social-layer.md` | 161 | 4,200 |
| PRD-09: Retailer Dashboard | `docs/prds/prd-09-retailer-dashboard.md` | 168 | 27 |

## Competitive Research

| Resource | Path | ~Lines | Description |
|----------|------|--------|-------------|
| Competitive Summary | `docs/competitive-research/COMPETITIVE_SUMMARY.md` | 168 | Executive summary of competitive landscape |
| Competitive Matrix | `docs/competitive-research/COMPETITIVE_MATRIX.md` | 274 | Feature-by-feature comparison grid |
| Analysis Index | `docs/competitive-research/COMPETITIVE_ANALYSIS_INDEX.md` | 191 | Index of all competitive research |
| Full Analysis (2025-2026) | `docs/competitive-research/wine_competitive_analysis_2025_2026.md` | 1093 | Comprehensive market analysis |

## Reference

| Resource | Path | Description |
|----------|------|-------------|
| Agent Team README | `docs/reference/AGENT_TEAM_README.md` | Agent team roles, responsibilities, coordination |
| Framework Comparison | `docs/reference/Modern_Web_Framework_Comparison_Guide.docx` | Next.js vs alternatives evaluation |

## Agent Infrastructure

| Resource | Path | Description |
|----------|------|-------------|
| Project Instructions | `CLAUDE.md` | Minimal essentials: stack, core patterns, context loading strategy |
| Context Guide | `.claude/CONTEXT_GUIDE.md` | **What to load per task phase** — prevents context overflow |
| Agent Definitions | `.claude/agents/` | Individual agent role definitions and instructions |
| Coding Rules | `.claude/rules/` | File-pattern-scoped coding standards (migrations, components, actions, tests, API routes) |
| Agent Log | `.claude/agent-log.md` | Running status log maintained by pm-orchestrator |
| Kickoff Prompt | `.claude/kickoff-prompt.md` | Pre-development planning prompt (Checkpoints 1-2) |
| Context Mgmt Rule | `.claude/rules/context-management.md` | Global rule: incremental loading, no bulk doc loading |

## Work Plan (Checkpoint 2 Output)

| Resource | Path | Description |
|----------|------|-------------|
| Work Plan README | `.claude/work-plan/README.md` | Directory structure and conventions |
| Epic Template | `.claude/work-plan/templates/epic-template.md` | Standard format for Jira Epics |
| Story Template | `.claude/work-plan/templates/story-template.md` | Standard format for Developer Stories |
| Epics Directory | `.claude/work-plan/epics/` | Epic summary files with Story Index tables; each epic has a `epic-XX/` subdirectory containing individual story files |
| Story Files | `.claude/work-plan/epics/epic-XX/story-XX-slug.md` | Individual developer story files (95 total across 9 epics). Find via Story Index table in parent epic file |
| Analysis Directory | `.claude/work-plan/analysis/` | Architecture review, risks, cross-cutting concerns, implementation sequence |

## Scripts

| Resource | Path | Description |
|----------|------|-------------|
| Prototype Starter | `scripts/start-prototype.sh` | Local dev environment bootstrap |
| Map Updater | `.claude/scripts/update-project-map.sh` | Regenerates the inventory sections of this file |

---

## Codebase Conventions (Structural — Not File Lookups)

> These are **architectural patterns**, not resource locations. They define where code
> should be *written*, not where documents live. These belong in agent definitions
> and CLAUDE.md, not in this map.

| Convention | Path Pattern | Governed By |
|------------|-------------|-------------|
| Migrations | `supabase/migrations/` | `.claude/rules/supabase-migrations.md` |
| RLS Tests | `supabase/tests/` | `.claude/rules/testing.md` |
| Data Access Layer | `lib/dal/` | `.claude/rules/server-actions.md` |
| Server Actions | `lib/actions/` | `.claude/rules/server-actions.md` |
| Validation Schemas | `lib/validations/` | `.claude/rules/server-actions.md` |
| Supabase Clients | `lib/supabase/` | `CLAUDE.md` |
| Stripe Helpers | `lib/stripe/` | `CLAUDE.md` |
| Medusa Client | `lib/medusa/` | `CLAUDE.md` |
| UI Primitives | `components/ui/` | `.claude/rules/components.md` |
| Feature Components | `components/features/` | `.claude/rules/components.md` |
| Org-Scoped Routes | `app/(app)/[orgSlug]/` | `CLAUDE.md` |
| Auth Routes | `app/(auth)/` | `CLAUDE.md` |
| API / Webhooks | `app/api/` | `.claude/rules/api-routes.md` |
| Generated Types | `types/database.ts` | `CLAUDE.md` |
