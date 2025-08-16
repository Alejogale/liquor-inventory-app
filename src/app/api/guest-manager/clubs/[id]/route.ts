import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { ClubFormData } from '@/types/guest-manager'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Update club
    const { data: club, error } = await supabaseClient
      .from('country_clubs')
      .update({
        name: body.name,
        location: body.location,
        contact_person: body.contact_person,
        contact_email: body.contact_email,
        phone_number: body.phone_number,
        notes: body.notes,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('organization_id', userProfile.organization_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating club:', error)
      return NextResponse.json({ error: 'Failed to update club' }, { status: 500 })
    }

    if (!club) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 })
    }

    return NextResponse.json(club)
  } catch (error) {
    console.error('Error in PUT /api/guest-manager/clubs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

    // Check if club has associated guest visits
    const { data: guestVisits } = await supabaseClient
      .from('guest_visits')
      .select('id')
      .eq('home_club_id', id)
      .limit(1)

    if (guestVisits && guestVisits.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete club with associated guest visits. Please update or delete the guest visits first.' 
      }, { status: 400 })
    }

    // Delete club
    const { error } = await supabaseClient
      .from('country_clubs')
      .delete()
      .eq('id', id)
      .eq('organization_id', userProfile.organization_id)

    if (error) {
      console.error('Error deleting club:', error)
      return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Club deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/guest-manager/clubs/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
