import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hash PIN with SHA-256 + salt (must match add-staff)
const PIN_SALT = process.env.PIN_HASH_SALT || 'invyeasy-pin-salt-2024'

function hashPin(pin: string): string {
  return createHash('sha256').update(pin + PIN_SALT).digest('hex')
}

export async function POST(request: Request) {
  try {
    const { pin, organizationId } = await request.json()

    if (!pin || !organizationId) {
      return NextResponse.json(
        { error: 'PIN and organization ID are required' },
        { status: 400 }
      )
    }

    console.log(`🔐 Verifying manager PIN for organization: ${organizationId}`)

    // Hash the input PIN and compare with stored hash
    const hashedPin = hashPin(pin)

    // Check if PIN belongs to a manager or owner in the organization
    const { data: manager, error } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, role, pin_code')
      .eq('organization_id', organizationId)
      .eq('pin_code', hashedPin)
      .in('role', ['owner', 'manager'])
      .single()

    if (error || !manager) {
      console.log('❌ Invalid manager PIN')
      return NextResponse.json(
        { valid: false, error: 'Invalid manager PIN' },
        { status: 401 }
      )
    }

    console.log(`✅ Valid manager PIN for: ${manager.full_name} (${manager.role})`)

    return NextResponse.json({
      valid: true,
      manager: {
        id: manager.id,
        name: manager.full_name,
        email: manager.email,
        role: manager.role
      }
    })

  } catch (error: any) {
    console.error('Error verifying manager PIN:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
