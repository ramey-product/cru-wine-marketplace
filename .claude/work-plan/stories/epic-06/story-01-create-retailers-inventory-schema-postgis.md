### [EPIC-06/STORY-01] — Create Retailers and Inventory Schema with PostGIS

**Type:** backend
**Story Points:** 8
**Assigned Agent:** sr-backend
**Phase:** Checkpoint 3: Backend

#### User Story

As a platform operator, I want a normalized data model for retailers and their inventory so that all downstream features (Search, Orders, Curation) query a consistent, location-aware inventory layer.

#### Acceptance Criteria

```gherkin
Given the migration runs successfully
When I query the retailers table
Then it includes PostGIS geography columns with GIST indexes for location queries

Given a retailer with latitude/longitude
When I query for retailers within 10 miles of a user
Then PostGIS ST_DWithin returns correct results in < 50ms for 20 retailers

Given a retailer_inventory record
When I check the table structure
Then it has wine_id, price (integer cents), quantity, stock_status enum, sync_source, and last_synced_at

Given any table in this migration
When I check RLS policies
Then retailers are readable by authenticated users and writable by org members
And retailer_inventory is readable by authenticated users and writable by org members

Given a sync completes or fails
When I check retailer_sync_logs
Then a log entry records sync_type, status, records_processed, records_failed, error_details, and duration_ms
```

#### Affected Files & Modules

| Layer | Path | Action |
|-------|------|--------|
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_retailers.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_retailer_inventory.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_retailer_sync_logs.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_create_wine_match_queue.sql` | Create |
| Migration | `supabase/migrations/YYYYMMDDHHMMSS_enable_postgis.sql` | Create |
| Test | `supabase/tests/retailers.test.sql` | Create |
| Test | `supabase/tests/retailer_inventory.test.sql` | Create |

#### Dependencies

- **Blocked by:** EPIC-01/STORY-01 — needs `organizations` table and membership infrastructure
- **Blocks:** EPIC-06/STORY-02 — DAL functions need schema to exist
- **Blocks:** EPIC-05/STORY-07 — retailer selection UI queries this schema

#### Testing Requirements

- [ ] **RLS:** Retailers readable by all authenticated users, writable only by org members
- [ ] **RLS:** Retailer inventory readable by all authenticated users, writable only by org members
- [ ] **RLS:** Sync logs readable/writable only by org members
- [ ] **RLS:** Wine match queue readable/writable only by platform admins
- [ ] **PostGIS:** ST_DWithin queries return correct results for known coordinates
- [ ] **PostGIS:** GIST index is used (EXPLAIN ANALYZE confirms index scan)
- [ ] **Constraints:** price >= 0, quantity >= 0, stock_status in valid enum values

#### Implementation Notes

**Schema Design:**

```
retailers:
  id UUID PK DEFAULT gen_random_uuid()
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  name TEXT NOT NULL
  slug TEXT UNIQUE NOT NULL
  address TEXT NOT NULL
  city TEXT NOT NULL
  state TEXT NOT NULL DEFAULT 'CA'
  zip TEXT NOT NULL
  location geography(Point, 4326) NOT NULL  -- PostGIS
  phone TEXT
  email TEXT
  website TEXT
  pos_type TEXT  -- 'square' | 'lightspeed' | 'shopify' | 'clover' | 'csv_only' | 'other'
  pos_credentials JSONB  -- encrypted at rest, contains API keys/tokens
  fulfillment_capabilities JSONB NOT NULL DEFAULT '["pickup"]'
    -- array of: 'pickup', 'delivery', 'shipping'
  delivery_radius_miles INTEGER
  commission_rate NUMERIC(5,4) DEFAULT 0.15  -- 15% default
  is_active BOOLEAN DEFAULT true
  onboarded_at TIMESTAMPTZ
  created_at TIMESTAMPTZ DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT now()

retailer_inventory:
  id UUID PK DEFAULT gen_random_uuid()
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE
  wine_id UUID NOT NULL REFERENCES wines(id) ON DELETE CASCADE
  sku TEXT  -- retailer's internal SKU
  price INTEGER NOT NULL  -- cents, matching Stripe format
  quantity INTEGER NOT NULL DEFAULT 0
  stock_status TEXT NOT NULL DEFAULT 'in_stock'
    -- 'in_stock' | 'low_stock' | 'out_of_stock'
  sync_source TEXT NOT NULL DEFAULT 'csv'
    -- 'csv' | 'pos_api' | 'manual'
  last_synced_at TIMESTAMPTZ DEFAULT now()
  created_at TIMESTAMPTZ DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT now()
  UNIQUE(retailer_id, wine_id)  -- one inventory record per wine per retailer

retailer_sync_logs:
  id UUID PK DEFAULT gen_random_uuid()
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE
  sync_type TEXT NOT NULL  -- 'csv_import' | 'pos_full' | 'pos_incremental' | 'manual'
  sync_source TEXT NOT NULL  -- 'square' | 'lightspeed' | 'shopify' | 'clover' | 'csv'
  status TEXT NOT NULL  -- 'started' | 'completed' | 'failed' | 'partial'
  records_processed INTEGER DEFAULT 0
  records_created INTEGER DEFAULT 0
  records_updated INTEGER DEFAULT 0
  records_failed INTEGER DEFAULT 0
  error_details JSONB
  started_at TIMESTAMPTZ DEFAULT now()
  completed_at TIMESTAMPTZ
  duration_ms INTEGER
  created_at TIMESTAMPTZ DEFAULT now()

wine_match_queue:
  id UUID PK DEFAULT gen_random_uuid()
  retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE
  raw_wine_name TEXT NOT NULL
  raw_producer TEXT
  raw_vintage TEXT
  raw_varietal TEXT
  raw_sku TEXT
  raw_price INTEGER  -- cents
  raw_quantity INTEGER
  matched_wine_id UUID REFERENCES wines(id)
  match_confidence NUMERIC(5,4)  -- 0.0000 to 1.0000
  match_status TEXT NOT NULL DEFAULT 'pending'
    -- 'pending' | 'auto_matched' | 'manual_matched' | 'rejected' | 'new_wine_created'
  reviewed_by UUID REFERENCES auth.users(id)
  reviewed_at TIMESTAMPTZ
  sync_log_id UUID REFERENCES retailer_sync_logs(id)
  created_at TIMESTAMPTZ DEFAULT now()
  updated_at TIMESTAMPTZ DEFAULT now()
```

**PostGIS setup:**
- Enable PostGIS extension: `CREATE EXTENSION IF NOT EXISTS postgis;`
- Create GIST index on `retailers.location`
- Populate location from address during onboarding (geocoding via external API or manual lat/lng input)
- Distance queries: `ST_DWithin(location, ST_MakePoint(lng, lat)::geography, radius_meters)`

**RLS Pattern:**
- Retailers and inventory are **publicly readable** by any authenticated user (consumers need to see nearby retailers)
- Retailers and inventory are **writable only by org members** (retailer staff managing their own data)
- Sync logs are **org-scoped** (only retailer's own team sees sync history)
- Wine match queue is **platform admin only** (content team reviews matches)
