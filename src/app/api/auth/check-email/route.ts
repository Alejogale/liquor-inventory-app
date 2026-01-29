import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists in user_profiles
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    return NextResponse.json({
      exists: !!profile,
    })
  } catch (error: any) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check email' },
      { status: 500 }
    )
  }
}
