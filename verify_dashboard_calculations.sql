-- =====================================================
-- VERIFY DASHBOARD INVENTORY VALUE CALCULATIONS
-- =====================================================
-- This script verifies that the current_stock column
-- accurately reflects the sum of room_counts and that
-- the dashboard inventory value calculations are correct
-- =====================================================

-- STEP 1: Verify current_stock matches sum of room_counts
-- =====================================================
SELECT
  ii.id,
  ii.brand,
  ii.size,
  ii.current_stock,
  COALESCE((
    SELECT SUM(rc.count)
    FROM room_counts rc
    WHERE rc.inventory_item_id = ii.id
  ), 0) as room_counts_sum,
  CASE
    WHEN ii.current_stock = COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = ii.id
    ), 0) THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM inventory_items ii
ORDER BY status DESC, ii.brand
LIMIT 20;

-- =====================================================
-- STEP 2: Calculate total inventory value by category
-- =====================================================
SELECT
  c.name as category_name,
  COUNT(ii.id) as item_count,
  SUM(ii.current_stock) as total_units,
  SUM(ii.current_stock * COALESCE(ii.price_per_item, 0)) as total_value
FROM inventory_items ii
LEFT JOIN categories c ON ii.category_id = c.id
GROUP BY c.name
ORDER BY total_value DESC;

-- =====================================================
-- STEP 3: Calculate overall total inventory value
-- =====================================================
SELECT
  COUNT(id) as total_items,
  SUM(current_stock) as total_units,
  SUM(current_stock * COALESCE(price_per_item, 0)) as total_inventory_value
FROM inventory_items;

-- =====================================================
-- STEP 4: Check for any items with null or missing data
-- =====================================================
SELECT
  'Items with NULL current_stock' as issue,
  COUNT(*) as count
FROM inventory_items
WHERE current_stock IS NULL

UNION ALL

SELECT
  'Items with NULL price_per_item' as issue,
  COUNT(*) as count
FROM inventory_items
WHERE price_per_item IS NULL

UNION ALL

SELECT
  'Items with current_stock = 0' as issue,
  COUNT(*) as count
FROM inventory_items
WHERE current_stock = 0;

-- =====================================================
-- STEP 5: Compare old vs new calculation method
-- =====================================================
-- Old method: Sum room_counts for each item
WITH old_calculation AS (
  SELECT
    ii.id,
    ii.brand,
    COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = ii.id
    ), 0) * COALESCE(ii.price_per_item, 0) as item_value_old
  FROM inventory_items ii
),
-- New method: Use current_stock directly
new_calculation AS (
  SELECT
    ii.id,
    ii.brand,
    COALESCE(ii.current_stock, 0) * COALESCE(ii.price_per_item, 0) as item_value_new
  FROM inventory_items ii
)
SELECT
  oc.brand,
  oc.item_value_old,
  nc.item_value_new,
  CASE
    WHEN oc.item_value_old = nc.item_value_new THEN '✅ MATCH'
    ELSE '❌ DIFF: ' || (nc.item_value_new - oc.item_value_old)::text
  END as comparison
FROM old_calculation oc
JOIN new_calculation nc ON oc.id = nc.id
WHERE oc.item_value_old != nc.item_value_new
ORDER BY ABS(nc.item_value_new - oc.item_value_old) DESC
LIMIT 10;

-- =====================================================
-- STEP 6: Summary - Total value comparison
-- =====================================================
SELECT
  'Old Calculation (sum room_counts)' as method,
  SUM(
    COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = ii.id
    ), 0) * COALESCE(ii.price_per_item, 0)
  ) as total_value
FROM inventory_items ii

UNION ALL

SELECT
  'New Calculation (current_stock)' as method,
  SUM(COALESCE(ii.current_stock, 0) * COALESCE(ii.price_per_item, 0)) as total_value
FROM inventory_items ii;
