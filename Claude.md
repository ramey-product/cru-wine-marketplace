# Project: Multi-Tenant B2B SaaS Platform

## Stack

- **Framework**: Next.js 15 (App Router) with React Server Components
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Commerce**: Medusa.js v2 (headless e-commerce engine)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Auth**: Supabase Auth (SSO/SAML 2.0, cookie-based sessions via `@supabase/ssr`)
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **Deployment**: Vercel (preview deploys per PR)
- **Monorepo**: Turborepo
- **Testing**: Vitest (unit/integration), Playwright (E2E), pgTAP (RLS), axe-core (a11y)

## Project Map — Single Source of Truth for File Locations

**All agents MUST read `.claude/PROJECT_MAP.md` at the start of every task** to resolve document and resource locations. Never hardcode file paths in agent logic — always look them up from the Project Map.

The Project Map contains the canonical paths for: Product & Strategy docs, Architecture docs, all PRDs, Competitive Research, Reference materials, Agent Infrastructure, Work Plan artifacts, and Scripts.

When the filesystem changes, update the Project Map (not individual agent definitions). Run `.claude/scripts/update-project-map.sh` to validate consistency.

## Core Patterns (All Agents Must Follow)

### Multi-Tenancy
- Every user-facing table has an `org_id UUID NOT NULL` column
- Every query goes through the Data Access Layer (`lib/dal/`) — never query Supabase directly from components
- RLS policies enforce tenant isolation; every table has RLS enabled
- All feature routes live under `app/(app)/[orgSlug]/`

### Data Access Layer
- DAL functions in `lib/dal/` are the ONLY way to read/write data
- Accept a typed Supabase client as the first argument
- Return the Supabase query builder result (let callers destructure `{ data, error }`)

### Server Actions
- All mutations go through Server Actions in `lib/actions/`
- Pattern: Zod validate → auth check → permission check → DAL call → revalidatePath
- Never trust client input — always re-validate on server

### Frontend
- Server Components by default; only `'use client'` when interactivity is needed
- Use Shadcn/ui primitives — don't build custom UI when a Shadcn component exists
- Types come from `types/database.ts` (auto-generated, never hand-edited)

### Security
- Service role key (`supabaseAdmin`) ONLY in webhooks and background jobs
- `NEXT_PUBLIC_` prefix ONLY for client-safe values
- Always verify webhook signatures before processing

## Agent Team

This project uses a coordinated agent team. The **pm-orchestrator** leads execution.

### Agents (`.claude/agents/`)

| Agent | Model | Domain |
|-------|-------|--------|
| `pm-orchestrator` | opus | Task decomposition, delegation, checkpoint enforcement |
| `architect` | opus | Schema design, API contracts, architecture decisions |
| `sr-backend` | opus | SQL, RLS, DAL, Server Actions, Medusa modules |
| `fullstack-1` | opus | **Lead Full Stack Dev** — complex features, code review of fullstack-2/3 |
| `fullstack-2` | sonnet | Forms, validation, state, real-time |
| `fullstack-3` | sonnet | Integrations, webhooks, Stripe, Medusa storefront |
| `fullstack-4` | sonnet | Data tables, dashboards, product catalogs, analytics views, commerce UI |
| `marketing-writer` | opus | **Brand Voice Lead** — all user-facing copy, microcopy, terminology, onboarding text |
| `ux-designer` | opus | **UX/UI Design Lead** — intuitive, elegant UX; design system governance |
| `devops` | sonnet | CI/CD, migrations, deployment, env config |
| `qa` | sonnet | Unit, integration, E2E, RLS, accessibility tests |

### Execution Flow

```
Feature Request → pm-orchestrator
  → architect (schema + API design, architecture decision records)
  → CHECKPOINT 1: Architecture Review (human approval)
  → pm-orchestrator + architect (collaborative work decomposition)
      - Review all PRDs against approved architecture
      - Decompose each PRD into Jira Epics
      - Break Epics into granular Developer Stories with:
          • Clear acceptance criteria (Given/When/Then)
          • Affected files and modules
          • Dependencies and blocked-by relationships
          • Story point estimates (relative sizing)
          • Agent assignment recommendation (which agent owns each story)
          • Testing requirements per story
      - Identify cross-cutting concerns spanning multiple epics
      - Flag technical risks, open questions, and assumptions
      - Produce a suggested implementation sequence (epic ordering)
      - Output: Work Plan directory (see Project Map) with epic + story markdown files
  → CHECKPOINT 2: Work Plan Review (human approval of all epics & stories)
  → sr-backend (migrations, RLS, DAL, Actions)
  → devops (migration scripts, env config)
  → CHECKPOINT 3: Backend Complete (human approval)
  → ux-designer (component design)
  → marketing-writer (all user-facing copy — consulted before frontend build)
  → fullstack-1 (Lead, complex tasks) + fullstack-2 + fullstack-3 + fullstack-4 (parallel build)
  → fullstack-1 reviews code from fullstack-2, fullstack-3, and fullstack-4
  → CHECKPOINT 4: Frontend Complete (human approval, all code review-approved)
  → qa (tests across all layers)
  → CHECKPOINT 5: QA & Polish (human approval)
```

### Checkpoint Rules
- Agents work autonomously between checkpoints
- The pm-orchestrator MUST pause at each checkpoint and present a status report
- Human must explicitly approve before the next phase begins
- No development work begins until Checkpoint 2 (Work Plan Review) is approved
- Status is tracked in the Agent Log (see **Agent Infrastructure** in Project Map)
- Work plan artifacts are tracked in the Work Plan directory (see **Work Plan** in Project Map)

## File Structure Convention

```
apps/web/
├── app/
│   ├── (app)/[orgSlug]/     # Authenticated org-scoped routes
│   ├── (auth)/               # Login, signup, SSO
│   └── api/                  # Route Handlers (webhooks, public API)
├── components/
│   ├── ui/                   # Shadcn/ui primitives
│   └── features/             # Feature-specific components
├── lib/
│   ├── dal/                  # Data Access Layer
│   ├── actions/              # Server Actions
│   ├── validations/          # Zod schemas
│   ├── supabase/             # Client factories (server.ts, client.ts, admin.ts)
│   ├── stripe/               # Stripe client + helpers
│   ├── medusa/               # Medusa.js client + queries
│   └── integrations/         # Third-party service wrappers
├── types/
│   └── database.ts           # Auto-generated (supabase gen types)
supabase/
├── migrations/               # SQL migrations (immutable once applied)
├── seed.sql                  # Dev seed data
└── tests/                    # pgTAP RLS tests
```

## Code Quality

- TypeScript strict mode everywhere
- Zod schemas are the single source of truth for validation
- Generated types from `supabase gen types` — never hand-edit `database.ts`
- Migrations are immutable — never edit existing migration files
- All new pages need loading.tsx, error.tsx, and accessibility checks
