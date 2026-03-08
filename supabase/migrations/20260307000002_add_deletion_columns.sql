-- Add account deletion columns for CCPA compliance (EPIC-01/STORY-11)
-- Enables 30-day soft-delete window before PII anonymization

ALTER TABLE profiles
  ADD COLUMN deletion_requested_at TIMESTAMPTZ,
  ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;

-- Index for the background deletion job to efficiently find profiles due for deletion
CREATE INDEX idx_profiles_deletion_scheduled
  ON profiles (deletion_scheduled_at)
  WHERE deletion_scheduled_at IS NOT NULL;

COMMENT ON COLUMN profiles.deletion_requested_at IS 'Timestamp when user initiated account deletion';
COMMENT ON COLUMN profiles.deletion_scheduled_at IS 'Timestamp when PII will be anonymized (30 days after request)';
