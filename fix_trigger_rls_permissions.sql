-- =====================================================
-- FIX: Trigger RLS Permission Error
-- =====================================================
-- Problem: Trigger can't insert into room_counts due to RLS policies
-- Solution: Make trigger function run as SECURITY DEFINER (admin privileges)
-- =====================================================

-- Drop existing trigger
DROP TRIGGER IF EXISTS trigger_update_inventory_on_movement ON stock_movements;
DROP FUNCTION IF EXISTS update_inventory_on_stock_movement();

-- Create enhanced function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION update_inventory_on_stock_movement()
RETURNS TRIGGER
SECURITY DEFINER  -- ⭐ THIS IS THE FIX - Runs with admin privileges
SET search_path = public
AS $$
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
  -- This will now bypass RLS thanks to SECURITY DEFINER
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

-- Create the trigger
CREATE TRIGGER trigger_update_inventory_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW
EXECUTE FUNCTION update_inventory_on_stock_movement();

-- Verify trigger was created
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_inventory_on_movement';

-- =====================================================
-- What SECURITY DEFINER does:
-- - Makes the function run with the permissions of the function owner (admin)
-- - Bypasses RLS policies that would block the insert/update
-- - Safe because the function validates data before inserting
-- - search_path = public ensures it uses the correct schema
-- =====================================================
