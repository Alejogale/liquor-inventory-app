-- CHECK TABLE SCHEMAS
-- This script shows the actual column names in each table

SELECT '=== CATEGORIES TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

SELECT '=== SUPPLIERS TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'suppliers' 
ORDER BY ordinal_position;

SELECT '=== INVENTORY_ITEMS TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
ORDER BY ordinal_position;

SELECT '=== ROOMS TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'rooms' 
ORDER BY ordinal_position;

SELECT '=== USER_PROFILES TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

SELECT '=== ORGANIZATIONS TABLE SCHEMA ===' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'organizations' 
ORDER BY ordinal_position;

SELECT '=== SCHEMA CHECK COMPLETE ===' as info;
SELECT 'Use these column names in the diagnostic script.' as status;
