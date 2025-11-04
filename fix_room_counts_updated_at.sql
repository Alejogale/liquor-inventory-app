-- Fix: Add missing updated_at column to room_counts table
-- This column is referenced by the update_room_counts_updated_at trigger
-- but was missing from the actual table

-- Add the updated_at column if it doesn't exist
ALTER TABLE room_counts
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'room_counts'
  AND column_name = 'updated_at';
