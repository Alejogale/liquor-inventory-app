-- =====================================================
-- EMERGENCY FIX - IMPORT HANGING ISSUE
-- =====================================================
-- The new RLS policies are too restrictive and blocking data access
-- Let's fix this immediately

SELECT '🚨 EMERGENCY FIX - Import hanging issue detected' as status;

-- =====================================================
-- PROBLEM: Categories fetch returning 0 results
-- SOLUTION: Check and fix the organization matching
-- =====================================================

-- First, let's see what's happening with the current user's data access
SELECT 'Current user organization check:' as debug_info;
SELECT 
    auth.uid() as current_user_id,
    up.organization_id as user_org_id,
    o."Name" as org_name
FROM user_profiles up
JOIN organizations o ON up.organization_id = o.id  
WHERE up.id = auth.uid();

-- Check what data exists for this organization
SELECT 'Data check for organization b10f47a2-c46e-44fb-8312-04e8484d5b91:' as debug_info;
SELECT 'Categories:' as table_name, COUNT(*) as count FROM categories WHERE organization_id = 'b10f47a2-c46e-44fb-8312-04e8484d5b91'
UNION ALL
SELECT 'Suppliers:', COUNT(*) FROM suppliers WHERE organization_id = 'b10f47a2-c46e-44fb-8312-04e8484d5b91'  
UNION ALL
SELECT 'Inventory:', COUNT(*) FROM inventory_items WHERE organization_id = 'b10f47a2-c46e-44fb-8312-04e8484d5b91';

-- =====================================================
-- FIX: Update RLS policies to be less restrictive for reads
-- =====================================================

-- Drop the overly restrictive SELECT policies
DROP POLICY IF EXISTS "categories_secure_select" ON categories;
DROP POLICY IF EXISTS "suppliers_secure_select" ON suppliers;  
DROP POLICY IF EXISTS "inventory_items_secure_select" ON inventory_items;

-- Create more permissive SELECT policies (but still secure)
CREATE POLICY "categories_read_access" ON categories
    FOR SELECT 
    USING (
        -- Allow authenticated users to read their organization's data
        auth.uid() IS NOT NULL 
        AND (
            -- Platform admin can see all
            (EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE id = auth.uid() 
                AND (is_platform_admin = true OR email = 'alejogaleis@gmail.com')
            ))
            OR 
            -- Users can see their organization's data
            (organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            ))
        )
    );

CREATE POLICY "suppliers_read_access" ON suppliers
    FOR SELECT 
    USING (
        -- Allow authenticated users to read their organization's data
        auth.uid() IS NOT NULL 
        AND (
            -- Platform admin can see all
            (EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE id = auth.uid() 
                AND (is_platform_admin = true OR email = 'alejogaleis@gmail.com')
            ))
            OR 
            -- Users can see their organization's data
            (organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            ))
        )
    );

CREATE POLICY "inventory_items_read_access" ON inventory_items
    FOR SELECT 
    USING (
        -- Allow authenticated users to read their organization's data
        auth.uid() IS NOT NULL 
        AND (
            -- Platform admin can see all
            (EXISTS (
                SELECT 1 FROM user_profiles 
                WHERE id = auth.uid() 
                AND (is_platform_admin = true OR email = 'alejogaleis@gmail.com')
            ))
            OR 
            -- Users can see their organization's data
            (organization_id IN (
                SELECT organization_id FROM user_profiles WHERE id = auth.uid()
            ))
        )
    );

-- =====================================================
-- TEST THE FIX
-- =====================================================
SELECT 'Testing fixed policies:' as test_info;

-- Test that we can now see data
SELECT 'Categories visible:' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Suppliers visible:', COUNT(*) FROM suppliers
UNION ALL  
SELECT 'Inventory visible:', COUNT(*) FROM inventory_items;

SELECT '✅ EMERGENCY FIX COMPLETE - Try the import now!' as status;