import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Allow any authenticated user to check setup
    console.log('User checking setup:', user.email)

    console.log('Checking Guest Manager database tables...')

    // Check if tables exist by trying to select from them
    const { data: clubsCheck, error: clubsError } = await supabaseClient
      .from('country_clubs')
      .select('id')
      .limit(1)

    if (clubsError && clubsError.code === '42P01') {
      // Tables don't exist
      return NextResponse.json({ 
        error: 'Database tables not found',
        message: 'Please run the SQL schema manually in your Supabase dashboard',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and paste the contents of guest_manager_schema.sql',
          '4. Run the SQL script',
          '5. Refresh this page'
        ]
      }, { status: 404 })
    }

    // Check other tables
    const { data: visitsCheckData, error: visitsCheckError } = await supabaseClient
      .from('guest_visits')
      .select('id')
      .limit(1)

    if (visitsCheckError && visitsCheckError.code === '42P01') {
      return NextResponse.json({ 
        error: 'Database tables not found',
        message: 'Please run the SQL schema manually in your Supabase dashboard',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and paste the contents of guest_manager_schema.sql',
          '4. Run the SQL script',
          '5. Refresh this page'
        ]
      }, { status: 404 })
    }

    const { data: purchasesCheckData, error: purchasesCheckError } = await supabaseClient
      .from('guest_purchases')
      .select('id')
      .limit(1)

    if (purchasesCheckError && purchasesCheckError.code === '42P01') {
      return NextResponse.json({ 
        error: 'Database tables not found',
        message: 'Please run the SQL schema manually in your Supabase dashboard',
        instructions: [
          '1. Go to your Supabase dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and paste the contents of guest_manager_schema.sql',
          '4. Run the SQL script',
          '5. Refresh this page'
        ]
      }, { status: 404 })
    }

    console.log('✅ Guest Manager database setup completed!')
    return NextResponse.json({ 
      success: true, 
      message: 'Guest Manager database tables are already set up.' 
    })

  } catch (error) {
    console.error('Error in setup:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
