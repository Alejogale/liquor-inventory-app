-- FIX DATA ACCESS ISSUE
-- This script fixes the data access problem by ensuring all data is properly linked to organizations

-- Step 1: Check current state
SELECT '=== CURRENT STATE CHECK ===' as info;

-- Check if there are any users with profiles
SELECT 'Users with profiles:' as check_type, COUNT(*) as count FROM user_profiles;

-- Check if there are any organizations
SELECT 'Total organizations:' as check_type, COUNT(*) as count FROM organizations;

-- Check for orphaned data (data with NULL organization_id)
SELECT '=== ORPHANED DATA CHECK ===' as info;

SELECT 'Categories with NULL organization_id:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NULL;

SELECT 'Suppliers with NULL organization_id:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NULL;

SELECT 'Inventory items with NULL organization_id:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NULL;

SELECT 'Rooms with NULL organization_id:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NULL;

-- Step 2: Find the first organization to link orphaned data to
DO $$
DECLARE
    first_org_id UUID;
    updated_count INTEGER;
BEGIN
    -- Get the first organization (or create one if none exists)
    SELECT id INTO first_org_id FROM organizations LIMIT 1;
    
    IF first_org_id IS NULL THEN
        RAISE NOTICE 'No organizations found. Creating a default organization...';
        
        -- Create a default organization
        INSERT INTO organizations ("Name", slug, created_by) 
        VALUES ('Default Organization', 'default-organization-' || gen_random_uuid()::text, NULL)
        RETURNING id INTO first_org_id;
        
        RAISE NOTICE 'Created default organization: %', first_org_id;
    ELSE
        RAISE NOTICE 'Using existing organization: %', first_org_id;
    END IF;
    
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

-- Step 3: Verify data is now accessible
SELECT '=== VERIFYING DATA ACCESS ===' as info;

-- Check data in organizations
SELECT 'Categories in organizations:' as check_type, COUNT(*) as count
FROM categories WHERE organization_id IS NOT NULL;

SELECT 'Suppliers in organizations:' as check_type, COUNT(*) as count
FROM suppliers WHERE organization_id IS NOT NULL;

SELECT 'Inventory items in organizations:' as check_type, COUNT(*) as count
FROM inventory_items WHERE organization_id IS NOT NULL;

SELECT 'Rooms in organizations:' as check_type, COUNT(*) as count
FROM rooms WHERE organization_id IS NOT NULL;

-- Step 4: Show sample data to verify
SELECT '=== SAMPLE DATA VERIFICATION ===' as info;

SELECT 'Sample categories:' as check_type;
SELECT id, name, organization_id FROM categories LIMIT 3;

SELECT 'Sample suppliers:' as check_type;
SELECT id, name, organization_id FROM suppliers LIMIT 3;

SELECT 'Sample inventory items:' as check_type;
SELECT id, brand, organization_id FROM inventory_items LIMIT 3;

SELECT 'Sample rooms:' as check_type;
SELECT id, name, organization_id FROM rooms LIMIT 3;

-- Step 5: Check RLS policies are working
SELECT '=== RLS ACCESS TEST ===' as info;

SELECT 'Can access categories with RLS:' as test, COUNT(*) as count FROM categories;
SELECT 'Can access suppliers with RLS:' as test, COUNT(*) as count FROM suppliers;
SELECT 'Can access inventory_items with RLS:' as test, COUNT(*) as count FROM inventory_items;
SELECT 'Can access rooms with RLS:' as test, COUNT(*) as count FROM rooms;

SELECT '=== DATA ACCESS FIX COMPLETE ===' as info;
SELECT 'Dashboard should now show data correctly. Check the results above to verify.' as status;
