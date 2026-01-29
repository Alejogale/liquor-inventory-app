import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to get price IDs fresh from env vars on each request
function getPriceIds(): Record<string, { monthly: string; yearly: string }> {
  return {
    starter: {
      monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_STARTER_YEARLY || '',
    },
    basic: {
      monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
    },
    professional: {
      monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY || '',
    },
    business: {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY || '',
      yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY || '',
    },
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      plan,
      billingCycle,
      // We'll pass signup data as metadata so webhook can access it
      firstName,
      lastName,
      company,
      businessType,
    } = body

    // Validate required fields
    if (!email || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: email, plan, billingCycle' },
        { status: 400 }
      )
    }

    // Check if user already exists BEFORE creating Stripe session
    // This prevents orphan Stripe subscriptions
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      )
    }

    // Get the price ID for the selected plan (read fresh from env vars)
    const PRICE_IDS = getPriceIds()
    const planPrices = PRICE_IDS[plan]

    // Debug logging to Vercel function logs
    console.log('Plan requested:', plan, 'Billing cycle:', billingCycle)
    console.log('Available env vars for business:', {
      monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ? 'SET' : 'NOT SET',
      yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ? 'SET' : 'NOT SET',
    })

    if (!planPrices) {
      return NextResponse.json(
        { error: `Invalid plan: ${plan}` },
        { status: 400 }
      )
    }

    const priceId = billingCycle === 'annual' ? planPrices.yearly : planPrices.monthly
    if (!priceId) {
      console.log('Price ID is empty for:', plan, billingCycle)
      return NextResponse.json(
        { error: `Price not configured for plan: ${plan} (${billingCycle})` },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // 30-day free trial
      subscription_data: {
        trial_period_days: 30,
        metadata: {
          plan: plan,
          billing_cycle: billingCycle,
        },
      },
      // Pass signup data in metadata for the webhook
      metadata: {
        signup_flow: 'true',
        plan: plan,
        billing_cycle: billingCycle,
        first_name: firstName || '',
        last_name: lastName || '',
        company: company || '',
        business_type: businessType || '',
        email: email,
      },
      // Success and cancel URLs
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?cancelled=true`,
      // Allow promotion codes
      allow_promotion_codes: true,
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error('Stripe checkout session error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
// Redeploy Thu Jan 29 00:57:06 EST 2026
// Force redeploy Thu Jan 29 01:15:33 EST 2026
// Env vars added to correct project Thu Jan 29 01:39:02 EST 2026
