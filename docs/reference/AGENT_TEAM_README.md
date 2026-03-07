# Agent Dev Team — Usage Guide

## Quick Start

```bash
# Option 1: Launch with a feature request
./scripts/start-prototype.sh "Build an auction bidding system for the wine marketplace"

# Option 2: Launch interactively (will prompt for input)
./scripts/start-prototype.sh

# Option 3: Run the orchestrator directly in Claude Code
claude --agent pm-orchestrator "Add a P2P wine trading feature"
```

## How It Works

### The Team

Eleven specialized agents work in a coordinated pipeline:

| Agent | Role | Model |
|-------|------|-------|
| **pm-orchestrator** | Leads execution, delegates tasks, enforces checkpoints | opus |
| **architect** | Designs schemas, API contracts, data models | opus |
| **sr-backend** | Implements SQL, RLS, DAL functions, Server Actions | opus |
| **fullstack-1** | **Lead Full Stack Dev** — builds complex features, reviews fullstack-2/3/4 | opus |
| **fullstack-2** | Builds forms, validation, state management | sonnet |
| **fullstack-3** | Handles integrations (Stripe, Medusa, external APIs) | sonnet |
| **fullstack-4** | Builds data tables, dashboards, catalogs, analytics views | sonnet |
| **marketing-writer** | **Brand Voice Lead** — all user-facing copy, microcopy, onboarding, terminology | opus |
| **ux-designer** | **UX/UI Design Lead** — intuitive, elegant UX; modern design trends | opus |
| **devops** | Manages CI/CD, migrations, deployment config | sonnet |
| **qa** | Writes tests across all layers | sonnet |

### Execution Pipeline

The pm-orchestrator runs the team through 4 phases, pausing for your approval at each checkpoint:

```
Phase 1: Architecture
  architect designs schema + API contracts
  → CHECKPOINT 1: You review and approve the architecture

Phase 2: Backend
  sr-backend writes migrations, RLS, DAL, Server Actions
  devops configures migration pipeline
  → CHECKPOINT 2: You review and approve the backend

Phase 3: Frontend
  ux-designer creates component specs
  marketing-writer delivers copy specs for all user-facing text (consulted before build)
  fullstack-1 (Lead) takes complex tasks; fullstack-2, fullstack-3, and fullstack-4 take scoped tasks — all build in parallel
  fullstack-1 reviews code from fullstack-2, fullstack-3, and fullstack-4 (fix or send back for changes)
  → CHECKPOINT 3: You review and approve the frontend (all code is review-approved)

Phase 4: Quality
  qa writes unit, integration, E2E, RLS, and accessibility tests
  → CHECKPOINT 4: Final review and sign-off
```

### Checkpoints

At each checkpoint, the orchestrator will:
1. Present a summary of what was completed
2. Show any decisions that need your input
3. Wait for your explicit "approved" before continuing

You can also provide feedback like "looks good but change X" and the agents will adjust.

### Progress Tracking

The orchestrator maintains a live status log at `.claude/agent-log.md` showing:
- Current phase and checkpoint
- Task completion status per agent
- Blockers and next actions

## Running Individual Agents

You can also run agents directly for focused tasks:

```bash
# Get architecture advice
claude --agent architect "Design the schema for a wine auction feature"

# Write backend code
claude --agent sr-backend "Implement RLS policies for the bids table"

# Design UI components
claude --agent ux-designer "Design the bid placement form and live auction view"

# Write tests
claude --agent qa "Write RLS tests for the bids and auctions tables"
```

## Project Structure

```
.claude/
├── agents/              # 11 agent definitions (Markdown + YAML frontmatter)
│   ├── pm-orchestrator.md
│   ├── architect.md
│   ├── sr-backend.md
│   ├── ux-designer.md
│   ├── fullstack-1.md
│   ├── fullstack-2.md
│   ├── fullstack-3.md
│   ├── fullstack-4.md
│   ├── marketing-writer.md
│   ├── devops.md
│   └── qa.md
├── hooks/               # Automation hooks
│   ├── protect-generated-files.sh  # Prevents editing auto-generated files
│   └── post-write-lint.sh          # Auto-formats TS/TSX after edits
├── rules/               # Path-specific rules enforced by context
│   ├── supabase-migrations.md
│   ├── api-routes.md
│   ├── components.md
│   ├── server-actions.md
│   └── testing.md
├── settings.json        # Hook configuration
└── agent-log.md         # Live execution status log

CLAUDE.md                # Shared context for all agents (stack, patterns, conventions)
SYSTEM_ARCHITECTURE.md   # Full platform architecture reference
MODULE_ECOMMERCE.md      # Commerce module specs
MODULE_INTEGRATIONS.md   # Third-party integration specs
scripts/
└── start-prototype.sh   # Quick-launch script
```

## Tips

- **Start broad**: Give the orchestrator a feature description, not implementation details. Let the architect make the technical decisions.
- **Review checkpoints carefully**: This is your chance to course-correct before work continues.
- **Run agents individually** when you want focused work on a specific layer.
- **Check the agent log** (`.claude/agent-log.md`) if you need to see what happened.
- **Rules are automatic**: The `.claude/rules/` files inject context when agents work on matching file paths, so they follow conventions without being told.
