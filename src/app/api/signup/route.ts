import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail, sendEmailVerificationEmail } from '@/lib/email-service'
import { getStripe } from '@/lib/stripe'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Allowed origins for CORS
const allowedOrigins = [
  'https://invyeasy.com',
  'https://www.invyeasy.com',
  'http://localhost:3000',
  'http://localhost:3001',
]

// Get CORS headers based on request origin
function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get('origin') || ''
  const isAllowed = allowedOrigins.includes(origin)

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(request) })
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request)

  try {
    const {
      firstName,
      lastName,
      email,
      password,
      company,
      phone,
      businessType,
      employees,
      primaryApp,
      plan,
      billingCycle,
      stripeSessionId, // Optional - if coming from Stripe checkout flow
    } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !company || !businessType || !primaryApp || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Check if user already exists (targeted query - much faster than listUsers())
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409, headers: corsHeaders }
      )
    }

    // Look up tier details from subscription_tiers table
    const { data: tierData, error: tierError } = await supabaseAdmin
      .from('subscription_tiers')
      .select('*')
      .eq('tier_id', plan)
      .single()

    if (tierError || !tierData) {
      console.error('Tier lookup error:', tierError)
      return NextResponse.json(
        { error: 'Invalid subscription tier selected' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Calculate subscription price based on billing cycle
    const subscriptionPrice = billingCycle === 'annual'
      ? tierData.yearly_price
      : tierData.monthly_price

    // Calculate trial end date (30 days from now)
    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    // Generate unique slug
    let baseSlug = company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
    let slug = baseSlug
    let slugSuffix = 0

    // Check if slug exists and add suffix if needed
    while (true) {
      const { data: existingOrg } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single()

      if (!existingOrg) break // Slug is unique

      slugSuffix++
      slug = `${baseSlug}-${slugSuffix}`

      // Safety limit to prevent infinite loop
      if (slugSuffix > 100) {
        slug = `${baseSlug}-${Date.now()}`
        break
      }
    }

    // Create organization with tier limits
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        Name: company,
        slug: slug,
        subscription_tier: plan,
        storage_area_limit: tierData.storage_area_limit,
        item_limit: tierData.item_limit,
        user_limit: tierData.user_limit,
        billing_cycle: billingCycle,
        subscription_price: subscriptionPrice,
        payment_status: 'trial',
        subscription_status: 'trial',
        features_enabled: tierData.features,
        trial_ends_at: trialEndsAt,
        trial_started_at: new Date().toISOString(),
        address: '',
        phone: phone || '',
        industry: businessType,
        subscription_plan: plan, // Keep for backwards compatibility
        created_by: null // Will be updated after user creation
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Create user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password, // Use the password provided by user
      email_confirm: false, // Require email verification for security
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company: company,
        business_type: businessType,
        employees: employees,
        primary_app: primaryApp,
        plan: plan,
        billing_cycle: billingCycle
      }
    })

    if (userError) {
      console.error('User creation error:', userError)
      // Clean up organization if user creation fails
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Update user profile (trigger already creates it, so we update with org info)
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userData.user.id,
        full_name: `${firstName} ${lastName}`,
        email: email,
        role: 'owner', // First user is owner
        job_title: 'Owner',
        organization_id: organization.id
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Update organization with owner
    await supabaseAdmin
      .from('organizations')
      .update({
        owner_id: userData.user.id,
        created_by: userData.user.id
      })
      .eq('id', organization.id)

    // If coming from Stripe checkout flow, link the subscription
    console.log('📋 Stripe session ID received:', stripeSessionId || 'NONE')
    if (stripeSessionId) {
      try {
        const stripeClient = getStripe()
        console.log('🔗 Linking Stripe session to organization:', stripeSessionId, 'org:', organization.id)
        const session = await stripeClient.checkout.sessions.retrieve(stripeSessionId)
        console.log('📦 Stripe session retrieved, subscription:', session.subscription, 'customer:', session.customer)

        if (session.subscription) {
          const subscription = await stripeClient.subscriptions.retrieve(session.subscription as string)
          console.log('📦 Subscription retrieved:', subscription.id, 'status:', subscription.status)

          // Update organization with Stripe info
          const { error: stripeUpdateError } = await supabaseAdmin
            .from('organizations')
            .update({
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: subscription.id,
              stripe_price_id: subscription.items.data[0]?.price?.id || null,
              subscription_status: subscription.status === 'trialing' ? 'trial' : subscription.status,
              subscription_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
              subscription_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            })
            .eq('id', organization.id)

          if (stripeUpdateError) {
            console.error('❌ Failed to update org with Stripe data:', stripeUpdateError)
          } else {
            console.log('✅ Stripe subscription linked to organization successfully')
          }
        } else {
          console.log('⚠️ No subscription found in Stripe session')
        }
      } catch (stripeError) {
        console.error('⚠️ Error linking Stripe session (non-fatal):', stripeError)
        // Don't fail signup if Stripe linking fails - webhook will handle it
      }
    } else {
      console.log('⚠️ No stripeSessionId provided - skipping Stripe linking')
    }

    // Generate email verification link and send via Resend
    try {
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
        }
      })

      if (linkError) {
        console.error('Error generating verification link:', linkError)
      } else if (linkData?.properties?.action_link) {
        // Send verification email via Resend
        const emailResult = await sendEmailVerificationEmail({
          to: email,
          userName: firstName,
          verificationUrl: linkData.properties.action_link
        })
        console.log('📧 Verification email sent:', emailResult.success ? 'Success' : 'Failed')
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail signup if email fails - user can request resend
    }

    // Log the signup for analytics
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: userData.user.id,
        organization_id: organization.id,
        action: 'user_signup',
        details: {
          plan: plan,
          billing_cycle: billingCycle,
          primary_app: primaryApp,
          business_type: businessType,
          employees: employees
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    // Send welcome email after email verification
    // Note: This will be sent via database trigger after user confirms email
    // But we can also queue it here as a backup
    try {
      console.log('📧 Queuing welcome email for:', email)
      // The welcome email will be sent automatically via database trigger
      // after user confirms their email address
      console.log('Account details:', {
        name: `${firstName} ${lastName}`,
        company: company,
        plan: plan,
        billingCycle: billingCycle,
        primaryApp: primaryApp
      })
    } catch (emailError) {
      // Don't fail signup if email fails - it will be retried via trigger
      console.error('Note: Email will be sent after verification:', emailError)
    }

    // Trigger welcome email processing in background (fire and forget)
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/process-welcome-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY || 'your-secret-key'}`
      }
    }).catch(err => console.log('Email queue processing will retry later:', err))

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: userData.user.id,
        email: userData.user.email
      },
      organization: {
        id: organization.id,
        name: organization.Name
      }
    }, { headers: corsHeaders })

  } catch (error) {
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}
