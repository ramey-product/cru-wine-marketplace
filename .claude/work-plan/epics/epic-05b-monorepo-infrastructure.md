# Epic 05b: Turborepo Monorepo Infrastructure

## Context

The codebase has **no `package.json`, `tsconfig.json`, `node_modules`, or `next.config`** anywhere. All source lives flat at the repo root instead of inside `apps/web/` as the system architecture specifies. Every new epic adds more unresolvable imports. This epic sets up the Turborepo monorepo with pnpm so we can type-check, build, and eventually add a mobile app.

## Package Manager: pnpm

## Total: 22 story points, 5 stories

---

### Story 1: Root Workspace Scaffolding (3 pts)

**Agent:** devops

Create the monorepo root config files.

**Files to create:**
- `package.json` — root workspace config, `"packageManager": "pnpm@9.x"`, scripts: `dev`, `build`, `lint`, `typecheck`, `test`
- `pnpm-workspace.yaml` — `packages: ["apps/*", "packages/*"]`
- `turbo.json` — pipeline for `build`, `lint`, `typecheck`, `dev`, `test`
- `.gitignore` — `node_modules/`, `.next/`, `.turbo/`, `.env.local`, `.env`, `dist/`
- `.env.example` — all env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `MEDUSA_BACKEND_URL`, `MEDUSA_API_KEY`
- `.npmrc` — `shamefully-hoist=true` (needed for Next.js compatibility with pnpm)

---

### Story 2: `packages/config/` — Shared Configs (3 pts)

**Agent:** devops

Shared configs that all apps extend.

**Files to create:**
- `packages/config/package.json` — name `@cru/config`
- `packages/config/tsconfig/base.json` — strict TS, ES2022, bundler resolution
- `packages/config/tsconfig/nextjs.json` — extends base, adds Next.js-specific settings (jsx, plugins)
- `packages/config/eslint/next.js` — shared ESLint config for Next.js apps
- `packages/config/tailwind/base.ts` — shared Tailwind config (colors, fonts, theme)
- `packages/config/postcss.js` — shared PostCSS config

---

### Story 3: Move Source into `apps/web/` (8 pts)

**Agent:** devops

Move all app source into the `apps/web/` workspace. This is the biggest story — must preserve git history and all `@/` imports.

**Steps:**
1. Remove the empty `apps/web/` subdirs first (they conflict with `git mv`)
2. `git mv app/ apps/web/app/`
3. `git mv lib/ apps/web/lib/`
4. `git mv components/ apps/web/components/`
5. `git mv types/ apps/web/types/`

**Files to create in `apps/web/`:**
- `apps/web/package.json` — name `@cru/web`, dependencies: `next`, `react`, `react-dom`, `@supabase/ssr`, `@supabase/supabase-js`, `stripe`, `zod`, devDeps: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `vitest`, `@cru/config`
- `apps/web/tsconfig.json` — extends `@cru/config/tsconfig/nextjs.json`, paths: `@/*` → `./*`
- `apps/web/next.config.mjs` — minimal, `transpilePackages: ["@cru/ui", "@cru/shared"]`
- `apps/web/tailwind.config.ts` — extends `@cru/config/tailwind/base`, content paths for `apps/web/`
- `apps/web/postcss.config.mjs` — uses shared postcss config

**Import resolution:** All `@/lib/...`, `@/types/...`, `@/components/...` resolve via tsconfig `paths` within `apps/web/`. No import changes needed.

**`vercel.json`** stays at root — Vercel auto-detects the framework in `apps/web/`.

---

### Story 4: `packages/shared/` and `packages/ui/` Scaffolds (3 pts)

**Agent:** devops

Minimal scaffolds for future shared packages.

**`packages/shared/`:**
- `packages/shared/package.json` — name `@cru/shared`, main/types entry
- `packages/shared/src/index.ts` — barrel export
- `packages/shared/src/constants.ts` — shared constants (e.g., `TAX_RATE`, `HOLD_TTL_MINUTES`)
- `packages/shared/tsconfig.json` — extends base config

**`packages/ui/`:**
- `packages/ui/package.json` — name `@cru/ui`, peer deps on react
- `packages/ui/src/index.ts` — barrel export placeholder
- `packages/ui/tsconfig.json` — extends base config
- `packages/ui/tailwind.config.ts` — extends shared tailwind config

**Note:** We do NOT move components into `packages/ui/` yet. The current `components/ui/` stays in `apps/web/` — extraction happens when a second app needs shared components.

---

### Story 5: Install, Verify, Fix (5 pts)

**Agent:** devops + qa

**Steps:**
1. Run `pnpm install`
2. Run `pnpm turbo typecheck` — fix any TS errors
3. Run `pnpm turbo build` — fix any build errors (may need env stubs)
4. Run `pnpm turbo test` — verify vitest runs
5. Verify `supabase/` still works (migrations, functions untouched at root)
6. Update `.claude/PROJECT_MAP.md` with new file locations
7. Commit everything

---

## Dependencies

- **Blocked by:** Nothing — this is infrastructure, not feature code
- **Blocks:** All future epics (type checking, builds, local dev)

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Package manager | pnpm | User preference, best Turborepo support |
| `types/database.ts` location | stays in `apps/web/types/` | tightly coupled to Supabase client used only in web app |
| `supabase/` location | stays at root | Supabase CLI expects it there |
| Component extraction | deferred | no second app exists yet to share with |
| `apps/marketing/` | not created | can add later, not needed for MVP |
| `apps/mobile/` | not created | P2 scope, but monorepo structure supports adding it |

## Verification

- `pnpm install` succeeds with no errors
- `pnpm turbo typecheck` passes
- `pnpm turbo build` runs (may warn on missing env vars but shouldn't error on deps)
- All `@/` imports resolve within `apps/web/`
- `git log --follow apps/web/lib/dal/orders.ts` shows history preserved
- `supabase/migrations/` untouched and accessible from root
