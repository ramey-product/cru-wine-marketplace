# Cru Wine Marketplace — Multi-Tenant B2B SaaS

## Context Management (READ FIRST)

**Do NOT load all project docs into context at once.** This project has ~17,500 lines of documentation. Loading everything causes context overflow before work begins.

### Rules
1. **Start lean** — this file + `.claude/CONTEXT_GUIDE.md` are all you need to begin
2. **Load on demand** — read only the docs required for your current task phase
3. **Use the Context Guide** — `.claude/CONTEXT_GUIDE.md` maps each task type to its required reading
4. **Agents load their own context** — subagents read only what their task needs, not everything
5. **Summarize, don't embed** — when passing context to subagents, summarize prior findings rather than re-reading entire documents

### Quick Reference
- **Project Map** (file locations): `.claude/PROJECT_MAP.md`
- **Context Guide** (what to load when): `.claude/CONTEXT_GUIDE.md`
- **Agent definitions**: `.claude/agents/<name>.md`
- **Coding rules**: `.claude/rules/<scope>.md`

## Stack

Next.js 15 (App Router, RSC) | Supabase (Postgres + RLS) | Medusa.js v2 | Tailwind + Shadcn/ui | Supabase Auth | Stripe | Vercel | Turborepo | Vitest + Playwright + pgTAP

## Core Patterns

- **Multi-tenancy**: Every table has `org_id`, every query goes through `lib/dal/`, RLS on all tables, routes under `app/(app)/[orgSlug]/`
- **Data Access Layer**: `lib/dal/` functions accept typed Supabase client, return query builder result
- **Server Actions**: `lib/actions/` — Zod validate → auth → permission → DAL → revalidatePath
- **Frontend**: Server Components default, `'use client'` only when needed, Shadcn/ui primitives, types from `types/database.ts`
- **Security**: Service role key only in webhooks/background jobs, `NEXT_PUBLIC_` only for client-safe values

## Agent Team

PM-orchestrator leads. 11 agents in `.claude/agents/`. Execution flow with 5 checkpoints requiring human approval. See `.claude/agents/pm-orchestrator.md` for full flow.

## Code Quality

TypeScript strict | Zod validation | Auto-generated types (`supabase gen types`) | Immutable migrations | All pages need loading.tsx, error.tsx, a11y checks
