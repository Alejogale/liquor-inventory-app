import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ExportOptions } from '@/types/guest-manager'

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

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')
    const clubId = searchParams.get('club_id')
    const status = searchParams.get('status')

    // Build query
    let query = supabaseClient
      .from('guest_visits')
      .select(`
        *,
        home_club:country_clubs(name, location, contact_person, contact_email),
        purchases:guest_purchases(*)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('visit_date', { ascending: false })

    // Apply filters
    if (dateFrom) {
      query = query.gte('visit_date', dateFrom)
    }

    if (dateTo) {
      query = query.lte('visit_date', dateTo)
    }

    if (clubId) {
      query = query.eq('home_club_id', clubId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: guests, error } = await query

    if (error) {
      console.error('Error fetching guests for export:', error)
      return NextResponse.json({ error: 'Failed to fetch data for export' }, { status: 500 })
    }

    if (format === 'csv') {
      return generateCSV(guests)
    } else {
      return NextResponse.json(guests)
    }
  } catch (error) {
    console.error('Error in GET /api/guest-manager/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateCSV(guests: any[]) {
  // Define CSV headers
  const headers = [
    'Guest Name',
    'Member Number',
    'Home Club',
    'Club Location',
    'Club Contact',
    'Club Email',
    'Visit Date',
    'Total Amount',
    'Status',
    'Purchase Items',
    'Created At'
  ]

  // Convert data to CSV rows
  const csvRows = guests.map(guest => {
    const purchases = guest.purchases?.map((p: any) => 
      `${p.item_description} (${p.quantity}x $${p.unit_price})`
    ).join('; ') || ''

    return [
      guest.guest_name,
      guest.member_number,
      guest.home_club?.name || '',
      guest.home_club?.location || '',
      guest.home_club?.contact_person || '',
      guest.home_club?.contact_email || '',
      guest.visit_date,
      guest.total_amount,
      guest.status,
      purchases,
      guest.created_at
    ].map(field => `"${field}"`).join(',')
  })

  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n')

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `guest-manager-export-${timestamp}.csv`

  // Return CSV response
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
