-- =====================================================
-- VERIFY STAFF ACCESS - RLS POLICIES CHECK
-- =====================================================
-- This script checks if RLS policies allow staff to see organization data
-- Run this to verify staff members can access their org's data
-- =====================================================

-- Check RLS is enabled on all tables
SELECT
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'inventory_items',
    'categories',
    'rooms',
    'room_counts',
    'suppliers',
    'user_profiles',
    'stock_movements'
  )
ORDER BY tablename;

-- Check policies exist for SELECT (viewing data)
SELECT
  tablename,
  policyname,
  cmd as "Command",
  qual as "USING clause"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'inventory_items',
    'categories',
    'rooms',
    'suppliers',
    'stock_movements'
  )
  AND cmd = 'SELECT'
ORDER BY tablename, policyname;

-- =====================================================
-- WHAT TO LOOK FOR:
-- =====================================================
-- ✅ All tables should have "RLS Enabled" = true
-- ✅ Each table should have a SELECT policy with organization_id check
--
-- If missing, staff won't be able to see organization data!
-- =====================================================
