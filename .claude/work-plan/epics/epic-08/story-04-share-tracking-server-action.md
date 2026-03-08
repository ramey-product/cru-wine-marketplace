### [EPIC-08/STORY-04] — Share Tracking Server Action and API Route

**Type:** backend
**Story Points:** 2
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a product team member, I want every share event tracked so that we can measure organic growth and identify our most-shared content.

#### Acceptance Criteria

```gherkin
Given a user shares a wine via the share button
When the trackShare action is called
Then a share_event row is inserted with correct shareable_type, shareable_id, and platform

Given a share event with an invalid platform value
When the action validates input
Then { error: "Invalid platform" } is returned

Given a logged-out user clicks share (clipboard copy)
When the API route receives the event
Then the event is stored with user_id = null (anonymous share tracking)
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Action | `lib/actions/shares.ts` | Create |
| Validation | `lib/validations/shares.ts` | Create |
| Route | `app/api/v1/share-events/route.ts` | Create (for beacon/anonymous tracking) |

#### Dependencies

- **Blocked by:** [EPIC-08/STORY-02] — DAL functions must exist
- **Blocks:** [EPIC-08/STORY-06] — ShareButton component fires these tracking calls

#### Testing Requirements

- [ ] **Unit:** Zod validation accepts valid shareable_type and platform values
- [ ] **Unit:** Zod validation rejects unknown platform or shareable_type values
- [ ] **Integration:** trackShare inserts a share_event row with correct data
- [ ] **Integration:** API route handles POST with valid body

#### Implementation Notes

Two tracking paths:
1. **Server Action** (`trackShare`) — for authenticated users, called from ShareButton client component
2. **API Route** (`POST /api/v1/share-events`) — for fire-and-forget tracking via `navigator.sendBeacon()`, supports anonymous shares

Zod schema:
```typescript
{
  shareableType: z.enum(['wine', 'producer']),
  shareableId: z.string().uuid(),
  platform: z.enum(['native_share', 'clipboard', 'twitter', 'facebook', 'email'])
}
```

The API route should be lightweight — validate, insert, return 202 Accepted. No auth required for the API route (anonymous share tracking is valuable for measuring share link reach).
