-- Database Diagnostic Script
-- This script will help us understand the current database structure

-- =====================================================
-- CHECK ORGANIZATIONS TABLE STRUCTURE
-- =====================================================

SELECT 'Organizations table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK USER_PROFILES TABLE STRUCTURE
-- =====================================================

SELECT 'User profiles table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK CURRENT DATA
-- =====================================================

SELECT 'Current organizations data:' as info;
SELECT id, uuid_id, "Name", slug, subscription_status, subscription_plan
FROM organizations;

SELECT 'Current user profiles data:' as info;
SELECT id, full_name, email, organization_id, role
FROM user_profiles;

-- =====================================================
-- CHECK INVENTORY TABLES
-- =====================================================

-- Check inventory tables individually
DO $$
DECLARE
    row_count integer;
BEGIN
    -- Check categories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        SELECT COUNT(*) INTO row_count FROM categories;
        RAISE NOTICE 'Categories table exists with % rows', row_count;
        RAISE NOTICE 'Categories columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'categories'
        );
    ELSE
        RAISE NOTICE 'Categories table does not exist';
    END IF;
    
    -- Check suppliers
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        SELECT COUNT(*) INTO row_count FROM suppliers;
        RAISE NOTICE 'Suppliers table exists with % rows', row_count;
        RAISE NOTICE 'Suppliers columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'suppliers'
        );
    ELSE
        RAISE NOTICE 'Suppliers table does not exist';
    END IF;
    
    -- Check inventory_items
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        SELECT COUNT(*) INTO row_count FROM inventory_items;
        RAISE NOTICE 'Inventory items table exists with % rows', row_count;
        RAISE NOTICE 'Inventory items columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'inventory_items'
        );
    ELSE
        RAISE NOTICE 'Inventory items table does not exist';
    END IF;
    
    -- Check rooms
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        SELECT COUNT(*) INTO row_count FROM rooms;
        RAISE NOTICE 'Rooms table exists with % rows', row_count;
        RAISE NOTICE 'Rooms columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'rooms'
        );
    ELSE
        RAISE NOTICE 'Rooms table does not exist';
    END IF;
    
    -- Check room_counts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') THEN
        SELECT COUNT(*) INTO row_count FROM room_counts;
        RAISE NOTICE 'Room counts table exists with % rows', row_count;
        RAISE NOTICE 'Room counts columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'room_counts'
        );
    ELSE
        RAISE NOTICE 'Room counts table does not exist';
    END IF;
    
    -- Check activity_logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        SELECT COUNT(*) INTO row_count FROM activity_logs;
        RAISE NOTICE 'Activity logs table exists with % rows', row_count;
        RAISE NOTICE 'Activity logs columns: %', (
            SELECT string_agg(column_name || ' (' || data_type || ')', ', ')
            FROM information_schema.columns 
            WHERE table_name = 'activity_logs'
        );
    ELSE
        RAISE NOTICE 'Activity logs table does not exist';
    END IF;
END $$;

-- =====================================================
-- CHECK FOR DATA CONSISTENCY ISSUES
-- =====================================================

SELECT 'Checking for orphaned data:' as info;

-- Check if user_profiles have valid organization references
SELECT 'User profiles with invalid organization references:' as info;
SELECT up.id, up.full_name, up.organization_id
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.uuid_id
WHERE up.organization_id IS NOT NULL AND o.uuid_id IS NULL;

-- Check if inventory data has valid organization references
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE NOTICE 'Categories with invalid org refs: %', (
            SELECT COUNT(*) 
            FROM categories c
            LEFT JOIN organizations o ON c.organization_id = o.uuid_id
            WHERE c.organization_id IS NOT NULL AND o.uuid_id IS NULL
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        RAISE NOTICE 'Inventory items with invalid org refs: %', (
            SELECT COUNT(*) 
            FROM inventory_items i
            LEFT JOIN organizations o ON i.organization_id = o.uuid_id
            WHERE i.organization_id IS NOT NULL AND o.uuid_id IS NULL
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE 'Suppliers with invalid org refs: %', (
            SELECT COUNT(*) 
            FROM suppliers s
            LEFT JOIN organizations o ON s.organization_id = o.uuid_id
            WHERE s.organization_id IS NOT NULL AND o.uuid_id IS NULL
        );
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        RAISE NOTICE 'Rooms with invalid org refs: %', (
            SELECT COUNT(*) 
            FROM rooms r
            LEFT JOIN organizations o ON r.organization_id = o.uuid_id
            WHERE r.organization_id IS NOT NULL AND o.uuid_id IS NULL
        );
    END IF;
END $$;
