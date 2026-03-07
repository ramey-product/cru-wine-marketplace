# Kickoff Prompt: Cru — P0 Feature Analysis & Work Decomposition

> **Paste this prompt into Claude Code to start the pm-orchestrator agent.**
> This scopes execution to Checkpoints 1 and 2 only — no development work.

---

## Prompt

Execute the pre-development planning phase for Cru through Checkpoint 2. NO CODE is to be written during this phase. Your job is analysis, architecture review, and work decomposition only.

### Phase 1 → Checkpoint 1: Architecture Review

**Step 1 — Read the Project Map and All Documentation**

Start by reading `.claude/PROJECT_MAP.md` to resolve all resource locations. Then read every document referenced in the map, in this order:

1. All items in the **Product & Strategy** section
2. All items in the **Architecture** section
3. All items in the **PRDs** section (every P0 PRD — read all of them)
4. All items in the **Competitive Research** section (for market context)

**Step 2 — Delegate to Architect**

Task the architect agent with a full architecture review. The architect should:

1. **Validate architecture coverage**: Confirm that the Architecture docs fully support every requirement in all 9 PRDs. Identify any gaps where a PRD requires capabilities not addressed by the architecture.

2. **Schema completeness review**: For each PRD, verify that the database schema design accounts for all data entities, relationships, and multi-tenancy requirements. Flag any missing tables, columns, or relationships.

3. **API contract review**: Verify that Server Actions, DAL functions, and Route Handlers are defined or clearly implied for every feature in every PRD. Identify any endpoints that need to be designed.

4. **Integration feasibility**: For PRDs involving third-party services (search, payments, shipping, age verification, wine data), verify the integration approach is complete and feasible.

5. **Medusa module mapping**: For e-commerce PRDs (order placement, retailer integration, curation engine), verify the e-commerce module architecture covers the required Medusa.js v2 functionality.

6. **Write Architecture Decision Records (ADRs)** for any non-obvious technical decisions or trade-offs discovered during review.

7. **Produce a consolidated analysis** at the architecture-review location within the Work Plan analysis directory (see Project Map). The analysis should cover:
   - Per-PRD architecture alignment assessment (supported / gaps found)
   - Missing or underspecified schema entities
   - Missing API contracts or endpoints
   - Integration risks or unknowns
   - Recommended architecture changes or additions
   - ADRs for significant decisions

**Step 3 — Present Checkpoint 1**

Present the architecture review findings to the human for approval. Include:
- Summary of alignment between PRDs and architecture
- Any gaps or risks discovered
- ADRs requiring human input
- Recommended changes before proceeding to work decomposition

**STOP. Wait for human approval before proceeding to Phase 2.**

---

### Phase 2 → Checkpoint 2: Work Plan Decomposition

**Only begin this phase after Checkpoint 1 is approved.**

Collaborate with the architect to decompose all 9 PRDs into implementation-ready Jira Epics and Developer Stories. Use the Project Map to locate the Work Plan directory, templates, and output locations.

**Step 4 — Decompose PRDs into Epics**

For each PRD, create an Epic file in the Work Plan epics directory, following the Epic template (see **Work Plan** section in Project Map). Each epic must include:
- Summary tying back to the PRD's value proposition
- Success criteria from the PRD's metrics
- Architecture dependencies (tables, modules, integrations)
- Cross-cutting concerns shared with other epics
- Technical risks specific to this epic

**Step 5 — Break Epics into Developer Stories**

Within each Epic file, break the work into granular Developer Stories following the Story template (see **Work Plan** section in Project Map). Each story must include:
- User story in "As a / I want / So that" format
- Acceptance criteria in Given/When/Then (Gherkin) format
- Affected files and modules (specific paths in the codebase)
- Dependencies (blocked-by and blocks relationships, referencing other stories by ID)
- Story point estimate using Fibonacci: 1, 2, 3, 5, 8, 13
- Agent assignment recommendation (which agent from the team roster owns this story)
- Testing requirements (unit, integration, RLS, E2E, accessibility)
- Implementation notes with technical guidance

**Granularity guidance**: A story should represent roughly 1-4 hours of focused agent work. If a story feels larger than a 5, break it down further. Backend stories (migrations, RLS, DAL) should be separate from frontend stories (components, pages) to maintain the checkpoint flow.

**Step 6 — Cross-Cutting Analysis**

Produce these analysis documents in the Work Plan analysis directory (see Project Map):

1. `cross-cutting-concerns.md` — Concerns that span multiple epics:
   - Shared database tables or columns used by multiple features
   - Shared UI components (e.g., wine card, user profile widget)
   - Auth/permission patterns needed across features
   - Real-time subscription patterns
   - Shared validation schemas

2. `technical-risks.md` — For each risk:
   - Description of the risk
   - Which epics/stories are affected
   - Likelihood (low/medium/high)
   - Impact (low/medium/high)
   - Proposed mitigation
   - Open questions requiring human input

3. `implementation-sequence.md` — Recommended epic ordering:
   - Which epics should be built first (foundation) vs. later (dependent)
   - Dependency graph between epics
   - Parallelization opportunities (which epics can be built simultaneously)
   - Suggested sprint groupings
   - Critical path identification

**Step 7 — Present Checkpoint 2**

Present the complete work plan to the human for approval. Include:
- Total count: X epics, Y stories, Z total story points
- Summary of each epic with story count and point total
- Top 5 technical risks
- Recommended implementation sequence (first 3 sprints)
- Cross-cutting concerns requiring early attention
- Open questions that need human decisions

**STOP. No development work begins until Checkpoint 2 is explicitly approved.**
