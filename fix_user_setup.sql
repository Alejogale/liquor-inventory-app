-- Fix user setup for both admin and manager
-- This ensures alejogaleis@gmail.com is admin and alehoegali@gmail.com is manager with full access

DO $$
DECLARE
    admin_email TEXT := 'alejogaleis@gmail.com';
    manager_email TEXT := 'alehoegali@gmail.com';
    admin_user_id UUID;
    manager_user_id UUID;
    admin_org_id UUID;
    manager_org_id UUID;
    rec RECORD;
BEGIN
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
    
    -- Get manager user ID  
    SELECT id INTO manager_user_id FROM auth.users WHERE email = manager_email;
    
    RAISE NOTICE 'Admin user ID: %', admin_user_id;
    RAISE NOTICE 'Manager user ID: %', manager_user_id;
    
    -- Check current status
    RAISE NOTICE '=== CURRENT STATUS ===';
    RAISE NOTICE 'Admin profile exists: %', (SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = admin_user_id));
    RAISE NOTICE 'Manager profile exists: %', (SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = manager_user_id));
    
    -- Get organization IDs
    SELECT organization_id INTO admin_org_id FROM user_profiles WHERE id = admin_user_id;
    SELECT organization_id INTO manager_org_id FROM user_profiles WHERE id = manager_user_id;
    
    RAISE NOTICE 'Admin org ID: %', admin_org_id;
    RAISE NOTICE 'Manager org ID: %', manager_org_id;
    
    -- Ensure admin has profile and is marked as platform admin
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO user_profiles (id, full_name, email, role, is_platform_admin, created_at, updated_at)
        VALUES (admin_user_id, 'Platform Admin', admin_email, 'admin', true, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            is_platform_admin = true,
            role = 'admin',
            full_name = COALESCE(user_profiles.full_name, 'Platform Admin'),
            updated_at = NOW();
        RAISE NOTICE '✅ Admin profile ensured';
    END IF;
    
    -- Ensure manager has profile and full access
    IF manager_user_id IS NOT NULL THEN
        -- If manager doesn't have an organization, create one
        IF manager_org_id IS NULL THEN
            INSERT INTO organizations ("Name", subscription_status, subscription_plan, created_at, updated_at)
            VALUES ('Manager Organization', 'active', 'professional', NOW(), NOW())
            RETURNING id INTO manager_org_id;
            RAISE NOTICE '✅ Created organization for manager: %', manager_org_id;
        END IF;
        
        INSERT INTO user_profiles (id, full_name, email, role, organization_id, is_platform_admin, created_at, updated_at)
        VALUES (manager_user_id, 'Manager User', manager_email, 'manager', manager_org_id, false, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            role = 'manager',
            organization_id = manager_org_id,
            full_name = COALESCE(user_profiles.full_name, 'Manager User'),
            updated_at = NOW();
        RAISE NOTICE '✅ Manager profile ensured';
        
        -- Grant full app access to manager
        DELETE FROM user_custom_permissions WHERE user_id = manager_user_id;
        
        -- Only add permissions if we have an organization
        IF manager_org_id IS NOT NULL THEN
            INSERT INTO user_custom_permissions (user_id, organization_id, app_id, permission_type, granted_by, created_at)
            VALUES 
                (manager_user_id, manager_org_id, 'liquor-inventory', 'admin', admin_user_id, NOW()),
                (manager_user_id, manager_org_id, 'reservation-management', 'admin', admin_user_id, NOW()),
                (manager_user_id, manager_org_id, 'member-database', 'admin', admin_user_id, NOW()),
                (manager_user_id, manager_org_id, 'pos-system', 'admin', admin_user_id, NOW());
            RAISE NOTICE '✅ Manager permissions granted for organization: %', manager_org_id;
        ELSE
            RAISE NOTICE '⚠️ No organization found for manager - skipping permissions';
        END IF;
    END IF;
    
    -- Show final status
    RAISE NOTICE '=== FINAL STATUS ===';
    RAISE NOTICE 'Users and roles:';
    
    -- Show admin status
    SELECT u.email, up.role, up.is_platform_admin, o."Name" as org_name
    INTO rec
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    LEFT JOIN organizations o ON up.organization_id = o.id
    WHERE u.email = admin_email;
    
    IF FOUND THEN
        RAISE NOTICE '  % | % | Platform Admin: % | Org: %', 
            rec.email, rec.role, rec.is_platform_admin, COALESCE(rec.org_name, 'None');
    END IF;
    
    -- Show manager status
    SELECT u.email, up.role, up.is_platform_admin, o."Name" as org_name
    INTO rec
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    LEFT JOIN organizations o ON up.organization_id = o.id
    WHERE u.email = manager_email;
    
    IF FOUND THEN
        RAISE NOTICE '  % | % | Platform Admin: % | Org: %', 
            rec.email, rec.role, rec.is_platform_admin, COALESCE(rec.org_name, 'None');
    END IF;
    
END $$;
