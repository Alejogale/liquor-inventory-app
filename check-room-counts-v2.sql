-- First, check the structure of room_counts table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'room_counts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if Alehoetesting has any room counts (using correct column names)
SELECT
  'Alehoetesting Room Counts' as check,
  COUNT(*) as total_count_records
FROM room_counts rc
JOIN rooms r ON r.id = rc.room_id
JOIN organizations o ON o.id = r.organization_id
WHERE o."Name" = 'Alehoetesting';

-- Check their rooms
SELECT
  'Alehoetesting Rooms' as check,
  COUNT(*) as total_rooms,
  STRING_AGG(name, ', ') as room_names
FROM rooms r
JOIN organizations o ON o.id = r.organization_id
WHERE o."Name" = 'Alehoetesting';

-- Sample of room_counts data structure
SELECT *
FROM room_counts
LIMIT 5;
