-- Fix Supplier Creation Issue
-- This script fixes the supplier creation problem during import
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================
SELECT '=== STEP 1: CHECKING CURRENT STATE ===' as info;

-- Check current suppliers
SELECT 'Current suppliers:' as check_type;
SELECT id, name, email, organization_id, created_at 
FROM suppliers 
ORDER BY created_at DESC 
LIMIT 10;

-- Check RLS policies for suppliers
SELECT 'RLS policies for suppliers:' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'suppliers'
ORDER BY policyname;

-- =====================================================
-- STEP 2: FIX RLS POLICIES FOR SUPPLIERS
-- =====================================================
SELECT '=== STEP 2: FIXING RLS POLICIES FOR SUPPLIERS ===' as info;

-- Drop existing supplier policies
DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers in their organization" ON suppliers;

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

-- =====================================================
-- STEP 3: FIX RLS POLICIES FOR CATEGORIES
-- =====================================================
SELECT '=== STEP 3: FIXING RLS POLICIES FOR CATEGORIES ===' as info;

-- Drop existing category policies
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can insert categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can update categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can delete categories in their organization" ON categories;

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

-- =====================================================
-- STEP 4: FIX RLS POLICIES FOR INVENTORY_ITEMS
-- =====================================================
SELECT '=== STEP 4: FIXING RLS POLICIES FOR INVENTORY_ITEMS ===' as info;

-- Drop existing inventory_items policies
DROP POLICY IF EXISTS "Users can view inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items in their organization" ON inventory_items;

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

-- Check new RLS policies
SELECT 'New RLS policies created:' as check_type;
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('suppliers', 'categories', 'inventory_items')
ORDER BY tablename, policyname;

-- Test supplier creation (this will show if the policies work)
SELECT '=== TESTING SUPPLIER CREATION ===' as info;

-- Check if we can create a test supplier
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

SELECT '=== SUPPLIER CREATION FIX COMPLETE ===' as info;
SELECT 'Supplier creation should now work properly during import.' as status;
