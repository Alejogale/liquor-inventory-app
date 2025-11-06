-- =====================================================
-- ADD current_stock column to inventory_items
-- =====================================================

-- Check if column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'inventory_items'
ORDER BY ordinal_position;

-- Add current_stock column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_items'
    AND column_name = 'current_stock'
  ) THEN
    ALTER TABLE inventory_items
    ADD COLUMN current_stock INTEGER DEFAULT 0 NOT NULL;

    RAISE NOTICE 'Added current_stock column';
  ELSE
    RAISE NOTICE 'current_stock column already exists';
  END IF;
END $$;

-- Initialize current_stock with sum of room_counts for each item
UPDATE inventory_items ii
SET current_stock = COALESCE((
  SELECT SUM(rc.count)
  FROM room_counts rc
  WHERE rc.inventory_item_id = ii.id
), 0);

-- Verify column was added and populated
SELECT
  id,
  brand,
  current_stock,
  (SELECT SUM(count) FROM room_counts WHERE inventory_item_id = inventory_items.id) as room_counts_sum
FROM inventory_items
LIMIT 10;
