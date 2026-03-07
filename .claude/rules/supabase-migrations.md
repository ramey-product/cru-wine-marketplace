# Rules for supabase/migrations/**

- Migrations are IMMUTABLE — never edit an existing migration file
- To change schema, create a NEW migration with the next timestamp
- Every table MUST have `org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
- Every table MUST have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- Every table MUST have at least a SELECT and INSERT RLS policy
- Always create an index on `org_id` (it appears in every RLS subquery)
- Use `gen_random_uuid()` for primary keys
- Use `TIMESTAMPTZ DEFAULT now()` for timestamps
- Include an `updated_at` trigger using `update_updated_at()` function
- Naming: `YYYYMMDDHHMMSS_descriptive_name.sql`
