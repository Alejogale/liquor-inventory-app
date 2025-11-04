-- Check actual column types in your database
-- Run this first to see what types we're working with

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('inventory_items', 'user_profiles', 'rooms', 'organizations')
  AND column_name IN ('id', 'organization_id', 'user_id', 'room_id')
ORDER BY table_name, column_name;
