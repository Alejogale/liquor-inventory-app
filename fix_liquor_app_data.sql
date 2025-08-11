-- Fix Liquor App Data Migration
-- This script fixes existing data to work with the new organization structure

-- =====================================================
-- CHECK AND FIX ORGANIZATION DATA
-- =====================================================

-- Check what organizations exist
SELECT 'Current organizations:' as info;
SELECT id, uuid_id, "Name", slug FROM organizations;

-- Check what user profiles exist
SELECT 'Current user profiles:' as info;
SELECT id, full_name, email, organization_id FROM user_profiles;

-- =====================================================
-- FIX USER PROFILES ORGANIZATION REFERENCES
-- =====================================================

-- First, let's check the current data types
SELECT 'Checking data types:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles' AND column_name = 'organization_id';

-- Update user profiles to use the correct organization_id (bigint id, not uuid_id)
-- We need to cast the bigint to text since organization_id is still UUID type
UPDATE user_profiles 
SET organization_id = (
    SELECT o.uuid_id 
    FROM organizations o 
    WHERE o.uuid_id = user_profiles.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- =====================================================
-- CHECK AND FIX INVENTORY DATA
-- =====================================================

-- Check if inventory tables exist and have data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE NOTICE 'Categories table exists';
        RAISE NOTICE 'Categories count: %', (SELECT COUNT(*) FROM categories);
    ELSE
        RAISE NOTICE 'Categories table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        RAISE NOTICE 'Inventory items table exists';
        RAISE NOTICE 'Inventory items count: %', (SELECT COUNT(*) FROM inventory_items);
    ELSE
        RAISE NOTICE 'Inventory items table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE 'Suppliers table exists';
        RAISE NOTICE 'Suppliers count: %', (SELECT COUNT(*) FROM suppliers);
    ELSE
        RAISE NOTICE 'Suppliers table does not exist';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        RAISE NOTICE 'Rooms table exists';
        RAISE NOTICE 'Rooms count: %', (SELECT COUNT(*) FROM rooms);
    ELSE
        RAISE NOTICE 'Rooms table does not exist';
    END IF;
END $$;

-- =====================================================
-- FIX INVENTORY DATA ORGANIZATION REFERENCES
-- =====================================================

-- Update categories to use correct organization_id
UPDATE categories 
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.uuid_id = categories.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Update suppliers to use correct organization_id
UPDATE suppliers 
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.uuid_id = suppliers.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Update inventory_items to use correct organization_id
UPDATE inventory_items 
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.uuid_id = inventory_items.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Update rooms to use correct organization_id
UPDATE rooms 
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.uuid_id = rooms.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Update room_counts to use correct organization_id
UPDATE room_counts 
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.uuid_id = room_counts.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Update activity_logs to use correct organization_id
UPDATE activity_logs 
SET organization_id = (
    SELECT o.id 
    FROM organizations o 
    WHERE o.uuid_id = activity_logs.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- =====================================================
-- VERIFY FIXES
-- =====================================================

-- Check final state
SELECT 'After fixes - Organizations:' as info;
SELECT id, uuid_id, "Name", slug FROM organizations;

SELECT 'After fixes - User profiles:' as info;
SELECT id, full_name, email, organization_id FROM user_profiles;

-- Check inventory data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE NOTICE 'Categories after fix: %', (SELECT COUNT(*) FROM categories);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        RAISE NOTICE 'Inventory items after fix: %', (SELECT COUNT(*) FROM inventory_items);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE 'Suppliers after fix: %', (SELECT COUNT(*) FROM suppliers);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        RAISE NOTICE 'Rooms after fix: %', (SELECT COUNT(*) FROM rooms);
    END IF;
END $$;
