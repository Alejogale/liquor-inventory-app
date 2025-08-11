-- DIAGNOSE USER AUTHENTICATION ISSUE AFTER UUID MIGRATION
-- This script helps identify why the dashboard can't find user profiles

-- Check current user authentication state
SELECT '=== CURRENT AUTH STATE ===' as info;

-- Check if auth.users table has the expected user
SELECT 'Auth users:' as check_type, COUNT(*) as count FROM auth.users;

-- Show the specific user that's trying to access the dashboard
SELECT 'Current user details:' as info;
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    raw_user_meta_data
FROM auth.users 
WHERE email = 'alehoegali@gmail.com'
LIMIT 1;

-- Check if user_profiles table has a record for this user
SELECT '=== USER PROFILE CHECK ===' as info;

SELECT 'User profiles count:' as check_type, COUNT(*) as count FROM user_profiles;

-- Check if the specific user has a profile
SELECT 'User profile for alehoegali@gmail.com:' as info;
SELECT 
    id,
    full_name,
    email,
    organization_id,
    role,
    created_at
FROM user_profiles 
WHERE email = 'alehoegali@gmail.com'
LIMIT 1;

-- Check organizations table
SELECT '=== ORGANIZATIONS CHECK ===' as info;

SELECT 'Organizations count:' as check_type, COUNT(*) as count FROM organizations;

-- Show all organizations
SELECT 'All organizations:' as info;
SELECT 
    id,
    "Name",
    created_at,
    created_by
FROM organizations
ORDER BY created_at;

-- Check if there are any user_profiles without valid organizations
SELECT '=== ORPHANED USER PROFILES ===' as info;

SELECT 'User profiles with invalid organization_id:' as check_type, COUNT(*) as count
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE o.id IS NULL AND up.organization_id IS NOT NULL;

-- Show orphaned user profiles
SELECT 'Orphaned user profiles:' as info;
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.organization_id,
    up.role
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE o.id IS NULL AND up.organization_id IS NOT NULL;

-- Check RLS policies
SELECT '=== RLS POLICIES CHECK ===' as info;

SELECT 'Current RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'organizations')
ORDER BY tablename, policyname;

-- Test RLS policy access
SELECT '=== RLS POLICY TEST ===' as info;

-- Test if we can access user_profiles with current auth context
SELECT 'Can access user_profiles:' as test, COUNT(*) as count 
FROM user_profiles;

-- Test if we can access organizations with current auth context
SELECT 'Can access organizations:' as test, COUNT(*) as count 
FROM organizations;

-- Check what auth.uid() returns
SELECT '=== AUTH CONTEXT TEST ===' as info;

-- This will show what the current authenticated user ID is
SELECT 'Current auth.uid():' as info, auth.uid() as current_user_id;

-- Test the RLS policy logic manually
SELECT '=== MANUAL RLS TEST ===' as info;

-- Test the user_profiles policy logic
SELECT 'User profiles accessible by current user:' as test, COUNT(*) as count
FROM user_profiles 
WHERE id = auth.uid();

-- Test the organizations policy logic
SELECT 'Organizations accessible by current user:' as test, COUNT(*) as count
FROM organizations 
WHERE id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Check if there are any data in the main tables
SELECT '=== DATA AVAILABILITY CHECK ===' as info;

SELECT 'Categories count:' as check_type, COUNT(*) as count FROM categories;
SELECT 'Suppliers count:' as check_type, COUNT(*) as count FROM suppliers;
SELECT 'Inventory items count:' as check_type, COUNT(*) as count FROM inventory_items;
SELECT 'Rooms count:' as check_type, COUNT(*) as count FROM rooms;

-- Show sample data if any exists
SELECT 'Sample categories:' as info;
SELECT id, name, organization_id FROM categories LIMIT 5;

SELECT 'Sample suppliers:' as info;
SELECT id, name, organization_id FROM suppliers LIMIT 5;

SELECT 'Sample inventory items:' as info;
SELECT id, "Name", organization_id FROM inventory_items LIMIT 5;

SELECT 'Sample rooms:' as info;
SELECT id, name, organization_id FROM rooms LIMIT 5;

SELECT '=== DIAGNOSIS COMPLETE ===' as info;
SELECT 'Check the results above to identify the authentication issue.' as status;
