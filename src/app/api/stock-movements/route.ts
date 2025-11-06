import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS
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
    const { movements, userId } = await request.json()

    if (!movements || !Array.isArray(movements) || movements.length === 0) {
      return NextResponse.json(
        { error: 'Movements array is required' },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists and get their organization
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id, full_name')
      .eq('id', userId)
      .single()

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      )
    }

    // Validate all movements have the correct organization_id
    const invalidMovements = movements.filter(
      m => m.organization_id !== userProfile.organization_id
    )

    if (invalidMovements.length > 0) {
      return NextResponse.json(
        { error: 'Organization mismatch in movements' },
        { status: 403 }
      )
    }

    // Insert all movements at once using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('stock_movements')
      .insert(movements)
      .select()

    if (error) {
      console.error('Error inserting stock movements:', error)
      return NextResponse.json(
        { error: 'Failed to save stock movements', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${movements.length} stock movement(s) saved successfully`,
      data: data
    })

  } catch (error: any) {
    console.error('Error in stock-movements API:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
