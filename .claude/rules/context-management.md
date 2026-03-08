# Rules for All Agents — Context Management

## Load Incrementally, Never in Bulk

- **Read `.claude/CONTEXT_GUIDE.md`** to determine which docs your current task phase requires
- **Never load all PRDs at once** — process one at a time, write output, then move to the next
- **Never load all architecture docs at once** — load only the module relevant to your task
- **Never load all agent definitions at once** — load only the agent you're delegating to
- **Competitive research is planning-only** — skip during implementation and QA phases

## Subagent Context Discipline

- When delegating to a subagent, pass a **brief summary** of relevant context (2-5 sentences)
- Tell the subagent which files to read by path — don't embed file contents in the prompt
- Tell the subagent which **phase** they're operating in so they consult the Context Guide
- Subagents should load their own agent definition + only task-relevant docs

## Context Preservation

- After completing a subtask, summarize key decisions in `.claude/agent-log.md`
- Don't re-read documents already processed — reference your prior summaries
- If context is growing large within a session, delegate remaining work to fresh subagents
- Use auto-memory for patterns that apply across sessions

## Worktree Rules

- Worktree `CLAUDE.md` should be minimal (redirect to main repo) — not a full copy
- Do NOT duplicate `.claude/rules/` files in worktrees — the main repo copies are loaded automatically
- Worktree-specific instructions (if any) go in the worktree's `.claude/` but should be brief
