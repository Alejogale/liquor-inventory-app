-- CLEANUP SCRIPT: Remove Orphaned Records
-- Run this BEFORE attempting the migration to clean up orphaned records

-- First, let's see what we're about to delete
SELECT '=== ORPHANED RECORDS TO BE DELETED ===' as info;

SELECT 'user_profiles' as table_name, COUNT(*) as count
FROM user_profiles 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'app_subscriptions' as table_name, COUNT(*) as count
FROM app_subscriptions 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'user_activity_logs' as table_name, COUNT(*) as count
FROM user_activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'role_templates' as table_name, COUNT(*) as count
FROM role_templates 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'user_invitations' as table_name, COUNT(*) as count
FROM user_invitations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'members' as table_name, COUNT(*) as count
FROM members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'family_members' as table_name, COUNT(*) as count
FROM family_members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'reservation_rooms' as table_name, COUNT(*) as count
FROM reservation_rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'reservation_tables' as table_name, COUNT(*) as count
FROM reservation_tables 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'reservations' as table_name, COUNT(*) as count
FROM reservations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'categories' as table_name, COUNT(*) as count
FROM categories 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'suppliers' as table_name, COUNT(*) as count
FROM suppliers 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'inventory_items' as table_name, COUNT(*) as count
FROM inventory_items 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'rooms' as table_name, COUNT(*) as count
FROM rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'room_counts' as table_name, COUNT(*) as count
FROM room_counts 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'activity_logs' as table_name, COUNT(*) as count
FROM activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Now delete orphaned records
SELECT '=== DELETING ORPHANED RECORDS ===' as info;

-- Delete orphaned user_profiles
DELETE FROM user_profiles 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned app_subscriptions
DELETE FROM app_subscriptions 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned user_activity_logs
DELETE FROM user_activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned role_templates
DELETE FROM role_templates 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned user_invitations
DELETE FROM user_invitations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned members
DELETE FROM members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned family_members
DELETE FROM family_members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned reservation_rooms
DELETE FROM reservation_rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned reservation_tables
DELETE FROM reservation_tables 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned reservations
DELETE FROM reservations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned categories
DELETE FROM categories 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned suppliers
DELETE FROM suppliers 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned inventory_items
DELETE FROM inventory_items 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned rooms
DELETE FROM rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned room_counts
DELETE FROM room_counts 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Delete orphaned activity_logs
DELETE FROM activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

-- Verify cleanup
SELECT '=== VERIFICATION: NO ORPHANED RECORDS SHOULD REMAIN ===' as info;

SELECT 'user_profiles' as table_name, COUNT(*) as remaining_orphaned
FROM user_profiles 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'app_subscriptions' as table_name, COUNT(*) as remaining_orphaned
FROM app_subscriptions 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'user_activity_logs' as table_name, COUNT(*) as remaining_orphaned
FROM user_activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'role_templates' as table_name, COUNT(*) as remaining_orphaned
FROM role_templates 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'user_invitations' as table_name, COUNT(*) as remaining_orphaned
FROM user_invitations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'members' as table_name, COUNT(*) as remaining_orphaned
FROM members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'family_members' as table_name, COUNT(*) as remaining_orphaned
FROM family_members 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'reservation_rooms' as table_name, COUNT(*) as remaining_orphaned
FROM reservation_rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'reservation_tables' as table_name, COUNT(*) as remaining_orphaned
FROM reservation_tables 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'reservations' as table_name, COUNT(*) as remaining_orphaned
FROM reservations 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'categories' as table_name, COUNT(*) as remaining_orphaned
FROM categories 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'suppliers' as table_name, COUNT(*) as remaining_orphaned
FROM suppliers 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'inventory_items' as table_name, COUNT(*) as remaining_orphaned
FROM inventory_items 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'rooms' as table_name, COUNT(*) as remaining_orphaned
FROM rooms 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'room_counts' as table_name, COUNT(*) as remaining_orphaned
FROM room_counts 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL

UNION ALL

SELECT 'activity_logs' as table_name, COUNT(*) as remaining_orphaned
FROM activity_logs 
WHERE organization_id::text NOT IN (SELECT id::text FROM organizations)
AND organization_id IS NOT NULL;

SELECT '=== CLEANUP COMPLETE ===' as info;
SELECT 'All orphaned records have been removed. You can now run the migration script.' as status;
