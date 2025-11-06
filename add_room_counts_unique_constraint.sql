-- =====================================================
-- ADD UNIQUE CONSTRAINT TO room_counts
-- =====================================================
-- The trigger uses ON CONFLICT (inventory_item_id, room_id)
-- which requires a unique constraint on these columns
-- =====================================================

-- Add unique constraint on (inventory_item_id, room_id)
-- This ensures each item can only have one count per room
ALTER TABLE room_counts
ADD CONSTRAINT room_counts_item_room_unique
UNIQUE (inventory_item_id, room_id);

-- Verify constraint was created
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'room_counts'::regclass
  AND conname = 'room_counts_item_room_unique';

-- =====================================================
-- This allows the trigger's UPSERT to work:
-- INSERT ... ON CONFLICT (inventory_item_id, room_id) DO UPDATE
-- =====================================================
