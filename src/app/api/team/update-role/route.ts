import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase Admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { userId, newRole, updatedBy } = await request.json()

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: 'User ID and new role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['owner', 'manager', 'staff', 'viewer']
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be owner, manager, staff, or viewer' },
        { status: 400 }
      )
    }

    console.log(`📝 Updating user ${userId} role to: ${newRole}`)

    // Check if the updater has permission (must be owner or manager)
    const { data: updaterProfile, error: updaterError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', updatedBy)
      .single()

    if (updaterError || !updaterProfile) {
      return NextResponse.json(
        { error: 'Could not verify updater permissions' },
        { status: 403 }
      )
    }

    if (updaterProfile.role !== 'owner' && updaterProfile.role !== 'manager') {
      return NextResponse.json(
        { error: 'Only owners and managers can update user roles' },
        { status: 403 }
      )
    }

    // Check if target user is in the same organization
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id, email, full_name')
      .eq('id', userId)
      .single()

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (targetProfile.organization_id !== updaterProfile.organization_id) {
      return NextResponse.json(
        { error: 'Cannot update users from different organizations' },
        { status: 403 }
      )
    }

    // Update the user's role
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating role:', updateError)
      return NextResponse.json(
        { error: 'Failed to update role', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ User role updated successfully`)

    // Log the activity
    await supabaseAdmin
      .from('user_activity_logs')
      .insert({
        user_id: updatedBy,
        organization_id: updaterProfile.organization_id,
        app_id: 'liquor-inventory',
        action_type: 'role_updated',
        action_details: {
          target_user: userId,
          target_email: targetProfile.email,
          target_name: targetProfile.full_name,
          new_role: newRole
        }
      })

    return NextResponse.json({
      success: true,
      message: `User role updated to ${newRole}`
    })

  } catch (error: any) {
    console.error('Error in update-role API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
