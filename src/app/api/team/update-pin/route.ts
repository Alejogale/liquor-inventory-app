import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

// Hash PIN with SHA-256 + salt for secure storage
const PIN_SALT = process.env.PIN_HASH_SALT || 'invyeasy-pin-salt-2024'

function hashPin(pin: string): string {
  return createHash('sha256').update(pin + PIN_SALT).digest('hex')
}

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
    const { userId, pin, action, updatedBy } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!updatedBy) {
      return NextResponse.json(
        { error: 'Updater ID is required for permission check' },
        { status: 400 }
      )
    }

    // Permission check: verify the updater has permission
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
        { error: 'Only owners and managers can update PINs' },
        { status: 403 }
      )
    }

    // Check if target user is in the same organization
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id')
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
        { error: 'Cannot update PINs for users from different organizations' },
        { status: 403 }
      )
    }

    // Handle remove PIN action
    if (action === 'remove') {
      console.log(`🗑️ Removing PIN for user: ${userId}`)

      const { error } = await supabaseAdmin
        .from('user_profiles')
        .update({ pin_code: null })
        .eq('id', userId)

      if (error) {
        console.error('Error removing PIN:', error)
        return NextResponse.json(
          { error: 'Failed to remove PIN', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'PIN removed successfully'
      })
    }

    // Handle set/update PIN
    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      )
    }

    // Validate PIN format
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      )
    }

    console.log(`🔐 Updating PIN for user: ${userId}`)

    // Hash the PIN before storing
    const hashedPin = hashPin(pin)

    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ pin_code: hashedPin })
      .eq('id', userId)

    if (error) {
      console.error('Error updating PIN:', error)
      return NextResponse.json(
        { error: 'Failed to update PIN', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ PIN updated successfully')

    return NextResponse.json({
      success: true,
      message: 'PIN updated successfully'
    })

  } catch (error: any) {
    console.error('Error in update-pin API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
