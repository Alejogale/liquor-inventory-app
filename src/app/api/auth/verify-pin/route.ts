import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// CORS headers for mobile app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Hash PIN with SHA-256 + salt (must match add-staff)
const PIN_SALT = process.env.PIN_HASH_SALT || 'invyeasy-pin-salt-2024'

function hashPin(pin: string): string {
  return createHash('sha256').update(pin + PIN_SALT).digest('hex')
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: Request) {
  try {
    const { pin, organizationId } = await request.json()

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate PIN format
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { valid: false, error: 'Invalid PIN format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Hash the input PIN
    const hashedPin = hashPin(pin)

    // Build query
    let query = supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name, role, organization_id')
      .eq('pin_code', hashedPin)

    // Optionally filter by organization
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error verifying PIN:', error)
      return NextResponse.json(
        { valid: false, error: 'Verification error' },
        { status: 500, headers: corsHeaders }
      )
    }

    if (users && users.length > 0) {
      const user = users[0]
      return NextResponse.json({
        valid: true,
        user: {
          id: user.id,
          name: user.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: user.role,
          organizationId: user.organization_id
        }
      }, { headers: corsHeaders })
    }

    return NextResponse.json(
      { valid: false, error: 'Invalid PIN' },
      { status: 401, headers: corsHeaders }
    )

  } catch (error: any) {
    console.error('Error in verify-pin API:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
