-- Cleanup script to remove sample clubs
-- Run this in your Supabase SQL Editor if you want to start fresh

-- Remove any existing sample clubs
DELETE FROM country_clubs WHERE name IN (
  'Pebble Beach Golf Links',
  'Augusta National Golf Club', 
  'St. Andrews Old Course'
);

-- Verify the cleanup
SELECT COUNT(*) as total_clubs FROM country_clubs;
SELECT name, location FROM country_clubs ORDER BY name;
