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

    console.log(`🚫 Cancelling subscription for org: ${organizationId}`)

    // Verify user has permission (owner only for cancellation)
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

    // Only owners can cancel subscriptions
    if (userProfile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can cancel subscriptions' },
        { status: 403 }
      )
    }

    // Get organization's subscription ID
    const { data: org, error: orgError } = await getSupabaseAdmin()
      .from('organizations')
      .select('stripe_subscription_id, subscription_status')
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (!org.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      )
    }

    if (org.subscription_status === 'cancelled') {
      return NextResponse.json(
        { error: 'Subscription is already cancelled' },
        { status: 400 }
      )
    }

    // Cancel subscription at period end (user keeps access until billing period ends)
    const subscription = await getStripe().subscriptions.update(org.stripe_subscription_id, {
      cancel_at_period_end: true
    })

    console.log('✅ Subscription set to cancel at period end:', subscription.current_period_end)

    // Update local database to reflect pending cancellation
    await getSupabaseAdmin()
      .from('organizations')
      .update({
        subscription_status: 'cancelling',
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)

    return NextResponse.json({
      success: true,
      message: 'Subscription will be cancelled at the end of the billing period',
      cancelAt: new Date(subscription.current_period_end * 1000).toISOString()
    })

  } catch (error: any) {
    console.error('❌ Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    )
  }
}
