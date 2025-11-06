-- =====================================================
-- DIAGNOSE: Stock Movement Insert Error
-- =====================================================

-- Check 1: See what rooms exist for your organization
SELECT
  id,
  name,
  organization_id,
  '✅ Valid room' as status
FROM rooms
WHERE organization_id = '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0'
ORDER BY name;

-- Check 2: Check RLS policies on room_counts table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'room_counts';

-- Check 3: Check RLS policies on stock_movements table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'stock_movements';

-- Check 4: Verify trigger exists and is enabled
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_update_inventory_on_movement';
