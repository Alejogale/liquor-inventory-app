-- =====================================================
-- STOCK MOVEMENTS FEATURE - DATABASE SETUP (FINAL FIX)
-- =====================================================
-- This file ONLY ADDS new tables and columns
-- Does NOT modify or remove any existing data
-- Safe to run - no breaking changes
-- FINAL FIX: Correct ID types after checking actual database
-- =====================================================

-- Step 1: Add PIN support to existing user_profiles table
-- -------------------------------------------------------
-- Only adds new columns, doesn't modify existing ones

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS pin_code TEXT,                    -- Hashed 4-digit PIN
ADD COLUMN IF NOT EXISTS last_pin_entry TIMESTAMP,         -- Last time PIN was used
ADD COLUMN IF NOT EXISTS failed_pin_attempts INTEGER DEFAULT 0; -- Security: track failed attempts

-- Step 2: Create stock_movements table (NEW)
-- -------------------------------------------------------
-- This is a completely new table, won't affect existing features
-- FINAL: Mixed types based on actual database schema:
--   - inventory_items.id = BIGINT
--   - rooms.id = BIGINT
--   - organizations.id = UUID
--   - user_profiles.id = UUID

CREATE TABLE IF NOT EXISTS stock_movements (
  id BIGSERIAL PRIMARY KEY,

  -- WHAT was moved (BIGINT to match inventory_items.id)
  inventory_item_id BIGINT REFERENCES inventory_items(id) ON DELETE CASCADE,
  item_brand TEXT NOT NULL,              -- Denormalized for faster reporting
  item_size TEXT,                        -- Denormalized

  -- WHO did it (UUID to match user_profiles.id)
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,               -- Denormalized so we keep history even if user deleted

  -- WHAT happened
  movement_type TEXT NOT NULL CHECK (movement_type IN ('IN', 'OUT')),
  quantity INTEGER NOT NULL,
  previous_stock INTEGER,                -- Stock before this movement
  new_stock INTEGER,                     -- Stock after this movement

  -- WHERE (BIGINT to match rooms.id)
  room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
  room_name TEXT,                        -- Denormalized

  -- WHY (notes and categorization)
  notes TEXT,                            -- Free-form notes
  reason_category TEXT,                  -- 'delivery', 'bar_restock', 'waste', 'breakage', etc.

  -- WHEN
  created_at TIMESTAMP DEFAULT NOW(),

  -- Multi-tenancy (UUID to match organizations.id)
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Offline sync support
  synced BOOLEAN DEFAULT true,           -- For offline mode
  offline_id TEXT                        -- Unique ID for offline-created records
);

-- Step 3: Add indexes for fast queries
-- -------------------------------------------------------
-- These make analytics and reports super fast

CREATE INDEX IF NOT EXISTS idx_stock_movements_date
ON stock_movements(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_user
ON stock_movements(user_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_item
ON stock_movements(inventory_item_id);

CREATE INDEX IF NOT EXISTS idx_stock_movements_type
ON stock_movements(movement_type);

CREATE INDEX IF NOT EXISTS idx_stock_movements_org
ON stock_movements(organization_id);

-- Step 4: Enable Row Level Security (RLS)
-- -------------------------------------------------------
-- Users can only see their organization's data

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their org's stock movements
CREATE POLICY "Users can view their org's stock movements"
ON stock_movements FOR SELECT
USING (
  organization_id = (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid()
  )
);

-- Policy: Users can insert stock movements for their org
CREATE POLICY "Users can insert stock movements for their org"
ON stock_movements FOR INSERT
WITH CHECK (
  organization_id = (
    SELECT organization_id
    FROM user_profiles
    WHERE id = auth.uid()
  )
);

-- Step 5: Auto-update room_counts when stock movement created
-- -------------------------------------------------------
-- This trigger automatically updates inventory when stock moves

CREATE OR REPLACE FUNCTION update_room_counts_on_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Update room_counts based on movement type
  IF NEW.movement_type = 'IN' THEN
    -- Stock coming IN: add to room count
    UPDATE room_counts
    SET count = count + NEW.quantity
    WHERE inventory_item_id = NEW.inventory_item_id
      AND room_id = NEW.room_id;

  ELSIF NEW.movement_type = 'OUT' THEN
    -- Stock going OUT: subtract from room count
    UPDATE room_counts
    SET count = count - NEW.quantity
    WHERE inventory_item_id = NEW.inventory_item_id
      AND room_id = NEW.room_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop first if exists to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_room_counts ON stock_movements;

CREATE TRIGGER trigger_update_room_counts
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_room_counts_on_movement();

-- =====================================================
-- VERIFICATION QUERIES (Run these to check it worked)
-- =====================================================

-- Check if PIN columns were added
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'user_profiles'
--   AND column_name IN ('pin_code', 'last_pin_entry', 'failed_pin_attempts');

-- Check if stock_movements table exists
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_name = 'stock_movements';

-- Check indexes
-- SELECT indexname
-- FROM pg_indexes
-- WHERE tablename = 'stock_movements';

-- =====================================================
-- DONE! This setup:
-- ✅ Adds PIN support to users
-- ✅ Creates stock movements tracking
-- ✅ Adds analytics-friendly indexes
-- ✅ Sets up security (RLS)
-- ✅ Auto-updates inventory on movements
-- ✅ Supports offline mode
-- ✅ Doesn't break ANY existing features
-- ✅ FINAL: Correct mixed types (BIGINT + UUID)
-- =====================================================
