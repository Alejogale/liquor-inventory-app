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
    const { userId, userName } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🗑️ Deleting user: ${userName} (${userId})`)

    // Step 1: Anonymize user activity in stock_movements (keep audit trail but remove user reference)
    console.log('📝 Anonymizing stock movements...')
    const { error: stockError } = await supabaseAdmin
      .from('stock_movements')
      .update({
        user_name: `[Deleted User]`,
        notes: `Originally by: ${userName}`
      })
      .eq('user_id', userId)

    if (stockError) {
      console.warn('Warning: Could not anonymize stock movements:', stockError)
      // Continue anyway - not critical
    }

    // Step 2: Delete related records that don't need to be preserved
    console.log('🗑️ Deleting user invitations...')
    await supabaseAdmin
      .from('user_invitations')
      .delete()
      .eq('invited_by', userId)

    console.log('🗑️ Deleting user activity logs...')
    await supabaseAdmin
      .from('user_activity_logs')
      .delete()
      .eq('user_id', userId)

    console.log('🗑️ Deleting activity logs...')
    await supabaseAdmin
      .from('activity_logs')
      .delete()
      .eq('user_id', userId)

    // Step 3: Delete from user_profiles
    console.log('🗑️ Deleting user profile...')
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return NextResponse.json(
        { error: 'Failed to delete user profile', details: profileError.message },
        { status: 500 }
      )
    }

    console.log('✅ User profile deleted')

    // Step 4: Delete from auth.users
    console.log('🗑️ Deleting auth user...')
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return NextResponse.json(
        {
          error: 'User profile deleted but failed to delete auth user',
          details: authError.message,
          partialSuccess: true
        },
        { status: 500 }
      )
    }

    console.log('✅ Auth user deleted')

    return NextResponse.json({
      success: true,
      message: `User ${userName} has been completely removed`
    })

  } catch (error: any) {
    console.error('Error in delete-user API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
