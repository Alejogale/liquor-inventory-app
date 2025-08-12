-- Simple Admin Check - Run this in your Supabase SQL Editor

-- Check if admin user exists
SELECT 
    'Admin User' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'alejogaleis@gmail.com') 
        THEN '✅ EXISTS' 
        ELSE '❌ NOT FOUND' 
    END as status,
    email
FROM auth.users 
WHERE email = 'alejogaleis@gmail.com';

-- Check admin profile
SELECT 
    'Admin Profile' as check_type,
    CASE 
        WHEN organization_id IS NULL THEN '❌ NO ORG LINK'
        ELSE '✅ HAS ORG LINK'
    END as status,
    full_name,
    role,
    organization_id
FROM user_profiles 
WHERE email = 'alejogaleis@gmail.com';

-- Check if organization exists
SELECT 
    'Organization' as check_type,
    CASE 
        WHEN o.id IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ NOT FOUND'
    END as status,
    o."Name",
    o.subscription_status,
    o.subscription_plan
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE up.email = 'alejogaleis@gmail.com';

-- Check app subscriptions
SELECT 
    'App Subscriptions' as check_type,
    app_id,
    subscription_status,
    subscription_plan
FROM app_subscriptions aps
JOIN user_profiles up ON aps.organization_id = up.organization_id
WHERE up.email = 'alejogaleis@gmail.com';
