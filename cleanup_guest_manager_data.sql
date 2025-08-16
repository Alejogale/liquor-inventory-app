-- Cleanup script for Guest Manager data
-- Run this in your Supabase SQL Editor to remove any existing data

-- Remove any existing guest purchases first (due to foreign key constraints)
DELETE FROM guest_purchases;

-- Remove any existing guest visits
DELETE FROM guest_visits;

-- Remove any existing country clubs
DELETE FROM country_clubs;

-- Verify all tables are empty
SELECT 'country_clubs' as table_name, COUNT(*) as record_count FROM country_clubs
UNION ALL
SELECT 'guest_visits' as table_name, COUNT(*) as record_count FROM guest_visits
UNION ALL
SELECT 'guest_purchases' as table_name, COUNT(*) as record_count FROM guest_purchases;

-- All tables should show 0 records
