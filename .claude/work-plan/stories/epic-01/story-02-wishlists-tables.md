### [EPIC-01/STORY-02] — Create wishlists and wishlist_items tables with RLS

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want my wishlist data stored securely so that only I can view and manage my saved wines.

#### Acceptance Criteria

```gherkin
Given the migration is applied
When I inspect the database schema
Then the wishlists table exists with columns: id (UUID PK), user_id (FK -> profiles.id), name (TEXT DEFAULT 'My Wishlist'), created_at, updated_at
And the wishlist_items table exists with columns: id (UUID PK), wishlist_id (FK -> wishlists.id ON DELETE CASCADE), wine_id (FK -> wines.id), notes (TEXT nullable), added_at (TIMESTAMPTZ DEFAULT now())
And both tables have RLS enabled
And RLS policies enforce user_id = auth.uid() on wishlists
And wishlist_items RLS joins through wishlist ownership

Given user-A adds a wine to their wishlist
When user-B queries wishlist_items
Then user-B sees zero items from user-A's wishlist

Given user-A deletes their wishlist
When I check wishlist_items
Then all items for that wishlist are cascade-deleted
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_wishlists.sql` | Create |
| Types | `types/database.ts` | Regenerate |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 (profiles table), EPIC-02/STORY-01 (wines table)
- **Blocks:** EPIC-01/STORY-07 (wishlist UI)

#### Testing Requirements

- [ ] **RLS (pgTAP):** Positive — user can CRUD their own wishlist and items
- [ ] **RLS (pgTAP):** Negative — user cannot read/write another user's wishlist
- [ ] **Unit:** Cascade delete removes items when wishlist is deleted
- [ ] **Unit:** UNIQUE constraint on (wishlist_id, wine_id) prevents duplicate adds

#### Implementation Notes

- Per CG-2, wishlists are **user-scoped** — NO `org_id`.
- Add `UNIQUE(wishlist_id, wine_id)` to prevent adding same wine twice.
- `wishlist_items` RLS for SELECT: `EXISTS (SELECT 1 FROM wishlists WHERE id = wishlist_items.wishlist_id AND user_id = auth.uid())`.
- Each user gets one default wishlist. Multi-wishlist support is future scope but schema should accommodate it (hence the separate wishlists table rather than putting user_id directly on wishlist_items).
- Index on `wishlist_items(wishlist_id)` for efficient item listing.
- Index on `wishlist_items(wine_id)` for "is this wine on my wishlist?" lookups.
