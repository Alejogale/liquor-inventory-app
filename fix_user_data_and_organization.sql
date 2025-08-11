-- Fix User Data and Organization Linking
-- This script fixes the specific issue with user data not showing
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================
SELECT '=== STEP 1: CURRENT STATE CHECK ===' as info;

-- Check current users
SELECT 'Current users:' as check_type;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- Check user profiles
SELECT 'User profiles:' as check_type;
SELECT id, full_name, email, role, organization_id, created_at 
FROM user_profiles 
ORDER BY created_at DESC;

-- Check organizations
SELECT 'Organizations:' as check_type;
SELECT id, "Name", slug, created_by, created_at 
FROM organizations 
ORDER BY created_at DESC;

-- Check data counts
SELECT 'Data counts:' as check_type;
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Suppliers:' as table_name, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'Inventory items:' as table_name, COUNT(*) as count FROM inventory_items
UNION ALL
SELECT 'Rooms:' as table_name, COUNT(*) as count FROM rooms;

-- =====================================================
-- STEP 2: FIND AND FIX USER PROFILES
-- =====================================================
SELECT '=== STEP 2: FINDING AND FIXING USER PROFILES ===' as info;

DO $$
DECLARE
    alehoegali_user_id UUID;
    alejogaleis_user_id UUID;
    org_id UUID;
    profile_count INTEGER;
BEGIN
    -- Find alehoegali@gmail.com user
    SELECT id INTO alehoegali_user_id FROM auth.users WHERE email = 'alehoegali@gmail.com';
    IF alehoegali_user_id IS NULL THEN
        RAISE NOTICE 'alehoegali@gmail.com user not found in auth.users';
    ELSE
        RAISE NOTICE 'Found alehoegali@gmail.com user: %', alehoegali_user_id;
    END IF;

    -- Find alejogaleis@gmail.com user (admin)
    SELECT id INTO alejogaleis_user_id FROM auth.users WHERE email = 'alejogaleis@gmail.com';
    IF alejogaleis_user_id IS NULL THEN
        RAISE NOTICE 'alejogaleis@gmail.com user not found in auth.users';
    ELSE
        RAISE NOTICE 'Found alejogaleis@gmail.com user: %', alejogaleis_user_id;
    END IF;

    -- Check if organizations exist
    SELECT COUNT(*) INTO profile_count FROM organizations;
    
    IF profile_count = 0 THEN
        RAISE NOTICE 'No organizations found. Creating default organization...';
        
        -- Create default organization
        INSERT INTO organizations ("Name", slug, created_by)
        VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, COALESCE(alejogaleis_user_id, alehoegali_user_id))
        RETURNING id INTO org_id;
        
        RAISE NOTICE 'Created default organization: %', org_id;
    ELSE
        -- Get existing organization
        SELECT id INTO org_id FROM organizations LIMIT 1;
        RAISE NOTICE 'Using existing organization: %', org_id;
    END IF;

    -- Create or update alehoegali@gmail.com profile
    IF alehoegali_user_id IS NOT NULL THEN
        -- Check if profile exists
        IF EXISTS (SELECT 1 FROM user_profiles WHERE id = alehoegali_user_id) THEN
            -- Update existing profile
            UPDATE user_profiles 
            SET 
                full_name = 'alehoegali@gmail.com',
                email = 'alehoegali@gmail.com',
                role = 'owner',
                organization_id = org_id
            WHERE id = alehoegali_user_id;
            RAISE NOTICE 'Updated alehoegali@gmail.com profile';
        ELSE
            -- Create new profile
            INSERT INTO user_profiles (id, full_name, email, role, organization_id)
            VALUES (alehoegali_user_id, 'alehoegali@gmail.com', 'alehoegali@gmail.com', 'owner', org_id);
            RAISE NOTICE 'Created alehoegali@gmail.com profile';
        END IF;
    END IF;

    -- Create or update alejogaleis@gmail.com profile (admin)
    IF alejogaleis_user_id IS NOT NULL THEN
        -- Check if profile exists
        IF EXISTS (SELECT 1 FROM user_profiles WHERE id = alejogaleis_user_id) THEN
            -- Update existing profile
            UPDATE user_profiles 
            SET 
                full_name = 'alejogaleis@gmail.com',
                email = 'alejogaleis@gmail.com',
                role = 'admin',
                organization_id = org_id
            WHERE id = alejogaleis_user_id;
            RAISE NOTICE 'Updated alejogaleis@gmail.com profile (admin)';
        ELSE
            -- Create new profile
            INSERT INTO user_profiles (id, full_name, email, role, organization_id)
            VALUES (alejogaleis_user_id, 'alejogaleis@gmail.com', 'alejogaleis@gmail.com', 'admin', org_id);
            RAISE NOTICE 'Created alejogaleis@gmail.com profile (admin)';
        END IF;
    END IF;

END $$;

-- =====================================================
-- STEP 3: LINK EXISTING DATA TO ORGANIZATION
-- =====================================================
SELECT '=== STEP 3: LINKING EXISTING DATA TO ORGANIZATION ===' as info;

DO $$
DECLARE
    org_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get the organization ID
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    IF org_id IS NULL THEN
        RAISE NOTICE 'No organization found. Cannot link data.';
        RETURN;
    END IF;

    RAISE NOTICE 'Linking data to organization: %', org_id;

    -- Link categories
    UPDATE categories
    SET organization_id = org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Linked % categories to organization', updated_count;

    -- Link suppliers
    UPDATE suppliers
    SET organization_id = org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Linked % suppliers to organization', updated_count;

    -- Link inventory items
    UPDATE inventory_items
    SET organization_id = org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Linked % inventory items to organization', updated_count;

    -- Link rooms
    UPDATE rooms
    SET organization_id = org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Linked % rooms to organization', updated_count;

END $$;

-- =====================================================
-- STEP 4: VERIFY THE FIX
-- =====================================================
SELECT '=== STEP 4: VERIFICATION ===' as info;

-- Check user profiles after fix
SELECT 'User profiles after fix:' as check_type;
SELECT id, full_name, email, role, organization_id, created_at 
FROM user_profiles 
ORDER BY created_at DESC;

-- Check data counts after fix
SELECT 'Data counts after fix:' as check_type;
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Suppliers:' as table_name, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'Inventory items:' as table_name, COUNT(*) as count FROM inventory_items
UNION ALL
SELECT 'Rooms:' as table_name, COUNT(*) as count FROM rooms;

-- Check data linked to organization
SELECT 'Data linked to organization:' as check_type;
SELECT 'Categories with organization_id:' as table_name, COUNT(*) as count 
FROM categories WHERE organization_id IS NOT NULL
UNION ALL
SELECT 'Suppliers with organization_id:' as table_name, COUNT(*) as count 
FROM suppliers WHERE organization_id IS NOT NULL
UNION ALL
SELECT 'Inventory items with organization_id:' as table_name, COUNT(*) as count 
FROM inventory_items WHERE organization_id IS NOT NULL
UNION ALL
SELECT 'Rooms with organization_id:' as table_name, COUNT(*) as count 
FROM rooms WHERE organization_id IS NOT NULL;

-- Show sample data
SELECT '=== SAMPLE DATA ===' as info;

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 5;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 5;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 5;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 5;

SELECT '=== USER DATA AND ORGANIZATION FIX COMPLETE ===' as info;
SELECT 'User data should now be properly linked and showing in the dashboard.' as status;
