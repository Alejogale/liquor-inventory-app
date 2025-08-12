-- Setup Manager User with Full Access
-- Run this in your Supabase SQL Editor to give alehoegali@gmail.com full manager access

-- First, let's check if the user exists and get their details
DO $$
DECLARE
    target_user_id UUID;
    target_org_id UUID;
    user_email TEXT := 'alehoegali@gmail.com';
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User % not found in auth.users', user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user: % with ID: %', user_email, target_user_id;
    
    -- Get or create organization for this user
    SELECT id INTO target_org_id 
    FROM organizations 
    LIMIT 1;
    
    IF target_org_id IS NULL THEN
        -- Create a default organization if none exists
        INSERT INTO organizations ("Name", slug, subscription_status, subscription_plan, created_by)
        VALUES ('Test Organization', 'test-org-' || extract(epoch from now()), 'active', 'professional', target_user_id)
        RETURNING id INTO target_org_id;
        
        RAISE NOTICE 'Created organization with ID: %', target_org_id;
    ELSE
        RAISE NOTICE 'Using existing organization with ID: %', target_org_id;
    END IF;
    
    -- Create or update user profile with manager role and full access
    INSERT INTO user_profiles (
        id, 
        full_name, 
        email, 
        role, 
        job_title,
        organization_id,
        is_platform_admin,
        app_access,
        status
    ) VALUES (
        target_user_id,
        'Manager User',
        user_email,
        'manager',
        'Operations Manager',
        target_org_id,
        FALSE, -- Not platform admin, but manager with full access
        ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'], -- All apps
        'active'
    )
    ON CONFLICT (id) DO UPDATE SET
        role = 'manager',
        job_title = 'Operations Manager',
        organization_id = target_org_id,
        app_access = ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'],
        status = 'active',
        updated_at = NOW();
    
    RAISE NOTICE 'User profile created/updated for %', user_email;
    
    -- Grant custom permissions for all features to this manager
    -- Delete existing permissions first
    DELETE FROM user_custom_permissions WHERE user_id = target_user_id;
    
    -- Insert comprehensive permissions for all apps
    INSERT INTO user_custom_permissions (user_id, organization_id, app_id, permission_type, is_active, granted_by)
    VALUES 
        -- Liquor Inventory permissions
        (target_user_id, target_org_id, 'liquor-inventory', 'view', TRUE, target_user_id),
        (target_user_id, target_org_id, 'liquor-inventory', 'create', TRUE, target_user_id),
        (target_user_id, target_org_id, 'liquor-inventory', 'edit', TRUE, target_user_id),
        (target_user_id, target_org_id, 'liquor-inventory', 'delete', TRUE, target_user_id),
        (target_user_id, target_org_id, 'liquor-inventory', 'export', TRUE, target_user_id),
        (target_user_id, target_org_id, 'liquor-inventory', 'admin', TRUE, target_user_id),
        
        -- Reservation Management permissions
        (target_user_id, target_org_id, 'reservation-management', 'view', TRUE, target_user_id),
        (target_user_id, target_org_id, 'reservation-management', 'create', TRUE, target_user_id),
        (target_user_id, target_org_id, 'reservation-management', 'edit', TRUE, target_user_id),
        (target_user_id, target_org_id, 'reservation-management', 'delete', TRUE, target_user_id),
        (target_user_id, target_org_id, 'reservation-management', 'export', TRUE, target_user_id),
        (target_user_id, target_org_id, 'reservation-management', 'admin', TRUE, target_user_id),
        
        -- Member Database permissions
        (target_user_id, target_org_id, 'member-database', 'view', TRUE, target_user_id),
        (target_user_id, target_org_id, 'member-database', 'create', TRUE, target_user_id),
        (target_user_id, target_org_id, 'member-database', 'edit', TRUE, target_user_id),
        (target_user_id, target_org_id, 'member-database', 'delete', TRUE, target_user_id),
        (target_user_id, target_org_id, 'member-database', 'export', TRUE, target_user_id),
        (target_user_id, target_org_id, 'member-database', 'admin', TRUE, target_user_id),
        
        -- POS System permissions
        (target_user_id, target_org_id, 'pos-system', 'view', TRUE, target_user_id),
        (target_user_id, target_org_id, 'pos-system', 'create', TRUE, target_user_id),
        (target_user_id, target_org_id, 'pos-system', 'edit', TRUE, target_user_id),
        (target_user_id, target_org_id, 'pos-system', 'delete', TRUE, target_user_id),
        (target_user_id, target_org_id, 'pos-system', 'export', TRUE, target_user_id),
        (target_user_id, target_org_id, 'pos-system', 'admin', TRUE, target_user_id);
    
    RAISE NOTICE 'Custom permissions granted for all apps';
    
    -- Update organization subscription to ensure access
    UPDATE organizations 
    SET 
        subscription_status = 'active',
        subscription_plan = 'professional',
        updated_at = NOW()
    WHERE id = target_org_id;
    
    RAISE NOTICE 'Organization subscription updated to active/professional';
    
    -- Log this setup in activity logs (if table exists with correct schema)
    BEGIN
        INSERT INTO activity_logs (user_id, organization_id, action, details, ip_address, user_agent)
        VALUES (
            target_user_id,
            target_org_id,
            'manager_setup_full_access',
            jsonb_build_object(
                'email', user_email,
                'role', 'manager',
                'app_access', ARRAY['liquor-inventory', 'reservation-management', 'member-database', 'pos-system'],
                'permissions_granted', 'all',
                'setup_by', 'admin_script'
            ),
            'system',
            'database_script'
        );
        RAISE NOTICE 'Activity logged for manager setup';
    EXCEPTION 
        WHEN undefined_column THEN
            RAISE NOTICE 'Activity logs table schema mismatch - skipping logging';
        WHEN undefined_table THEN
            RAISE NOTICE 'Activity logs table not found - skipping logging';
    END;
    RAISE NOTICE '✅ Manager user % is now set up with full access to all features!', user_email;
    
END $$;

-- Verify the setup
SELECT 
    up.email,
    up.role,
    up.job_title,
    up.app_access,
    up.status,
    o."Name" as organization_name,
    o.subscription_status,
    o.subscription_plan
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
WHERE up.email = 'alehoegali@gmail.com';

-- Show custom permissions
SELECT 
    ucp.app_id,
    ucp.permission_type,
    ucp.is_active,
    ucp.created_at
FROM user_custom_permissions ucp
JOIN user_profiles up ON ucp.user_id = up.id
WHERE up.email = 'alehoegali@gmail.com'
ORDER BY ucp.app_id, ucp.permission_type;
