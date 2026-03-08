### [EPIC-01/STORY-10] — Write settings page copy and microcopy

**Type:** copy
**Story Points:** 2
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build — copy delivered before STORY-08 begins)

#### User Story

As an explorer, I want the settings experience to feel clear and empowering, especially around data control and account deletion.

#### Acceptance Criteria

```gherkin
Given the marketing-writer delivers settings copy
When a developer reviews the copy document
Then it includes: section headers, form labels, help text, success/error toasts, empty states, delete account confirmation dialog text, and post-deletion message

Given account deletion copy is integrated
When a user reads the deletion dialog
Then the messaging clearly explains what will happen, the 30-day timeline, and that this is irreversible
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `docs/copy/settings-pages.md` | Create |

#### Dependencies

- **Blocked by:** None
- **Blocks:** EPIC-01/STORY-08 (settings pages need copy)

#### Testing Requirements

- [ ] **Review:** Copy reviewed by pm-orchestrator for brand voice and legal accuracy

#### Implementation Notes

- Account deletion copy is especially sensitive — must be clear about CCPA compliance, timeline, and irreversibility.
- Notification frequency options need brief descriptions: "Daily digest — a curated email each morning," "Weekly roundup — highlights every Monday."
- Occasion tag labels should match the 12 predefined categories exactly.
