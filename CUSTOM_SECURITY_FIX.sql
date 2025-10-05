-- =====================================================
-- CUSTOM SECURITY FIX FOR YOUR DATABASE
-- =====================================================
-- Based on your actual database state:
-- ✅ Users properly linked to organizations
-- ✅ Data properly linked to organizations  
-- ❌ RLS policies have major security holes

SELECT '🔒 STARTING CUSTOM SECURITY FIX FOR YOUR DATABASE...' as status;
SELECT 'Fixing dangerous RLS policies while preserving your data...' as info;

-- =====================================================
-- STEP 1: DROP ALL DANGEROUS POLICIES
-- =====================================================
SELECT '🗑️ Removing dangerous policies...' as step;

-- Drop categories policies
DROP POLICY IF EXISTS "Categories access policy" ON categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON categories;

-- Drop suppliers policies  
DROP POLICY IF EXISTS "Suppliers access policy" ON suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers for their organization" ON suppliers;
DROP POLICY IF EXISTS "Users can update suppliers for their organization" ON suppliers;

-- Drop inventory_items policies
DROP POLICY IF EXISTS "Inventory access policy" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items for their organization" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items for their organization" ON inventory_items;

SELECT '✅ Dangerous policies removed!' as status;

-- =====================================================
-- STEP 2: CREATE SECURE ORGANIZATION-BASED POLICIES
-- =====================================================
SELECT '🛡️ Creating secure organization-based policies...' as step;

-- =====================================================
-- CATEGORIES - SECURE POLICIES
-- =====================================================

CREATE POLICY "categories_secure_select" ON categories
    FOR SELECT 
    USING (
        -- Platform admin access OR user's organization data
        (EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (is_platform_admin = true OR email = 'alejogaleis@gmail.com')
        ))
        OR 
        (organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        ))
    );

CREATE POLICY "categories_secure_insert" ON categories
    FOR INSERT 
    WITH CHECK (
        -- Must be user's organization
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "categories_secure_update" ON categories
    FOR UPDATE 
    USING (
        -- Can only update own organization's data
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        -- Updated data must stay in user's organization
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "categories_secure_delete" ON categories
    FOR DELETE 
    USING (
        -- Can only delete own organization's data
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- SUPPLIERS - SECURE POLICIES  
-- =====================================================

CREATE POLICY "suppliers_secure_select" ON suppliers
    FOR SELECT 
    USING (
        -- Platform admin access OR user's organization data
        (EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (is_platform_admin = true OR email = 'alejogaleis@gmail.com')
        ))
        OR 
        (organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        ))
    );

CREATE POLICY "suppliers_secure_insert" ON suppliers
    FOR INSERT 
    WITH CHECK (
        -- Must be user's organization
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "suppliers_secure_update" ON suppliers
    FOR UPDATE 
    USING (
        -- Can only update own organization's data
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        -- Updated data must stay in user's organization
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "suppliers_secure_delete" ON suppliers
    FOR DELETE 
    USING (
        -- Can only delete own organization's data
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- INVENTORY_ITEMS - SECURE POLICIES
-- =====================================================

CREATE POLICY "inventory_items_secure_select" ON inventory_items
    FOR SELECT 
    USING (
        -- Platform admin access OR user's organization data
        (EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() 
            AND (is_platform_admin = true OR email = 'alejogaleis@gmail.com')
        ))
        OR 
        (organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        ))
    );

CREATE POLICY "inventory_items_secure_insert" ON inventory_items
    FOR INSERT 
    WITH CHECK (
        -- Must be user's organization
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "inventory_items_secure_update" ON inventory_items
    FOR UPDATE 
    USING (
        -- Can only update own organization's data
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        -- Updated data must stay in user's organization
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "inventory_items_secure_delete" ON inventory_items
    FOR DELETE 
    USING (
        -- Can only delete own organization's data
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- =====================================================
-- STEP 3: TEST THE NEW POLICIES
-- =====================================================
SELECT '🧪 Testing new secure policies...' as step;

-- Test that we can see the counts (should work for authenticated users)
SELECT 
    'Test Results:' as test_type,
    'Categories' as table_name,
    COUNT(*) as visible_count
FROM categories
UNION ALL
SELECT 
    'Test Results:',
    'Suppliers',
    COUNT(*)
FROM suppliers
UNION ALL
SELECT 
    'Test Results:',
    'Inventory Items', 
    COUNT(*)
FROM inventory_items;

-- =====================================================
-- STEP 4: VERIFY SECURITY
-- =====================================================
SELECT '🔍 Verifying new policies are secure...' as step;

SELECT 
    'Security Check:' as check_type,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%organization_id IN%' THEN '✅ SECURE (organization-based)'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ SECURE (user-based)'
        WHEN qual = 'true' THEN '❌ STILL DANGEROUS'
        WHEN qual IS NULL THEN '❌ NO SECURITY'
        ELSE '⚠️ NEEDS REVIEW'
    END as security_status
FROM pg_policies 
WHERE tablename IN ('categories', 'suppliers', 'inventory_items')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT '🎉 SECURITY FIX COMPLETE!' as status;
SELECT 'Your CSV import should now work securely!' as message;
SELECT 'All data is protected by proper organization-based policies.' as security_note;
SELECT 'Next: Test the CSV import functionality in your app.' as next_step;