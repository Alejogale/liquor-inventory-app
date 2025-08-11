-- Comprehensive Database Data Fix Script
-- This script fixes the data inconsistencies after the schema migration

-- =====================================================
-- STEP 1: CHECK CURRENT STATE
-- =====================================================

SELECT '=== CURRENT DATABASE STATE ===' as info;

-- Check organizations
SELECT 'Organizations:' as info;
SELECT id, uuid_id, "Name", slug, subscription_status, subscription_plan
FROM organizations;

-- Check user profiles
SELECT 'User profiles:' as info;
SELECT id, full_name, email, organization_id, role
FROM user_profiles;

-- =====================================================
-- STEP 2: FIX USER PROFILES ORGANIZATION REFERENCES
-- =====================================================

SELECT '=== FIXING USER PROFILES ===' as info;

-- First, let's see what user profiles have invalid organization references
SELECT 'User profiles with invalid org refs:' as info;
SELECT up.id, up.full_name, up.email, up.organization_id
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.uuid_id
WHERE up.organization_id IS NOT NULL AND o.uuid_id IS NULL;

-- Fix user profiles by updating them to use the correct organization reference
-- Since organization_id is still UUID type, we keep the uuid_id reference
UPDATE user_profiles 
SET organization_id = (
    SELECT o.uuid_id 
    FROM organizations o 
    WHERE o.uuid_id = user_profiles.organization_id
)
WHERE organization_id IS NOT NULL 
AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
AND EXISTS (
    SELECT 1 FROM organizations o 
    WHERE o.uuid_id = user_profiles.organization_id
);

-- =====================================================
-- STEP 3: FIX INVENTORY DATA ORGANIZATION REFERENCES
-- =====================================================

SELECT '=== FIXING INVENTORY DATA ===' as info;

-- Fix categories
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE NOTICE 'Fixing categories organization references...';
        
        UPDATE categories 
        SET organization_id = (
            SELECT o.uuid_id 
            FROM organizations o 
            WHERE o.uuid_id = categories.organization_id
        )
        WHERE organization_id IS NOT NULL 
        AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.uuid_id = categories.organization_id
        );
        
        RAISE NOTICE 'Categories fixed. Count: %', (SELECT COUNT(*) FROM categories);
    ELSE
        RAISE NOTICE 'Categories table does not exist';
    END IF;
END $$;

-- Fix suppliers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE 'Fixing suppliers organization references...';
        
        UPDATE suppliers 
        SET organization_id = (
            SELECT o.uuid_id 
            FROM organizations o 
            WHERE o.uuid_id = suppliers.organization_id
        )
        WHERE organization_id IS NOT NULL 
        AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.uuid_id = suppliers.organization_id
        );
        
        RAISE NOTICE 'Suppliers fixed. Count: %', (SELECT COUNT(*) FROM suppliers);
    ELSE
        RAISE NOTICE 'Suppliers table does not exist';
    END IF;
END $$;

-- Fix inventory_items
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        RAISE NOTICE 'Fixing inventory items organization references...';
        
        UPDATE inventory_items 
        SET organization_id = (
            SELECT o.uuid_id 
            FROM organizations o 
            WHERE o.uuid_id = inventory_items.organization_id
        )
        WHERE organization_id IS NOT NULL 
        AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.uuid_id = inventory_items.organization_id
        );
        
        RAISE NOTICE 'Inventory items fixed. Count: %', (SELECT COUNT(*) FROM inventory_items);
    ELSE
        RAISE NOTICE 'Inventory items table does not exist';
    END IF;
END $$;

-- Fix rooms
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        RAISE NOTICE 'Fixing rooms organization references...';
        
        UPDATE rooms 
        SET organization_id = (
            SELECT o.uuid_id 
            FROM organizations o 
            WHERE o.uuid_id = rooms.organization_id
        )
        WHERE organization_id IS NOT NULL 
        AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.uuid_id = rooms.organization_id
        );
        
        RAISE NOTICE 'Rooms fixed. Count: %', (SELECT COUNT(*) FROM rooms);
    ELSE
        RAISE NOTICE 'Rooms table does not exist';
    END IF;
END $$;

-- Fix room_counts
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') THEN
        RAISE NOTICE 'Fixing room counts organization references...';
        
        UPDATE room_counts 
        SET organization_id = (
            SELECT o.uuid_id 
            FROM organizations o 
            WHERE o.uuid_id = room_counts.organization_id
        )
        WHERE organization_id IS NOT NULL 
        AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.uuid_id = room_counts.organization_id
        );
        
        RAISE NOTICE 'Room counts fixed. Count: %', (SELECT COUNT(*) FROM room_counts);
    ELSE
        RAISE NOTICE 'Room counts table does not exist';
    END IF;
END $$;

-- Fix activity_logs
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        RAISE NOTICE 'Fixing activity logs organization references...';
        
        UPDATE activity_logs 
        SET organization_id = (
            SELECT o.uuid_id 
            FROM organizations o 
            WHERE o.uuid_id = activity_logs.organization_id
        )
        WHERE organization_id IS NOT NULL 
        AND organization_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
        AND EXISTS (
            SELECT 1 FROM organizations o 
            WHERE o.uuid_id = activity_logs.organization_id
        );
        
        RAISE NOTICE 'Activity logs fixed. Count: %', (SELECT COUNT(*) FROM activity_logs);
    ELSE
        RAISE NOTICE 'Activity logs table does not exist';
    END IF;
END $$;

-- =====================================================
-- STEP 4: VERIFY FIXES
-- =====================================================

SELECT '=== VERIFICATION ===' as info;

-- Check if any user profiles still have invalid organization references
SELECT 'User profiles with invalid org refs (after fix):' as info;
SELECT up.id, up.full_name, up.email, up.organization_id
FROM user_profiles up
LEFT JOIN organizations o ON up.organization_id = o.uuid_id
WHERE up.organization_id IS NOT NULL AND o.uuid_id IS NULL;

-- Check final state of organizations and user profiles
SELECT 'Final organizations state:' as info;
SELECT id, uuid_id, "Name", slug, subscription_status, subscription_plan
FROM organizations;

SELECT 'Final user profiles state:' as info;
SELECT id, full_name, email, organization_id, role
FROM user_profiles;

-- Check inventory data counts
DO $$
BEGIN
    RAISE NOTICE '=== FINAL INVENTORY COUNTS ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        RAISE NOTICE 'Categories: %', (SELECT COUNT(*) FROM categories);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        RAISE NOTICE 'Suppliers: %', (SELECT COUNT(*) FROM suppliers);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        RAISE NOTICE 'Inventory items: %', (SELECT COUNT(*) FROM inventory_items);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rooms') THEN
        RAISE NOTICE 'Rooms: %', (SELECT COUNT(*) FROM rooms);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'room_counts') THEN
        RAISE NOTICE 'Room counts: %', (SELECT COUNT(*) FROM room_counts);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        RAISE NOTICE 'Activity logs: %', (SELECT COUNT(*) FROM activity_logs);
    END IF;
END $$;

SELECT '=== FIX COMPLETE ===' as info;
