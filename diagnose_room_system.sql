-- DIAGNOSIS SCRIPT: Check current room system state
-- Run this first to understand what tables exist and their data

SELECT '=== ROOM SYSTEM DIAGNOSIS ===' as info;

-- Check if rooms table exists and has data
SELECT '1. Checking rooms table...' as step;
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

-- Check if reservation_rooms table exists and has data
SELECT '2. Checking reservation_rooms table...' as step;
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

-- Check if room_counts table exists and has data
SELECT '3. Checking room_counts table...' as step;
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

-- Check if reservation_room_counts table exists
SELECT '4. Checking reservation_room_counts table...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservation_room_counts') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as reservation_room_counts_table_status;

-- Show sample data from existing tables
SELECT '5. Sample data from reservation_rooms (if exists)...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reservation_rooms') 
        THEN (SELECT json_agg(row_to_json(t)) FROM (SELECT id, name, organization_id, is_active FROM reservation_rooms LIMIT 5) t)::text
        ELSE 'N/A' 
    END as reservation_rooms_sample;

-- Show sample data from rooms (if exists)
SELECT '6. Sample data from rooms (if exists)...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') 
        THEN (SELECT json_agg(row_to_json(t)) FROM (SELECT id, name, organization_id FROM rooms LIMIT 5) t)::text
        ELSE 'N/A' 
    END as rooms_sample;

-- Check organization IDs
SELECT '7. Checking organizations...' as step;
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') 
        THEN (SELECT COUNT(*) FROM organizations)::text
        ELSE 'N/A' 
    END as organizations_count;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organizations') 
        THEN (SELECT json_agg(row_to_json(t)) FROM (SELECT id, "Name" FROM organizations LIMIT 3) t)::text
        ELSE 'N/A' 
    END as organizations_sample;

-- Check foreign key constraints
SELECT '8. Checking foreign key constraints...' as step;
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
  AND (tc.table_name IN ('rooms', 'reservation_rooms', 'room_counts', 'reservation_room_counts')
       OR ccu.table_name IN ('rooms', 'reservation_rooms', 'inventory_items', 'organizations'))
ORDER BY tc.table_name, kcu.column_name;

SELECT '=== DIAGNOSIS COMPLETE ===' as info;
