-- =====================================================
-- STEP 5: Update Trigger with Room Validation
-- =====================================================
-- Enhances the trigger to validate room_ids before inserting
-- =====================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_update_inventory_on_movement ON stock_movements;
DROP FUNCTION IF EXISTS update_inventory_on_stock_movement();

-- Create enhanced function with room validation
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
    -- Log warning but don't fail
    RAISE WARNING 'Room ID % does not exist for organization %. Skipping room_counts update.',
      NEW.room_id, NEW.organization_id;
    RETURN NEW;
  END IF;

  -- Determine if we're adding or subtracting
  IF NEW.movement_type = 'IN' THEN
    quantity_change := NEW.quantity;
  ELSIF NEW.movement_type = 'OUT' THEN
    quantity_change := -NEW.quantity;
  ELSE
    RETURN NEW; -- Unknown type, do nothing
  END IF;

  -- Update or insert room_counts (UPSERT)
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

-- Create the trigger
CREATE TRIGGER trigger_update_inventory_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_stock_movement();

-- =====================================================
-- Verify trigger was created
-- =====================================================

SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_inventory_on_movement';

-- =====================================================
-- What this trigger does:
-- ✅ Validates room exists before updating
-- ✅ Updates room_counts for specific room
-- ✅ Recalculates inventory_items.current_stock
-- ✅ Handles both Stock IN and Stock OUT
-- ✅ Won't create orphaned room_counts
-- =====================================================
