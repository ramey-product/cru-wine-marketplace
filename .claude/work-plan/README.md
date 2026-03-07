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
│   ├── epic-01-user-accounts.md
│   ├── epic-02-search-browse.md
│   ├── epic-03-taste-profile.md
│   ├── epic-04-producer-storytelling.md
│   ├── epic-05-order-placement.md
│   ├── epic-06-retailer-integration.md
│   ├── epic-07-curation-engine.md
│   ├── epic-08-social-layer.md
│   └── epic-09-retailer-dashboard.md
└── templates/
    ├── epic-template.md
    └── story-template.md
```

## Conventions

- Each Epic file contains the epic summary followed by all child Developer Stories
- Stories use Given/When/Then acceptance criteria
- Story points use the Fibonacci scale: 1, 2, 3, 5, 8, 13
- Every story includes an agent assignment recommendation
- Dependencies reference other stories by ID (e.g., `EPIC-01/STORY-03`)
