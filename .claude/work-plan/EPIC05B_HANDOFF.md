# Epic 05b Handoff — Turborepo Monorepo Infrastructure

> **Created**: 2026-03-12
> **Previous**: EPIC-05 Order Placement backend committed on `epic-05/order-placement`
> **Branch**: Create `epic-05b/monorepo-infra` off `main` (after EPIC-05 PR merges)
> **Epic File**: `.claude/work-plan/epics/epic-05b-monorepo-infrastructure.md`

---

## Why This Epic Exists

The codebase has **zero infrastructure files**: no `package.json`, no `tsconfig.json`, no `node_modules`, no `next.config`. All source lives flat at the repo root instead of inside `apps/web/` as `docs/architecture/SYSTEM_ARCHITECTURE.md` (lines 85-153) specifies. This blocks:
- Type checking (`tsc --noEmit` cannot run)
- Building (`next build` cannot run)
- Local development (`next dev` cannot run)
- Installing any dependency (`stripe`, `zod`, `@supabase/ssr`, etc.)
- Adding future apps (mobile, admin portal)

## Process Instructions

1. **Work stories sequentially**: 1 → 2 → 3 → 4 → 5
2. **Delegate to `devops`** for Stories 1-4
3. **Delegate to `qa`** for verification in Story 5
4. **Story 3 is the critical path** — moving files with `git mv` must preserve history
5. **After all stories**: verify, commit, PR to main

---

## Scope: 5 Stories, 22 Points

| # | Story | Points | Agent | Description |
|---|-------|--------|-------|-------------|
| 01 | Root workspace scaffolding | 3 | devops | `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`, `.env.example`, `.npmrc` |
| 02 | Shared configs package | 3 | devops | `packages/config/` — tsconfig, eslint, tailwind, postcss |
| 03 | Move source into `apps/web/` | 8 | devops | `git mv` app/lib/components/types → `apps/web/`, create web package.json/tsconfig/next.config |
| 04 | Shared + UI package scaffolds | 3 | devops | `packages/shared/` and `packages/ui/` minimal scaffolds |
| 05 | Install, verify, fix | 5 | devops + qa | `pnpm install`, `turbo typecheck`, `turbo build`, fix errors |

---

## Target Structure

```
/
├── apps/
│   └── web/                    # Next.js 15 app (moved from root)
│       ├── app/                # ← git mv from root app/
│       ├── lib/                # ← git mv from root lib/
│       ├── components/         # ← git mv from root components/
│       ├── types/              # ← git mv from root types/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.mjs
│       ├── tailwind.config.ts
│       └── postcss.config.mjs
├── packages/
│   ├── config/                 # Shared tsconfig, eslint, tailwind
│   ├── shared/                 # Shared constants, types
│   └── ui/                     # Shared component library (scaffold)
├── supabase/                   # Stays at root (CLI requirement)
│   ├── migrations/
│   └── functions/
├── .claude/                    # Stays at root
├── docs/                       # Stays at root
├── package.json                # Root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── vercel.json                 # Stays at root
├── .gitignore
├── .env.example
└── .npmrc
```

## Package Manager: pnpm

Install pnpm if not available: `npm install -g pnpm`

## External Dependencies (from actual code imports)

**Production:**
- `next` (^15.0.0)
- `react`, `react-dom` (^19.0.0)
- `@supabase/ssr` (^0.5.0)
- `@supabase/supabase-js` (^2.45.0)
- `stripe` (^17.0.0)
- `zod` (^3.23.0)

**Dev:**
- `typescript` (^5.6.0)
- `@types/node`, `@types/react`, `@types/react-dom`
- `vitest` (^2.0.0)
- `eslint`, `eslint-config-next`
- `tailwindcss` (^3.4.0), `postcss`, `autoprefixer`
- `turbo` (^2.0.0)

## Critical Constraints

1. **`@/` imports must not break** — `tsconfig.json` paths alias `@/*` → `./*` inside `apps/web/`
2. **`supabase/` stays at root** — Supabase CLI expects `supabase/migrations/` relative to project root
3. **`git mv` preserves history** — do NOT copy+delete; use `git mv` for all file moves
4. **`.claude/` stays at root** — agent configs, work plans, rules
5. **Empty `apps/web/` subdirs must be removed first** — they conflict with `git mv`

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Medusa (optional for V1)
MEDUSA_BACKEND_URL=http://localhost:9000
MEDUSA_API_KEY=your_medusa_api_key
```

## How to Start

1. Merge EPIC-05 PR first
2. `git checkout main && git pull`
3. `git checkout -b epic-05b/monorepo-infra`
4. Read Story 1 from the epic file
5. Delegate to `devops`

## Story File Path

All stories are in the epic file: `.claude/work-plan/epics/epic-05b-monorepo-infrastructure.md`

## Verification Checklist

- [ ] `pnpm install` — zero errors
- [ ] `pnpm turbo typecheck` — passes
- [ ] `pnpm turbo build` — runs without dep errors
- [ ] `pnpm turbo test` — vitest runs
- [ ] `git log --follow apps/web/lib/dal/orders.ts` — history preserved
- [ ] All `@/` imports resolve in `apps/web/`
- [ ] `supabase/migrations/` accessible from root
- [ ] `.claude/` untouched at root
