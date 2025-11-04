-- =====================================================
-- FIX STOCK MOVEMENTS - Support Decimal Quantities
-- =====================================================
-- Fixes two issues:
-- 1. Missing updated_at column in room_counts
-- 2. Integer-only quantities (need to support decimals like 31.5)
-- =====================================================

-- Fix 1: Add missing updated_at column to room_counts
ALTER TABLE room_counts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix 2: Change quantity columns to support decimals
-- This allows for partial bottles, liters, ounces, etc.

ALTER TABLE stock_movements
ALTER COLUMN quantity TYPE NUMERIC(10,2),
ALTER COLUMN previous_stock TYPE NUMERIC(10,2),
ALTER COLUMN new_stock TYPE NUMERIC(10,2);

-- Verify the changes
SELECT
  column_name,
  data_type,
  numeric_precision,
  numeric_scale
FROM information_schema.columns
WHERE table_name = 'stock_movements'
  AND column_name IN ('quantity', 'previous_stock', 'new_stock');

-- Also verify updated_at was added to room_counts
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'room_counts'
  AND column_name = 'updated_at';

-- =====================================================
-- DONE! This allows:
-- ✅ Whole numbers: 10, 20, 100
-- ✅ Decimals: 31.5, 33.5, 2.75
-- ✅ Up to 2 decimal places (perfect for bottles/liters)
-- =====================================================
