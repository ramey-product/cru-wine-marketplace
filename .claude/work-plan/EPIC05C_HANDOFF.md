# Epic 05c Handoff — Type Safety & Build Workaround Cleanup

> **Created**: 2026-03-12
> **Previous**: EPIC-05b Turborepo Monorepo Infrastructure on `epic-05b/monorepo-infrastructure`
> **Branch**: Create `epic-05c/type-safety-fixes` off `main` (after EPIC-05b PR merges)
> **Epic File**: `.claude/work-plan/epics/epic-05c-type-safety-fixes.md`

---

## Why This Epic Exists

Epic 05b set up the Turborepo monorepo, which enabled `tsc --noEmit` for the first time. This surfaced **314 pre-existing TypeScript errors** across 40 files — code that was written without type checking. The build was unblocked with temporary workarounds (`ignoreBuildErrors`, lazy Stripe init, API version casts). This epic fixes all the underlying issues and removes the workarounds.

## Process Instructions

1. **Work stories sequentially**: 1 → 2 → 3 → 4
2. **Story 1 is the highest-leverage fix** — regenerating types eliminates ~80% of errors
3. **Story 4 cannot start until Stories 1-3 are complete** and `pnpm turbo typecheck` passes with 0 errors
4. **After all stories**: verify, commit, PR to main

---

## Scope: 4 Stories, 18 Points

| # | Story | Points | Agent | Description |
|---|-------|--------|-------|-------------|
| 01 | Regenerate database types | 3 | sr-backend | Run `supabase gen types` to populate missing table definitions in `types/database.ts` |
| 02 | Fix strict null check violations | 5 | sr-backend | Add null guards, fix argument count mismatches (~58 errors after Story 1) |
| 03 | Fix remaining type mismatches | 3 | sr-backend | POS adapter `undefined`→`null`, implicit `any` in supabase client, spread types |
| 04 | Remove build workarounds | 2 | devops | Drop `ignoreBuildErrors`, `ignoreDuringBuilds`; verify clean build |

---

## Error Breakdown (314 total before fixes)

### By error code:
| Code | Count | Description | Fixed By |
|------|-------|-------------|----------|
| TS2339 | 175 | Property does not exist on type 'never' | Story 1 (gen types) |
| TS2532 | 43 | Object is possibly 'undefined' | Story 2 |
| TS2345 | 31 | Argument type mismatch | Story 1 + 2 |
| TS2769 | 27 | No overload matches this call | Story 1 (gen types) |
| TS18048 | 15 | Value is possibly 'undefined' | Story 2 |
| TS2554 | 11 | Wrong argument count | Story 2 |
| TS2322 | 5 | Type assignment mismatch | Story 3 |
| TS7006/7031 | 4 | Implicit 'any' type | Story 3 |
| TS2698 | 1 | Spread from non-object | Story 3 |
| TS2538 | 2 | Undefined as index type | Story 2 |

### By module (top 10):
| Module | Errors | Primary Cause |
|--------|--------|---------------|
| `lib/actions/` | 178 | Missing table types → `never` |
| `lib/dal/` | 67 | Missing table types → `never` |
| `lib/stripe/` | 19 | Missing table types + API version |
| `lib/services/` | 19 | Missing table types → `never` |
| `app/api/webhooks/` | 9 | Missing `retailer_sync_logs` table type |
| `lib/csv/` | 9 | Strict null checks |
| `lib/integrations/` | 6 | `undefined` vs `null` coercion |
| `lib/supabase/` | 4 | Implicit `any` on callback params |
| `components/` | 2 | Prop type mismatches |
| `lib/utils/` | 1 | Strict null |

## Workaround Registry (from Epic 05b)

> Every workaround deployed to unblock the build. Each must be addressed.

| Workaround | File | Remove When |
|------------|------|-------------|
| `ignoreBuildErrors: true` | `apps/web/next.config.mjs:13` | Story 4 — after typecheck passes |
| `ignoreDuringBuilds: true` | `apps/web/next.config.mjs:18` | Story 4 — after ESLint configured |
| `as Stripe.LatestApiVersion` cast | `checkout.ts`, `route.ts`, `webhook-handlers.ts` | Story 3 — update API version string |
| Lazy Stripe init | `checkout.ts:8-17`, `route.ts:31-40` | **Keep** — better serverless pattern |

## Prerequisites

- Supabase CLI installed and configured (for `supabase gen types`)
- Access to Supabase project (local or remote) to generate types
- If local: `supabase start` must be running with all migrations applied

## How to Start

1. Merge EPIC-05b PR first
2. `git checkout main && git pull`
3. `git checkout -b epic-05c/type-safety-fixes`
4. Read the epic file: `.claude/work-plan/epics/epic-05c-type-safety-fixes.md`
5. Start with Story 1: `supabase gen types typescript --local > apps/web/types/database.ts`
6. Re-run `pnpm turbo typecheck` to see remaining errors
7. Fix Stories 2-3 based on remaining output
8. Story 4: remove workarounds, verify clean build

## Verification Checklist

- [ ] `supabase gen types` — runs successfully, `types/database.ts` updated
- [ ] `pnpm turbo typecheck` — 0 errors
- [ ] `pnpm turbo build` — passes **without** `ignoreBuildErrors`
- [ ] `pnpm turbo test` — passes (if tests exist)
- [ ] No `as Stripe.LatestApiVersion` casts remain (or API version is correct)
- [ ] `ignoreBuildErrors` removed from `next.config.mjs`
- [ ] Lazy Stripe init kept (intentional pattern, not a workaround)
