# Context Loading Guide

> **Purpose**: Tells agents and sessions exactly which documents to load for each task type.
> Prevents context overflow by ensuring only relevant docs enter the window.
>
> Last updated: 2026-03-07

---

## How to Use This Guide

1. Identify your **current task phase** from the table below
2. Load **only** the documents listed in "Required Reading"
3. Load "Optional / As-Needed" docs only if your specific subtask touches that area
4. When delegating to subagents, tell them which phase they're in so they load correctly
5. **Never load all docs at once** — the full doc set is ~17,500 lines and will overflow context

---

## Phase-Based Context Loading

### Phase 1: Architecture Review (Checkpoint 1)

| Category | Documents | When to Load |
|----------|-----------|-------------|
| **Required** | `docs/product/cru-product-spec.md` | Always — defines what we're building |
| **Required** | `docs/architecture/SYSTEM_ARCHITECTURE.md` | Always — the architecture under review |
| **Required** | `.claude/agents/architect.md` | When delegating to architect agent |
| **As-needed** | `docs/architecture/MODULE_ECOMMERCE.md` | When reviewing e-commerce architecture |
| **As-needed** | `docs/architecture/MODULE_INTEGRATIONS.md` | When reviewing integration architecture |
| **As-needed** | `docs/competitive-research/COMPETITIVE_SUMMARY.md` | For competitive context on design decisions |
| **Skip** | All PRDs, all agent defs except architect, all coding rules | Not needed yet |

### Phase 2: Work Plan Decomposition (Checkpoint 2)

| Category | Documents | When to Load |
|----------|-----------|-------------|
| **Required** | `.claude/agents/pm-orchestrator.md` | Always — owns decomposition process |
| **Required** | `.claude/work-plan/README.md` | Always — output format reference |
| **Required** | `.claude/work-plan/templates/epic-template.md` | Always — template for output |
| **Required** | `.claude/work-plan/templates/story-template.md` | Always — template for output |
| **Per-PRD** | `docs/prds/prd-NN-*.md` | Load ONE PRD at a time for decomposition |
| **Per-PRD** | Relevant architecture doc | Load the arch doc that covers the PRD's domain |
| **As-needed** | `docs/product/cru-product-development-roadmap.md` | For sequencing and priority context |
| **Skip** | Competitive research, reference docs, all coding rules | Not needed for planning |

**CRITICAL**: Do NOT load all 9 PRDs simultaneously. Process them one at a time:
1. Load PRD-01 → decompose into epics/stories → write output files
2. Unload PRD-01, load PRD-02 → decompose → write output
3. Continue sequentially

### Phase 3: Backend Implementation (Checkpoint 3)

| Category | Documents | When to Load |
|----------|-----------|-------------|
| **Required** | The specific epic/story being implemented | One at a time |
| **Required** | `.claude/rules/supabase-migrations.md` | For any migration work |
| **Required** | `.claude/rules/server-actions.md` | For any DAL/action work |
| **As-needed** | `docs/architecture/SYSTEM_ARCHITECTURE.md` | Schema reference (specific sections only) |
| **As-needed** | `.claude/rules/api-routes.md` | When building API routes |
| **As-needed** | `.claude/rules/testing.md` | When writing tests |
| **Skip** | All PRDs (already decomposed), product docs, competitive research |

### Phase 4: Frontend Implementation (Checkpoint 4)

| Category | Documents | When to Load |
|----------|-----------|-------------|
| **Required** | The specific epic/story being implemented | One at a time |
| **Required** | `.claude/rules/components.md` | For any component work |
| **As-needed** | `.claude/agents/ux-designer.md` | When delegating UX work |
| **As-needed** | `.claude/agents/marketing-writer.md` | When delegating copy work |
| **As-needed** | `.claude/rules/testing.md` | When writing tests |
| **Skip** | Architecture docs, PRDs, competitive research, migration rules |

### Phase 5: QA & Polish (Checkpoint 5)

| Category | Documents | When to Load |
|----------|-----------|-------------|
| **Required** | `.claude/rules/testing.md` | Always |
| **Required** | The specific features being tested | One at a time |
| **As-needed** | `.claude/agents/qa.md` | When delegating to QA agent |
| **Skip** | Architecture docs, PRDs, product docs |

---

## Agent-Specific Loading Rules

When spawning a subagent, include **only** what that agent needs:

| Agent | Always Load | Load Per-Task |
|-------|------------|---------------|
| `pm-orchestrator` | Its agent def, this guide | Current phase docs only |
| `architect` | Its agent def, system architecture | Relevant module architecture |
| `sr-backend` | Its agent def, migration rules, action rules | Current story, relevant schema sections |
| `fullstack-1` | Its agent def, component rules | Current story, relevant existing components |
| `fullstack-2/3/4` | Its agent def, component rules | Current story only |
| `ux-designer` | Its agent def | Current feature context only |
| `marketing-writer` | Its agent def | Current feature context only |
| `devops` | Its agent def | Current deployment/CI task only |
| `qa` | Its agent def, testing rules | Current feature being tested |

---

## Context Preservation Techniques

### Between Sessions
- Write key decisions and findings to `.claude/agent-log.md`
- Completed work plans persist in `.claude/work-plan/epics/`
- Use auto-memory (`~/.claude/projects/.../memory/`) for cross-session patterns

### Within Long Sessions
- After completing a subtask, summarize findings before moving to the next
- Don't re-read documents you've already processed — reference your summaries
- If context is getting large, delegate remaining subtasks to fresh subagents

### When Delegating to Subagents
- Pass a **brief summary** of relevant context, not raw document contents
- Tell the subagent which specific files to read (using Project Map keys)
- Tell the subagent which phase they're operating in (so they use this guide)

---

## Anti-Patterns (Do NOT Do These)

1. **Loading all PRDs at once** — process one at a time
2. **Loading all agent definitions at once** — only load the agent you're delegating to
3. **Re-reading architecture docs every session** — summarize key decisions in agent-log
4. **Passing full document contents to subagents** — give them file paths and brief context
5. **Loading competitive research during implementation** — it's only for planning phases
6. **Loading coding rules not relevant to current work** — migration rules aren't needed for frontend work
