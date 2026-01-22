-- Check if organizations table has all necessary columns for RevenueCat integration

SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND column_name IN ('plan', 'status', 'current_period_start', 'current_period_end')
ORDER BY column_name;

-- Check what plans exist in the database
SELECT DISTINCT plan FROM organizations;

-- Check what statuses exist in the database
SELECT DISTINCT status FROM organizations;
