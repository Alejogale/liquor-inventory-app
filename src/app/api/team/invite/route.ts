import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, role, appAccess, customMessage } = await request.json()

    // Validate required fields
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 })
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

    // Check if user has permission to invite others
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if user with this email is already in the organization
    const { data: existingUser } = await supabaseClient
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'User is already a member of this organization' }, { status: 400 })
    }

    // Check for existing pending invitation
    const { data: existingInvitation } = await supabaseClient
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .eq('organization_id', userProfile.organization_id)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 400 })
    }

    // Create invitation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .insert({
        organization_id: userProfile.organization_id,
        email,
        role,
        app_access: appAccess || [],
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        custom_message: customMessage,
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      console.error('Error creating invitation:', inviteError)
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 })
    }

    // Get organization details for email
    const { data: organization } = await supabaseClient
      .from('organizations')
      .select('Name')
      .eq('id', userProfile.organization_id)
      .single()

    // Send invitation email
    const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invitation.invitation_token}`
    
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Invitation to join ${organization?.Name || 'Hospitality Hub'}`,
          template: 'team-invitation',
          data: {
            organizationName: organization?.Name || 'Hospitality Hub',
            inviterName: user.email,
            role,
            inviteUrl,
            customMessage,
            expiresAt: expiresAt.toLocaleDateString()
          }
        })
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // Don't fail the invitation creation if email fails
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        expires_at: invitation.expires_at,
        invite_url: inviteUrl
      }
    })

  } catch (error) {
    console.error('Error in team invite API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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

    // Get all invitations for the organization
    const { data: invitations, error } = await supabaseClient
      .from('user_invitations')
      .select(`
        id,
        email,
        role,
        app_access,
        status,
        expires_at,
        created_at,
        custom_message,
        invited_by,
        user_profiles!invited_by(full_name, email)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
    }

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('Error in team invite GET API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}