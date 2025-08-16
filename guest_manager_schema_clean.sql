-- Country Club Guest Manager Database Schema (Clean Version)
-- This integrates seamlessly with the existing Hospitality Hub structure
-- Run this in your Supabase SQL Editor - NO SAMPLE DATA INCLUDED

-- 1. Create country_clubs table
CREATE TABLE IF NOT EXISTS country_clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    phone_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notes TEXT,
    monthly_guests INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create guest_visits table
CREATE TABLE IF NOT EXISTS guest_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_name VARCHAR(255) NOT NULL,
    member_number VARCHAR(100) NOT NULL,
    home_club_id UUID REFERENCES country_clubs(id) ON DELETE SET NULL,
    visit_date DATE NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'billed', 'cancelled')),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create guest_purchases table
CREATE TABLE IF NOT EXISTS guest_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_visit_id UUID REFERENCES guest_visits(id) ON DELETE CASCADE,
    item_description VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Row Level Security on all tables
ALTER TABLE country_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_purchases ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for country_clubs
DROP POLICY IF EXISTS "Users can view country clubs in their organization" ON country_clubs;
DROP POLICY IF EXISTS "Users can insert country clubs in their organization" ON country_clubs;
DROP POLICY IF EXISTS "Users can update country clubs in their organization" ON country_clubs;
DROP POLICY IF EXISTS "Users can delete country clubs in their organization" ON country_clubs;

CREATE POLICY "Users can view country clubs in their organization" ON country_clubs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert country clubs in their organization" ON country_clubs
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update country clubs in their organization" ON country_clubs
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete country clubs in their organization" ON country_clubs
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 6. Create RLS policies for guest_visits
DROP POLICY IF EXISTS "Users can view guest visits in their organization" ON guest_visits;
DROP POLICY IF EXISTS "Users can insert guest visits in their organization" ON guest_visits;
DROP POLICY IF EXISTS "Users can update guest visits in their organization" ON guest_visits;
DROP POLICY IF EXISTS "Users can delete guest visits in their organization" ON guest_visits;

CREATE POLICY "Users can view guest visits in their organization" ON guest_visits
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert guest visits in their organization" ON guest_visits
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update guest visits in their organization" ON guest_visits
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete guest visits in their organization" ON guest_visits
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 7. Create RLS policies for guest_purchases
DROP POLICY IF EXISTS "Users can view guest purchases in their organization" ON guest_purchases;
DROP POLICY IF EXISTS "Users can insert guest purchases in their organization" ON guest_purchases;
DROP POLICY IF EXISTS "Users can update guest purchases in their organization" ON guest_purchases;
DROP POLICY IF EXISTS "Users can delete guest purchases in their organization" ON guest_purchases;

CREATE POLICY "Users can view guest purchases in their organization" ON guest_purchases
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert guest purchases in their organization" ON guest_purchases
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update guest purchases in their organization" ON guest_purchases
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete guest purchases in their organization" ON guest_purchases
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_country_clubs_organization_id ON country_clubs(organization_id);
CREATE INDEX IF NOT EXISTS idx_country_clubs_status ON country_clubs(status);
CREATE INDEX IF NOT EXISTS idx_guest_visits_organization_id ON guest_visits(organization_id);
CREATE INDEX IF NOT EXISTS idx_guest_visits_home_club_id ON guest_visits(home_club_id);
CREATE INDEX IF NOT EXISTS idx_guest_visits_visit_date ON guest_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_guest_visits_status ON guest_visits(status);
CREATE INDEX IF NOT EXISTS idx_guest_purchases_guest_visit_id ON guest_purchases(guest_visit_id);
CREATE INDEX IF NOT EXISTS idx_guest_purchases_organization_id ON guest_purchases(organization_id);

-- 9. Create function to update total_amount in guest_visits
CREATE OR REPLACE FUNCTION update_guest_visit_total()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE guest_visits
        SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM guest_purchases
            WHERE guest_visit_id = OLD.guest_visit_id
        )
        WHERE id = OLD.guest_visit_id;
        RETURN OLD;
    ELSE
        UPDATE guest_visits
        SET total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM guest_purchases
            WHERE guest_visit_id = NEW.guest_visit_id
        )
        WHERE id = NEW.guest_visit_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger to automatically update guest_visit totals
DROP TRIGGER IF EXISTS trigger_update_guest_visit_total ON guest_purchases;
CREATE TRIGGER trigger_update_guest_visit_total
    AFTER INSERT OR UPDATE OR DELETE ON guest_purchases
    FOR EACH ROW EXECUTE FUNCTION update_guest_visit_total();

-- 11. Create function to update country club statistics
CREATE OR REPLACE FUNCTION update_country_club_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE country_clubs
        SET
            monthly_guests = (
                SELECT COUNT(*)
                FROM guest_visits
                WHERE home_club_id = OLD.home_club_id
                AND visit_date >= DATE_TRUNC('month', CURRENT_DATE)
            ),
            total_revenue = (
                SELECT COALESCE(SUM(total_amount), 0)
                FROM guest_visits
                WHERE home_club_id = OLD.home_club_id
            )
        WHERE id = OLD.home_club_id;
        RETURN OLD;
    ELSE
        UPDATE country_clubs
        SET
            monthly_guests = (
                SELECT COUNT(*)
                FROM guest_visits
                WHERE home_club_id = NEW.home_club_id
                AND visit_date >= DATE_TRUNC('month', CURRENT_DATE)
            ),
            total_revenue = (
                SELECT COALESCE(SUM(total_amount), 0)
                FROM guest_visits
                WHERE home_club_id = NEW.home_club_id
            )
        WHERE id = NEW.home_club_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to automatically update country club statistics
DROP TRIGGER IF EXISTS trigger_update_country_club_stats ON guest_visits;
CREATE TRIGGER trigger_update_country_club_stats
    AFTER INSERT OR UPDATE OR DELETE ON guest_visits
    FOR EACH ROW EXECUTE FUNCTION update_country_club_stats();

-- 13. Verify the schema (NO SAMPLE DATA INSERTED)
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name IN ('country_clubs', 'guest_visits', 'guest_purchases')
ORDER BY table_name, ordinal_position;

-- 14. Show empty tables (should be 0 records)
SELECT 'country_clubs' as table_name, COUNT(*) as record_count FROM country_clubs
UNION ALL
SELECT 'guest_visits' as table_name, COUNT(*) as record_count FROM guest_visits
UNION ALL
SELECT 'guest_purchases' as table_name, COUNT(*) as record_count FROM guest_purchases;
