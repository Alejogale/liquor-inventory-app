-- Systematic Diagnosis - Check Each Scenario One by One
-- Run this in your Supabase SQL Editor to identify the exact issues

-- =====================================================
-- SCENARIO 1: Check if user exists in auth.users
-- =====================================================
SELECT '=== SCENARIO 1: AUTH.USERS CHECK ===' as info;

SELECT 'Users in auth.users:' as check_type, COUNT(*) as count FROM auth.users;

SELECT 'Sample users:' as check_type;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- =====================================================
-- SCENARIO 2: Check if user_profiles table exists and has data
-- =====================================================
SELECT '=== SCENARIO 2: USER_PROFILES TABLE CHECK ===' as info;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles'
) as table_exists;

-- If table exists, check data
DO $$
DECLARE
    profile_count INTEGER;
    profile_record RECORD;
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) THEN
        RAISE NOTICE 'user_profiles table exists';
        
        -- Check user_profiles data
        SELECT COUNT(*) INTO profile_count FROM user_profiles;
        RAISE NOTICE 'User profiles count: %', profile_count;
        
        RAISE NOTICE 'Sample user profiles:';
        FOR profile_record IN SELECT id, full_name, email, organization_id FROM user_profiles LIMIT 3 LOOP
            RAISE NOTICE '  - ID: %, Name: %, Email: %, Org: %', profile_record.id, profile_record.full_name, profile_record.email, profile_record.organization_id;
        END LOOP;
    ELSE
        RAISE NOTICE 'user_profiles table does NOT exist';
    END IF;
END $$;

-- =====================================================
-- SCENARIO 3: Check if organizations table exists and has data
-- =====================================================
SELECT '=== SCENARIO 3: ORGANIZATIONS TABLE CHECK ===' as info;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations'
) as table_exists;

-- If table exists, check data
DO $$
DECLARE
    org_count INTEGER;
    org_record RECORD;
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations'
    ) THEN
        RAISE NOTICE 'organizations table exists';
        
        -- Check organizations data
        SELECT COUNT(*) INTO org_count FROM organizations;
        RAISE NOTICE 'Organizations count: %', org_count;
        
        RAISE NOTICE 'Sample organizations:';
        FOR org_record IN SELECT id, "Name", slug, created_by FROM organizations LIMIT 3 LOOP
            RAISE NOTICE '  - ID: %, Name: %, Slug: %, Created_by: %', org_record.id, org_record."Name", org_record.slug, org_record.created_by;
        END LOOP;
    ELSE
        RAISE NOTICE 'organizations table does NOT exist';
    END IF;
END $$;

-- =====================================================
-- SCENARIO 4: Check if user has a profile
-- =====================================================
SELECT '=== SCENARIO 4: USER PROFILE CHECK ===' as info;

DO $$
DECLARE
    user_id UUID;
    profile_count INTEGER;
    profile_record RECORD;
BEGIN
    -- Get the first user
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users';
    ELSE
        RAISE NOTICE 'Checking profile for user: %', user_id;
        
        -- Check if user has a profile
        SELECT COUNT(*) INTO profile_count FROM user_profiles WHERE id = user_id;
        
        IF profile_count = 0 THEN
            RAISE NOTICE '❌ User does NOT have a profile';
        ELSE
            RAISE NOTICE '✅ User has a profile';
            
            -- Show profile details
            FOR profile_record IN SELECT id, full_name, email, organization_id, role FROM user_profiles WHERE id = user_id LOOP
                RAISE NOTICE '  - Profile: ID=%, Name=%, Email=%, Org=%, Role=%', profile_record.id, profile_record.full_name, profile_record.email, profile_record.organization_id, profile_record.role;
            END LOOP;
        END IF;
    END IF;
END $$;

-- =====================================================
-- SCENARIO 5: Check if user's organization exists
-- =====================================================
SELECT '=== SCENARIO 5: USER ORGANIZATION CHECK ===' as info;

DO $$
DECLARE
    user_id UUID;
    org_id UUID;
    org_count INTEGER;
    org_record RECORD;
BEGIN
    -- Get the first user
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'No users found in auth.users';
    ELSE
        -- Check if user has a profile with organization_id
        SELECT organization_id INTO org_id FROM user_profiles WHERE id = user_id;
        
        IF org_id IS NULL THEN
            RAISE NOTICE '❌ User profile has NULL organization_id';
        ELSE
            RAISE NOTICE 'User profile has organization_id: %', org_id;
            
            -- Check if organization exists
            SELECT COUNT(*) INTO org_count FROM organizations WHERE id = org_id;
            
            IF org_count = 0 THEN
                RAISE NOTICE '❌ Organization does NOT exist for ID: %', org_id;
            ELSE
                RAISE NOTICE '✅ Organization exists for ID: %', org_id;
                
                -- Show organization details
                FOR org_record IN SELECT id, "Name", slug, created_by FROM organizations WHERE id = org_id LOOP
                    RAISE NOTICE '  - Organization: ID=%, Name=%, Slug=%, Created_by=%', org_record.id, org_record."Name", org_record.slug, org_record.created_by;
                END LOOP;
            END IF;
        END IF;
    END IF;
END $$;

-- =====================================================
-- SCENARIO 6: Check for orphaned data
-- =====================================================
SELECT '=== SCENARIO 6: ORPHANED DATA CHECK ===' as info;

-- Check categories
SELECT 'Categories with NULL organization_id:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NULL;

-- Check suppliers
SELECT 'Suppliers with NULL organization_id:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NULL;

-- Check inventory_items
SELECT 'Inventory items with NULL organization_id:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NULL;

-- Check rooms
SELECT 'Rooms with NULL organization_id:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NULL;

-- =====================================================
-- SCENARIO 7: Check RLS policies
-- =====================================================
SELECT '=== SCENARIO 7: RLS POLICIES CHECK ===' as info;

-- Check RLS policies for key tables
SELECT 'RLS policies for user_profiles:' as check_type;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

SELECT 'RLS policies for organizations:' as check_type;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY policyname;

SELECT 'RLS policies for categories:' as check_type;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'categories'
ORDER BY policyname;

-- =====================================================
-- SCENARIO 8: Test RLS access
-- =====================================================
SELECT '=== SCENARIO 8: RLS ACCESS TEST ===' as info;

-- Test if current user can access their own profile
SELECT 'Can access own profile:' as test, COUNT(*) as count
FROM user_profiles 
WHERE id = auth.uid();

-- Test if current user can access organizations
SELECT 'Can access organizations:' as test, COUNT(*) as count
FROM organizations 
WHERE id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access categories
SELECT 'Can access categories:' as test, COUNT(*) as count
FROM categories 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access suppliers
SELECT 'Can access suppliers:' as test, COUNT(*) as count
FROM suppliers 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access inventory_items
SELECT 'Can access inventory_items:' as test, COUNT(*) as count
FROM inventory_items 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Test if current user can access rooms
SELECT 'Can access rooms:' as test, COUNT(*) as count
FROM rooms 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT '=== SYSTEMATIC DIAGNOSIS COMPLETE ===' as info;
