-- DIAGNOSE DATA ACCESS ISSUE
-- This script checks why categories and items are not showing in the dashboard

-- Check current user and organization
SELECT '=== CURRENT USER AND ORGANIZATION ===' as info;

SELECT 'Current user:' as check_type, auth.uid() as user_id;

SELECT 'User profile:' as check_type;
SELECT 
    id,
    full_name,
    email,
    organization_id,
    role
FROM user_profiles 
WHERE id = auth.uid()
LIMIT 1;

SELECT 'User organization:' as check_type;
SELECT 
    o.id,
    o."Name",
    o.slug,
    o.created_at
FROM organizations o
JOIN user_profiles up ON o.id = up.organization_id
WHERE up.id = auth.uid()
LIMIT 1;

-- Check if data exists in the user's organization
SELECT '=== DATA IN USER ORGANIZATION ===' as info;

SELECT 'Categories in user organization:' as check_type, COUNT(*) as count
FROM categories 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT 'Suppliers in user organization:' as check_type, COUNT(*) as count
FROM suppliers 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT 'Inventory items in user organization:' as check_type, COUNT(*) as count
FROM inventory_items 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

SELECT 'Rooms in user organization:' as check_type, COUNT(*) as count
FROM rooms 
WHERE organization_id IN (
    SELECT organization_id FROM user_profiles WHERE id = auth.uid()
);

-- Check if data exists at all (without RLS)
SELECT '=== ALL DATA IN DATABASE ===' as info;

SELECT 'Total categories:' as check_type, COUNT(*) as count FROM categories;
SELECT 'Total suppliers:' as check_type, COUNT(*) as count FROM suppliers;
SELECT 'Total inventory items:' as check_type, COUNT(*) as count FROM inventory_items;
SELECT 'Total rooms:' as check_type, COUNT(*) as count FROM rooms;

-- Check sample data to see organization_id values
SELECT '=== SAMPLE DATA ===' as info;

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 5;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 5;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 5;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 5;

-- Check RLS policies for these tables
SELECT '=== RLS POLICIES ===' as info;

SELECT 'Categories RLS policies:' as check_type;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'categories'
ORDER BY policyname;

SELECT 'Suppliers RLS policies:' as check_type;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'suppliers'
ORDER BY policyname;

SELECT 'Inventory items RLS policies:' as check_type;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'inventory_items'
ORDER BY policyname;

SELECT 'Rooms RLS policies:' as check_type;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'rooms'
ORDER BY policyname;

-- Test RLS access directly
SELECT '=== RLS ACCESS TEST ===' as info;

SELECT 'Can access categories with RLS:' as test, COUNT(*) as count FROM categories;
SELECT 'Can access suppliers with RLS:' as test, COUNT(*) as count FROM suppliers;
SELECT 'Can access inventory_items with RLS:' as test, COUNT(*) as count FROM inventory_items;
SELECT 'Can access rooms with RLS:' as test, COUNT(*) as count FROM rooms;

-- Check if there are any orphaned records
SELECT '=== ORPHANED RECORDS CHECK ===' as info;

SELECT 'Categories with invalid organization_id:' as check_type, COUNT(*) as count
FROM categories c
LEFT JOIN organizations o ON c.organization_id = o.id
WHERE o.id IS NULL AND c.organization_id IS NOT NULL;

SELECT 'Suppliers with invalid organization_id:' as check_type, COUNT(*) as count
FROM suppliers s
LEFT JOIN organizations o ON s.organization_id = o.id
WHERE o.id IS NULL AND s.organization_id IS NOT NULL;

SELECT 'Inventory items with invalid organization_id:' as check_type, COUNT(*) as count
FROM inventory_items i
LEFT JOIN organizations o ON i.organization_id = o.id
WHERE o.id IS NULL AND i.organization_id IS NOT NULL;

SELECT 'Rooms with invalid organization_id:' as check_type, COUNT(*) as count
FROM rooms r
LEFT JOIN organizations o ON r.organization_id = o.id
WHERE o.id IS NULL AND r.organization_id IS NOT NULL;

-- Check if data exists but organization_id is NULL
SELECT '=== NULL ORGANIZATION_ID CHECK ===' as info;

SELECT 'Categories with NULL organization_id:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NULL;

SELECT 'Suppliers with NULL organization_id:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NULL;

SELECT 'Inventory items with NULL organization_id:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NULL;

SELECT 'Rooms with NULL organization_id:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NULL;

-- Check if data exists but organization_id is wrong type (bigint vs UUID)
SELECT '=== DATA TYPE CHECK ===' as info;

SELECT 'Categories organization_id data type:' as check_type, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories' AND column_name = 'organization_id';

SELECT 'Suppliers organization_id data type:' as check_type, data_type 
FROM information_schema.columns 
WHERE table_name = 'suppliers' AND column_name = 'organization_id';

SELECT 'Inventory items organization_id data type:' as check_type, data_type 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' AND column_name = 'organization_id';

SELECT 'Rooms organization_id data type:' as check_type, data_type 
FROM information_schema.columns 
WHERE table_name = 'rooms' AND column_name = 'organization_id';

SELECT '=== DIAGNOSIS COMPLETE ===' as info;
SELECT 'Check the results above to identify why data is not showing in the dashboard.' as status;
