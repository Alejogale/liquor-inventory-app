-- ============================================
-- COMPREHENSIVE ANALYSIS OF COUNT SYSTEM
-- ============================================

-- 1. Check if trigger exists to update current_stock when room_counts change
SELECT
  'Triggers on room_counts table' as check,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'room_counts'
ORDER BY trigger_name;

-- 2. Check if trigger exists to update current_stock from inventory_items
SELECT
  'Triggers on inventory_items table' as check,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'inventory_items'
ORDER BY trigger_name;

-- 3. Check functions that might update current_stock
SELECT
  'Functions that mention current_stock' as check,
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname LIKE '%current_stock%'
OR pg_get_functiondef(oid) LIKE '%current_stock%';

-- 4. Test case: Account with counts but wrong inventory value
-- Find organizations where current_stock doesn't match room_counts sum
SELECT
  o."Name" as organization,
  COUNT(DISTINCT i.id) as total_items,
  COUNT(DISTINCT i.id) FILTER (
    WHERE i.current_stock != COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = i.id
    ), 0)
  ) as items_with_mismatch,
  SUM(i.current_stock * COALESCE(i.price_per_item, 0)) as dashboard_value,
  SUM(
    COALESCE((
      SELECT SUM(rc.count)
      FROM room_counts rc
      WHERE rc.inventory_item_id = i.id
    ), 0) * COALESCE(i.price_per_item, 0)
  ) as actual_value_from_counts
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
ORDER BY dashboard_value DESC;

-- 5. Sample of mismatched items (showing the problem)
SELECT
  i.brand,
  i.current_stock as dashboard_shows,
  COALESCE((
    SELECT SUM(rc.count)
    FROM room_counts rc
    WHERE rc.inventory_item_id = i.id
  ), 0) as actual_count_in_rooms,
  i.price_per_item,
  (i.current_stock * COALESCE(i.price_per_item, 0)) as dashboard_value,
  (COALESCE((
    SELECT SUM(rc.count)
    FROM room_counts rc
    WHERE rc.inventory_item_id = i.id
  ), 0) * COALESCE(i.price_per_item, 0)) as should_be_value,
  o."Name" as organization
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE i.current_stock != COALESCE((
  SELECT SUM(rc.count)
  FROM room_counts rc
  WHERE rc.inventory_item_id = i.id
), 0)
LIMIT 20;

-- 6. Check room_counts table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'room_counts'
ORDER BY ordinal_position;

-- 7. Check if there are any zero-count records
-- (These might be causing issues)
SELECT
  'Zero count records' as check,
  COUNT(*) as total_zero_records,
  COUNT(DISTINCT organization_id) as affected_organizations
FROM room_counts
WHERE count = 0;

-- 8. Sample of zero-count records
SELECT
  rc.count,
  i.brand,
  r.name as room_name,
  o."Name" as organization,
  rc.created_at,
  rc.updated_at
FROM room_counts rc
JOIN inventory_items i ON i.id = rc.inventory_item_id
JOIN rooms r ON r.id = rc.room_id
JOIN organizations o ON o.id = rc.organization_id
WHERE rc.count = 0
LIMIT 10;
