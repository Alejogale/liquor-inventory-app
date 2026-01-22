import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkUserLimit } from '@/lib/subscription-limits'
import { createHash } from 'crypto'

// Hash PIN with SHA-256 + salt for secure storage
const PIN_SALT = process.env.PIN_HASH_SALT || 'invyeasy-pin-salt-2024'

function hashPin(pin: string): string {
  return createHash('sha256').update(pin + PIN_SALT).digest('hex')
}

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

    if (!createdBy) {
      return NextResponse.json(
        { error: 'Creator ID is required for permission check' },
        { status: 400 }
      )
    }

    // Permission check: verify the creator has permission
    const { data: creatorProfile, error: creatorError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', createdBy)
      .single()

    if (creatorError || !creatorProfile) {
      return NextResponse.json(
        { error: 'Could not verify creator permissions' },
        { status: 403 }
      )
    }

    if (creatorProfile.role !== 'owner' && creatorProfile.role !== 'manager') {
      return NextResponse.json(
        { error: 'Only owners and managers can add staff members' },
        { status: 403 }
      )
    }

    if (creatorProfile.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'Cannot add staff to a different organization' },
        { status: 403 }
      )
    }

    // Validate PIN
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      )
    }

    // Check user limit before creating
    const limitCheck = await checkUserLimit(organizationId, supabaseAdmin)
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.error || 'User limit reached',
          upgradeRequired: limitCheck.upgradeRequired,
          current: limitCheck.current,
          limit: limitCheck.limit
        },
        { status: 403 }
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
        pin_code: hashPin(pin),
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
