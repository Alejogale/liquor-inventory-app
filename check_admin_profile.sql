-- Check Admin Profile and Organization Link
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    admin_email TEXT := 'alejogaleis@gmail.com';
    admin_user_id UUID;
    admin_profile RECORD;
    admin_org RECORD;
BEGIN
    RAISE NOTICE '=== CHECKING ADMIN PROFILE ===';
    
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
        RETURN;
    ELSE
        RAISE NOTICE '✅ Admin profile found:';
        RAISE NOTICE '   - Full name: %', admin_profile.full_name;
        RAISE NOTICE '   - Role: %', admin_profile.role;
        RAISE NOTICE '   - Platform admin: %', admin_profile.is_platform_admin;
        RAISE NOTICE '   - Organization ID: %', admin_profile.organization_id;
    END IF;
    
    -- Check if organization_id is NULL
    IF admin_profile.organization_id IS NULL THEN
        RAISE NOTICE '❌ PROBLEM: organization_id is NULL in admin profile!';
        
        -- Find the organization with inventory data
        SELECT id INTO admin_org FROM organizations 
        WHERE id IN (
            SELECT DISTINCT organization_id 
            FROM inventory_items 
            WHERE organization_id IS NOT NULL
        )
        LIMIT 1;
        
        IF admin_org IS NULL THEN
            RAISE NOTICE '❌ No organization with inventory data found';
        ELSE
            RAISE NOTICE '✅ Found organization with inventory: %', admin_org.id;
            
            -- Fix the profile
            UPDATE user_profiles 
            SET 
                organization_id = admin_org.id,
                role = 'admin',
                is_platform_admin = true,
                updated_at = NOW()
            WHERE id = admin_user_id;
            
            RAISE NOTICE '✅ Fixed admin profile - linked to organization: %', admin_org.id;
        END IF;
    ELSE
        -- Check if the organization exists
        SELECT * INTO admin_org FROM organizations WHERE id = admin_profile.organization_id;
        
        IF admin_org IS NULL THEN
            RAISE NOTICE '❌ Organization not found for ID: %', admin_profile.organization_id;
        ELSE
            RAISE NOTICE '✅ Organization found:';
            RAISE NOTICE '   - Name: %', admin_org."Name";
            RAISE NOTICE '   - Subscription status: %', admin_org.subscription_status;
            RAISE NOTICE '   - Subscription plan: %', admin_org.subscription_plan;
        END IF;
    END IF;
    
    RAISE NOTICE '=== CHECK COMPLETE ===';
    
END $$;
