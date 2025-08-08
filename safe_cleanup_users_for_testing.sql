-- Safe Cleanup Users for Multitenant Testing
-- Run this in your Supabase SQL Editor
-- WARNING: This will delete ALL users except alejogaleis@gmail.com

-- First, let's see what users exist
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Get the admin user ID safely
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'alejogaleis@gmail.com';
    
    -- If admin user exists, proceed with cleanup
    IF admin_user_id IS NOT NULL THEN
        -- Delete all user_profiles except admin
        DELETE FROM user_profiles 
        WHERE id != admin_user_id;
        
        -- Delete all organizations except admin's
        DELETE FROM organizations 
        WHERE created_by != admin_user_id;
        
        -- Clear all other data (will be recreated by new users)
        DELETE FROM categories;
        DELETE FROM suppliers;
        DELETE FROM inventory_items;
        DELETE FROM rooms;
        DELETE FROM room_counts;
        DELETE FROM activity_logs;
        
        -- Delete all auth.users except admin
        DELETE FROM auth.users 
        WHERE email != 'alejogaleis@gmail.com';
        
        RAISE NOTICE 'Cleanup completed successfully. Admin user preserved.';
    ELSE
        RAISE EXCEPTION 'Admin user (alejogaleis@gmail.com) not found!';
    END IF;
END $$;

-- Verify only admin user remains
SELECT 
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Show remaining data counts
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