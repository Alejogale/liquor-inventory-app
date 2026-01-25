-- =====================================================
-- DIAGNOSE ADMIN LOCKOUT FOR alejogaleis@gmail.com
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Check if user exists in auth.users
SELECT
    'AUTH.USERS' as table_name,
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'alejogaleis@gmail.com';

-- 2. Check user_profiles
SELECT
    'USER_PROFILES' as table_name,
    id,
    email,
    first_name,
    last_name,
    role,
    organization_id,
    is_platform_admin,
    created_at
FROM user_profiles
WHERE email = 'alejogaleis@gmail.com';

-- 3. Check if organization exists for this user
SELECT
    'ORGANIZATIONS' as table_name,
    o.id,
    o.name,
    o.owner_id,
    o.subscription_status,
    o.subscription_plan,
    o.trial_ends_at,
    o.stripe_customer_id,
    o.stripe_subscription_id
FROM organizations o
JOIN user_profiles up ON up.organization_id = o.id
WHERE up.email = 'alejogaleis@gmail.com';

-- 4. Check all organizations (in case user needs to be linked to one)
SELECT
    'ALL_ORGANIZATIONS' as table_name,
    id,
    name,
    owner_id,
    subscription_status,
    subscription_plan
FROM organizations
LIMIT 10;

-- 5. Check app_subscriptions for user's organization
SELECT
    'APP_SUBSCRIPTIONS' as table_name,
    aps.*
FROM app_subscriptions aps
JOIN user_profiles up ON up.organization_id = aps.organization_id
WHERE up.email = 'alejogaleis@gmail.com';

-- 6. Show what needs to be fixed
SELECT
    '=== DIAGNOSIS ===' as info,
    CASE
        WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'alejogaleis@gmail.com')
        THEN 'PROBLEM: User does not exist in auth.users - needs to sign up'
        WHEN NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'alejogaleis@gmail.com')
        THEN 'PROBLEM: User profile does not exist - will be created on next login'
        WHEN (SELECT organization_id FROM user_profiles WHERE email = 'alejogaleis@gmail.com') IS NULL
        THEN 'PROBLEM: User has no organization linked'
        WHEN (SELECT is_platform_admin FROM user_profiles WHERE email = 'alejogaleis@gmail.com') IS NOT TRUE
        THEN 'PROBLEM: is_platform_admin flag is not set to TRUE'
        ELSE 'User profile looks OK - check subscription status'
    END as diagnosis;
