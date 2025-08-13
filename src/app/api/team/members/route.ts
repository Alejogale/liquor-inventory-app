import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get all team members for the organization
    const { data: members, error } = await supabaseClient
      .from('user_profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        status,
        app_access,
        job_title,
        created_at,
        updated_at,
        invited_by,
        user_profiles!invited_by(full_name, email)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching team members:', error)
      return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
    }

    return NextResponse.json({ members })

  } catch (error) {
    console.error('Error in team members API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { memberId, updates } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Get user's organization and verify permissions
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user has permission to update members
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the member belongs to the same organization
    const { data: targetMember, error: memberError } = await supabaseClient
      .from('user_profiles')
      .select('id, organization_id, role')
      .eq('id', memberId)
      .single()

    if (memberError || !targetMember || targetMember.organization_id !== userProfile.organization_id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent non-owners from modifying owners
    if (targetMember.role === 'owner' && userProfile.role !== 'owner') {
      return NextResponse.json({ error: 'Cannot modify owner role' }, { status: 403 })
    }

    // Prevent setting owner role unless current user is owner
    if (updates.role === 'owner' && userProfile.role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can assign owner role' }, { status: 403 })
    }

    // Update member
    const { data: updatedMember, error: updateError } = await supabaseClient
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating member:', updateError)
      return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      member: updatedMember
    })

  } catch (error) {
    console.error('Error in team members PUT API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Get user's organization and verify permissions
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user has permission to remove members
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify the member belongs to the same organization
    const { data: targetMember, error: memberError } = await supabaseClient
      .from('user_profiles')
      .select('id, organization_id, role')
      .eq('id', memberId)
      .single()

    if (memberError || !targetMember || targetMember.organization_id !== userProfile.organization_id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Prevent removing owners unless current user is owner
    if (targetMember.role === 'owner' && userProfile.role !== 'owner') {
      return NextResponse.json({ error: 'Cannot remove owner' }, { status: 403 })
    }

    // Prevent users from removing themselves
    if (memberId === user.id) {
      return NextResponse.json({ error: 'Cannot remove yourself' }, { status: 400 })
    }

    // Remove member from organization (set organization_id to null and status to suspended)
    const { error: removeError } = await supabaseClient
      .from('user_profiles')
      .update({
        organization_id: null,
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (removeError) {
      console.error('Error removing member:', removeError)
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error in team members DELETE API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}