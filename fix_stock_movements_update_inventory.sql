-- =====================================================
-- FIX: Stock Movements Should Update Inventory Counts
-- =====================================================
-- Problem: Stock In/Out creates movements but doesn't update
--          inventory counts or room quantities
-- Solution: Enhanced trigger that updates BOTH room_counts
--           AND inventory_items.current_stock
-- =====================================================

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_room_counts ON stock_movements;
DROP FUNCTION IF EXISTS update_room_counts_on_movement();

-- Step 2: Create improved function that updates EVERYTHING
CREATE OR REPLACE FUNCTION update_inventory_on_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
  quantity_change INTEGER;
BEGIN
  -- Determine if we're adding or subtracting
  IF NEW.movement_type = 'IN' THEN
    quantity_change := NEW.quantity;
  ELSIF NEW.movement_type = 'OUT' THEN
    quantity_change := -NEW.quantity;
  ELSE
    RETURN NEW; -- Unknown type, do nothing
  END IF;

  -- Update or insert room_counts
  -- Uses UPSERT to handle both existing and new room/item combinations
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
  -- This sums up ALL room counts for this item
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

-- Step 3: Create the trigger
CREATE TRIGGER trigger_update_inventory_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_stock_movement();

-- =====================================================
-- VERIFICATION: Check if trigger was created
-- =====================================================
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_inventory_on_movement';

-- =====================================================
-- TESTING: Test the trigger with a sample movement
-- =====================================================
-- Uncomment to test (replace with actual IDs from your database):
/*
-- 1. Check current inventory before
SELECT id, brand, current_stock FROM inventory_items WHERE id = YOUR_ITEM_ID;

-- 2. Check room counts before
SELECT * FROM room_counts WHERE inventory_item_id = YOUR_ITEM_ID;

-- 3. Insert a test stock movement (Stock IN)
INSERT INTO stock_movements (
  inventory_item_id,
  item_brand,
  user_id,
  user_name,
  movement_type,
  quantity,
  previous_stock,
  new_stock,
  room_id,
  room_name,
  organization_id
) VALUES (
  YOUR_ITEM_ID,
  'Test Item',
  YOUR_USER_ID,
  'Test User',
  'IN',
  5,
  0,
  5,
  YOUR_ROOM_ID,
  'Test Room',
  YOUR_ORG_ID
);

-- 4. Check inventory after (should be +5)
SELECT id, brand, current_stock FROM inventory_items WHERE id = YOUR_ITEM_ID;

-- 5. Check room counts after (should have new/updated record)
SELECT * FROM room_counts WHERE inventory_item_id = YOUR_ITEM_ID;
*/

-- =====================================================
-- DONE! Now Stock In/Out will:
-- ✅ Update room-specific counts (room_counts table)
-- ✅ Update total inventory (inventory_items.current_stock)
-- ✅ Handle new item/room combinations automatically
-- ✅ Work for both Stock IN and Stock OUT
-- =====================================================
