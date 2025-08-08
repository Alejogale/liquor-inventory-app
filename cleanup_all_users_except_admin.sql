-- =====================================================
-- CLEANUP ALL USERS EXCEPT ADMIN
-- =====================================================
-- This script deletes all authentication users and data
-- except for the admin account: alejogaleis@gmail.com
-- =====================================================

-- Step 1: Get the admin user ID and organization ID
DO $$
DECLARE
    admin_user_id UUID;
    admin_org_id BIGINT;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'alejogaleis@gmail.com';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user alejogaleis@gmail.com not found!';
    END IF;
    
    SELECT organization_id INTO admin_org_id
    FROM user_profiles 
    WHERE id = admin_user_id;
    
    RAISE NOTICE 'Admin user ID: %, Admin org ID: %', admin_user_id, admin_org_id;
END $$;

-- Step 2: Delete all data tables (except admin data)
-- Delete room counts (except admin's)
DELETE FROM room_counts 
WHERE room_id IN (
    SELECT id FROM rooms 
    WHERE organization_id NOT IN (
        SELECT organization_id FROM user_profiles 
        WHERE id IN (
            SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
        )
    )
);

-- Delete rooms (except admin's)
DELETE FROM rooms 
WHERE organization_id NOT IN (
    SELECT organization_id FROM user_profiles 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
    )
);

-- Delete inventory items (except admin's)
DELETE FROM inventory_items 
WHERE organization_id NOT IN (
    SELECT organization_id FROM user_profiles 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
    )
);

-- Delete suppliers (except admin's)
DELETE FROM suppliers 
WHERE organization_id NOT IN (
    SELECT organization_id FROM user_profiles 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
    )
);

-- Delete categories (except admin's)
DELETE FROM categories 
WHERE organization_id NOT IN (
    SELECT organization_id FROM user_profiles 
    WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
    )
);

-- Delete organizations (except admin's)
DELETE FROM organizations 
WHERE created_by NOT IN (
    SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
);

-- Delete user profiles (except admin's)
DELETE FROM user_profiles 
WHERE id NOT IN (
    SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
);

-- Step 3: Delete authentication users (except admin)
DELETE FROM auth.users 
WHERE email != 'alejogaleis@gmail.com';

-- Step 4: Show results
SELECT 
    'auth.users' as table_name,
    COUNT(*) as remaining_count
FROM auth.users
UNION ALL
SELECT 
    'user_profiles' as table_name,
    COUNT(*) as remaining_count
FROM user_profiles
UNION ALL
SELECT 
    'organizations' as table_name,
    COUNT(*) as remaining_count
FROM organizations
UNION ALL
SELECT 
    'categories' as table_name,
    COUNT(*) as remaining_count
FROM categories
UNION ALL
SELECT 
    'suppliers' as table_name,
    COUNT(*) as remaining_count
FROM suppliers
UNION ALL
SELECT 
    'inventory_items' as table_name,
    COUNT(*) as remaining_count
FROM inventory_items
UNION ALL
SELECT 
    'rooms' as table_name,
    COUNT(*) as remaining_count
FROM rooms
UNION ALL
SELECT 
    'room_counts' as table_name,
    COUNT(*) as remaining_count
FROM room_counts;

-- Step 5: Verify admin still exists
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'alejogaleis@gmail.com'; 