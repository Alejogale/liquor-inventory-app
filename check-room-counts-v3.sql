-- Check if Alehoetesting has any room counts
SELECT
  'Alehoetesting Room Counts' as check,
  COUNT(*) as total_count_records,
  COUNT(DISTINCT inventory_item_id) as unique_items_counted,
  SUM(count) as total_quantity_counted
FROM room_counts rc
WHERE rc.organization_id = (
  SELECT id FROM organizations WHERE "Name" = 'Alehoetesting'
);

-- Check their rooms
SELECT
  'Alehoetesting Rooms' as check,
  COUNT(*) as total_rooms,
  STRING_AGG(name, ', ') as room_names
FROM rooms r
WHERE r.organization_id = (
  SELECT id FROM organizations WHERE "Name" = 'Alehoetesting'
);

-- For comparison: Default Organization
SELECT
  'Default Organization Room Counts' as check,
  COUNT(*) as total_count_records,
  COUNT(DISTINCT inventory_item_id) as unique_items_counted,
  SUM(count) as total_quantity_counted
FROM room_counts rc
WHERE rc.organization_id = '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0';

-- Get Alehoetesting organization ID
SELECT id, "Name" FROM organizations WHERE "Name" = 'Alehoetesting';
