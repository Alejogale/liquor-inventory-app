-- Clean database and setup admin-only access
-- This preserves inventory data but cleans up user/org mess

DO $$
DECLARE
    admin_email TEXT := 'alejogaleis@gmail.com';
    admin_user_id UUID;
    admin_org_id UUID;
    inventory_org_id UUID;
BEGIN
    RAISE NOTICE '🧹 Starting clean database setup for admin-only access...';
    
    -- Step 1: Get admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = admin_email;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin user % not found in auth.users!', admin_email;
    END IF;
    
    RAISE NOTICE '✅ Found admin user: % (ID: %)', admin_email, admin_user_id;
    
    -- Step 2: Find organization with inventory data
    SELECT organization_id INTO inventory_org_id 
    FROM inventory_items 
    GROUP BY organization_id 
    ORDER BY COUNT(*) DESC 
    LIMIT 1;
    
    IF inventory_org_id IS NOT NULL THEN
        RAISE NOTICE '📦 Found organization with inventory data: %', inventory_org_id;
        admin_org_id := inventory_org_id;
    END IF;
    
    -- Step 3: Clean up user_custom_permissions
    RAISE NOTICE '🗑️ Cleaning user_custom_permissions...';
    DELETE FROM user_custom_permissions;
    
    -- Step 4: Clean up user_profiles (except admin)
    RAISE NOTICE '🗑️ Cleaning user_profiles (keeping admin)...';
    DELETE FROM user_profiles WHERE id != admin_user_id;
    
    -- Step 5: Clean up app_subscriptions
    RAISE NOTICE '🗑️ Cleaning app_subscriptions...';
    DELETE FROM app_subscriptions;
    
    -- Step 6: Keep only one organization (with inventory data) or create one
    IF admin_org_id IS NULL THEN
        -- Create new organization for admin
        RAISE NOTICE '🏢 Creating new organization for admin...';
        INSERT INTO organizations ("Name", subscription_status, subscription_plan, owner_id, created_by)
        VALUES ('Admin Organization', 'active', 'bundle', admin_user_id, admin_user_id)
        RETURNING id INTO admin_org_id;
        
        -- Update inventory items to belong to admin org
        UPDATE inventory_items SET organization_id = admin_org_id WHERE organization_id IS NULL;
    ELSE
        -- Update existing organization to be owned by admin
        RAISE NOTICE '🏢 Updating existing organization ownership...';
        UPDATE organizations 
        SET 
            owner_id = admin_user_id,
            created_by = admin_user_id,
            subscription_status = 'active',
            subscription_plan = 'bundle'
        WHERE id = admin_org_id;
    END IF;
    
    -- Step 7: Clean up other organizations
    RAISE NOTICE '🗑️ Removing other organizations...';
    DELETE FROM organizations WHERE id != admin_org_id;
    
    -- Step 8: Create/update admin user profile
    RAISE NOTICE '👤 Setting up admin user profile...';
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
        'Platform Administrator',
        admin_email,
        'admin',
        admin_org_id,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = 'Platform Administrator',
        role = 'admin',
        organization_id = admin_org_id,
        is_platform_admin = true,
        updated_at = NOW();
    
    -- Step 9: Create app subscriptions for admin org
    RAISE NOTICE '📱 Creating app subscriptions...';
    INSERT INTO app_subscriptions (organization_id, app_id, subscription_status, subscription_plan, subscription_ends_at)
    VALUES 
        (admin_org_id, 'liquor-inventory', 'active', 'bundle', NOW() + INTERVAL '10 years'),
        (admin_org_id, 'reservation-management', 'active', 'bundle', NOW() + INTERVAL '10 years'),
        (admin_org_id, 'member-database', 'active', 'bundle', NOW() + INTERVAL '10 years'),
        (admin_org_id, 'pos-system', 'active', 'bundle', NOW() + INTERVAL '10 years');
    
    -- Step 10: Fix schema issues first
    RAISE NOTICE '🔧 Fixing schema issues...';
    
    -- Add updated_at column to inventory_items if it doesn't exist
    BEGIN
        ALTER TABLE inventory_items ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE '✅ Added updated_at column to inventory_items';
    EXCEPTION
        WHEN duplicate_column THEN
            RAISE NOTICE 'ℹ️ updated_at column already exists in inventory_items';
    END;
    
    -- Step 11: Update all data to belong to admin org
    RAISE NOTICE '📊 Updating all data to belong to admin organization...';
    
    -- Update inventory items
    UPDATE inventory_items SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    
    -- Update categories
    UPDATE categories SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    
    -- Update suppliers  
    UPDATE suppliers SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    
    -- Update rooms
    UPDATE rooms SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    
    -- Update room_counts
    UPDATE room_counts SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    
    -- Update activity_logs
    UPDATE activity_logs SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    
    -- Update reservations (if exists)
    BEGIN
        UPDATE reservations SET organization_id = admin_org_id WHERE organization_id != admin_org_id OR organization_id IS NULL;
    EXCEPTION
        WHEN undefined_table THEN
            RAISE NOTICE 'Reservations table not found - skipping';
    END;
    
    RAISE NOTICE '=== CLEANUP COMPLETE ===';
    RAISE NOTICE '✅ Admin user: % (ID: %)', admin_email, admin_user_id;
    RAISE NOTICE '✅ Admin organization: % (ID: %)', (SELECT "Name" FROM organizations WHERE id = admin_org_id), admin_org_id;
    RAISE NOTICE '✅ Inventory items: %', (SELECT COUNT(*) FROM inventory_items WHERE organization_id = admin_org_id);
    RAISE NOTICE '✅ Categories: %', (SELECT COUNT(*) FROM categories WHERE organization_id = admin_org_id);
    RAISE NOTICE '✅ Suppliers: %', (SELECT COUNT(*) FROM suppliers WHERE organization_id = admin_org_id);
    RAISE NOTICE '✅ App subscriptions: %', (SELECT COUNT(*) FROM app_subscriptions WHERE organization_id = admin_org_id);
    RAISE NOTICE '🎉 Admin now has full access to all apps and all existing data!';
    
END $$;
