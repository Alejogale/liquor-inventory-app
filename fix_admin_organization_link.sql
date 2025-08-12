-- Fix Admin Organization Link
-- Run this in your Supabase SQL Editor

DO $$
DECLARE
    admin_email TEXT := 'alejogaleis@gmail.com';
    admin_user_id UUID;
    admin_org_id UUID;
BEGIN
    RAISE NOTICE '🔧 Fixing admin organization link...';
    
    -- Get admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        RAISE NOTICE '❌ Admin user not found';
        RETURN;
    END IF;
    
    -- Find the organization with inventory data (should be the one we set up)
    SELECT id INTO admin_org_id FROM organizations 
    WHERE id IN (
        SELECT DISTINCT organization_id 
        FROM inventory_items 
        WHERE organization_id IS NOT NULL
    )
    LIMIT 1;
    
    IF admin_org_id IS NULL THEN
        RAISE NOTICE '❌ No organization with inventory data found';
        RETURN;
    END IF;
    
    RAISE NOTICE '✅ Found organization with inventory: %', admin_org_id;
    
    -- Update admin profile to link to this organization
    UPDATE user_profiles 
    SET 
        organization_id = admin_org_id,
        role = 'admin',
        is_platform_admin = true,
        updated_at = NOW()
    WHERE id = admin_user_id;
    
    IF FOUND THEN
        RAISE NOTICE '✅ Admin profile updated successfully';
    ELSE
        RAISE NOTICE '❌ Failed to update admin profile';
    END IF;
    
    -- Verify the update
    SELECT organization_id INTO admin_org_id 
    FROM user_profiles 
    WHERE id = admin_user_id;
    
    RAISE NOTICE '✅ Admin is now linked to organization: %', admin_org_id;
    
END $$;
