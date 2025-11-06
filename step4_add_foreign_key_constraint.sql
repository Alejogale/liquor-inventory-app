-- =====================================================
-- STEP 4: Add Foreign Key Constraint
-- =====================================================
-- This prevents future orphaned room_counts
-- When a room is deleted, room_counts are auto-deleted too
-- =====================================================

-- First, check if constraint already exists
SELECT
  constraint_name,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'room_counts'
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name LIKE '%room_id%';

-- =====================================================
-- Add the foreign key constraint
-- =====================================================

-- Drop if exists (in case there's an old one)
ALTER TABLE room_counts
DROP CONSTRAINT IF EXISTS room_counts_room_id_fkey;

-- Add new constraint with CASCADE delete
ALTER TABLE room_counts
ADD CONSTRAINT room_counts_room_id_fkey
FOREIGN KEY (room_id)
REFERENCES rooms(id)
ON DELETE CASCADE;

-- =====================================================
-- Verify it was created
-- =====================================================

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
-- Expected result:
-- - constraint_name: room_counts_room_id_fkey
-- - delete_rule: CASCADE
--
-- This means: When a room is deleted, its room_counts are automatically deleted
-- No more orphaned data!
-- =====================================================
