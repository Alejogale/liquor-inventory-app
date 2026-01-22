import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

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

// Stripe price IDs mapping - Production
const STRIPE_PRICE_IDS = {
  pro: {
    monthly: 'price_1SCYw0Gp6QH8POrPhYVYuxy3', // $10/month
    annual: 'price_1SCYwZGp6QH8POrPL5QTUwv9'   // $100/year
  }
}

export async function POST(request: NextRequest) {
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
      billingCycle
    } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !company || !businessType || !primaryApp || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users?.some(user => user.email === email)
    if (userExists) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create organization first
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        Name: company,
        slug: company.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        subscription_status: 'trial',
        subscription_plan: plan,
        address: '',
        phone: phone || '',
        industry: businessType,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days trial
        created_by: null // Will be updated after user creation
      })
      .select()
      .single()

    if (orgError) {
      console.error('Organization creation error:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      )
    }

    console.log('Organization created:', {
      id: organization.id,
      idType: typeof organization.id,
      name: organization.Name
    })

    // Create user account with email confirmation
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: password, // Use the password provided by user
      email_confirm: true,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        company: company,
        business_type: businessType,
        employees: employees,
        primary_app: primaryApp,
        plan: plan,
        billing_cycle: billingCycle,
        signup_completed: true
      }
    })

    if (userError) {
      console.error('User creation error:', userError)
      // Clean up organization if user creation fails
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userData.user.id,
        full_name: `${firstName} ${lastName}`,
        email: email,
        role: 'owner', // First user is owner
        job_title: 'Owner',
        organization_id: organization.id
      })
      .select()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      console.error('Profile creation details:', {
        userId: userData.user.id,
        organizationId: organization.id,
        fullName: `${firstName} ${lastName}`,
        email: email
      })
      // Clean up if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Failed to create user profile', details: profileError.message },
        { status: 500 }
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

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: email,
      name: `${firstName} ${lastName}`,
      metadata: {
        organization_id: organization.id,
        user_id: userData.user.id,
        company: company,
        plan: plan,
        billing_cycle: billingCycle
      },
    })

    // Save Stripe customer ID to organization
    await supabaseAdmin
      .from('organizations')
      .update({ stripe_customer_id: customer.id })
      .eq('id', organization.id)

    // Get the appropriate Stripe price ID (default to pro plan)
    const priceId = STRIPE_PRICE_IDS.pro[billingCycle as keyof typeof STRIPE_PRICE_IDS.pro]
    
    if (!priceId) {
      console.error('Invalid billing cycle:', { billingCycle })
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "annual"' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session with 30-day free trial
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/apps?success=subscription_created&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?canceled=true`,
      metadata: {
        organization_id: organization.id,
        user_id: userData.user.id,
        plan: plan,
        billing_cycle: billingCycle,
        primary_app: primaryApp
      },
      subscription_data: {
        trial_period_days: 30, // 30-day free trial
        metadata: {
          organization_id: organization.id,
          user_id: userData.user.id,
          plan: plan,
          billing_cycle: billingCycle
        }
      }
    })

    // User account created with password - no password reset needed
    console.log('✅ Account created successfully for:', email)

    // Log the signup for analytics
    await supabaseAdmin
      .from('activity_logs')
      .insert({
        user_id: userData.user.id,
        organization_id: organization.id,
        action: 'user_signup_with_stripe',
        details: {
          plan: plan,
          billing_cycle: billingCycle,
          primary_app: primaryApp,
          business_type: businessType,
          employees: employees,
          stripe_session_id: session.id
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      stripe_url: session.url,
      user: {
        id: userData.user.id,
        email: userData.user.email
      },
      organization: {
        id: organization.id,
        name: organization.Name
      }
    })

  } catch (error) {
    console.error('Signup with Stripe API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
