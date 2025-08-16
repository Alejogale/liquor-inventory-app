const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function applySchema() {
  try {
    console.log('Applying Guest Manager database schema...')

    // 1. Create country_clubs table
    console.log('Creating country_clubs table...')
    const { error: clubsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (clubsError) {
      console.error('Error creating country_clubs table:', clubsError)
    } else {
      console.log('✅ country_clubs table created')
    }

    // 2. Create guest_visits table
    console.log('Creating guest_visits table...')
    const { error: visitsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (visitsError) {
      console.error('Error creating guest_visits table:', visitsError)
    } else {
      console.log('✅ guest_visits table created')
    }

    // 3. Create guest_purchases table
    console.log('Creating guest_purchases table...')
    const { error: purchasesError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (purchasesError) {
      console.error('Error creating guest_purchases table:', purchasesError)
    } else {
      console.log('✅ guest_purchases table created')
    }

    // 4. Enable RLS
    console.log('Enabling Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE country_clubs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE guest_visits ENABLE ROW LEVEL SECURITY;
        ALTER TABLE guest_purchases ENABLE ROW LEVEL SECURITY;
      `
    })

    if (rlsError) {
      console.error('Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled')
    }

    // 5. Create indexes
    console.log('Creating indexes...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_country_clubs_organization_id ON country_clubs(organization_id);
        CREATE INDEX IF NOT EXISTS idx_guest_visits_organization_id ON guest_visits(organization_id);
        CREATE INDEX IF NOT EXISTS idx_guest_visits_home_club_id ON guest_visits(home_club_id);
        CREATE INDEX IF NOT EXISTS idx_guest_visits_visit_date ON guest_visits(visit_date);
        CREATE INDEX IF NOT EXISTS idx_guest_purchases_guest_visit_id ON guest_purchases(guest_visit_id);
        CREATE INDEX IF NOT EXISTS idx_guest_purchases_organization_id ON guest_purchases(organization_id);
      `
    })

    if (indexError) {
      console.error('Error creating indexes:', indexError)
    } else {
      console.log('✅ Indexes created')
    }

    console.log('🎉 Guest Manager schema applied successfully!')
    
  } catch (error) {
    console.error('Error applying schema:', error)
  }
}

applySchema()
