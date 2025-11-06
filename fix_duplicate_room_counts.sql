-- =====================================================
-- FIX: Duplicate room_counts entries
-- =====================================================
-- Step 1: Find all duplicates
-- Step 2: Merge duplicates by summing counts
-- Step 3: Add unique constraint
-- =====================================================

-- STEP 1: View all duplicate entries
SELECT
  inventory_item_id,
  room_id,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as record_ids,
  STRING_AGG(count::text, ', ') as counts
FROM room_counts
GROUP BY inventory_item_id, room_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- =====================================================
-- STEP 2: Merge duplicates (keeps sum of counts)
-- =====================================================
-- This will:
-- 1. Keep the first record for each item/room combo
-- 2. Update its count to be the SUM of all duplicates
-- 3. Delete the other duplicate records

-- First, update the count to be the sum
WITH duplicate_sums AS (
  SELECT
    inventory_item_id,
    room_id,
    SUM(count) as total_count,
    MIN(id) as keep_id
  FROM room_counts
  GROUP BY inventory_item_id, room_id
  HAVING COUNT(*) > 1
)
UPDATE room_counts rc
SET count = ds.total_count
FROM duplicate_sums ds
WHERE rc.id = ds.keep_id;

-- Then, delete all duplicate records except the one we kept
WITH duplicate_sums AS (
  SELECT
    inventory_item_id,
    room_id,
    MIN(id) as keep_id
  FROM room_counts
  GROUP BY inventory_item_id, room_id
  HAVING COUNT(*) > 1
)
DELETE FROM room_counts rc
USING duplicate_sums ds
WHERE rc.inventory_item_id = ds.inventory_item_id
  AND rc.room_id = ds.room_id
  AND rc.id != ds.keep_id;

-- =====================================================
-- STEP 3: Verify no duplicates remain
-- =====================================================
SELECT
  COUNT(*) as remaining_duplicates
FROM (
  SELECT
    inventory_item_id,
    room_id,
    COUNT(*) as cnt
  FROM room_counts
  GROUP BY inventory_item_id, room_id
  HAVING COUNT(*) > 1
) sub;

-- Should return 0

-- =====================================================
-- STEP 4: Add unique constraint
-- =====================================================
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
