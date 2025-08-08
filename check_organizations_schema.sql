-- =====================================================
-- CHECK ORGANIZATIONS TABLE SCHEMA
-- =====================================================
-- This script checks the actual column names in the organizations table
-- =====================================================

-- Check the actual column names
SELECT 'Organizations table columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- Check existing organizations
SELECT 'Existing organizations:' as info;
SELECT * FROM organizations LIMIT 5; 