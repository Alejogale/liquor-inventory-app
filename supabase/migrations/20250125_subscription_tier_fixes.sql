-- Migration: 20250125_subscription_tier_fixes.sql
-- Description: Fix subscription tiers to match website, add trial tracking
-- Date: 2025-01-25
-- Context: During Apple review account creation, discovered mismatch between
--          website tiers and database constraints

-- ============================================
-- 1. Add trial_started_at column to organizations
-- ============================================
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. Update subscription_tiers table
-- ============================================

-- Delete old tiers that don't exist on website
DELETE FROM subscription_tiers WHERE tier_id = 'personal';
DELETE FROM subscription_tiers WHERE tier_id = 'premium';

-- Add new tiers that exist on website
INSERT INTO subscription_tiers (tier_id, name, monthly_price, yearly_price, storage_area_limit, item_limit, user_limit, features)
VALUES
  ('basic', 'Basic', 9.99, 99.99, 3, 500, 3, '["basic_reporting", "email_support"]'),
  ('business', 'Business', 49.99, 499.99, -1, -1, -1, '["unlimited_storage", "unlimited_items", "unlimited_users", "priority_support", "api_access", "custom_integrations", "dedicated_account_manager"]')
ON CONFLICT (tier_id) DO UPDATE SET
  name = EXCLUDED.name,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  storage_area_limit = EXCLUDED.storage_area_limit,
  item_limit = EXCLUDED.item_limit,
  user_limit = EXCLUDED.user_limit,
  features = EXCLUDED.features;

-- Update existing tiers with correct limits
UPDATE subscription_tiers SET
  storage_area_limit = 1,
  item_limit = 100,
  user_limit = 1,
  monthly_price = 0,
  yearly_price = 0
WHERE tier_id = 'starter';

UPDATE subscription_tiers SET
  storage_area_limit = 10,
  item_limit = 2000,
  user_limit = 10,
  monthly_price = 24.99,
  yearly_price = 249.99
WHERE tier_id = 'professional';

-- ============================================
-- 3. Update constraints on subscription_tiers
-- ============================================

-- Drop old constraint if exists
ALTER TABLE subscription_tiers
DROP CONSTRAINT IF EXISTS subscription_tiers_tier_id_check;

-- Add new constraint with correct tier IDs
ALTER TABLE subscription_tiers
ADD CONSTRAINT subscription_tiers_tier_id_check
CHECK (tier_id IN ('starter', 'basic', 'professional', 'business', 'enterprise'));

-- ============================================
-- 4. Update constraints on organizations
-- ============================================

-- Drop old constraint if exists
ALTER TABLE organizations
DROP CONSTRAINT IF EXISTS organizations_subscription_tier_check;

-- Add new constraint with correct tier IDs
ALTER TABLE organizations
ADD CONSTRAINT organizations_subscription_tier_check
CHECK (subscription_tier IN ('starter', 'basic', 'professional', 'business', 'enterprise'));

-- ============================================
-- ROLLBACK (if needed, run these manually)
-- ============================================
-- ALTER TABLE organizations DROP COLUMN trial_started_at;
-- ALTER TABLE subscription_tiers DROP CONSTRAINT subscription_tiers_tier_id_check;
-- ALTER TABLE organizations DROP CONSTRAINT organizations_subscription_tier_check;
