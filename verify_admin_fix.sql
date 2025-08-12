-- Verify Admin Fix - Run this in your Supabase SQL Editor

-- Check if admin profile exists now
SELECT 
    'Admin Profile Status' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTS'
        ELSE '❌ NOT FOUND'
    END as status,
    COUNT(*) as count
FROM user_profiles 
WHERE email = 'alejogaleis@gmail.com';

-- Show admin profile details
SELECT 
    'Admin Profile Details' as check_type,
    full_name,
    role,
    organization_id,
    is_platform_admin,
    created_at
FROM user_profiles 
WHERE email = 'alejogaleis@gmail.com';

-- Check organization link
SELECT 
    'Organization Link' as check_type,
    o."Name",
    o.subscription_status,
    o.subscription_plan
FROM user_profiles up
JOIN organizations o ON up.organization_id = o.id
WHERE up.email = 'alejogaleis@gmail.com';
