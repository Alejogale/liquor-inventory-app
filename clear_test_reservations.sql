-- Clear all test reservation data for the organization
-- Replace '876bdf87-5983-4b57-9274-811be47b8671' with your actual organization ID

-- First, let's see what we're about to delete
SELECT 
    COUNT(*) as total_reservations,
    SUM(party_size) as total_covers
FROM reservations 
WHERE organization_id = '876bdf87-5983-4b57-9274-811be47b8671';

-- Show sample of what will be deleted
SELECT 
    member_name,
    party_size,
    reservation_date,
    status
FROM reservations 
WHERE organization_id = '876bdf87-5983-4b57-9274-811be47b8671'
ORDER BY reservation_date DESC
LIMIT 10;

-- DELETE all reservations for this organization
DELETE FROM reservations 
WHERE organization_id = '876bdf87-5983-4b57-9274-811be47b8671';

-- Verify deletion
SELECT COUNT(*) as remaining_reservations
FROM reservations 
WHERE organization_id = '876bdf87-5983-4b57-9274-811be47b8671';
