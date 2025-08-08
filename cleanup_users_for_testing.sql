-- Cleanup Users for Multitenant Testing
-- Run this in your Supabase SQL Editor
-- WARNING: This will delete ALL users except alejogaleis@gmail.com

-- First, let's see what users exist
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Delete all user_profiles except admin
DELETE FROM user_profiles 
WHERE id NOT IN (
    SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
);

-- Delete all organizations except admin's
DELETE FROM organizations 
WHERE created_by NOT IN (
    SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
);

-- Delete all categories (they will be recreated by new users)
DELETE FROM categories;

-- Delete all suppliers (they will be recreated by new users)
DELETE FROM suppliers;

-- Delete all inventory_items (they will be recreated by new users)
DELETE FROM inventory_items;

-- Delete all rooms (they will be recreated by new users)
DELETE FROM rooms;

-- Delete all room_counts (they will be recreated by new users)
DELETE FROM room_counts;

-- Delete all activity_logs (they will be recreated by new users)
DELETE FROM activity_logs;

-- Now delete all auth.users except admin
-- Note: This must be done carefully as it affects authentication
DELETE FROM auth.users 
WHERE email != 'alejogaleis@gmail.com';

-- Verify only admin user remains
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Show remaining data
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles
UNION ALL
SELECT 'organizations' as table_name, COUNT(*) as count FROM organizations
UNION ALL
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'suppliers' as table_name, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'inventory_items' as table_name, COUNT(*) as count FROM inventory_items
UNION ALL
SELECT 'rooms' as table_name, COUNT(*) as count FROM rooms
UNION ALL
SELECT 'room_counts' as table_name, COUNT(*) as count FROM room_counts
UNION ALL
SELECT 'activity_logs' as table_name, COUNT(*) as count FROM activity_logs; 