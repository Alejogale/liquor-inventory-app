import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-04-30.basil'
    })
  }
  return stripe
}

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

export async function POST(request: Request) {
  try {
    const { userId, organizationId } = await request.json()

    if (!userId || !organizationId) {
      return NextResponse.json(
        { error: 'User ID and Organization ID are required' },
        { status: 400 }
      )
    }

    console.log(`🔗 Creating billing portal session for org: ${organizationId}`)

    // Verify user has permission (owner or manager only)
    const { data: userProfile, error: profileError } = await getSupabaseAdmin()
      .from('user_profiles')
      .select('role, organization_id')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (userProfile.organization_id !== organizationId) {
      return NextResponse.json(
        { error: 'User does not belong to this organization' },
        { status: 403 }
      )
    }

    if (userProfile.role !== 'owner' && userProfile.role !== 'manager') {
      return NextResponse.json(
        { error: 'Only owners and managers can access billing' },
        { status: 403 }
      )
    }

    // Get organization's Stripe customer ID
    const { data: org, error: orgError } = await getSupabaseAdmin()
      .from('organizations')
      .select('stripe_customer_id')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (!org.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Create Stripe Billing Portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'

    const session = await getStripe().billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: `${baseUrl}/dashboard?tab=subscription`
    })

    console.log('✅ Billing portal session created')

    return NextResponse.json({
      success: true,
      url: session.url
    })

  } catch (error: any) {
    console.error('❌ Error creating billing portal session:', error)
    return NextResponse.json(
      { error: 'Failed to create billing portal session', details: error.message },
      { status: 500 }
    )
  }
}
