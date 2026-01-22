-- ============================================
-- DIAGNOSE: Why Alehoetesting has $0 inventory value
-- ============================================

-- 1. Check if current_stock values are all zero
SELECT
  'Stock Analysis' as check_type,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE current_stock IS NULL) as null_stock,
  COUNT(*) FILTER (WHERE current_stock = 0) as zero_stock,
  COUNT(*) FILTER (WHERE current_stock > 0) as positive_stock,
  SUM(current_stock) as total_stock_count
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Alehoetesting';

-- 2. Check if price_per_item values are zero or null
SELECT
  'Price Analysis' as check_type,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE price_per_item IS NULL) as null_prices,
  COUNT(*) FILTER (WHERE price_per_item = 0) as zero_prices,
  COUNT(*) FILTER (WHERE price_per_item > 0) as positive_prices,
  AVG(price_per_item) as avg_price,
  MAX(price_per_item) as max_price
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Alehoetesting';

-- 3. Sample of items with stock and price
SELECT
  brand,
  current_stock,
  price_per_item,
  (current_stock * price_per_item) as item_value
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Alehoetesting'
AND price_per_item IS NOT NULL
AND current_stock IS NOT NULL
ORDER BY (current_stock * price_per_item) DESC
LIMIT 10;

-- 4. Compare with Default Organization (working example)
SELECT
  'Default Organization - Stock' as comparison,
  COUNT(*) FILTER (WHERE current_stock > 0) as items_with_stock,
  SUM(current_stock) as total_stock,
  AVG(CASE WHEN current_stock > 0 THEN current_stock END) as avg_stock_per_item
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Default Organization';

SELECT
  'Alehoetesting - Stock' as comparison,
  COUNT(*) FILTER (WHERE current_stock > 0) as items_with_stock,
  SUM(current_stock) as total_stock,
  AVG(CASE WHEN current_stock > 0 THEN current_stock END) as avg_stock_per_item
FROM inventory_items i
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Alehoetesting';
