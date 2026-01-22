-- ============================================
-- STEP 1: VERIFY CURRENT STATE (Simplified)
-- Run each section separately
-- ============================================

-- Section 1: Check if current_stock column exists
SELECT
  'current_stock column' as check,
  COUNT(*) as exists
FROM information_schema.columns
WHERE table_name = 'inventory_items'
AND column_name = 'current_stock';

-- Section 2: Existing triggers on room_counts
SELECT
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'room_counts'
ORDER BY trigger_name;

-- Section 3: Count total items and mismatches
SELECT
  COUNT(*) as total_inventory_items
FROM inventory_items;

-- Section 4: Organizations with data
SELECT
  o."Name" as organization,
  COUNT(i.id) as total_items,
  SUM(i.current_stock * COALESCE(i.price_per_item, 0)) as current_dashboard_value
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
GROUP BY o."Name"
ORDER BY current_dashboard_value DESC;

-- Section 5: Check for zero-count records
SELECT
  COUNT(*) as zero_count_records
FROM room_counts
WHERE count = 0;

-- Section 6: Sample items - current_stock vs actual counts
SELECT
  i.brand,
  i.current_stock as shows_on_dashboard,
  i.price_per_item,
  o."Name" as organization
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
ORDER BY i.current_stock DESC
LIMIT 10;
