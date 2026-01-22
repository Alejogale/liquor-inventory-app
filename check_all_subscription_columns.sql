-- Check ALL subscription-related columns in organizations table
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND (
    column_name LIKE '%subscription%'
    OR column_name LIKE '%period%'
    OR column_name LIKE '%stripe%'
    OR column_name LIKE '%plan%'
    OR column_name LIKE '%trial%'
  )
ORDER BY column_name;
