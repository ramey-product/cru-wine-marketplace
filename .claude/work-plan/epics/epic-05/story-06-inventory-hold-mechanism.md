### [EPIC-05/STORY-06] — Inventory hold mechanism

**Type:** backend
**Story Points:** 3
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As the system, I want to place a temporary hold on inventory when a consumer begins checkout so that wines cannot be oversold if multiple consumers try to buy the last bottle simultaneously.

#### Acceptance Criteria

```gherkin
Given a retailer has 2 units of Wine X in stock
When Consumer A starts checkout for 1 unit
Then 1 unit is held and only 1 unit shows as available to other consumers

Given a hold has been active for 10 minutes without payment
When the hold expiration check runs
Then the hold is released and the unit becomes available again

Given Consumer A completes payment within the hold window
When the payment webhook fires
Then the hold is converted to a confirmed order and stock is decremented

Given Consumer A abandons checkout
When they navigate away without completing payment
Then the hold expires after 10 minutes and stock is restored
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_inventory_holds.sql` | Create |
| DAL | `lib/dal/inventory-holds.ts` | Create |
| Lib | `lib/medusa/inventory.ts` | Create |

#### Dependencies

- **Blocked by:** EPIC-06 — needs retailer inventory data model
- **Blocks:** EPIC-05/STORY-04 — initiateCheckout creates a hold

#### Testing Requirements

- [ ] **Unit:** Hold creation decrements available stock count
- [ ] **Unit:** Hold expiration restores available stock
- [ ] **Unit:** Hold conversion on payment success permanently decrements stock
- [ ] **RLS:** Only system/service role can manage holds (no direct user access)
- [ ] **Integration:** Concurrent checkout for last unit — only one hold succeeds

#### Implementation Notes

**Approach:** Use a Supabase `inventory_holds` table for V1 rather than relying solely on Medusa's inventory module. This gives us direct control and simpler integration with the retailer inventory from EPIC-06.

**Table: `inventory_holds`**
```
id UUID PK DEFAULT gen_random_uuid()
wine_id UUID NOT NULL REFERENCES wines(id)
retailer_org_id UUID NOT NULL REFERENCES organizations(id)
user_id UUID NOT NULL REFERENCES profiles(id)
quantity INTEGER NOT NULL CHECK (quantity > 0)
expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 minutes')
status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'converted', 'expired', 'released'))
stripe_checkout_session_id TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

**Hold lifecycle:**
1. `initiateCheckout` → INSERT hold with `status = 'active'`, `expires_at = now() + 10 min`
2. Stripe webhook success → UPDATE hold `status = 'converted'`
3. Cron or pg_cron → UPDATE expired holds `status = 'expired'` WHERE `expires_at < now() AND status = 'active'`
4. Consumer cancels → UPDATE hold `status = 'released'`

**Available stock query:** `retailer_stock - SUM(active holds)` = available for purchase.

**RLS:** Holds table uses restrictive policies — only service role can INSERT/UPDATE (managed by Server Actions and webhooks, never by direct client access). Consumers cannot query holds directly.
