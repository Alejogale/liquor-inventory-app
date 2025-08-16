import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        authError: authError?.message 
      }, { status: 401 })
    }

    // Test 2: Check user profile
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.organization_id) {
      return NextResponse.json({ 
        error: 'User profile not found',
        profileError: profileError?.message,
        userProfile 
      }, { status: 404 })
    }

    // Test 3: Check if tables exist
    const { data: tableTest, error: tableError } = await supabaseClient
      .from('guest_visits')
      .select('id')
      .limit(1)

    if (tableError) {
      return NextResponse.json({ 
        error: 'Table access failed',
        tableError: tableError.message,
        tableErrorCode: tableError.code
      }, { status: 500 })
    }

    // Test 4: Check RLS policies
    const { data: rlsTest, error: rlsError } = await supabaseClient
      .from('guest_visits')
      .select('id')
      .eq('organization_id', userProfile.organization_id)
      .limit(1)

    if (rlsError) {
      return NextResponse.json({ 
        error: 'RLS policy failed',
        rlsError: rlsError.message,
        rlsErrorCode: rlsError.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      organization: {
        id: userProfile.organization_id
      },
      tables: {
        guest_visits: 'accessible',
        rls: 'working'
      }
    })

  } catch (error) {
    console.error('Error in test route:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
