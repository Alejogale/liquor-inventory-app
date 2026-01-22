import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let supabaseAdmin: ReturnType<typeof createClient> | null = null
function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }
  return supabaseAdmin
}

let supabaseAuth: ReturnType<typeof createClient> | null = null
function getSupabaseAuth() {
  if (!supabaseAuth) {
    supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseAuth
}

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, email } = await request.json()

    if (!currentPassword || !newPassword || !email) {
      return NextResponse.json(
        { error: 'Current password, new password, and email are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
        { status: 400 }
      )
    }

    console.log(`🔐 Attempting password change for: ${email}`)

    // Step 1: Verify current password by attempting to sign in
    const { data: signInData, error: signInError } = await getSupabaseAuth().auth.signInWithPassword({
      email,
      password: currentPassword
    })

    if (signInError || !signInData.user) {
      console.log('❌ Current password verification failed')
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    console.log('✅ Current password verified')

    // Step 2: Update password using admin client
    const { error: updateError } = await getSupabaseAdmin().auth.admin.updateUserById(
      signInData.user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('❌ Error updating password:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Password changed successfully')

    // Sign out the temporary session we created for verification
    await getSupabaseAuth().auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error: any) {
    console.error('❌ Error in change-password API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
