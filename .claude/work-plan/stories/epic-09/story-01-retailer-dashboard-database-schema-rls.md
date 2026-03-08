### [EPIC-09/STORY-01] — Retailer Dashboard Database Schema & RLS Policies

**Type:** backend
**Story Points:** 5
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a system, I need the database schema to support retailer-specific roles, settings, stock overrides, and analytics so that the retailer dashboard can query and display data securely.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When a user is linked as a retailer member
Then their retailer_members row connects their user_id to a retailer_id with a role (owner/staff)

Given a retailer member queries order data
When RLS evaluates the query
Then only orders belonging to that member's linked retailer are returned

Given a retailer member queries another retailer's data
When RLS evaluates the query
Then zero rows are returned (no cross-retailer data leakage)

Given a retailer owner queries the dashboard
When they access settings and analytics
Then they see full data for their retailer

Given a retailer staff member queries the dashboard
When they access orders and inventory
Then they see operational data but not revenue/commission details
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_retailer_dashboard_schema.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_retailer_analytics_views.sql` | Create |
| Test | `supabase/tests/retailer-dashboard-rls.test.sql` | Create |

#### Dependencies

- **Blocked by:** [EPIC-01/STORY-01] — Needs `memberships` table and auth infrastructure
- **Blocked by:** [EPIC-06/STORY-01] — Needs `retailers`, `retailer_inventories`, `retailer_pos_connections` tables
- **Blocked by:** [EPIC-05/STORY-01] — Needs `orders` and `order_items` tables
- **Blocks:** [EPIC-09/STORY-02] through [EPIC-09/STORY-05] — All DAL functions depend on schema

#### Testing Requirements

- [ ] **RLS (positive):** Retailer member can read their own retailer's orders, inventory, settings
- [ ] **RLS (negative):** Retailer member cannot read another retailer's orders, inventory, settings
- [ ] **RLS (staff vs owner):** Staff can read orders but cannot access revenue/commission analytics
- [ ] **Schema:** All columns, constraints, indexes, and triggers are correctly created
- [ ] **Migration:** Migration is idempotent and rolls back cleanly

#### Implementation Notes

**New tables:**

```sql
-- Org-scoped: links users to specific retailers with retailer roles
CREATE TABLE retailer_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')) DEFAULT 'staff',
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, user_id)
);

-- Org-scoped: per-user notification settings for retailer context
CREATE TABLE retailer_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_member_id UUID NOT NULL REFERENCES retailer_members(id) ON DELETE CASCADE,
  new_order_email BOOLEAN NOT NULL DEFAULT true,
  daily_summary_email BOOLEAN NOT NULL DEFAULT true,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_member_id)
);

-- Org-scoped: manual stock overrides that take precedence over POS sync
CREATE TABLE retailer_stock_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
  wine_id UUID NOT NULL,  -- FK to wines table from Epic 04
  override_status TEXT NOT NULL CHECK (override_status IN ('in_stock', 'low_stock', 'out_of_stock')),
  overridden_by UUID NOT NULL REFERENCES auth.users(id),
  cleared_at TIMESTAMPTZ,  -- NULL = active override, set = cleared by sync or user
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(retailer_id, wine_id) WHERE cleared_at IS NULL  -- Only one active override per wine per retailer
);
```

**Extend `retailers` table (from Epic 06):**
```sql
ALTER TABLE retailers
  ADD COLUMN IF NOT EXISTS pickup_enabled BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS delivery_radius_miles NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS delivery_fee_cents INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_delivery_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS hours_of_operation JSONB;  -- { "mon": "10:00-20:00", ... }
```

**Analytics materialized view:**
```sql
CREATE MATERIALIZED VIEW retailer_order_analytics AS
SELECT
  r.id AS retailer_id,
  r.org_id,
  COUNT(o.id) AS total_orders_30d,
  SUM(o.total_cents) AS gross_revenue_30d,
  SUM(o.commission_cents) AS commission_30d,
  SUM(o.total_cents - o.commission_cents) AS net_payout_30d,
  DATE_TRUNC('week', o.created_at) AS week
FROM retailers r
LEFT JOIN orders o ON o.retailer_id = r.id
  AND o.created_at >= now() - INTERVAL '30 days'
  AND o.status != 'cancelled'
GROUP BY r.id, r.org_id, DATE_TRUNC('week', o.created_at);

CREATE UNIQUE INDEX idx_retailer_order_analytics ON retailer_order_analytics(retailer_id, week);
```

RLS on `retailer_members`, `retailer_notification_preferences`, `retailer_stock_overrides`: user must be an active retailer member for the given retailer. RLS on analytics MV: user must be a retailer member with `owner` role to see revenue/commission data.

Standard indexes: `org_id` on all tables, `retailer_id` on `retailer_members`, `retailer_stock_overrides`.
