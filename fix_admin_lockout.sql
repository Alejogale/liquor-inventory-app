-- =====================================================
-- FIX ADMIN LOCKOUT FOR alejogaleis@gmail.com
-- Run this in Supabase SQL Editor AFTER running diagnose_admin_lockout.sql
-- =====================================================

-- Step 1: Get the user ID from auth.users
DO $$
DECLARE
    admin_user_id UUID;
    admin_org_id UUID;
BEGIN
    -- Get user ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'alejogaleis@gmail.com';

    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'ERROR: User alejogaleis@gmail.com not found in auth.users. Please sign up first.';
        RETURN;
    END IF;

    RAISE NOTICE 'Found user ID: %', admin_user_id;

    -- Step 2: Check if user_profiles exists, create if not
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = admin_user_id) THEN
        INSERT INTO user_profiles (id, email, first_name, last_name, role, is_platform_admin, created_at)
        VALUES (admin_user_id, 'alejogaleis@gmail.com', 'Admin', 'User', 'owner', TRUE, NOW());
        RAISE NOTICE 'Created user_profiles entry';
    END IF;

    -- Step 3: Set is_platform_admin to TRUE
    UPDATE user_profiles
    SET is_platform_admin = TRUE,
        role = 'owner'
    WHERE id = admin_user_id;
    RAISE NOTICE 'Set is_platform_admin = TRUE';

    -- Step 4: Check if there's an organization to link to
    SELECT id INTO admin_org_id FROM organizations LIMIT 1;

    IF admin_org_id IS NULL THEN
        -- Create a new organization for admin
        INSERT INTO organizations (name, owner_id, subscription_status, subscription_plan, created_at)
        VALUES ('Admin Organization', admin_user_id, 'active', 'business', NOW())
        RETURNING id INTO admin_org_id;
        RAISE NOTICE 'Created new organization: %', admin_org_id;
    END IF;

    -- Step 5: Link user to organization
    UPDATE user_profiles
    SET organization_id = admin_org_id
    WHERE id = admin_user_id;
    RAISE NOTICE 'Linked user to organization: %', admin_org_id;

    -- Step 6: Create app_subscriptions for all apps
    INSERT INTO app_subscriptions (organization_id, app_id, subscription_status, subscription_plan, created_at, updated_at)
    VALUES
        (admin_org_id, 'liquor-inventory', 'active', 'bundle', NOW(), NOW()),
        (admin_org_id, 'consumption-tracker', 'active', 'bundle', NOW(), NOW())
    ON CONFLICT (organization_id, app_id) DO UPDATE
    SET subscription_status = 'active',
        subscription_plan = 'bundle',
        updated_at = NOW();
    RAISE NOTICE 'Created/updated app_subscriptions';

    -- Step 7: Make sure organization has active subscription
    UPDATE organizations
    SET subscription_status = 'active',
        subscription_plan = 'business'
    WHERE id = admin_org_id;
    RAISE NOTICE 'Updated organization subscription status';

    RAISE NOTICE 'SUCCESS: Admin user alejogaleis@gmail.com should now have full access!';
END $$;

-- Verify the fix
SELECT
    'VERIFICATION' as check_type,
    up.email,
    up.is_platform_admin,
    up.organization_id,
    o.name as org_name,
    o.subscription_status,
    o.subscription_plan
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE up.email = 'alejogaleis@gmail.com';
