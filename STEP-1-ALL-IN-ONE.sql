-- ============================================
-- STEP 1: Complete Verification - All Results
-- Copy and run this entire file
-- ============================================

-- Check 1: current_stock column exists?
SELECT 'CHECK 1: current_stock column' as check, COUNT(*) as exists
FROM information_schema.columns
WHERE table_name = 'inventory_items' AND column_name = 'current_stock';

-- Check 2: Triggers on room_counts
SELECT 'CHECK 2: Triggers on room_counts' as check, COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_table = 'room_counts';

-- Check 2b: List triggers (if any)
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'room_counts';

-- Check 3: Total inventory items
SELECT 'CHECK 3: Total items' as check, COUNT(*) as total_items
FROM inventory_items;

-- Check 4: Organizations and their values
SELECT 'CHECK 4: Organizations' as check, COUNT(DISTINCT organization_id) as total_orgs
FROM inventory_items;

-- Check 4b: Organization details
SELECT
  o."Name" as organization,
  COUNT(i.id) as items,
  ROUND(SUM(i.current_stock * COALESCE(i.price_per_item, 0))::numeric, 2) as dashboard_value
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
GROUP BY o."Name"
ORDER BY dashboard_value DESC;

-- Check 5: Zero count records
SELECT 'CHECK 5: Zero counts' as check, COUNT(*) as zero_records
FROM room_counts
WHERE count = 0;

-- Check 6: Total room_counts records
SELECT 'CHECK 6: Total room counts' as check, COUNT(*) as total_room_counts
FROM room_counts;

-- Summary
SELECT '=== VERIFICATION COMPLETE ===' as status;
