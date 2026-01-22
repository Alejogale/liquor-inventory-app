-- Check Alehoetesting room counts
SELECT
  'Alehoetesting Room Counts' as check,
  COUNT(*) as total_count_records,
  COUNT(DISTINCT inventory_item_id) as unique_items_counted,
  SUM(count) as total_quantity_counted
FROM room_counts
WHERE organization_id = '6c8f9e6b-57d7-4802-8578-59e206925fdf';

-- Check their rooms
SELECT
  'Alehoetesting Rooms' as check,
  COUNT(*) as total_rooms,
  STRING_AGG(name, ', ') as room_names
FROM rooms
WHERE organization_id = '6c8f9e6b-57d7-4802-8578-59e206925fdf';

-- Check if current_stock trigger is working
-- Sample items with their current_stock values
SELECT
  i.brand,
  i.current_stock,
  i.price_per_item,
  (i.current_stock * i.price_per_item) as calculated_value
FROM inventory_items i
WHERE i.organization_id = '6c8f9e6b-57d7-4802-8578-59e206925fdf'
ORDER BY i.brand
LIMIT 10;

-- Check if trigger exists for updating current_stock
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'room_counts'
AND trigger_name LIKE '%stock%';
