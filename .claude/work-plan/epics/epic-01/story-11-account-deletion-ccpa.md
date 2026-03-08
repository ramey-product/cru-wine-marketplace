### [EPIC-01/STORY-11] — Implement account deletion (CCPA compliance)

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a user, I want to delete my account and have all my personal data removed within 30 days so that my privacy is respected per CCPA requirements.

#### Acceptance Criteria

```gherkin
Given a user requests account deletion
When the deletion is initiated
Then the user's profile is marked as pending_deletion with a deletion_scheduled_at timestamp 30 days in the future
And the user is immediately logged out
And a confirmation email is sent

Given a user's deletion_scheduled_at has passed
When the background deletion job runs
Then all PII is anonymized: email set to 'deleted-{uuid}@deleted.cru', full_name set to 'Deleted User', all preferences cleared, all wishlist items removed
And the auth user is deleted from Supabase Auth

Given a user requests deletion then changes their mind within 30 days
When they contact support
Then the deletion can be cancelled by removing the pending_deletion flag
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_add_deletion_columns.sql` | Create |
| DAL | `lib/dal/users.ts` | Modify (add deletion functions) |
| Action | `lib/actions/account.ts` | Create |
| Edge Function | `supabase/functions/process-deletions/index.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table), EPIC-01/STORY-03 (auth DAL)
- **Blocks:** None

#### Testing Requirements

- [ ] **Unit:** Deletion initiation sets correct timestamp
- [ ] **Integration:** Full deletion flow — initiate → mark → process → verify anonymization
- [ ] **Unit:** Verify all PII columns are anonymized (no data leaks)

#### Implementation Notes

- Add `deletion_requested_at TIMESTAMPTZ` and `deletion_scheduled_at TIMESTAMPTZ` columns to profiles.
- Background job: Supabase Edge Function or a cron-triggered function that runs daily, finds profiles with `deletion_scheduled_at < now()`, anonymizes PII, and deletes the auth user via service role.
- Anonymization: replace email, name, avatar. Delete preferences, wishlists, taste profiles, follows, share events. Keep order history but anonymize customer name for retailer record-keeping.
- The 30-day window allows support-initiated cancellation. Users who change their mind can email support, who removes the deletion flag via admin API.
