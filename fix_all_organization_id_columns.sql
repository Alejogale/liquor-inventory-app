-- =====================================================
-- FIX ALL ORGANIZATION_ID COLUMNS TO UUID
-- =====================================================
-- This script fixes all organization_id columns across all tables
-- to use UUID instead of bigint to match the organizations.uuid_id

-- Check current schema for all tables with organization_id
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'organization_id'
ORDER BY table_name;

-- =====================================================
-- FIX CATEGORIES TABLE
-- =====================================================
DO $$ 
BEGIN
    -- Check if organization_id is bigint
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        -- Add new UUID column
        ALTER TABLE categories ADD COLUMN organization_id_uuid UUID;
        
        -- Update with UUID values
        UPDATE categories 
        SET organization_id_uuid = o.uuid_id
        FROM organizations o 
        WHERE categories.organization_id = o.id;
        
        -- Drop old column and rename new one
        ALTER TABLE categories DROP COLUMN organization_id;
        ALTER TABLE categories RENAME COLUMN organization_id_uuid TO organization_id;
        
        RAISE NOTICE 'Fixed categories.organization_id to UUID';
    ELSE
        RAISE NOTICE 'categories.organization_id is already UUID or does not exist';
    END IF;
END $$;

-- =====================================================
-- FIX SUPPLIERS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'suppliers' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE suppliers ADD COLUMN organization_id_uuid UUID;
        
        UPDATE suppliers 
        SET organization_id_uuid = o.uuid_id
        FROM organizations o 
        WHERE suppliers.organization_id = o.id;
        
        ALTER TABLE suppliers DROP COLUMN organization_id;
        ALTER TABLE suppliers RENAME COLUMN organization_id_uuid TO organization_id;
        
        RAISE NOTICE 'Fixed suppliers.organization_id to UUID';
    ELSE
        RAISE NOTICE 'suppliers.organization_id is already UUID or does not exist';
    END IF;
END $$;

-- =====================================================
-- FIX INVENTORY_ITEMS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN organization_id_uuid UUID;
        
        UPDATE inventory_items 
        SET organization_id_uuid = o.uuid_id
        FROM organizations o 
        WHERE inventory_items.organization_id = o.id;
        
        ALTER TABLE inventory_items DROP COLUMN organization_id;
        ALTER TABLE inventory_items RENAME COLUMN organization_id_uuid TO organization_id;
        
        RAISE NOTICE 'Fixed inventory_items.organization_id to UUID';
    ELSE
        RAISE NOTICE 'inventory_items.organization_id is already UUID or does not exist';
    END IF;
END $$;

-- =====================================================
-- FIX ROOMS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE rooms ADD COLUMN organization_id_uuid UUID;
        
        UPDATE rooms 
        SET organization_id_uuid = o.uuid_id
        FROM organizations o 
        WHERE rooms.organization_id = o.id;
        
        ALTER TABLE rooms DROP COLUMN organization_id;
        ALTER TABLE rooms RENAME COLUMN organization_id_uuid TO organization_id;
        
        RAISE NOTICE 'Fixed rooms.organization_id to UUID';
    ELSE
        RAISE NOTICE 'rooms.organization_id is already UUID or does not exist';
    END IF;
END $$;

-- =====================================================
-- FIX ROOM_COUNTS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'room_counts' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE room_counts ADD COLUMN organization_id_uuid UUID;
        
        UPDATE room_counts 
        SET organization_id_uuid = o.uuid_id
        FROM organizations o 
        WHERE room_counts.organization_id = o.id;
        
        ALTER TABLE room_counts DROP COLUMN organization_id;
        ALTER TABLE room_counts RENAME COLUMN organization_id_uuid TO organization_id;
        
        RAISE NOTICE 'Fixed room_counts.organization_id to UUID';
    ELSE
        RAISE NOTICE 'room_counts.organization_id is already UUID or does not exist';
    END IF;
END $$;

-- =====================================================
-- FIX ACTIVITY_LOGS TABLE
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'activity_logs' 
        AND column_name = 'organization_id' 
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE activity_logs ADD COLUMN organization_id_uuid UUID;
        
        UPDATE activity_logs 
        SET organization_id_uuid = o.uuid_id
        FROM organizations o 
        WHERE activity_logs.organization_id = o.id;
        
        ALTER TABLE activity_logs DROP COLUMN organization_id;
        ALTER TABLE activity_logs RENAME COLUMN organization_id_uuid TO organization_id;
        
        RAISE NOTICE 'Fixed activity_logs.organization_id to UUID';
    ELSE
        RAISE NOTICE 'activity_logs.organization_id is already UUID or does not exist';
    END IF;
END $$;

-- =====================================================
-- ADD FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Categories
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'categories_organization_id_fkey'
    ) THEN
        ALTER TABLE categories 
        ADD CONSTRAINT categories_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id);
        RAISE NOTICE 'Added FK constraint for categories';
    END IF;
END $$;

-- Suppliers
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'suppliers_organization_id_fkey'
    ) THEN
        ALTER TABLE suppliers 
        ADD CONSTRAINT suppliers_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id);
        RAISE NOTICE 'Added FK constraint for suppliers';
    END IF;
END $$;

-- Inventory Items
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'inventory_items_organization_id_fkey'
    ) THEN
        ALTER TABLE inventory_items 
        ADD CONSTRAINT inventory_items_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id);
        RAISE NOTICE 'Added FK constraint for inventory_items';
    END IF;
END $$;

-- Rooms
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'rooms_organization_id_fkey'
    ) THEN
        ALTER TABLE rooms 
        ADD CONSTRAINT rooms_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id);
        RAISE NOTICE 'Added FK constraint for rooms';
    END IF;
END $$;

-- Room Counts
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'room_counts_organization_id_fkey'
    ) THEN
        ALTER TABLE room_counts 
        ADD CONSTRAINT room_counts_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id);
        RAISE NOTICE 'Added FK constraint for room_counts';
    END IF;
END $$;

-- Activity Logs
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'activity_logs_organization_id_fkey'
    ) THEN
        ALTER TABLE activity_logs 
        ADD CONSTRAINT activity_logs_organization_id_fkey 
        FOREIGN KEY (organization_id) REFERENCES organizations(uuid_id);
        RAISE NOTICE 'Added FK constraint for activity_logs';
    END IF;
END $$;

-- =====================================================
-- VERIFY CHANGES
-- =====================================================

-- Check final schema
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'organization_id'
ORDER BY table_name;

-- Test queries to make sure everything works
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'suppliers', COUNT(*) FROM suppliers
UNION ALL
SELECT 'inventory_items', COUNT(*) FROM inventory_items
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'room_counts', COUNT(*) FROM room_counts
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs; 