-- Diagnose current authentication and organization state
-- Run this first to understand what we're working with

DO $$
BEGIN
    RAISE NOTICE '=== CURRENT DATABASE STATE DIAGNOSIS ===';
    RAISE NOTICE '--- Review the query results below to understand current state ---';
END $$;

-- 1. Check all users in auth.users
SELECT 
    '1. USERS IN AUTH.USERS' as section,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    created_at
FROM auth.users 
ORDER BY created_at;

-- 2. Check all user profiles
SELECT 
    '2. USER PROFILES' as section,
    id,
    email,
    full_name,
    role,
    organization_id,
    is_platform_admin
FROM user_profiles 
ORDER BY created_at;

-- 3. Check all organizations
SELECT 
    '3. ORGANIZATIONS' as section,
    id,
    "Name" as name,
    subscription_status,
    subscription_plan,
    owner_id,
    created_by
FROM organizations 
ORDER BY created_at;

-- 4. Check app subscriptions (if table exists)
SELECT 
    '4. APP SUBSCRIPTIONS' as section,
    organization_id,
    app_id,
    subscription_status,
    subscription_plan,
    trial_ends_at,
    subscription_ends_at
FROM app_subscriptions 
ORDER BY organization_id, app_id;

-- 5. Check custom permissions (if table exists)
SELECT 
    '5. CUSTOM PERMISSIONS' as section,
    user_id,
    organization_id,
    app_id,
    permission_type
FROM user_custom_permissions 
ORDER BY user_id, app_id;

-- 6. Check inventory data (to preserve)
SELECT 
    '6. INVENTORY DATA COUNT' as section,
    organization_id,
    COUNT(*) as item_count
FROM inventory_items 
GROUP BY organization_id;
