-- =====================================================
-- STEP 2: Check Current Valid Rooms
-- =====================================================
-- This query shows all rooms that currently exist
-- READ-ONLY - Safe to run
-- =====================================================

-- Show all rooms for your organization
SELECT
  id,
  name,
  organization_id,
  display_order,
  created_at
FROM rooms
WHERE organization_id = '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0'
ORDER BY display_order, name;

-- =====================================================
-- NOTE:
-- - This shows all valid rooms in your database
-- - Room IDs 43, 49, 50, 51 are NOT in this list (they were deleted)
-- - That's why they show as "Unknown Room" in reports
-- =====================================================
