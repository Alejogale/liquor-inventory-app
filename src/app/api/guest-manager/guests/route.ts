import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { GuestFormData } from '@/types/guest-manager'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => cookieStore })
    
    console.log('🔍 Testing Guest Manager API...')
    
    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.log('❌ Auth failed:', authError?.message)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ Auth successful for user:', user.email)

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
    const clubId = searchParams.get('club_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build query
    let query = supabaseClient
      .from('guest_visits')
      .select(`
        *,
        home_club:country_clubs(name, location, contact_person, contact_email)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('visit_date', { ascending: false })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (clubId) {
      query = query.eq('home_club_id', clubId)
    }

    if (dateFrom) {
      query = query.gte('visit_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('visit_date', dateTo)
    }

    if (search) {
      query = query.or(`guest_name.ilike.%${search}%,member_number.ilike.%${search}%`)
    }

    // Get total count for pagination
    const { count } = await supabaseClient
      .from('guest_visits')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userProfile.organization_id)

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    console.log('🔍 Querying guest_visits table...')
    const { data: guests, error } = await query

    if (error) {
      console.log('❌ Table query error:', error.message, error.code)
      return NextResponse.json({ error: 'Failed to fetch guests', details: error.message }, { status: 500 })
    }
    
    console.log('✅ Successfully fetched guests:', guests?.length || 0)

    return NextResponse.json({
      guests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/guest-manager/guests:', error)
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
    const body: GuestFormData = await request.json()

    // Validate required fields
    if (!body.guest_name || !body.member_number || !body.visit_date) {
      return NextResponse.json({ error: 'Guest name, member number, and visit date are required' }, { status: 400 })
    }

    // Calculate total amount from purchases
    const totalAmount = body.purchases.reduce((sum, purchase) => {
      const total = purchase.quantity * purchase.unit_price
      return sum + total
    }, 0)

    // Insert guest visit
    const { data: guestVisit, error: visitError } = await supabaseClient
      .from('guest_visits')
      .insert({
        guest_name: body.guest_name,
        member_number: body.member_number,
        home_club_id: body.home_club_id || null,
        visit_date: body.visit_date,
        total_amount: totalAmount,
        status: 'active',
        organization_id: userProfile.organization_id
      })
      .select()
      .single()

    if (visitError) {
      console.error('Error creating guest visit:', visitError)
      return NextResponse.json({ error: 'Failed to create guest visit' }, { status: 500 })
    }

    // Insert purchases if any
    if (body.purchases.length > 0) {
      const purchases = body.purchases.map(purchase => ({
        guest_visit_id: guestVisit.id,
        item_description: purchase.item_description,
        quantity: purchase.quantity,
        unit_price: purchase.unit_price,
        total_price: purchase.quantity * purchase.unit_price,
        organization_id: userProfile.organization_id
      }))

      const { error: purchaseError } = await supabaseClient
        .from('guest_purchases')
        .insert(purchases)

      if (purchaseError) {
        console.error('Error creating purchases:', purchaseError)
        // Note: The guest visit was created successfully, so we don't fail the entire request
      }
    }

    // Fetch the complete guest visit with purchases
    const { data: completeGuestVisit } = await supabaseClient
      .from('guest_visits')
      .select(`
        *,
        home_club:country_clubs(name, location),
        purchases:guest_purchases(*)
      `)
      .eq('id', guestVisit.id)
      .single()

    return NextResponse.json(completeGuestVisit, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/guest-manager/guests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
