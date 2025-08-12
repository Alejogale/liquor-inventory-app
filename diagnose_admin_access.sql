-- Diagnose Admin Access Issues
-- Run this in your Supabase SQL Editor to see what's happening

DO $$
DECLARE
    admin_email TEXT := 'alejogaleis@gmail.com';
    admin_user_id UUID;
    admin_profile RECORD;
    admin_org RECORD;
    app_sub RECORD;
BEGIN
    RAISE NOTICE '=== ADMIN ACCESS DIAGNOSIS ===';
    
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE '❌ Admin user not found in auth.users';
        RETURN;
    ELSE
        RAISE NOTICE '✅ Admin user found: %', admin_user_id;
    END IF;
    
    -- Check admin profile
    SELECT * INTO admin_profile FROM user_profiles WHERE id = admin_user_id;
    
    IF admin_profile IS NULL THEN
        RAISE NOTICE '❌ Admin profile not found in user_profiles';
    ELSE
        RAISE NOTICE '✅ Admin profile found:';
        RAISE NOTICE '   - Full name: %', admin_profile.full_name;
        RAISE NOTICE '   - Role: %', admin_profile.role;
        RAISE NOTICE '   - Platform admin: %', admin_profile.is_platform_admin;
        RAISE NOTICE '   - Organization ID: %', admin_profile.organization_id;
    END IF;
    
    -- Check organization
    IF admin_profile.organization_id IS NOT NULL THEN
        SELECT * INTO admin_org FROM organizations WHERE id = admin_profile.organization_id;
        
        IF admin_org IS NULL THEN
            RAISE NOTICE '❌ Organization not found for ID: %', admin_profile.organization_id;
        ELSE
            RAISE NOTICE '✅ Organization found:';
            RAISE NOTICE '   - Name: %', admin_org."Name";
            RAISE NOTICE '   - Subscription status: %', admin_org.subscription_status;
            RAISE NOTICE '   - Subscription plan: %', admin_org.subscription_plan;
        END IF;
    ELSE
        RAISE NOTICE '❌ No organization_id in admin profile';
    END IF;
    
    -- Check app subscriptions
    IF admin_org.id IS NOT NULL THEN
        RAISE NOTICE '📱 Checking app subscriptions for organization: %', admin_org.id;
        
        FOR app_sub IN 
            SELECT * FROM app_subscriptions 
            WHERE organization_id = admin_org.id
        LOOP
            RAISE NOTICE '   - %: % (% plan)', 
                app_sub.app_id, 
                app_sub.subscription_status, 
                app_sub.subscription_plan;
        END LOOP;
    END IF;
    
    -- Check inventory data
    RAISE NOTICE '📊 Checking inventory data:';
    
    DECLARE
        item_count INTEGER;
        org_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO item_count FROM inventory_items;
        SELECT COUNT(*) INTO org_count FROM inventory_items WHERE organization_id = admin_org.id;
        
        RAISE NOTICE '   - Total inventory items: %', item_count;
        RAISE NOTICE '   - Items in admin org: %', org_count;
    END;
    
    RAISE NOTICE '=== DIAGNOSIS COMPLETE ===';
    
END $$;
