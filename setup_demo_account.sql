-- Demo Account Setup for Apple App Review
-- Run this script in Supabase SQL Editor to create the demo account

-- ============================================================================
-- 1. CREATE DEMO USER
-- ============================================================================
-- Email: reviewer@invyeasy.com
-- Password: AppleReview2024!
-- Note: You must create this user in Supabase Auth Dashboard first, then use their UUID below

-- After creating the user in Auth Dashboard, replace 'USER_ID_HERE' with the actual UUID
-- Then run the rest of this script

-- For reference, to get the user ID after creating:
-- SELECT id FROM auth.users WHERE email = 'reviewer@invyeasy.com';

-- ============================================================================
-- 2. CREATE DEMO ORGANIZATION
-- ============================================================================

-- Insert organization
INSERT INTO organizations (
  id,
  name,
  plan,
  status,
  created_at,
  updated_at,
  current_period_start,
  current_period_end
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- Fixed UUID for demo org
  'Demo Hospitality Group',
  'professional', -- Give them Professional plan features
  'active',
  NOW(),
  NOW(),
  NOW(),
  NOW() + INTERVAL '30 days'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  plan = EXCLUDED.plan,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ============================================================================
-- 3. ADD DEMO USER AS OWNER
-- ============================================================================

-- !!! IMPORTANT: Replace 'USER_ID_HERE' with the actual UUID from auth.users !!!
-- You can get it from: SELECT id FROM auth.users WHERE email = 'reviewer@invyeasy.com';

INSERT INTO organization_members (
  organization_id,
  user_id,
  role,
  created_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'USER_ID_HERE', -- !!! REPLACE THIS !!!
  'owner',
  NOW()
) ON CONFLICT (organization_id, user_id) DO UPDATE SET
  role = EXCLUDED.role;

-- ============================================================================
-- 4. CREATE SAMPLE STORAGE AREAS
-- ============================================================================

INSERT INTO storage_areas (
  id,
  organization_id,
  name,
  description,
  created_at,
  updated_at
) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Bar', 'Primary bar area on first floor', NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001', 'Wine Cellar', 'Temperature-controlled wine storage', NOW(), NOW()),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000001', 'Kitchen Storage', 'Dry storage area in kitchen', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = NOW();

-- ============================================================================
-- 5. CREATE SAMPLE ITEMS
-- ============================================================================

-- Main Bar Items
INSERT INTO items (
  id,
  organization_id,
  name,
  category,
  unit,
  par_level,
  created_at,
  updated_at
) VALUES
  -- Spirits
  ('00000000-0000-0001-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Grey Goose Vodka 750ml', 'Vodka', 'bottle', 12, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Tito''s Handmade Vodka 1L', 'Vodka', 'bottle', 18, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Jack Daniel''s Tennessee Whiskey', 'Whiskey', 'bottle', 10, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Jameson Irish Whiskey', 'Whiskey', 'bottle', 15, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Johnnie Walker Black Label', 'Whiskey', 'bottle', 8, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Bacardi Superior Rum', 'Rum', 'bottle', 12, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Captain Morgan Spiced Rum', 'Rum', 'bottle', 10, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'Tanqueray London Dry Gin', 'Gin', 'bottle', 10, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'Bombay Sapphire Gin', 'Gin', 'bottle', 12, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Patrón Silver Tequila', 'Tequila', 'bottle', 8, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Don Julio Blanco Tequila', 'Tequila', 'bottle', 6, NOW(), NOW()),

  -- Liqueurs & Others
  ('00000000-0000-0001-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Cointreau Triple Sec', 'Liqueur', 'bottle', 6, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Kahlúa Coffee Liqueur', 'Liqueur', 'bottle', 4, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Baileys Irish Cream', 'Liqueur', 'bottle', 8, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000015', '00000000-0000-0000-0000-000000000001', 'Aperol', 'Aperitif', 'bottle', 5, NOW(), NOW()),

  -- Beer
  ('00000000-0000-0001-0000-000000000016', '00000000-0000-0000-0000-000000000001', 'Corona Extra 12oz (case)', 'Beer', 'case', 4, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000017', '00000000-0000-0000-0000-000000000001', 'Heineken 12oz (case)', 'Beer', 'case', 3, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000018', '00000000-0000-0000-0000-000000000001', 'Modelo Especial (case)', 'Beer', 'case', 5, NOW(), NOW()),

  -- Wine (Wine Cellar)
  ('00000000-0000-0001-0000-000000000019', '00000000-0000-0000-0000-000000000001', 'Château Margaux 2015', 'Red Wine', 'bottle', 3, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'Caymus Cabernet Sauvignon', 'Red Wine', 'bottle', 12, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'La Crema Chardonnay', 'White Wine', 'bottle', 15, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Whispering Angel Rosé', 'Rosé Wine', 'bottle', 18, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Moët & Chandon Champagne', 'Champagne', 'bottle', 10, NOW(), NOW()),
  ('00000000-0000-0001-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Veuve Clicquot Champagne', 'Champagne', 'bottle', 8, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  par_level = EXCLUDED.par_level,
  updated_at = NOW();

-- ============================================================================
-- 6. CREATE STORAGE AREA ASSIGNMENTS
-- ============================================================================

INSERT INTO storage_area_items (
  storage_area_id,
  item_id,
  quantity,
  last_counted_at
) VALUES
  -- Main Bar
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000001', 15, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000002', 22, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000003', 12, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000004', 18, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000005', 9, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000006', 14, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000007', 11, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000008', 13, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000009', 15, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000010', 10, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000011', 7, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000012', 8, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000013', 5, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000014', 9, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000015', 6, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000016', 5, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000017', 4, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0001-0000-000000000018', 6, NOW() - INTERVAL '2 days'),

  -- Wine Cellar
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000019', 4, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000020', 15, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000021', 18, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000022', 20, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000023', 12, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0001-0000-000000000024', 9, NOW() - INTERVAL '3 days'),

  -- Kitchen Storage (some beer backup)
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0001-0000-000000000016', 8, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0001-0000-000000000017', 6, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0001-0000-000000000018', 10, NOW() - INTERVAL '1 day')
ON CONFLICT (storage_area_id, item_id) DO UPDATE SET
  quantity = EXCLUDED.quantity,
  last_counted_at = EXCLUDED.last_counted_at;

-- ============================================================================
-- 7. CREATE SAMPLE INVENTORY COUNTS (HISTORY)
-- ============================================================================

INSERT INTO inventory_counts (
  id,
  organization_id,
  storage_area_id,
  counted_by,
  notes,
  created_at
) VALUES
  ('00000000-0000-0002-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000001', 'USER_ID_HERE', 'Weekly main bar count', NOW() - INTERVAL '2 days'),
  ('00000000-0000-0002-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000002', 'USER_ID_HERE', 'Wine cellar monthly audit', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0002-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0001-000000000003', 'USER_ID_HERE', 'Kitchen backup stock check', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================

-- Next steps:
-- 1. Create user in Supabase Auth Dashboard:
--    - Email: reviewer@invyeasy.com
--    - Password: AppleReview2024!
--    - Confirm email automatically
--
-- 2. Get the user ID:
--    SELECT id FROM auth.users WHERE email = 'reviewer@invyeasy.com';
--
-- 3. Replace all instances of 'USER_ID_HERE' in this script with the actual UUID
--
-- 4. Run this script in Supabase SQL Editor
--
-- 5. Verify the setup:
--    - Log in to the mobile app with reviewer@invyeasy.com
--    - Should see "Demo Hospitality Group" organization
--    - Should see 3 storage areas with items
--    - Should be able to perform counts, view reports, etc.

SELECT 'Demo account setup complete! ✅' AS status;
