# Rules for All Agents — Project Map

## Read First

Every agent MUST read `.claude/PROJECT_MAP.md` at the start of every task to resolve resource locations. Never hardcode document paths in agent output, reasoning, or code — always look them up from the Project Map.

## Reference by Map Key

When referring to project resources in status updates, delegation instructions, or analysis, reference them by their **map key** (e.g., "Product Spec", "System Architecture", "PRD-01") — not by file path. The map key is the `Resource` column value in the Project Map tables.

## Update on Change

Any agent that creates, moves, renames, or deletes a file referenced in the Project Map MUST update `.claude/PROJECT_MAP.md` to reflect the change. After updating, run `.claude/scripts/update-project-map.sh` to validate consistency.

This includes:
- New documents added to `docs/`
- New work plan artifacts added to `.claude/work-plan/`
- New agent definitions added to `.claude/agents/`
- Any file relocation or rename

## Codebase Conventions Stay in Agents

Codebase convention paths (like `lib/dal/`, `components/ui/`, `app/(app)/[orgSlug]/`) are **architectural patterns**, not document locations. These belong in agent definitions and coding rules — NOT in the Project Map. The Project Map only tracks documents and resources, not code structure patterns.
