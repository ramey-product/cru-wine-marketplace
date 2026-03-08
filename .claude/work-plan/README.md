# Work Plan Directory

This directory contains the output of the PM-Orchestrator + Architect collaborative work decomposition (Checkpoint 2).

## Structure

```
work-plan/
├── README.md                          ← This file
├── analysis/
│   ├── architecture-review.md         ← Architect's analysis of all PRDs against architecture
│   ├── cross-cutting-concerns.md      ← Concerns spanning multiple epics
│   ├── technical-risks.md             ← Risks, open questions, assumptions
│   └── implementation-sequence.md     ← Suggested epic ordering with rationale
├── epics/
│   ├── epic-01-user-accounts.md       ← Epic summary + story reference table
│   ├── epic-02-search-browse.md
│   ├── ...
│   └── epic-09-retailer-dashboard.md
├── stories/
│   ├── epic-01/                       ← Individual story files for Epic 01
│   │   ├── story-01-profiles-preferences-tables.md
│   │   ├── story-02-wishlists-tables.md
│   │   └── ...
│   ├── epic-02/
│   │   └── ...
│   └── epic-09/
│       └── ...
└── templates/
    ├── epic-template.md
    └── story-template.md
```

## Conventions

- Each Epic file contains the epic summary, metadata, and a **Story Index** table linking to individual story files
- Individual story files live in `stories/epic-XX/story-XX-slug.md` (one file per story)
- Epic files contain only summary metadata and a story reference table — individual story files are the source of truth
- Stories use Given/When/Then acceptance criteria
- Story points use the Fibonacci scale: 1, 2, 3, 5, 8, 13
- Every story includes an agent assignment recommendation
- Dependencies reference other stories by ID (e.g., `EPIC-01/STORY-03`)

## Finding a Story

1. Open the parent epic file (e.g., `epic-02-search-browse.md`)
2. Locate the **Developer Stories** table
3. Follow the story link to the individual story file (e.g., `../stories/epic-02/story-01-wines-table.md`)
