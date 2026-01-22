-- ============================================
-- STEP 1: Single comprehensive result
-- ============================================

SELECT
  'current_stock_exists' as metric,
  (SELECT COUNT(*)::text FROM information_schema.columns
   WHERE table_name = 'inventory_items' AND column_name = 'current_stock') as value
UNION ALL
SELECT
  'triggers_on_room_counts' as metric,
  (SELECT COUNT(*)::text FROM information_schema.triggers
   WHERE event_object_table = 'room_counts') as value
UNION ALL
SELECT
  'total_inventory_items' as metric,
  (SELECT COUNT(*)::text FROM inventory_items) as value
UNION ALL
SELECT
  'total_organizations' as metric,
  (SELECT COUNT(DISTINCT organization_id)::text FROM inventory_items) as value
UNION ALL
SELECT
  'zero_count_records' as metric,
  (SELECT COUNT(*)::text FROM room_counts WHERE count = 0) as value
UNION ALL
SELECT
  'total_room_count_records' as metric,
  (SELECT COUNT(*)::text FROM room_counts) as value
ORDER BY metric;

-- Organizations with values
SELECT
  o."Name" as organization,
  COUNT(i.id) as items,
  ROUND(SUM(i.current_stock * COALESCE(i.price_per_item, 0))::numeric, 2) as dashboard_value
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
GROUP BY o."Name"
ORDER BY dashboard_value DESC;
