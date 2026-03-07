### [EPIC-XX/STORY-XX] — [Story Title]

**Type:** [backend | frontend | fullstack | infrastructure | design | copy]
**Story Points:** [1 | 2 | 3 | 5 | 8 | 13]
**Assigned Agent:** [agent name]
**Phase:** [Checkpoint 3: Backend | Checkpoint 4: Frontend | Checkpoint 5: QA]

#### User Story

As a [role], I want to [action] so that [outcome].

#### Acceptance Criteria

```gherkin
Given [precondition]
When [action]
Then [expected result]

Given [precondition]
When [action]
Then [expected result]
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_description.sql` | Create |
| DAL | `lib/dal/feature-name.ts` | Create / Modify |
| Action | `lib/actions/feature-name.ts` | Create / Modify |
| Validation | `lib/validations/feature-name.ts` | Create / Modify |
| Component | `components/features/feature-name/ComponentName.tsx` | Create |
| Page | `app/(app)/[orgSlug]/feature/page.tsx` | Create |
| Test | `supabase/tests/feature-name.test.sql` | Create |

#### Dependencies

- **Blocked by:** [EPIC-XX/STORY-XX] — [brief reason]
- **Blocks:** [EPIC-XX/STORY-XX] — [brief reason]

#### Testing Requirements

- [ ] **Unit:** [what to test]
- [ ] **Integration:** [what to test]
- [ ] **RLS:** [positive and negative cases]
- [ ] **E2E:** [critical path, if applicable]
- [ ] **Accessibility:** [axe-core check, if UI involved]

#### Implementation Notes

[Any technical guidance, architecture decisions, edge cases, or gotchas the implementing agent should know. Reference ADRs if applicable.]
