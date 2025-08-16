-- Test Database Setup
-- Run this after running fix_subscription_team_management.sql to verify everything is working

-- Test 1: Check if all required tables exist
SELECT '=== TEST 1: TABLE EXISTENCE ===' as test_name;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('user_profiles', 'organizations', 'app_subscriptions', 'team_invitations', 'billing_history', 'usage_logs') 
        THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'organizations', 'app_subscriptions', 'team_invitations', 'billing_history', 'usage_logs')
ORDER BY table_name;

-- Test 2: Check user_profiles columns
SELECT '=== TEST 2: USER_PROFILES COLUMNS ===' as test_name;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND column_name IN ('status', 'app_access', 'invited_by', 'invitation_token', 'permissions')
ORDER BY column_name;

-- Test 3: Check organizations columns
SELECT '=== TEST 3: ORGANIZATIONS COLUMNS ===' as test_name;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND column_name IN ('stripe_subscription_id', 'stripe_price_id', 'subscription_period_start', 'subscription_period_end', 'app_subscriptions')
ORDER BY column_name;

-- Test 4: Check RLS policies
SELECT '=== TEST 4: RLS POLICIES ===' as test_name;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('app_subscriptions', 'team_invitations', 'billing_history', 'usage_logs')
ORDER BY tablename, policyname;

-- Test 5: Check existing data
SELECT '=== TEST 5: EXISTING DATA ===' as test_name;

SELECT 
    'user_profiles' as table_name,
    COUNT(*) as record_count
FROM user_profiles
UNION ALL
SELECT 
    'organizations' as table_name,
    COUNT(*) as record_count
FROM organizations
UNION ALL
SELECT 
    'app_subscriptions' as table_name,
    COUNT(*) as record_count
FROM app_subscriptions;

-- Test 6: Check sample user profile
SELECT '=== TEST 6: SAMPLE USER PROFILE ===' as test_name;

SELECT 
    id,
    email,
    role,
    status,
    app_access,
    organization_id
FROM user_profiles 
LIMIT 3;

-- Test 7: Check sample organization
SELECT '=== TEST 7: SAMPLE ORGANIZATION ===' as test_name;

SELECT 
    id,
    "Name",
    subscription_status,
    subscription_plan,
    app_subscriptions
FROM organizations 
LIMIT 3;

-- Test 8: Check app subscriptions
SELECT '=== TEST 8: APP SUBSCRIPTIONS ===' as test_name;

SELECT 
    o."Name" as organization_name,
    app_sub.app_name,
    app_sub.status,
    app_sub.subscription_start_date
FROM app_subscriptions app_sub
JOIN organizations o ON app_sub.organization_id = o.id
ORDER BY o."Name", app_sub.app_name;
