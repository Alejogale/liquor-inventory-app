-- Check if Alehoetesting has any room counts recorded
SELECT
  'Alehoetesting Room Counts' as check,
  COUNT(*) as total_counts,
  COUNT(DISTINCT item_id) as unique_items_counted,
  SUM(quantity) as total_quantity_counted
FROM room_counts rc
JOIN inventory_items i ON i.id = rc.item_id
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Alehoetesting';

-- Check their rooms
SELECT
  'Alehoetesting Rooms' as check,
  COUNT(*) as total_rooms,
  STRING_AGG(name, ', ') as room_names
FROM rooms r
JOIN organizations o ON o.id = r.organization_id
WHERE o."Name" = 'Alehoetesting';

-- For comparison: Default Organization
SELECT
  'Default Organization Room Counts' as check,
  COUNT(*) as total_counts,
  COUNT(DISTINCT item_id) as unique_items_counted,
  SUM(quantity) as total_quantity_counted
FROM room_counts rc
JOIN inventory_items i ON i.id = rc.item_id
JOIN organizations o ON o.id = i.organization_id
WHERE o."Name" = 'Default Organization';
