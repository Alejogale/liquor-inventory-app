-- Check RLS policies (the important one!)
SELECT 'RLS POLICIES CHECK:' as info;
SELECT 
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('categories', 'suppliers', 'inventory_items')
AND schemaname = 'public'
ORDER BY tablename, policyname;