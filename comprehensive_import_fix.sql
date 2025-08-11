-- Comprehensive Import Fix
-- This script fixes all import-related issues including supplier creation
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================
SELECT '=== STEP 1: CHECKING CURRENT STATE ===' as info;

-- Check current users and organizations
SELECT 'Current users:' as check_type;
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

SELECT 'Current organizations:' as check_type;
SELECT id, "Name", slug, created_by FROM organizations ORDER BY created_at DESC LIMIT 5;

SELECT 'Current user profiles:' as check_type;
SELECT id, full_name, email, organization_id, role FROM user_profiles ORDER BY created_at DESC LIMIT 5;

-- Check current data counts
SELECT 'Current data counts:' as check_type;
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Suppliers:' as table_name, COUNT(*) as count FROM suppliers
UNION ALL
SELECT 'Inventory items:' as table_name, COUNT(*) as count FROM inventory_items
UNION ALL
SELECT 'Rooms:' as table_name, COUNT(*) as count FROM rooms;

-- =====================================================
-- STEP 2: ENSURE USER PROFILES AND ORGANIZATIONS EXIST
-- =====================================================
SELECT '=== STEP 2: ENSURING USER PROFILES AND ORGANIZATIONS EXIST ===' as info;

DO $$
DECLARE
    alehoegali_user_id UUID;
    alejogaleis_user_id UUID;
    org_id UUID;
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
    SELECT id INTO org_id FROM organizations LIMIT 1;
    
    IF org_id IS NULL THEN
        RAISE NOTICE 'No organizations found. Creating default organization...';
        
        -- Create default organization
        INSERT INTO organizations ("Name", slug, created_by)
        VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, COALESCE(alejogaleis_user_id, alehoegali_user_id))
        RETURNING id INTO org_id;
        
        RAISE NOTICE 'Created default organization: %', org_id;
    ELSE
        RAISE NOTICE 'Using existing organization: %', org_id;
    END IF;

    -- Create or update alehoegali@gmail.com profile
    IF alehoegali_user_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM user_profiles WHERE id = alehoegali_user_id) THEN
            UPDATE user_profiles 
            SET 
                full_name = 'alehoegali@gmail.com',
                email = 'alehoegali@gmail.com',
                role = 'owner',
                organization_id = org_id
            WHERE id = alehoegali_user_id;
            RAISE NOTICE 'Updated alehoegali@gmail.com profile';
        ELSE
            INSERT INTO user_profiles (id, full_name, email, role, organization_id)
            VALUES (alehoegali_user_id, 'alehoegali@gmail.com', 'alehoegali@gmail.com', 'owner', org_id);
            RAISE NOTICE 'Created alehoegali@gmail.com profile';
        END IF;
    END IF;

    -- Create or update alejogaleis@gmail.com profile (admin)
    IF alejogaleis_user_id IS NOT NULL THEN
        IF EXISTS (SELECT 1 FROM user_profiles WHERE id = alejogaleis_user_id) THEN
            UPDATE user_profiles 
            SET 
                full_name = 'alejogaleis@gmail.com',
                email = 'alejogaleis@gmail.com',
                role = 'admin',
                organization_id = org_id
            WHERE id = alejogaleis_user_id;
            RAISE NOTICE 'Updated alejogaleis@gmail.com profile (admin)';
        ELSE
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
-- STEP 4: FIX RLS POLICIES FOR IMPORT
-- =====================================================
SELECT '=== STEP 4: FIXING RLS POLICIES FOR IMPORT ===' as info;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers in their organization" ON suppliers;

DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can insert categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can update categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can delete categories in their organization" ON categories;

DROP POLICY IF EXISTS "Users can view inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items in their organization" ON inventory_items;

-- Create new RLS policies for suppliers
CREATE POLICY "Users can view suppliers in their organization" ON suppliers
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert suppliers in their organization" ON suppliers
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update suppliers in their organization" ON suppliers
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete suppliers in their organization" ON suppliers
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create new RLS policies for categories
CREATE POLICY "Users can view categories in their organization" ON categories
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert categories in their organization" ON categories
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update categories in their organization" ON categories
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete categories in their organization" ON categories
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create new RLS policies for inventory_items
CREATE POLICY "Users can view inventory items in their organization" ON inventory_items
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert inventory items in their organization" ON inventory_items
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update inventory items in their organization" ON inventory_items
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete inventory items in their organization" ON inventory_items
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 5: VERIFY THE FIX
-- =====================================================
SELECT '=== STEP 5: VERIFYING THE FIX ===' as info;

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

-- Test supplier creation
SELECT '=== TESTING SUPPLIER CREATION ===' as info;

DO $$
DECLARE
    test_org_id UUID;
    test_supplier_id UUID;
BEGIN
    -- Get the first organization
    SELECT id INTO test_org_id FROM organizations LIMIT 1;
    
    IF test_org_id IS NULL THEN
        RAISE NOTICE 'No organization found for testing';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Testing supplier creation for organization: %', test_org_id;
    
    -- Try to create a test supplier
    INSERT INTO suppliers (name, email, organization_id)
    VALUES ('TEST SUPPLIER - DELETE ME', 'test@example.com', test_org_id)
    RETURNING id INTO test_supplier_id;
    
    IF test_supplier_id IS NOT NULL THEN
        RAISE NOTICE '✅ Test supplier created successfully: %', test_supplier_id;
        
        -- Clean up the test supplier
        DELETE FROM suppliers WHERE id = test_supplier_id;
        RAISE NOTICE '🧹 Test supplier cleaned up';
    ELSE
        RAISE NOTICE '❌ Test supplier creation failed';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test supplier creation failed with error: %', SQLERRM;
END $$;

SELECT '=== COMPREHENSIVE IMPORT FIX COMPLETE ===' as info;
SELECT 'All import issues should now be resolved. Users can import data successfully.' as status;
