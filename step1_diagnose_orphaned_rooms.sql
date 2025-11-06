-- =====================================================
-- STEP 1: DIAGNOSTIC - Identify Orphaned Room Data
-- =====================================================
-- This query is READ-ONLY and will not modify any data
-- =====================================================

-- Check 1: Find orphaned room_counts (room_ids that don't exist in rooms table)
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
-- NOTE:
-- - If this returns 0 rows, there are NO orphaned records (good!)
-- - If this returns rows, those room_ids don't exist in rooms table
-- - Copy the results and share them before we proceed to cleanup
-- =====================================================
