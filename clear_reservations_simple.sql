-- Clear all test reservations for your organization
-- Run this in your Supabase SQL Editor

-- Delete all reservations for your organization
DELETE FROM reservations 
WHERE organization_id = '876bdf87-5983-4b57-9274-811be47b8671';

-- Verify the deletion worked
SELECT COUNT(*) as remaining_reservations
FROM reservations 
WHERE organization_id = '876bdf87-5983-4b57-9274-811be47b8671';
