-- Fix RLS Permissions - Temporarily Disable RLS for inventory_items
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS on inventory_items to allow updates
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS disabled on inventory_items. Edit Item functionality should now work.' as status; 