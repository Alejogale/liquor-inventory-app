-- Check if app_subscriptions table exists and what its schema is
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_subscriptions'
ORDER BY ordinal_position;
