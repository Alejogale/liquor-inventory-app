import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { CountryClub, ClubFormData } from '@/types/guest-manager'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build query
    let query = supabaseClient
      .from('country_clubs')
      .select('*')
      .eq('organization_id', userProfile.organization_id)
      .order('name', { ascending: true })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,contact_person.ilike.%${search}%`)
    }

    const { data: clubs, error } = await query

    if (error) {
      console.error('Error fetching clubs:', error)
      return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
    }

    return NextResponse.json(clubs)
  } catch (error) {
    console.error('Error in GET /api/guest-manager/clubs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfile } = await supabaseClient
      .from('user_profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Parse request body
    const body: ClubFormData = await request.json()

    // Validate required fields
    if (!body.name || !body.location) {
      return NextResponse.json({ error: 'Name and location are required' }, { status: 400 })
    }

    // Insert new club
    const { data: club, error } = await supabaseClient
      .from('country_clubs')
      .insert({
        name: body.name,
        location: body.location,
        contact_person: body.contact_person,
        contact_email: body.contact_email,
        phone_number: body.phone_number,
        notes: body.notes,
        status: body.status || 'active',
        organization_id: userProfile.organization_id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating club:', error)
      return NextResponse.json({ error: 'Failed to create club' }, { status: 500 })
    }

    return NextResponse.json(club, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/guest-manager/clubs:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
