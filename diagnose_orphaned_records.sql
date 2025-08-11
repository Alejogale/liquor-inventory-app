-- DIAGNOSTIC SCRIPT: Identify Orphaned Records
-- Run this BEFORE attempting the migration to understand the current state

-- Check current organizations table
SELECT '=== ORGANIZATIONS TABLE ===' as info;
SELECT id, "Name", created_at FROM organizations ORDER BY id;

-- Check for orphaned records in user_profiles
SELECT '=== ORPHANED USER_PROFILES ===' as info;
SELECT id, organization_id, full_name, email 
FROM user_profiles 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Check for orphaned records in all other tables
SELECT '=== ORPHANED APP_SUBSCRIPTIONS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM app_subscriptions 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED USER_ACTIVITY_LOGS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM user_activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED ROLE_TEMPLATES ===' as info;
SELECT organization_id, COUNT(*) as count
FROM role_templates 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED USER_INVITATIONS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM user_invitations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED MEMBERS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED FAMILY_MEMBERS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM family_members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED RESERVATION_ROOMS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM reservation_rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED RESERVATION_TABLES ===' as info;
SELECT organization_id, COUNT(*) as count
FROM reservation_tables 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED RESERVATIONS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM reservations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED CATEGORIES ===' as info;
SELECT organization_id, COUNT(*) as count
FROM categories 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED SUPPLIERS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM suppliers 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED INVENTORY_ITEMS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM inventory_items 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED ROOMS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED ROOM_COUNTS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM room_counts 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

SELECT '=== ORPHANED ACTIVITY_LOGS ===' as info;
SELECT organization_id, COUNT(*) as count
FROM activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL
GROUP BY organization_id;

-- Summary of orphaned records
SELECT '=== SUMMARY ===' as info;
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as orphaned_count
FROM user_profiles 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'app_subscriptions' as table_name,
    COUNT(*) as orphaned_count
FROM app_subscriptions 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'user_activity_logs' as table_name,
    COUNT(*) as orphaned_count
FROM user_activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'role_templates' as table_name,
    COUNT(*) as orphaned_count
FROM role_templates 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'user_invitations' as table_name,
    COUNT(*) as orphaned_count
FROM user_invitations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'members' as table_name,
    COUNT(*) as orphaned_count
FROM members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'family_members' as table_name,
    COUNT(*) as orphaned_count
FROM family_members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'reservation_rooms' as table_name,
    COUNT(*) as orphaned_count
FROM reservation_rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'reservation_tables' as table_name,
    COUNT(*) as orphaned_count
FROM reservation_tables 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'reservations' as table_name,
    COUNT(*) as orphaned_count
FROM reservations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'categories' as table_name,
    COUNT(*) as orphaned_count
FROM categories 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'suppliers' as table_name,
    COUNT(*) as orphaned_count
FROM suppliers 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'inventory_items' as table_name,
    COUNT(*) as orphaned_count
FROM inventory_items 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'rooms' as table_name,
    COUNT(*) as orphaned_count
FROM rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'room_counts' as table_name,
    COUNT(*) as orphaned_count
FROM room_counts 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 
    'activity_logs' as table_name,
    COUNT(*) as orphaned_count
FROM activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;
