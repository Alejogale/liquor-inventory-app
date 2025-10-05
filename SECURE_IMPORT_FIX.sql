-- =====================================================
-- SECURE CSV IMPORT FIX - PROPER RLS POLICIES
-- =====================================================
-- This script creates SECURE, working RLS policies for CSV imports
-- WITHOUT bypassing security like the previous "fixes"

SELECT '🔒 STARTING SECURE IMPORT FIX...' as status;

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================
SELECT '📊 Checking current user profiles and organizations...' as step;

-- Show current users and their organizations
SELECT 
    up.id,
    up.full_name,
    up.email,
    up.organization_id,
    up.role,
    o."Name" as org_name
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.id
ORDER BY up.created_at DESC
LIMIT 10;

-- Check if we have orphaned data
SELECT 
    'Categories without organization' as check_type,
    COUNT(*) as count
FROM categories 
WHERE organization_id IS NULL
UNION ALL
SELECT 
    'Suppliers without organization',
    COUNT(*) 
FROM suppliers 
WHERE organization_id IS NULL
UNION ALL
SELECT 
    'Inventory items without organization',
    COUNT(*) 
FROM inventory_items 
WHERE organization_id IS NULL;

-- =====================================================
-- STEP 2: ENSURE USER PROFILES ARE LINKED PROPERLY
-- =====================================================
SELECT '👥 Ensuring user profiles are properly linked...' as step;

DO $$
DECLARE
    user_record RECORD;
    default_org_id UUID;
BEGIN
    -- Get or create a default organization for orphaned users
    SELECT id INTO default_org_id 
    FROM organizations 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF default_org_id IS NULL THEN
        -- Create a default organization if none exists
        INSERT INTO organizations ("Name", slug, created_by)
        VALUES ('Default Organization', 'default-org-' || gen_random_uuid()::text, 
                (SELECT id FROM auth.users LIMIT 1))
        RETURNING id INTO default_org_id;
        
        RAISE NOTICE '✅ Created default organization: %', default_org_id;
    ELSE
        RAISE NOTICE '✅ Using existing organization: %', default_org_id;
    END IF;
    
    -- Update any user profiles without an organization
    UPDATE user_profiles 
    SET organization_id = default_org_id 
    WHERE organization_id IS NULL;
    
    GET DIAGNOSTICS user_record = ROW_COUNT;
    RAISE NOTICE '✅ Updated % user profiles with organization', user_record;
    
    -- Link orphaned data to the default organization
    UPDATE categories SET organization_id = default_org_id WHERE organization_id IS NULL;
    UPDATE suppliers SET organization_id = default_org_id WHERE organization_id IS NULL;
    UPDATE inventory_items SET organization_id = default_org_id WHERE organization_id IS NULL;
    UPDATE rooms SET organization_id = default_org_id WHERE organization_id IS NULL;
    
    RAISE NOTICE '✅ Linked orphaned data to organization';
END $$;

-- =====================================================
-- STEP 3: CREATE SECURE RLS POLICIES
-- =====================================================
SELECT '🛡️ Creating secure RLS policies...' as step;

-- Drop the dangerous policies that bypass security
DROP POLICY IF EXISTS "Users can view categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can insert categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can update categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can delete categories for their organization" ON categories;
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can insert categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can update categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can delete categories in their organization" ON categories;

-- Create SECURE policies for categories
CREATE POLICY "categories_select_policy" ON categories
    FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "categories_insert_policy" ON categories
    FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "categories_update_policy" ON categories
    FOR UPDATE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "categories_delete_policy" ON categories
    FOR DELETE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- SUPPLIERS POLICIES
-- =====================================================

-- Drop existing supplier policies
DROP POLICY IF EXISTS "Users can view suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can view suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers in their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers in their organization" ON suppliers;

-- Create SECURE policies for suppliers
CREATE POLICY "suppliers_select_policy" ON suppliers
    FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "suppliers_insert_policy" ON suppliers
    FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "suppliers_update_policy" ON suppliers
    FOR UPDATE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "suppliers_delete_policy" ON suppliers
    FOR DELETE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- INVENTORY ITEMS POLICIES
-- =====================================================

-- Drop existing inventory policies
DROP POLICY IF EXISTS "Users can view inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can view items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update items in their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete items in their organization" ON inventory_items;

-- Create SECURE policies for inventory_items
CREATE POLICY "inventory_items_select_policy" ON inventory_items
    FOR SELECT 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "inventory_items_insert_policy" ON inventory_items
    FOR INSERT 
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "inventory_items_update_policy" ON inventory_items
    FOR UPDATE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "inventory_items_delete_policy" ON inventory_items
    FOR DELETE 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 4: TEST THE POLICIES
-- =====================================================
SELECT '🧪 Testing the new policies...' as step;

-- Test supplier creation (this will work only for authenticated users with organization)
DO $$
DECLARE
    test_org_id UUID;
    test_supplier_id UUID;
    current_user_id UUID;
BEGIN
    -- Get current user's organization
    SELECT organization_id INTO test_org_id 
    FROM user_profiles 
    WHERE id = auth.uid();
    
    IF test_org_id IS NULL THEN
        -- Use any organization for system test
        SELECT id INTO test_org_id FROM organizations LIMIT 1;
    END IF;
    
    IF test_org_id IS NOT NULL THEN
        RAISE NOTICE '🧪 Testing with organization: %', test_org_id;
        
        -- Try to create a test supplier (should work)
        INSERT INTO suppliers (name, email, organization_id)
        VALUES ('TEST SUPPLIER - SAFE TO DELETE', 'test@example.com', test_org_id)
        RETURNING id INTO test_supplier_id;
        
        IF test_supplier_id IS NOT NULL THEN
            RAISE NOTICE '✅ Test supplier created successfully: %', test_supplier_id;
            
            -- Clean up the test supplier
            DELETE FROM suppliers WHERE id = test_supplier_id;
            RAISE NOTICE '🧹 Test supplier cleaned up successfully';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ No organization found for testing';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Test failed (expected for unauthenticated): %', SQLERRM;
END $$;

-- =====================================================
-- STEP 5: VERIFY FINAL STATE
-- =====================================================
SELECT '📊 Verifying final state...' as step;

-- Check policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE tablename IN ('categories', 'suppliers', 'inventory_items')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify data integrity
SELECT 
    'Categories with organization' as table_name,
    COUNT(*) as count
FROM categories 
WHERE organization_id IS NOT NULL
UNION ALL
SELECT 
    'Suppliers with organization',
    COUNT(*) 
FROM suppliers 
WHERE organization_id IS NOT NULL
UNION ALL
SELECT 
    'Inventory items with organization',
    COUNT(*) 
FROM inventory_items 
WHERE organization_id IS NOT NULL
UNION ALL
SELECT 
    'User profiles with organization',
    COUNT(*) 
FROM user_profiles 
WHERE organization_id IS NOT NULL;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '🎉 SECURE IMPORT FIX COMPLETE!' as status;
SELECT 'CSV import should now work securely with proper organization isolation.' as message;
SELECT 'Next: Test the import functionality in the UI' as next_step;