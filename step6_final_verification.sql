-- =====================================================
-- STEP 6: Final Verification
-- =====================================================
-- Verify everything is fixed and working correctly
-- READ-ONLY - Safe to run
-- =====================================================

-- Check 1: Verify NO orphaned room_counts remain
SELECT
  COUNT(*) as orphaned_room_counts,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ No orphaned data!'
    ELSE '⚠️ Still have orphaned data'
  END as status
FROM room_counts rc
LEFT JOIN rooms r ON rc.room_id = r.id
WHERE r.id IS NULL;

-- Check 2: Verify foreign key constraint exists
SELECT
  constraint_name,
  delete_rule,
  CASE
    WHEN delete_rule = 'CASCADE' THEN '✅ Constraint configured correctly!'
    ELSE '⚠️ Constraint needs CASCADE'
  END as status
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.table_name = 'room_counts'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%room_id%';

-- Check 3: Verify trigger exists
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  '✅ Trigger is active!' as status
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_inventory_on_movement';

-- Check 4: View current room_counts (should all have valid rooms)
SELECT
  r.name as room_name,
  ii.brand as item_name,
  rc.count as quantity,
  '✅ Valid room' as status
FROM room_counts rc
JOIN rooms r ON rc.room_id = r.id
JOIN inventory_items ii ON rc.inventory_item_id = ii.id
WHERE rc.organization_id = '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0'
ORDER BY r.name, ii.brand;

-- =====================================================
-- Expected Results:
-- ✅ Check 1: 0 orphaned room_counts
-- ✅ Check 2: Foreign key with CASCADE delete rule
-- ✅ Check 3: Trigger exists and is active
-- ✅ Check 4: All room_counts have valid room names (no "Unknown Room")
--
-- If all checks pass, the fix is complete!
-- Reports will now show proper room names instead of "Unknown Room"
-- =====================================================
