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
│   ├── epic-01-user-accounts.md       ← Epic summary + Story Index table
│   ├── epic-01/                       ← Individual story files
│   │   ├── story-01-signup-login.md
│   │   ├── story-03-profile-management.md
│   │   └── ...
│   ├── epic-02-search-browse.md
│   ├── epic-02/
│   │   └── ...
│   ├── epic-03-taste-profile.md
│   ├── epic-03/
│   │   └── ...
│   ├── epic-04-producer-storytelling.md
│   ├── epic-04/
│   │   └── ...
│   ├── epic-05-order-placement.md
│   ├── epic-05/
│   │   └── ...
│   ├── epic-06-retailer-integration.md
│   ├── epic-06/
│   │   └── ...
│   ├── epic-07-curation-engine.md
│   ├── epic-07/
│   │   └── ...
│   ├── epic-08-social-layer.md
│   ├── epic-08/
│   │   └── ...
│   ├── epic-09-retailer-dashboard.md
│   └── epic-09/
│       └── ...
└── templates/
    ├── epic-template.md
    └── story-template.md
```

## Conventions

- Each Epic file contains the epic summary, metadata, and a **Story Index** table linking to individual story files
- Individual story files live in `epic-XX/story-XX-slug.md` subdirectories (one file per story)
- Stories also remain inline in the parent epic for quick scanning, but the individual files are the source of truth
- Stories use Given/When/Then acceptance criteria
- Story points use the Fibonacci scale: 1, 2, 3, 5, 8, 13
- Every story includes an agent assignment recommendation
- Dependencies reference other stories by ID (e.g., `EPIC-01/STORY-03`)

## Finding a Story

1. Open the parent epic file (e.g., `epic-02-search-browse.md`)
2. Locate the **Story Index** table near the top
3. Follow the `File` column link to the individual story file (e.g., `epic-02/story-01-wines-table.md`)
