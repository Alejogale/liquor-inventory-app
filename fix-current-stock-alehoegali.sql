-- ============================================
-- FIX: Recalculate current_stock for alehoegali@gmail.com
-- ============================================

-- Step 1: Get the organization ID for alehoegali@gmail.com
SELECT
  'Organization for alehoegali@gmail.com' as info,
  u.email,
  up.organization_id,
  o."Name" as org_name
FROM auth.users u
JOIN user_profiles up ON up.id = u.id
JOIN organizations o ON o.id = up.organization_id
WHERE u.email = 'alehoegali@gmail.com';

-- Step 2: Check if they have room counts
SELECT
  'Room Counts Check' as info,
  COUNT(*) as total_counts,
  COUNT(DISTINCT inventory_item_id) as unique_items,
  SUM(count) as total_quantity
FROM room_counts rc
WHERE rc.organization_id = (
  SELECT up.organization_id
  FROM auth.users u
  JOIN user_profiles up ON up.id = u.id
  WHERE u.email = 'alehoegali@gmail.com'
);

-- Step 3: Compare current_stock vs actual room_counts totals
-- (This will show the mismatch)
SELECT
  i.brand,
  i.current_stock as dashboard_shows,
  COALESCE(SUM(rc.count), 0) as actual_count,
  i.price_per_item,
  (COALESCE(SUM(rc.count), 0) * i.price_per_item) as should_be_value
FROM inventory_items i
LEFT JOIN room_counts rc ON rc.inventory_item_id = i.id
WHERE i.organization_id = (
  SELECT up.organization_id
  FROM auth.users u
  JOIN user_profiles up ON up.id = u.id
  WHERE u.email = 'alehoegali@gmail.com'
)
GROUP BY i.id, i.brand, i.current_stock, i.price_per_item
HAVING i.current_stock != COALESCE(SUM(rc.count), 0)
ORDER BY (COALESCE(SUM(rc.count), 0) * i.price_per_item) DESC
LIMIT 20;

-- Step 4: FIX - Recalculate current_stock for this organization
UPDATE inventory_items i
SET current_stock = (
  SELECT COALESCE(SUM(rc.count), 0)
  FROM room_counts rc
  WHERE rc.inventory_item_id = i.id
)
WHERE i.organization_id = (
  SELECT up.organization_id
  FROM auth.users u
  JOIN user_profiles up ON up.id = u.id
  WHERE u.email = 'alehoegali@gmail.com'
);

-- Step 5: Verify the fix worked
SELECT
  'After Fix - Total Value Check' as info,
  SUM(current_stock * COALESCE(price_per_item, 0)) as total_inventory_value,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE current_stock > 0) as items_with_stock
FROM inventory_items
WHERE organization_id = (
  SELECT up.organization_id
  FROM auth.users u
  JOIN user_profiles up ON up.id = u.id
  WHERE u.email = 'alehoegali@gmail.com'
);
