-- Targeted Admin Check - Run this in your Supabase SQL Editor

-- 1. Check if admin user exists in auth.users
SELECT 
    '1. Auth User' as step,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ NOT FOUND'
    END as status,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'alejogaleis@gmail.com';

-- 2. Check if admin profile exists in user_profiles
SELECT 
    '2. User Profile' as step,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ NOT FOUND'
    END as status,
    COUNT(*) as count
FROM user_profiles 
WHERE email = 'alejogaleis@gmail.com';

-- 3. Check admin profile details (if exists)
SELECT 
    '3. Profile Details' as step,
    full_name,
    role,
    organization_id,
    is_platform_admin
FROM user_profiles 
WHERE email = 'alejogaleis@gmail.com';

-- 4. Check if organization exists (if profile has org_id)
SELECT 
    '4. Organization' as step,
    o."Name",
    o.subscription_status,
    o.subscription_plan
FROM user_profiles up
JOIN organizations o ON up.organization_id = o.id
WHERE up.email = 'alejogaleis@gmail.com';

-- 5. Show all organizations (to see what's available)
SELECT 
    '5. All Organizations' as step,
    id,
    "Name",
    subscription_status,
    subscription_plan
FROM organizations
ORDER BY created_at DESC
LIMIT 5;
