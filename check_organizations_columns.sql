-- Check what columns organizations table has
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'organizations'
ORDER BY ordinal_position;
