import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to create users without logging in as them
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
    const { name, pin, organizationId, createdBy } = await request.json()

    if (!name || !pin || !organizationId) {
      return NextResponse.json(
        { error: 'Name, PIN, and organization ID are required' },
        { status: 400 }
      )
    }

    // Validate PIN
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      )
    }

    // Generate unique identifiers
    const randomId = crypto.randomUUID().slice(0, 8)
    const placeholderEmail = `mobile-${name.toLowerCase().replace(/\s+/g, '-')}-${randomId}@staff.local`
    const randomPassword = crypto.randomUUID() + crypto.randomUUID()

    // Create auth user using admin client (won't log in as this user)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: placeholderEmail,
      password: randomPassword,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name,
        is_mobile_only: true
      }
    })

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: 'Failed to create staff member', details: authError?.message },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        organization_id: organizationId,
        email: placeholderEmail,
        full_name: name,
        pin_code: pin,
        role: 'staff',
        app_access: ['inventory'],
        status: 'active'
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
      )
    }

    // Log the activity
    if (createdBy) {
      await supabaseAdmin
        .from('user_activity_logs')
        .insert({
          user_id: createdBy,
          organization_id: organizationId,
          app_id: 'liquor-inventory',
          action_type: 'staff_added',
          action_details: {
            staff_name: name,
            staff_id: authData.user.id,
            has_pin: true
          }
        })
    }

    return NextResponse.json({
      success: true,
      message: `${name} has been added successfully`,
      user: {
        id: authData.user.id,
        name: name,
        email: placeholderEmail
      }
    })

  } catch (error: any) {
    console.error('Error in add-staff API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
