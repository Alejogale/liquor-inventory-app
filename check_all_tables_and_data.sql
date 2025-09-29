-- COMPREHENSIVE DATABASE CHECK SCRIPT
-- This will show you ALL tables and their data in your Supabase database

SELECT '=== COMPREHENSIVE DATABASE CHECK ===' as info;

-- 1. Check all tables that exist
SELECT '1. ALL TABLES IN DATABASE:' as section;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check rooms table specifically
SELECT '2. ROOMS TABLE CHECK:' as section;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as rooms_table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') 
        THEN (SELECT COUNT(*) FROM rooms)::text
        ELSE 'N/A' 
    END as rooms_count;

-- Show rooms data if exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') 
        THEN (SELECT json_agg(row_to_json(t)) FROM (SELECT id, name, organization_id, display_order, created_at FROM rooms ORDER BY display_order) t)::text
        ELSE 'N/A' 
    END as rooms_data;

-- 3. Check room_counts table specifically
SELECT '3. ROOM_COUNTS TABLE CHECK:' as section;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as room_counts_table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') 
        THEN (SELECT COUNT(*) FROM room_counts)::text
        ELSE 'N/A' 
    END as room_counts_count;

-- Show room_counts data if exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') 
        THEN (SELECT json_agg(row_to_json(t)) FROM (SELECT inventory_item_id, room_id, count, organization_id, created_at FROM room_counts LIMIT 10) t)::text
        ELSE 'N/A' 
    END as room_counts_data;

-- 4. Check reservation_rooms table
SELECT '4. RESERVATION_ROOMS TABLE CHECK:' as section;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservation_rooms') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as reservation_rooms_table_status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservation_rooms') 
        THEN (SELECT COUNT(*) FROM reservation_rooms)::text
        ELSE 'N/A' 
    END as reservation_rooms_count;

-- 5. Check organizations
SELECT '5. ORGANIZATIONS CHECK:' as section;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') 
        THEN (SELECT COUNT(*) FROM organizations)::text
        ELSE 'N/A' 
    END as organizations_count;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') 
        THEN (SELECT json_agg(row_to_json(t)) FROM (SELECT id, "Name", created_at FROM organizations LIMIT 5) t)::text
        ELSE 'N/A' 
    END as organizations_data;

-- 6. Check inventory_items
SELECT '6. INVENTORY_ITEMS CHECK:' as section;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') 
        THEN (SELECT COUNT(*) FROM inventory_items)::text
        ELSE 'N/A' 
    END as inventory_items_count;

-- 7. Check user_profiles
SELECT '7. USER_PROFILES CHECK:' as section;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') 
        THEN (SELECT COUNT(*) FROM user_profiles)::text
        ELSE 'N/A' 
    END as user_profiles_count;

-- 8. Check all foreign key relationships
SELECT '8. FOREIGN KEY RELATIONSHIPS:' as section;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 9. Check RLS policies
SELECT '9. ROW LEVEL SECURITY POLICIES:' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 10. Check if RLS is enabled on key tables
SELECT '10. RLS STATUS ON KEY TABLES:' as section;
SELECT 
    c.relname as table_name,
    c.relrowsecurity as rls_enabled,
    c.relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' 
  AND c.relkind = 'r'
  AND c.relname IN ('rooms', 'room_counts', 'organizations', 'inventory_items', 'user_profiles')
ORDER BY c.relname;

-- 11. Sample data from all tables (first 3 rows each)
SELECT '11. SAMPLE DATA FROM ALL TABLES:' as section;

-- This will show sample data from each table
DO $$
DECLARE
    table_name text;
    query text;
    result text;
BEGIN
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        ORDER BY t.table_name
    LOOP
        query := format('SELECT COUNT(*) FROM %I', table_name);
        EXECUTE query INTO result;
        RAISE NOTICE 'Table: % - Row count: %', table_name, result;
    END LOOP;
END $$;

SELECT '=== CHECK COMPLETE ===' as info;
