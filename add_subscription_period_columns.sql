-- Add subscription period tracking columns to organizations table
-- These columns track when the current subscription period starts and ends

-- Add current_period_start column
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

-- Add current_period_end column
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Verify the columns were added
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND column_name IN ('subscription_plan', 'subscription_status', 'current_period_start', 'current_period_end')
ORDER BY column_name;

-- Show current state of organizations table
SELECT
  id,
  "Name",
  subscription_plan,
  subscription_status,
  current_period_start,
  current_period_end,
  trial_ends_at
FROM organizations
LIMIT 5;
