-- ============================================
-- STEP 1: VERIFY CURRENT DATABASE STATE
-- Run this BEFORE making any changes
-- ============================================

-- 1. Check if current_stock column exists
SELECT
  'current_stock column check' as verification,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'inventory_items' AND column_name = 'current_stock'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. Check for existing triggers on room_counts
SELECT
  '=== Existing Triggers on room_counts ===' as info;

SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'room_counts'
ORDER BY trigger_name;

-- 3. Check for existing triggers on inventory_items
SELECT
  '=== Existing Triggers on inventory_items ===' as info;

SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'inventory_items'
ORDER BY trigger_name;

-- 4. Check for functions that update current_stock
SELECT
  '=== Functions mentioning current_stock ===' as info;

SELECT
  proname as function_name,
  CASE
    WHEN pg_get_functiondef(oid) LIKE '%current_stock%' THEN '✅ Found'
    ELSE '❌ Not found'
  END as mentions_current_stock
FROM pg_proc
WHERE pg_get_functiondef(oid) LIKE '%current_stock%'
ORDER BY proname;

-- 5. Count mismatched records (BEFORE fix)
SELECT
  '=== Mismatch Analysis (BEFORE) ===' as info;

SELECT
  COUNT(*) as total_items,
  COUNT(*) FILTER (
    WHERE i.current_stock != COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = i.id
    ), 0)
  ) as items_with_mismatch,
  ROUND(
    100.0 * COUNT(*) FILTER (
      WHERE i.current_stock != COALESCE((
        SELECT SUM(rc.count)
        FROM room_counts rc
        WHERE rc.inventory_item_id = i.id
      ), 0)
    ) / NULLIF(COUNT(*), 0),
    2
  ) as mismatch_percentage
FROM inventory_items i;

-- 6. Organizations with mismatches
SELECT
  '=== Organizations Affected ===' as info;

SELECT
  o."Name" as organization,
  COUNT(DISTINCT i.id) as total_items,
  COUNT(DISTINCT i.id) FILTER (
    WHERE i.current_stock != COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = i.id
    ), 0)
  ) as items_needing_fix,
  SUM(i.current_stock * COALESCE(i.price_per_item, 0)) as current_dashboard_value,
  SUM(
    COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = i.id
    ), 0) * COALESCE(i.price_per_item, 0)
  ) as correct_value_should_be
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
GROUP BY o."Name"
HAVING COUNT(DISTINCT i.id) FILTER (
  WHERE i.current_stock != COALESCE((
    SELECT SUM(rc.count)
    FROM room_counts rc
    WHERE rc.inventory_item_id = i.id
  ), 0)
) > 0
ORDER BY items_needing_fix DESC;

-- 7. Check for zero-count records
SELECT
  '=== Zero Count Records ===' as info;

SELECT
  COUNT(*) as total_zero_records,
  COUNT(DISTINCT organization_id) as organizations_with_zeros,
  COUNT(DISTINCT inventory_item_id) as unique_items_with_zero
FROM room_counts
WHERE count = 0;

-- 8. Sample of problem items
SELECT
  '=== Sample Problem Items (Top 10) ===' as info;

SELECT
  i.brand,
  i.current_stock as dashboard_shows,
  COALESCE((
    SELECT SUM(rc.count)
    FROM room_counts rc
    WHERE rc.inventory_item_id = i.id
  ), 0) as actual_count,
  i.price_per_item,
  o."Name" as organization
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE i.current_stock != COALESCE((
  SELECT SUM(rc.count)
  FROM room_counts rc
  WHERE rc.inventory_item_id = i.id
), 0)
ORDER BY i.price_per_item DESC
LIMIT 10;

-- 9. Summary
SELECT
  '=== SUMMARY ===' as info;

SELECT
  'Total organizations' as metric,
  COUNT(DISTINCT id) as value
FROM organizations
UNION ALL
SELECT
  'Total inventory items' as metric,
  COUNT(*) as value
FROM inventory_items
UNION ALL
SELECT
  'Total room count records' as metric,
  COUNT(*) as value
FROM room_counts;

SELECT '✅ Verification complete. Review results above before proceeding to Step 2.' as next_step;
