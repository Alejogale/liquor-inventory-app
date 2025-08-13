import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { action: string } }
) {
  try {
    const supabaseClient = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = params
    const { invitationId } = await request.json()

    if (!invitationId) {
      return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 })
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

    // Check if user has permission to manage invitations
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get the invitation
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('user_invitations')
      .select('*')
      .eq('id', invitationId)
      .eq('organization_id', userProfile.organization_id)
      .single()

    if (inviteError || !invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    let updateData: any = { updated_at: new Date().toISOString() }

    switch (action) {
      case 'resend':
        if (invitation.status !== 'pending') {
          return NextResponse.json({ error: 'Can only resend pending invitations' }, { status: 400 })
        }
        
        // Extend expiration date
        const newExpiresAt = new Date()
        newExpiresAt.setDate(newExpiresAt.getDate() + 7)
        updateData.expires_at = newExpiresAt.toISOString()

        // Get organization details for email
        const { data: organization } = await supabaseClient
          .from('organizations')
          .select('Name')
          .eq('id', userProfile.organization_id)
          .single()

        // Resend invitation email
        const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${invitation.invitation_token}`
        
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: invitation.email,
              subject: `Reminder: Invitation to join ${organization?.Name || 'Hospitality Hub'}`,
              template: 'team-invitation',
              data: {
                organizationName: organization?.Name || 'Hospitality Hub',
                inviterName: user.email,
                role: invitation.role,
                inviteUrl,
                customMessage: invitation.custom_message,
                expiresAt: newExpiresAt.toLocaleDateString(),
                isReminder: true
              }
            })
          })
        } catch (emailError) {
          console.error('Error resending invitation email:', emailError)
        }
        break

      case 'cancel':
        if (invitation.status !== 'pending') {
          return NextResponse.json({ error: 'Can only cancel pending invitations' }, { status: 400 })
        }
        updateData.status = 'cancelled'
        break

      case 'delete':
        // Delete the invitation entirely
        const { error: deleteError } = await supabaseClient
          .from('user_invitations')
          .delete()
          .eq('id', invitationId)
          .eq('organization_id', userProfile.organization_id)

        if (deleteError) {
          console.error('Error deleting invitation:', deleteError)
          return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update the invitation
    const { data: updatedInvitation, error: updateError } = await supabaseClient
      .from('user_invitations')
      .update(updateData)
      .eq('id', invitationId)
      .eq('organization_id', userProfile.organization_id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      invitation: updatedInvitation
    })

  } catch (error) {
    console.error('Error in invitation action API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}