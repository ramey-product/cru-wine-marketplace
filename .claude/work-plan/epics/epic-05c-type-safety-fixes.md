# Epic 05c: Type Safety & Build Workaround Cleanup

## Context

Epic 05b introduced Turborepo monorepo infrastructure, which enabled `tsc --noEmit` for the first time. This surfaced **314 pre-existing TypeScript errors** across 40 files. The build was unblocked by adding `ignoreBuildErrors: true` and lazy Stripe client initialization as temporary workarounds.

This epic tracks all pre-existing issues and the workarounds that need to be removed once they're resolved.

## Package Manager: pnpm

## Total: 18 story points, 4 stories

---

### Story 1: Regenerate Database Types (3 pts)

**Agent:** sr-backend

**Root cause of ~80% of errors.** The `types/database.ts` file is missing table definitions for tables created in later migrations. Supabase queries against these tables resolve to `never`, causing cascading TS2339 ("Property does not exist on type 'never'") and TS2769 ("No overload matches") errors.

**Tables missing from types (referenced in code but not in `database.ts`):**
- `retailer_sync_logs`
- `inventory_holds`
- `orders`, `order_items`
- `cart_items`
- `wine_matches`, `match_candidates`
- Possibly others added in EPIC-05 and EPIC-06 migrations

**Steps:**
1. Run `supabase gen types typescript --local > apps/web/types/database.ts` (or from remote project)
2. Verify all table types are now present
3. Re-run `pnpm turbo typecheck` — expect error count to drop from 314 to ~30-50

**Affected files (by error count):**
- `lib/actions/wine-matching.ts` (90 errors)
- `lib/actions/pos-sync.ts` (30)
- `lib/stripe/webhook-handlers.ts` (19)
- `lib/actions/orders.ts` (16)
- `lib/dal/search.ts` (12)
- `lib/actions/retailer-onboarding.ts` (12)
- `lib/dal/wines.ts` (10)
- `lib/services/wine-matcher.ts` (10)
- `lib/services/sync-orchestrator.ts` (9)
- `lib/dal/orders.ts` (8)
- And 20+ more files with 1-7 errors each

**Note:** This story may be completed naturally during any epic that runs `supabase gen types` as part of its workflow. If so, mark this story as resolved.

---

### Story 2: Fix Strict Null Check Violations (5 pts)

**Agent:** sr-backend

After Story 1 resolves the `never` type errors, the remaining errors will be primarily:

**TS2532 / TS18048 — "Object is possibly 'undefined'"** (~58 errors)
- DAL functions returning query results without null checks
- Array indexing without bounds checks (`noUncheckedIndexedAccess` is enabled)
- Supabase `.single()` / `.maybeSingle()` returns not being narrowed

**TS2345 — "Argument of type X is not assignable to parameter of type Y"** (~31 errors)
- Passing potentially-undefined values to functions expecting defined values
- Type narrowing gaps between DAL return types and action consumers

**TS2554 — "Expected N arguments, but got M"** (~11 errors)
- DAL function signatures changed but callers not updated

**Fix approach:**
- Add null checks / optional chaining where appropriate
- Fix function signatures to match actual call sites
- Add type guards for Supabase query results

**Files with most strict-null errors:**
- `lib/csv/parser.ts` (8)
- `lib/dal/wishlists.ts` (7)
- `lib/dal/producers.ts` (7)
- `lib/dal/users.ts` (5)
- `lib/actions/auth.ts` (5)
- `lib/actions/wines.ts` (4)

---

### Story 3: Fix Remaining Type Mismatches (3 pts)

**Agent:** sr-backend

**TS2322 — "Type 'string | undefined' is not assignable to type 'string | null'"** (5 errors)
- POS adapter files: `clover-adapter.ts`, `lightspeed-adapter.ts`, `shopify-adapter.ts`, `square-adapter.ts`
- Fix: Use `?? null` to coerce `undefined` to `null` where the DB schema expects `null`

**TS2698 — "Spread types may only be created from object types"** (1 error)
- `lib/dal/orders.ts:322` — spreading a value that could be non-object
- Fix: Add type guard before spread

**TS7006 / TS7031 — Implicit 'any' types** (4 errors)
- `lib/supabase/server.ts` — `cookiesToSet` callback params missing types
- Fix: Add explicit types from `@supabase/ssr` Cookie types

**CSVUploadStep.tsx** (2 errors)
- Component type mismatches
- Fix: Align prop types

---

### Story 4: Remove Build Workarounds (2 pts)

**Agent:** devops

**Prerequisite:** Stories 1-3 must be complete and `pnpm turbo typecheck` must pass with 0 errors.

**Workarounds to remove:**

1. **`apps/web/next.config.mjs`** — Remove `typescript.ignoreBuildErrors: true`
2. **`apps/web/next.config.mjs`** — Remove `eslint.ignoreDuringBuilds: true` (after ESLint is configured)
3. **`apps/web/lib/stripe/checkout.ts`** — Can optionally revert lazy init to direct `const stripe = new Stripe(...)` if env vars are guaranteed at build time. However, **lazy init is actually the better pattern** for serverless — keep it unless there's a reason to revert.
4. **`apps/web/app/api/webhooks/stripe/route.ts`** — Same as above (keep lazy init).
5. **Stripe API version cast** — `as Stripe.LatestApiVersion` in 3 files. Update to the version that matches the installed `stripe` package, or remove the cast if the version string is correct.

**Verification:**
- `pnpm turbo typecheck` — 0 errors
- `pnpm turbo build` — passes without `ignoreBuildErrors`
- `pnpm turbo test` — passes

---

## Dependencies

- **Blocked by:** Nothing (can start anytime)
- **Overlaps with:** Any epic that runs `supabase gen types` will partially resolve Story 1
- **Blocks:** Removing `ignoreBuildErrors` from production builds

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stripe lazy init | Keep (not a workaround) | Better pattern for serverless — avoids crash if env var missing at import time |
| `ignoreBuildErrors` | Remove after Story 3 | Temporary — types must be clean for production |
| `ignoreDuringBuilds` (ESLint) | Remove when ESLint is configured | Separate concern — may happen in a different epic |
| Execution timing | Flexible | Can be done standalone or absorbed into the next epic that touches these files |

## Workaround Registry

> Track all workarounds deployed in Epic 05b so none are forgotten.

| Workaround | File | Line | Remove When |
|------------|------|------|-------------|
| `ignoreBuildErrors: true` | `apps/web/next.config.mjs` | 13 | Story 4 (typecheck passes) |
| `ignoreDuringBuilds: true` | `apps/web/next.config.mjs` | 18 | ESLint configured |
| Lazy Stripe init | `apps/web/lib/stripe/checkout.ts` | 8-17 | Keep — better pattern |
| Lazy Stripe init | `apps/web/app/api/webhooks/stripe/route.ts` | 31-40 | Keep — better pattern |
| `as Stripe.LatestApiVersion` cast | `checkout.ts`, `route.ts`, `webhook-handlers.ts` | various | Update Stripe API version or remove cast |
