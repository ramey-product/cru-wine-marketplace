### [EPIC-01/STORY-05] — Implement wishlist DAL and Server Actions

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As an explorer, I want to save and remove wines from my wishlist so that I can track bottles I'm interested in.

#### Acceptance Criteria

```gherkin
Given an authenticated user adds a wine to their wishlist
When the addToWishlist action executes
Then a wishlist_items row is created linking the wine to the user's default wishlist

Given a user tries to add a wine that's already on their wishlist
When the action executes
Then it returns success (idempotent) without creating a duplicate

Given a user removes a wine from their wishlist
When the removeFromWishlist action executes
Then the wishlist_items row is deleted

Given a user requests their wishlist
When getWishlistItems is called
Then items are returned with wine details (name, producer, price, image) joined from the wines table
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| DAL | `lib/dal/wishlists.ts` | Create |
| Action | `lib/actions/wishlists.ts` | Create |
| Validation | `lib/validations/wishlists.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-02 (wishlists tables), EPIC-02/STORY-01 (wines table for JOIN)
- **Blocks:** EPIC-01/STORY-07 (wishlist UI)

#### Testing Requirements

- [ ] **Unit (Vitest):** DAL correctly creates default wishlist on first add
- [ ] **Unit (Vitest):** Idempotent add returns success without duplicate
- [ ] **Integration:** Full add/remove cycle through Server Actions
- [ ] **RLS:** Verify user cannot add items to another user's wishlist via direct SQL

#### Implementation Notes

- Auto-create default wishlist: `getOrCreateDefaultWishlist(client, userId)` — creates a wishlist named "My Wishlist" if none exists.
- `addToWishlist`: Use `INSERT ... ON CONFLICT (wishlist_id, wine_id) DO NOTHING` for idempotency.
- `getWishlistItems`: JOIN with wines table to return denormalized wine data. Support sorting by `added_at DESC` (default) or by wine price.
- `removeFromWishlist`: DELETE by wishlist_item_id. Verify ownership via the wishlist -> user_id chain before deleting.
