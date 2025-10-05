-- =====================================================
-- STEP 1: CHECK CURRENT STATE OF YOUR DATABASE
-- =====================================================
-- Run this script first in Supabase SQL Editor to see what you have
-- Copy the results and I'll create the exact fix you need

SELECT '🔍 CHECKING CURRENT STATE OF YOUR DATABASE...' as info;

-- =====================================================
-- CHECK 1: USER PROFILES AND ORGANIZATIONS
-- =====================================================
SELECT '👥 USER PROFILES AND ORGANIZATIONS:' as section;

SELECT 
    'User Profiles:' as check_type,
    up.id,
    up.full_name,
    up.email,
    up.organization_id,
    up.role,
    CASE 
        WHEN up.organization_id IS NULL THEN '❌ NO ORGANIZATION' 
        ELSE '✅ HAS ORGANIZATION' 
    END as status
FROM user_profiles up
ORDER BY up.created_at DESC;

SELECT 
    'Organizations:' as check_type,
    o.id,
    o."Name",
    o.slug,
    o.created_by,
    o.created_at
FROM organizations o
ORDER BY o.created_at DESC;

-- =====================================================
-- CHECK 2: DATA WITHOUT ORGANIZATIONS (ORPHANED DATA)
-- =====================================================
SELECT '🏠 ORPHANED DATA (DATA WITHOUT ORGANIZATION):' as section;

SELECT 
    'Categories without organization' as table_name,
    COUNT(*) as orphaned_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS FIXING'
        ELSE '✅ ALL GOOD'
    END as status
FROM categories 
WHERE organization_id IS NULL
UNION ALL
SELECT 
    'Suppliers without organization',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS FIXING'
        ELSE '✅ ALL GOOD'
    END
FROM suppliers 
WHERE organization_id IS NULL
UNION ALL
SELECT 
    'Inventory items without organization',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS FIXING'
        ELSE '✅ ALL GOOD'
    END
FROM inventory_items 
WHERE organization_id IS NULL
UNION ALL
SELECT 
    'Rooms without organization',
    COUNT(*),
    CASE 
        WHEN COUNT(*) > 0 THEN '⚠️ NEEDS FIXING'
        ELSE '✅ ALL GOOD'
    END
FROM rooms 
WHERE organization_id IS NULL;

-- =====================================================
-- CHECK 3: CURRENT RLS POLICIES (THE DANGEROUS ONES)
-- =====================================================
SELECT '🛡️ CURRENT RLS POLICIES:' as section;

SELECT 
    'Current Policies:' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN qual LIKE '%true%' THEN '❌ DANGEROUS (bypassed security)'
        WHEN qual LIKE '%auth.uid()%' THEN '✅ SECURE (checks user)'
        ELSE '⚠️ CHECK NEEDED'
    END as security_status,
    qual
FROM pg_policies 
WHERE tablename IN ('categories', 'suppliers', 'inventory_items', 'rooms')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- CHECK 4: DATA COUNTS (CURRENT INVENTORY)
-- =====================================================
SELECT '📊 CURRENT DATA COUNTS:' as section;

SELECT 
    'Categories' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL) as with_organization,
    COUNT(*) FILTER (WHERE organization_id IS NULL) as without_organization
FROM categories
UNION ALL
SELECT 
    'Suppliers',
    COUNT(*),
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL),
    COUNT(*) FILTER (WHERE organization_id IS NULL)
FROM suppliers
UNION ALL
SELECT 
    'Inventory Items',
    COUNT(*),
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL),
    COUNT(*) FILTER (WHERE organization_id IS NULL)
FROM inventory_items
UNION ALL
SELECT 
    'Rooms',
    COUNT(*),
    COUNT(*) FILTER (WHERE organization_id IS NOT NULL),
    COUNT(*) FILTER (WHERE organization_id IS NULL)
FROM rooms;

-- =====================================================
-- CHECK 5: SAMPLE DATA (TO VERIFY WHAT EXISTS)
-- =====================================================
SELECT '📋 SAMPLE DATA:' as section;

SELECT 'Sample Categories:' as data_type, name, organization_id FROM categories LIMIT 5
UNION ALL
SELECT 'Sample Suppliers:', name, organization_id FROM suppliers LIMIT 5
UNION ALL  
SELECT 'Sample Inventory:', brand, organization_id FROM inventory_items LIMIT 5;

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT '📝 SUMMARY - COPY THESE RESULTS AND SEND TO ME:' as final_step;
SELECT 'I will create the exact fix script based on what you have!' as instruction;