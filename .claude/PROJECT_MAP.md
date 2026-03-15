# Project Map

> **Single source of truth for all project resource locations.**
> All agents MUST read this file at the start of every task instead of hardcoding paths.
> When the filesystem changes, update THIS file — not individual agent definitions.
>
> Last updated: 2026-03-14

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

## Design System

| Resource | Path | ~Lines | Description |
|----------|------|--------|-------------|
| UX Design Bible | `docs/design/UX_DESIGN_BIBLE.md` | 2575 | Complete design system: colors, typography, components, page specs, interactions, accessibility, tokens |

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
| PRD-10: Commerce Flow & Cart UX | `docs/prds/prd-10-commerce-flow.md` | 279 | 4,800 |
| PRD-11: Order Tracking & Post-Purchase | `docs/prds/prd-11-order-tracking.md` | 237 | 4,800 |
| PRD-12: Discovery & Proximity | `docs/prds/prd-12-discovery-proximity.md` | 237 | 7,200 |

## PRDs (P1 — Post-Launch Polish)

| Resource | Path | ~Lines | RICE |
|----------|------|--------|------|
| PRD-13: Motion Library Adoption | `docs/prds/prd-13-motion-library-adoption.md` | 170 | — |

## Competitive Research

| Resource | Path | ~Lines | Description |
|----------|------|--------|-------------|
| Competitive Summary | `docs/competitive-research/COMPETITIVE_SUMMARY.md` | 168 | Executive summary of competitive landscape |
| Competitive Matrix | `docs/competitive-research/COMPETITIVE_MATRIX.md` | 274 | Feature-by-feature comparison grid |
| Analysis Index | `docs/competitive-research/COMPETITIVE_ANALYSIS_INDEX.md` | 191 | Index of all competitive research |
| Full Analysis (2025-2026) | `docs/competitive-research/wine_competitive_analysis_2025_2026.md` | 1093 | Comprehensive market analysis |
| Local Marketplace UX (PM) | `docs/competitive-research/local-marketplace-ux-analysis.md` | ~500 | PM analysis of Uber Eats/Grubhub patterns |
| Local Marketplace UX (UX) | `docs/competitive-research/LOCAL_MARKETPLACE_UX_DESIGN.md` | ~250 | UX design lens on delivery marketplace patterns |
| Local Marketplace UX (Eng) | `docs/competitive-research/LOCAL_MARKETPLACE_UX_ENGINEERING.md` | ~720 | Engineering analysis of marketplace implementations |

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
| Mock Data Registry | `.claude/MOCK_DATA_REGISTRY.md` | All placeholder/mock data that must be replaced with real DAL queries before production |

## Work Plan (Checkpoint 2 Output)

| Resource | Path | Description |
|----------|------|-------------|
| Work Plan README | `.claude/work-plan/README.md` | Directory structure and conventions |
| Epic Template | `.claude/work-plan/templates/epic-template.md` | Standard format for Jira Epics |
| Story Template | `.claude/work-plan/templates/story-template.md` | Standard format for Developer Stories |
| Epics Directory | `.claude/work-plan/epics/` | Epic summary files with Developer Stories reference tables (no inline story content) |
| Story Files | `.claude/work-plan/stories/epic-XX/story-XX-slug.md` | Individual developer story files (95 total across 9 epics). Find via Story Index table in parent epic file |
| Analysis Directory | `.claude/work-plan/analysis/` | Architecture review, risks, cross-cutting concerns, implementation sequence |
| Epic 05c Type Safety | `.claude/work-plan/epics/epic-05c-type-safety-fixes.md` | Pre-existing TS errors + build workaround cleanup |
| EPIC-10 Commerce Flow | `.claude/work-plan/epics/EPIC-10-commerce-hub-discovery.md` | Commerce Hub, cart UX, availability on cards, buy flow |
| EPIC-11 Order Tracking | `.claude/work-plan/epics/EPIC-11-order-tracking.md` | Tracking screen, real-time updates, notifications, taste feedback |
| EPIC-12 Discovery & Proximity | `.claude/work-plan/epics/EPIC-12-discovery-proximity.md` | PostGIS, geolocation, producer browse, discovery loops |
| EPIC-13 Motion Library Adoption | `.claude/work-plan/epics/EPIC-13-motion-library-adoption.md` | Platform-wide animation enhancement with Motion library |
| EPIC-14 DAL & Auth Wiring | `.claude/work-plan/epics/EPIC-14-dal-auth-wiring.md` | Replace all mock/placeholder data with real DAL queries, wire auth flows end-to-end |
| Architecture Review (10-12) | `.claude/work-plan/reviews/architecture-review-prd-10-12.md` | Architect approval + conditions for PRD-10/11/12 |
| Engineering Review (10-12) | `.claude/work-plan/reviews/engineering-review-prd-10-12.md` | FE Lead feasibility + estimates for PRD-10/11/12 |
| UX Review (10-12) | `.claude/work-plan/reviews/ux-review-prd-10-12.md` | UX Lead refinements + wireframes for PRD-10/11/12 |
| Copy Deck (Commerce/Track/Disc) | `.claude/work-plan/copy/commerce-tracking-discovery-copy.md` | All user-facing strings for PRD-10/11/12 |

## Scripts

| Resource | Path | Description |
|----------|------|-------------|
| Prototype Starter | `scripts/start-prototype.sh` | Local dev environment bootstrap |
| Map Updater | `.claude/scripts/update-project-map.sh` | Regenerates the inventory sections of this file |

---

## Monorepo Infrastructure

| Resource | Path | Description |
|----------|------|-------------|
| Root Workspace | `package.json` | pnpm workspace root, turbo scripts |
| Workspace Config | `pnpm-workspace.yaml` | apps/* + packages/* workspaces |
| Turbo Pipeline | `turbo.json` | build, lint, typecheck, dev, test tasks |
| Shared TS Config | `packages/config/tsconfig/` | base.json + nextjs.json |
| Shared ESLint | `packages/config/eslint/next.js` | Next.js ESLint config |
| Shared Tailwind | `packages/config/tailwind/base.ts` | Brand colors, fonts |
| Shared Constants | `packages/shared/src/` | TAX_RATE, HOLD_TTL_MINUTES |
| UI Library | `packages/ui/src/` | Scaffold — components extracted when needed |
| Web App | `apps/web/` | Next.js 15 app (moved from root) |
| Vercel Config | `vercel.json` | Build command, output dir, crons |

## Codebase Conventions (Structural — Not File Lookups)

> These are **architectural patterns**, not resource locations. They define where code
> should be *written*, not where documents live. These belong in agent definitions
> and CLAUDE.md, not in this map.
>
> **Note:** All app source code now lives under `apps/web/`. The `@/` import alias
> resolves within `apps/web/` via tsconfig paths.

| Convention | Path Pattern | Governed By |
|------------|-------------|-------------|
| Migrations | `supabase/migrations/` | `.claude/rules/supabase-migrations.md` |
| RLS Tests | `supabase/tests/` | `.claude/rules/testing.md` |
| Data Access Layer | `apps/web/lib/dal/` | `.claude/rules/server-actions.md` |
| Server Actions | `apps/web/lib/actions/` | `.claude/rules/server-actions.md` |
| Validation Schemas | `apps/web/lib/validations/` | `.claude/rules/server-actions.md` |
| Supabase Clients | `apps/web/lib/supabase/` | `CLAUDE.md` |
| Stripe Helpers | `apps/web/lib/stripe/` | `CLAUDE.md` |
| Medusa Client | `apps/web/lib/medusa/` | `CLAUDE.md` |
| UI Primitives | `apps/web/components/ui/` | `.claude/rules/components.md` |
| Feature Components | `apps/web/components/features/` | `.claude/rules/components.md` |
| Org-Scoped Routes | `apps/web/app/(app)/[orgSlug]/` | `CLAUDE.md` |
| Auth Routes | `apps/web/app/(auth)/` | `CLAUDE.md` |
| API / Webhooks | `apps/web/app/api/` | `.claude/rules/api-routes.md` |
| Generated Types | `apps/web/types/database.ts` | `CLAUDE.md` |
