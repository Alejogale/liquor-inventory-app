import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client for webhooks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// RevenueCat webhook secret for verification
const REVENUECAT_WEBHOOK_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET

// Map RevenueCat product IDs to plan names
// Note: Premium and Enterprise are web-only (exceed Apple's $999 limit)
const PRODUCT_TO_PLAN_MAP: Record<string, string> = {
  'com.invyeasy.personal.monthly': 'personal',
  'com.invyeasy.personal.yearly': 'personal',
  'com.invyeasy.starter.monthly': 'starter',
  'com.invyeasy.starter.yearly': 'starter',
  'com.invyeasy.professional.monthly': 'professional',
  'com.invyeasy.professional.yearly': 'professional',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('📱 RevenueCat webhook received:', {
      type: body.event?.type,
      userId: body.event?.app_user_id,
      productId: body.event?.product_id,
    })

    // Verify webhook signature if secret is configured
    if (REVENUECAT_WEBHOOK_SECRET) {
      const signature = request.headers.get('X-RevenueCat-Signature')
      // TODO: Implement signature verification
      // For now, we'll log it
      console.log('Webhook signature:', signature)
    }

    const event = body.event
    if (!event) {
      return NextResponse.json({ error: 'No event data' }, { status: 400 })
    }

    // Get user ID from RevenueCat (should match Supabase user ID)
    const userId = event.app_user_id
    if (!userId) {
      console.error('❌ No app_user_id in webhook')
      return NextResponse.json({ error: 'No user ID' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'INITIAL_PURCHASE':
      case 'RENEWAL':
      case 'PRODUCT_CHANGE':
        await handleSubscriptionActivated(event, userId)
        break

      case 'CANCELLATION':
      case 'EXPIRATION':
        await handleSubscriptionDeactivated(event, userId)
        break

      case 'BILLING_ISSUE':
        await handleBillingIssue(event, userId)
        break

      case 'NON_RENEWING_PURCHASE':
        // Handle one-time purchases if needed
        console.log('Non-renewing purchase:', event)
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ RevenueCat webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionActivated(event: any, userId: string) {
  try {
    const productId = event.product_id
    const planName = PRODUCT_TO_PLAN_MAP[productId]

    if (!planName) {
      console.error('❌ Unknown product ID:', productId)
      return
    }

    console.log('✅ Activating subscription:', { userId, planName, productId })

    // Find organization by user ID
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .single()

    if (membershipError || !membership) {
      console.error('❌ No organization found for user:', userId)
      return
    }

    // Update organization subscription
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        subscription_plan: planName,
        subscription_status: 'active',
        subscription_period_start: new Date(event.purchased_at_ms).toISOString(),
        subscription_period_end: event.expiration_at_ms
          ? new Date(event.expiration_at_ms).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membership.organization_id)

    if (updateError) {
      console.error('❌ Error updating organization:', updateError)
      return
    }

    console.log('✅ Organization subscription updated:', {
      organizationId: membership.organization_id,
      subscription_plan: planName,
      subscription_status: 'active',
    })
  } catch (error) {
    console.error('❌ Error in handleSubscriptionActivated:', error)
  }
}

async function handleSubscriptionDeactivated(event: any, userId: string) {
  try {
    console.log('❌ Deactivating subscription:', { userId, event: event.type })

    // Find organization by user ID
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .single()

    if (membershipError || !membership) {
      console.error('❌ No organization found for user:', userId)
      return
    }

    // Update organization to free plan
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        subscription_plan: 'free',
        subscription_status: event.type === 'CANCELLATION' ? 'cancelled' : 'expired',
        subscription_period_start: null,
        subscription_period_end: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', membership.organization_id)

    if (updateError) {
      console.error('❌ Error updating organization:', updateError)
      return
    }

    console.log('✅ Organization subscription deactivated:', {
      organizationId: membership.organization_id,
      subscription_plan: 'free',
      subscription_status: event.type === 'CANCELLATION' ? 'cancelled' : 'expired',
    })
  } catch (error) {
    console.error('❌ Error in handleSubscriptionDeactivated:', error)
  }
}

async function handleBillingIssue(event: any, userId: string) {
  try {
    console.log('⚠️ Billing issue detected:', { userId })

    // Find organization by user ID
    const { data: membership, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id, role')
      .eq('user_id', userId)
      .eq('role', 'owner')
      .single()

    if (membershipError || !membership) {
      console.error('❌ No organization found for user:', userId)
      return
    }

    // Update organization status to indicate billing issue
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('id', membership.organization_id)

    if (updateError) {
      console.error('❌ Error updating organization:', updateError)
      return
    }

    console.log('⚠️ Organization marked as past_due:', {
      organizationId: membership.organization_id,
    })

    // TODO: Send email notification to user about billing issue
  } catch (error) {
    console.error('❌ Error in handleBillingIssue:', error)
  }
}
