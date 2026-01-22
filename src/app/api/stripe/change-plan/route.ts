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

// Price IDs for each plan (should match your Stripe dashboard)
const PLAN_PRICE_IDS: Record<string, string> = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
  professional: process.env.STRIPE_PROFESSIONAL_PRICE_ID || 'price_professional',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
}

export async function POST(request: Request) {
  try {
    const { userId, organizationId, newPlan } = await request.json()

    if (!userId || !organizationId || !newPlan) {
      return NextResponse.json(
        { error: 'User ID, Organization ID, and new plan are required' },
        { status: 400 }
      )
    }

    const newPriceId = PLAN_PRICE_IDS[newPlan]
    if (!newPriceId) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      )
    }

    console.log(`🔄 Changing plan to ${newPlan} for org: ${organizationId}`)

    // Verify user has permission (owner only)
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

    if (userProfile.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only organization owners can change plans' },
        { status: 403 }
      )
    }

    // Get organization's subscription ID and current plan
    const { data: org, error: orgError } = await getSupabaseAdmin()
      .from('organizations')
      .select('stripe_subscription_id, subscription_status, plan')
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

    if (org.plan === newPlan) {
      return NextResponse.json(
        { error: 'You are already on this plan' },
        { status: 400 }
      )
    }

    // Get current subscription
    const subscription = await getStripe().subscriptions.retrieve(org.stripe_subscription_id)

    if (subscription.status === 'canceled') {
      return NextResponse.json(
        { error: 'Cannot change plan on a cancelled subscription. Please create a new subscription.' },
        { status: 400 }
      )
    }

    // Update the subscription with the new price
    const updatedSubscription = await getStripe().subscriptions.update(org.stripe_subscription_id, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations', // Prorate for upgrades/downgrades
    })

    console.log('✅ Plan changed successfully')

    // Update local database
    await getSupabaseAdmin()
      .from('organizations')
      .update({
        plan: newPlan,
        updated_at: new Date().toISOString()
      })
      .eq('id', organizationId)

    return NextResponse.json({
      success: true,
      message: `Plan changed to ${newPlan}`,
      newPlan: newPlan,
      nextBillingDate: new Date(updatedSubscription.current_period_end * 1000).toISOString()
    })

  } catch (error: any) {
    console.error('❌ Error changing plan:', error)
    return NextResponse.json(
      { error: 'Failed to change plan', details: error.message },
      { status: 500 }
    )
  }
}
