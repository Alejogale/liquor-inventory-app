-- Comprehensive Fix for Authentication and Data Access Issues
-- Run this in your Supabase SQL Editor
-- This script fixes all the issues with user authentication and data access

-- Step 1: Check current state
SELECT '=== STEP 1: CURRENT STATE CHECK ===' as info;

-- Check organizations table structure
SELECT 'Organizations table structure:' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check user_profiles table structure
SELECT 'User_profiles table structure:' as check_type;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Step 2: Fix user profiles and organization linking
SELECT '=== STEP 2: FIX USER PROFILES AND ORGANIZATION LINKING ===' as info;

DO $$
DECLARE
    user_id UUID;
    org_id UUID;
    profile_count INTEGER;
BEGIN
    -- Get the first user (assuming it's the main user)
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Processing user: %', user_id;
    
    -- Check if user profile exists
    SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = user_id;
    
    IF profile_count = 0 THEN
        RAISE NOTICE 'Creating user profile for user: %', user_id;
        
        -- Create user profile
        INSERT INTO user_profiles (id, full_name, email, role, organization_id)
        SELECT 
            u.id,
            COALESCE(u.raw_user_meta_data->>'full_name', u.email),
            u.email,
            'owner',
            NULL
        FROM auth.users u
        WHERE u.id = user_id;
        
        RAISE NOTICE 'Created user profile for user: %', user_id;
    ELSE
        RAISE NOTICE 'User profile already exists for user: %', user_id;
    END IF;
    
    -- Get or create organization
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    IF org_id IS NULL THEN
        RAISE NOTICE 'No organizations found. Creating a default organization...';
        
        -- Create a default organization
        INSERT INTO organizations ("Name", slug, created_by)
        VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, user_id)
        RETURNING id INTO org_id;
        
        RAISE NOTICE 'Created default organization: %', org_id;
    ELSE
        RAISE NOTICE 'Using existing organization: %', org_id;
    END IF;
    
    -- Link user profile to organization
    UPDATE user_profiles 
    SET organization_id = org_id
    WHERE id = user_id AND (organization_id IS NULL OR organization_id != org_id);
    
    RAISE NOTICE 'Linked user profile to organization: %', org_id;
    
END $$;

-- Step 3: Fix orphaned data by linking to the first organization
SELECT '=== STEP 3: FIX ORPHANED DATA ===' as info;

DO $$
DECLARE
    first_org_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get the first organization
    SELECT id INTO first_org_id FROM organizations LIMIT 1;
    
    IF first_org_id IS NULL THEN
        RAISE NOTICE 'No organizations found. Cannot fix orphaned data.';
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

-- Step 4: Verify the fix
SELECT '=== STEP 4: VERIFICATION ===' as info;

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

-- Step 5: Show sample data
SELECT '=== STEP 5: SAMPLE DATA ===' as info;

SELECT 'Sample user profiles:' as check_type;
SELECT id, full_name, email, organization_id FROM user_profiles LIMIT 3;

SELECT 'Sample organizations:' as check_type;
SELECT id, "Name", slug FROM organizations LIMIT 3;

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 3;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 3;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 3;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 3;

-- Step 6: Test RLS access
SELECT '=== STEP 6: RLS ACCESS TEST ===' as info;

-- Test if user can access their own profile
SELECT 'Can access own profile:' as test, COUNT(*) as count
FROM user_profiles 
WHERE id = auth.uid();

-- Test if user can access their organization
SELECT 'Can access organization:' as test, COUNT(*) as count
FROM organizations 
WHERE id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if user can access data in their organization
SELECT 'Can access categories:' as test, COUNT(*) as count
FROM categories 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT 'Can access suppliers:' as test, COUNT(*) as count
FROM suppliers 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT 'Can access inventory_items:' as test, COUNT(*) as count
FROM inventory_items 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT 'Can access rooms:' as test, COUNT(*) as count
FROM rooms 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT '=== COMPREHENSIVE FIX COMPLETE ===' as info;
SELECT 'Authentication and data access should now be working. Dashboard should show data correctly.' as status;
