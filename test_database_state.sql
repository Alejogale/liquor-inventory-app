-- =====================================================
-- TEST DATABASE STATE
-- =====================================================
-- This script checks the current state of all tables and data

-- Check user_profiles table
SELECT 'user_profiles' as table_name, COUNT(*) as count FROM user_profiles;

-- Check organizations table
SELECT 'organizations' as table_name, COUNT(*) as count FROM organizations;

-- Check categories table
SELECT 'categories' as table_name, COUNT(*) as count FROM categories;

-- Check suppliers table
SELECT 'suppliers' as table_name, COUNT(*) as count FROM suppliers;

-- Check rooms table
SELECT 'rooms' as table_name, COUNT(*) as count FROM rooms;

-- Check inventory_items table
SELECT 'inventory_items' as table_name, COUNT(*) as count FROM inventory_items;

-- Check room_counts table
SELECT 'room_counts' as table_name, COUNT(*) as count FROM room_counts;

-- Check activity_logs table
SELECT 'activity_logs' as table_name, COUNT(*) as count FROM activity_logs;

-- Check organization_id column types
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'organization_id' 
AND table_name IN ('user_profiles', 'categories', 'suppliers', 'rooms', 'inventory_items', 'room_counts', 'activity_logs')
ORDER BY table_name;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('categories', 'suppliers', 'inventory_items', 'rooms', 'room_counts', 'activity_logs')
ORDER BY tablename, policyname;

-- Test a simple insert to categories
INSERT INTO categories (name, organization_id) 
VALUES ('Test Category', (SELECT organization_id FROM user_profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com') LIMIT 1))
ON CONFLICT DO NOTHING;

-- Check if the test insert worked
SELECT 'Test insert result' as test, COUNT(*) as count FROM categories WHERE name = 'Test Category';

-- Clean up test data
DELETE FROM categories WHERE name = 'Test Category'; 