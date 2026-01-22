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

export async function PUT(request: Request) {
  try {
    const { userId, fullName, jobTitle } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`📝 Updating profile for user: ${userId}`)

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (fullName !== undefined) {
      updates.full_name = fullName
    }

    if (jobTitle !== undefined) {
      updates.job_title = jobTitle
    }

    // Update user profile
    const { error: updateError } = await getSupabaseAdmin()
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Profile updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })

  } catch (error: any) {
    console.error('❌ Error in profile API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
