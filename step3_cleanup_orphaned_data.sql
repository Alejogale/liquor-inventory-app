-- =====================================================
-- STEP 3: Clean Up Orphaned room_counts
-- =====================================================
-- ⚠️ WARNING: This will DELETE data
-- But it's safe because these rooms don't exist anymore
-- =====================================================

-- Show exactly what will be deleted (preview)
SELECT
  rc.id as room_count_id,
  rc.room_id as orphaned_room_id,
  rc.inventory_item_id,
  ii.brand as item_name,
  rc.count as quantity,
  rc.organization_id
FROM room_counts rc
LEFT JOIN rooms r ON rc.room_id = r.id
LEFT JOIN inventory_items ii ON rc.inventory_item_id = ii.id
WHERE r.id IS NULL
ORDER BY rc.room_id, ii.brand;

-- =====================================================
-- After reviewing the above preview, uncomment and run this to delete:
-- =====================================================

/*
-- Delete orphaned room_counts (rooms 43, 49, 50, 51 don't exist)
DELETE FROM room_counts
WHERE room_id IN (43, 49, 50, 51)
  AND organization_id = '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0';

-- Show how many were deleted
SELECT '✅ Cleanup complete!' as status;
*/

-- =====================================================
-- IMPORTANT NOTES:
-- - These room_counts are orphaned (their rooms don't exist)
-- - They're causing "Unknown Room" in reports
-- - Deleting them won't affect your actual inventory
-- - The inventory_items.current_stock will be recalculated by trigger
-- =====================================================
