-- =====================================================
-- CHECK FOR "UNKNOWN ROOM" ISSUE
-- =====================================================

-- 1. Find room_counts with room_ids that don't exist in rooms table
SELECT 
  rc.room_id,
  rc.organization_id,
  COUNT(*) as orphaned_records,
  STRING_AGG(DISTINCT ii.brand, ', ') as affected_items
FROM room_counts rc
LEFT JOIN rooms r ON rc.room_id = r.id
LEFT JOIN inventory_items ii ON rc.inventory_item_id = ii.id
WHERE r.id IS NULL
GROUP BY rc.room_id, rc.organization_id;

-- 2. Check stock_movements for invalid room_ids
SELECT 
  sm.room_id,
  sm.room_name,
  sm.organization_id,
  COUNT(*) as movement_records,
  MIN(sm.created_at) as first_occurrence,
  MAX(sm.created_at) as last_occurrence
FROM stock_movements sm
LEFT JOIN rooms r ON sm.room_id = r.id
WHERE r.id IS NULL
GROUP BY sm.room_id, sm.room_name, sm.organization_id;

-- 3. Check for deleted rooms (if there's a deleted_at column)
SELECT 
  id,
  name,
  organization_id,
  created_at
FROM rooms
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- 4. Verify all rooms exist for an organization
SELECT 
  r.id,
  r.name,
  r.organization_id,
  COUNT(DISTINCT rc.inventory_item_id) as items_in_room
FROM rooms r
LEFT JOIN room_counts rc ON r.id = rc.room_id
GROUP BY r.id, r.name, r.organization_id
ORDER BY r.name;
