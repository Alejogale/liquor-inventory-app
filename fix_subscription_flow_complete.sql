-- Fix subscription flow by cleaning up test data and ensuring proper app subscriptions

-- 1. Clean up test user (alehoegali@gmail.com)
DO $$
DECLARE
    test_user_id uuid;
    test_org_id uuid;
BEGIN
    -- Find test user
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'alehoegali@gmail.com';
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found test user: %', test_user_id;
        
        -- Find their organization
        SELECT organization_id INTO test_org_id FROM user_profiles WHERE id = test_user_id;
        
        -- Clean up all related data
        DELETE FROM activity_logs WHERE user_id = test_user_id;
        DELETE FROM app_subscriptions WHERE organization_id = test_org_id;
        DELETE FROM user_profiles WHERE id = test_user_id;
        DELETE FROM organizations WHERE id = test_org_id;
        
        -- Delete the auth user (this will cascade)
        DELETE FROM auth.users WHERE id = test_user_id;
        
        RAISE NOTICE '✅ Cleaned up test user and associated data';
    ELSE
        RAISE NOTICE 'Test user not found - no cleanup needed';
    END IF;
END $$;

-- 2. Ensure admin user has proper app subscriptions
DO $$
DECLARE
    admin_user_id uuid;
    admin_org_id uuid;
    apps text[] := ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'];
    app_name text;
BEGIN
    -- Find admin user
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'alejogaleis@gmail.com';
    
    IF admin_user_id IS NOT NULL THEN
        RAISE NOTICE 'Found admin user: %', admin_user_id;
        
        -- Find admin organization
        SELECT organization_id INTO admin_org_id FROM user_profiles WHERE id = admin_user_id;
        
        IF admin_org_id IS NOT NULL THEN
            RAISE NOTICE 'Found admin organization: %', admin_org_id;
            
            -- Ensure admin has active subscriptions to all apps
            FOREACH app_name IN ARRAY apps LOOP
                INSERT INTO app_subscriptions (
                    organization_id,
                    app_id,
                    subscription_status,
                    subscription_plan,
                    subscription_ends_at,
                    trial_ends_at
                ) VALUES (
                    admin_org_id,
                    app_name,
                    'active',
                    'bundle',
                    NOW() + INTERVAL '10 years', -- Long-term active
                    NULL -- No trial needed
                ) ON CONFLICT (organization_id, app_id) DO UPDATE SET
                    subscription_status = 'active',
                    subscription_plan = 'bundle',
                    subscription_ends_at = NOW() + INTERVAL '10 years',
                    trial_ends_at = NULL,
                    updated_at = NOW();
                    
                RAISE NOTICE 'Created/updated admin subscription for app: %', app_name;
            END LOOP;
            
            RAISE NOTICE '✅ Admin now has active subscriptions to all apps';
        ELSE
            RAISE NOTICE '❌ Admin organization not found';
        END IF;
    ELSE
        RAISE NOTICE '❌ Admin user not found';
    END IF;
END $$;

-- 3. Verify the setup
SELECT 
    'ADMIN USER CHECK' as check_type,
    u.email,
    up.full_name,
    up.is_platform_admin,
    o.Name as org_name
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE u.email = 'alejogaleis@gmail.com';

SELECT 
    'ADMIN SUBSCRIPTIONS' as check_type,
    app_id,
    subscription_status,
    subscription_plan,
    subscription_ends_at > NOW() as is_active,
    trial_ends_at
FROM app_subscriptions
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id IN (
        SELECT id FROM auth.users WHERE email = 'alejogaleis@gmail.com'
    )
);

-- 4. Check if there are any remaining test users
SELECT 
    'REMAINING TEST USERS' as check_type,
    u.email,
    up.full_name,
    o.Name as org_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE u.email != 'alejogaleis@gmail.com';

RAISE NOTICE '🎯 Subscription flow fix complete!';
RAISE NOTICE 'ℹ️  Admin should now have full access to all apps';
RAISE NOTICE 'ℹ️  Test user data has been cleaned up';
RAISE NOTICE 'ℹ️  Ready for fresh signup testing';