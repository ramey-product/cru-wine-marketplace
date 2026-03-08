### [EPIC-01/STORY-09] — Write auth page copy and microcopy

**Type:** copy
**Story Points:** 2
**Assigned Agent:** marketing-writer
**Phase:** Checkpoint 4: Frontend (pre-build — copy delivered before STORY-06 begins)

#### User Story

As an explorer, I want the signup and login experience to feel warm, trustworthy, and distinctly Cru — not like every other generic sign-in form.

#### Acceptance Criteria

```gherkin
Given the marketing-writer delivers auth copy
When a developer reviews the copy document
Then it includes: signup page headline + subhead, login page headline + subhead, age gate checkbox label, password reset messaging, email verification message, OAuth button labels, error messages (duplicate email, invalid password, network error), and placeholder text for all inputs

Given the copy is integrated into auth pages
When a user reads the signup page
Then the messaging communicates trust, purpose, and personality — not boilerplate
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Copy | `docs/copy/auth-pages.md` | Create |

#### Dependencies

- **Blocked by:** None (can start immediately)
- **Blocks:** EPIC-01/STORY-06 (auth pages need copy before build)

#### Testing Requirements

- [ ] **Review:** Copy reviewed by pm-orchestrator for brand voice consistency

#### Implementation Notes

- Deliver as a markdown file with sections matching each page/component.
- Include both primary copy and error/edge-case microcopy.
- Age gate label must be legally precise ("I confirm I am 21 years of age or older") while still feeling on-brand.
- Error messages should be helpful, not scolding. "That email's already part of the Cru family — try logging in instead."
