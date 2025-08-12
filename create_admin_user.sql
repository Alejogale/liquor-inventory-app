-- Create Admin User Profile
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    admin_email TEXT := 'alejogaleis@gmail.com';
    admin_user_id UUID;
    admin_org_id UUID;
BEGIN
    RAISE NOTICE '🔧 Creating admin user profile...';
    
    -- Get admin user ID from auth.users
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE '❌ Admin user not found in auth.users - you need to create the user first';
        RAISE NOTICE 'Please go to Supabase Dashboard > Authentication > Users and create a user with email: %', admin_email;
        RETURN;
    ELSE
        RAISE NOTICE '✅ Admin user found in auth.users: %', admin_user_id;
    END IF;
    
    -- Get the organization ID
    SELECT id INTO admin_org_id FROM organizations LIMIT 1;
    
    IF admin_org_id IS NULL THEN
        RAISE NOTICE '❌ No organization found';
        RETURN;
    ELSE
        RAISE NOTICE '✅ Found organization: %', admin_org_id;
    END IF;
    
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = admin_user_id) THEN
        RAISE NOTICE 'ℹ️ Admin profile already exists, updating...';
        
        UPDATE user_profiles 
        SET 
            full_name = 'Platform Admin',
            email = admin_email,
            role = 'admin',
            organization_id = admin_org_id,
            is_platform_admin = true,
            updated_at = NOW()
        WHERE id = admin_user_id;
        
        RAISE NOTICE '✅ Admin profile updated successfully';
    ELSE
        RAISE NOTICE 'ℹ️ Creating new admin profile...';
        
        INSERT INTO user_profiles (
            id,
            full_name,
            email,
            role,
            organization_id,
            is_platform_admin,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'Platform Admin',
            admin_email,
            'admin',
            admin_org_id,
            true,
            NOW(),
            NOW()
        );
        
        RAISE NOTICE '✅ Admin profile created successfully';
    END IF;
    
    -- Verify the profile was created/updated
    RAISE NOTICE '✅ Profile verification:';
    RAISE NOTICE '   - Full name: %', (SELECT full_name FROM user_profiles WHERE id = admin_user_id);
    RAISE NOTICE '   - Role: %', (SELECT role FROM user_profiles WHERE id = admin_user_id);
    RAISE NOTICE '   - Organization ID: %', (SELECT organization_id FROM user_profiles WHERE id = admin_user_id);
    RAISE NOTICE '   - Platform Admin: %', (SELECT is_platform_admin FROM user_profiles WHERE id = admin_user_id);
    
    RAISE NOTICE '✅ Admin user setup complete!';
    
END $$;
