-- =====================================================
-- FIX: "Unknown Room" Issue in Reports
-- =====================================================
-- Problem: room_counts has room_ids that don't exist in rooms table
-- Solution:
--   1. Identify and clean up orphaned room_counts
--   2. Add foreign key constraint to prevent future orphans
--   3. Update trigger to validate room_ids
-- =====================================================

-- =====================================================
-- STEP 1: IDENTIFY THE PROBLEM
-- =====================================================

-- Check for orphaned room_counts (room_ids that don't exist in rooms table)
SELECT
  rc.room_id as orphaned_room_id,
  rc.organization_id,
  COUNT(*) as orphaned_records,
  STRING_AGG(DISTINCT ii.brand, ', ') as affected_items
FROM room_counts rc
LEFT JOIN rooms r ON rc.room_id = r.id
LEFT JOIN inventory_items ii ON rc.inventory_item_id = ii.id
WHERE r.id IS NULL
GROUP BY rc.room_id, rc.organization_id
ORDER BY orphaned_records DESC;

-- =====================================================
-- STEP 2: CLEAN UP ORPHANED DATA
-- =====================================================

-- Option A: Delete orphaned room_counts (recommended if data is corrupted)
-- Uncomment to execute:
/*
DELETE FROM room_counts
WHERE room_id NOT IN (SELECT id FROM rooms);
*/

-- Option B: Move orphaned counts to a default room (if you want to preserve data)
-- First, create a default "Unassigned" room for each organization:
/*
INSERT INTO rooms (name, organization_id, display_order)
SELECT DISTINCT
  'Unassigned Items' as name,
  organization_id,
  999 as display_order
FROM room_counts rc
WHERE NOT EXISTS (
  SELECT 1 FROM rooms r WHERE r.organization_id = rc.organization_id AND r.name = 'Unassigned Items'
)
ON CONFLICT DO NOTHING;

-- Then reassign orphaned room_counts to the "Unassigned Items" room:
UPDATE room_counts rc
SET room_id = (
  SELECT r.id
  FROM rooms r
  WHERE r.organization_id = rc.organization_id
    AND r.name = 'Unassigned Items'
  LIMIT 1
)
WHERE NOT EXISTS (
  SELECT 1 FROM rooms r WHERE r.id = rc.room_id
);
*/

-- =====================================================
-- STEP 3: ADD FOREIGN KEY CONSTRAINT
-- =====================================================
-- This prevents future orphaned room_counts by requiring room_id to exist in rooms table

-- First, ensure all current data is clean (run Option A or B above first!)
-- Then add the foreign key constraint:

ALTER TABLE room_counts
DROP CONSTRAINT IF EXISTS room_counts_room_id_fkey;

ALTER TABLE room_counts
ADD CONSTRAINT room_counts_room_id_fkey
FOREIGN KEY (room_id)
REFERENCES rooms(id)
ON DELETE CASCADE;  -- When a room is deleted, automatically delete associated room_counts

-- =====================================================
-- STEP 4: ENHANCE THE TRIGGER TO VALIDATE ROOM_IDS
-- =====================================================

-- Drop and recreate the trigger with validation
DROP TRIGGER IF EXISTS trigger_update_inventory_on_movement ON stock_movements;
DROP FUNCTION IF EXISTS update_inventory_on_stock_movement();

CREATE OR REPLACE FUNCTION update_inventory_on_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  quantity_change INTEGER;
  room_exists BOOLEAN;
BEGIN
  -- Validate that the room exists
  SELECT EXISTS(
    SELECT 1 FROM rooms
    WHERE id = NEW.room_id
      AND organization_id = NEW.organization_id
  ) INTO room_exists;

  IF NOT room_exists THEN
    RAISE WARNING 'Room ID % does not exist for organization %. Skipping room_counts update.',
      NEW.room_id, NEW.organization_id;
    RETURN NEW;  -- Don't fail, just skip the update
  END IF;

  -- Determine if we're adding or subtracting
  IF NEW.movement_type = 'IN' THEN
    quantity_change := NEW.quantity;
  ELSIF NEW.movement_type = 'OUT' THEN
    quantity_change := -NEW.quantity;
  ELSE
    RETURN NEW; -- Unknown type, do nothing
  END IF;

  -- Update or insert room_counts
  INSERT INTO room_counts (
    inventory_item_id,
    room_id,
    count,
    organization_id
  ) VALUES (
    NEW.inventory_item_id,
    NEW.room_id,
    quantity_change,
    NEW.organization_id
  )
  ON CONFLICT (inventory_item_id, room_id)
  DO UPDATE SET
    count = room_counts.count + quantity_change;

  -- Update total inventory_items.current_stock
  UPDATE inventory_items
  SET current_stock = COALESCE((
    SELECT SUM(count)
    FROM room_counts
    WHERE inventory_item_id = NEW.inventory_item_id
  ), 0)
  WHERE id = NEW.inventory_item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_inventory_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_stock_movement();

-- =====================================================
-- STEP 5: VERIFICATION
-- =====================================================

-- Verify no orphaned room_counts remain
SELECT
  COUNT(*) as orphaned_room_counts
FROM room_counts rc
LEFT JOIN rooms r ON rc.room_id = r.id
WHERE r.id IS NULL;

-- Verify foreign key constraint exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'room_counts'
  AND kcu.column_name = 'room_id';

-- =====================================================
-- RECOMMENDED EXECUTION ORDER:
-- =====================================================
-- 1. Run STEP 1 to identify orphaned data
-- 2. Choose Option A (delete) or Option B (preserve) in STEP 2
-- 3. Run STEP 3 to add foreign key constraint
-- 4. Run STEP 4 to enhance the trigger
-- 5. Run STEP 5 to verify the fix
--
-- After this, reports will no longer show "Unknown Room"!
-- =====================================================
