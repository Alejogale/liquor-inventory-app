-- Immediate Fix - Resolve Dashboard Data Issues
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check current state
-- =====================================================
SELECT '=== STEP 1: CURRENT STATE CHECK ===' as info;

-- Check if user_profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as user_profiles_exists;

-- Check if organizations table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations'
) as organizations_exists;

-- Check current users
SELECT 'Current users:' as check_type, COUNT(*) as count FROM auth.users;

-- Check if user_profiles table has data
SELECT 'User profiles count:' as check_type, COUNT(*) as count FROM user_profiles;

-- Check if organizations table has data
SELECT 'Organizations count:' as check_type, COUNT(*) as count FROM organizations;

-- =====================================================
-- STEP 2: Create user profile for current user
-- =====================================================
SELECT '=== STEP 2: CREATE USER PROFILE ===' as info;

DO $$
DECLARE
    user_id UUID;
    user_email TEXT;
    profile_count INTEGER;
BEGIN
    -- Get the first user
    SELECT id, email INTO user_id, user_email FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE '❌ No users found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Processing user: % (email: %)', user_id, user_email;
    
    -- Check if user profile exists
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = user_id;
    
    IF profile_count = 0 THEN
        RAISE NOTICE 'Creating user profile for user: %', user_id;
        
        -- Create user profile
        INSERT INTO user_profiles (id, full_name, email, role, organization_id)
        VALUES (user_id, COALESCE(user_email, 'Dashboard User'), user_email, 'owner', NULL);
        
        RAISE NOTICE '✅ User profile created successfully';
    ELSE
        RAISE NOTICE '✅ User profile already exists';
    END IF;
END $$;

-- =====================================================
-- STEP 3: Create organization and link user
-- =====================================================
SELECT '=== STEP 3: CREATE ORGANIZATION ===' as info;

DO $$
DECLARE
    user_id UUID;
    org_id UUID;
    org_count INTEGER;
BEGIN
    -- Get the first user
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE '❌ No users found in auth.users';
        RETURN;
    END IF;
    
    -- Check if organization exists
    SELECT COUNT(*) INTO org_count FROM organizations;
    
    IF org_count = 0 THEN
        RAISE NOTICE 'Creating organization for user: %', user_id;
        
        -- Create organization
        INSERT INTO organizations ("Name", slug, created_by)
        VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, user_id)
        RETURNING id INTO org_id;
        
        RAISE NOTICE '✅ Organization created successfully: %', org_id;
    ELSE
        -- Get existing organization
        SELECT id INTO org_id FROM organizations LIMIT 1;
        RAISE NOTICE '✅ Using existing organization: %', org_id;
    END IF;
    
    -- Link user profile to organization
    UPDATE user_profiles 
    SET organization_id = org_id
    WHERE id = user_id AND (organization_id IS NULL OR organization_id != org_id);
    
    RAISE NOTICE '✅ User profile linked to organization: %', org_id;
END $$;

-- =====================================================
-- STEP 4: Fix orphaned data
-- =====================================================
SELECT '=== STEP 4: FIX ORPHANED DATA ===' as info;

DO $$
DECLARE
    first_org_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get the first organization
    SELECT id INTO first_org_id FROM organizations LIMIT 1;
    
    IF first_org_id IS NULL THEN
        RAISE NOTICE '❌ No organizations found. Cannot fix orphaned data.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Linking orphaned data to organization: %', first_org_id;
    
    -- Fix categories with NULL organization_id
    UPDATE categories
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % categories with organization_id', updated_count;
    
    -- Fix suppliers with NULL organization_id
    UPDATE suppliers
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % suppliers with organization_id', updated_count;
    
    -- Fix inventory_items with NULL organization_id
    UPDATE inventory_items
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % inventory items with organization_id', updated_count;
    
    -- Fix rooms with NULL organization_id
    UPDATE rooms
    SET organization_id = first_org_id
    WHERE organization_id IS NULL;
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % rooms with organization_id', updated_count;
    
END $$;

-- =====================================================
-- STEP 5: Verify the fix
-- =====================================================
SELECT '=== STEP 5: VERIFICATION ===' as info;

-- Check user profiles
SELECT 'User profiles with organization_id:' as check_type, COUNT(*) as count
FROM user_profiles WHERE organization_id IS NOT NULL;

-- Check data in organizations
SELECT 'Categories in organizations:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NOT NULL;

SELECT 'Suppliers in organizations:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NOT NULL;

SELECT 'Inventory items in organizations:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NOT NULL;

SELECT 'Rooms in organizations:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NOT NULL;

-- =====================================================
-- STEP 6: Show final state
-- =====================================================
SELECT '=== STEP 6: FINAL STATE ===' as info;

SELECT 'Sample user profiles:' as check_type;
SELECT id, full_name, email, organization_id, role FROM user_profiles LIMIT 3;

SELECT 'Sample organizations:' as check_type;
SELECT id, "Name", slug, created_by FROM organizations LIMIT 3;

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 3;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 3;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 3;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 3;

SELECT '=== IMMEDIATE FIX COMPLETE ===' as info;
SELECT 'Dashboard should now show data correctly. Please refresh the page.' as status;
