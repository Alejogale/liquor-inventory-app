-- Test script to check if Guest Manager tables exist
-- Run this in your Supabase SQL Editor

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM information_schema.tables 
WHERE table_name IN ('country_clubs', 'guest_visits', 'guest_purchases')
AND table_schema = 'public';

-- If tables exist, show their structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('country_clubs', 'guest_visits', 'guest_purchases')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('country_clubs', 'guest_visits', 'guest_purchases');

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('country_clubs', 'guest_visits', 'guest_purchases');
