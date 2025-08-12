import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      company,
      phone,
      businessType,
      employees,
      primaryApp,
      plan,
      billingCycle
    } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !company || !businessType || !primaryApp || !plan || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    const { data: usersPage } = await supabaseAdmin.auth.admin.listUsers({ perPage: 100, page: 1 })
    const exists = usersPage?.users?.some(u => u.email?.toLowerCase() === email.toLowerCase())
    if (exists) {
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

    // Create user account
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: Math.random().toString(36).slice(-12), // Generate temporary password
      email_confirm: true,
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

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Clean up if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
      await supabaseAdmin.from('organizations').delete().eq('id', organization.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
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

    // Send welcome email (you can integrate with your email service here)
    console.log('📧 Welcome email would be sent to:', email)
    console.log('Account details:', {
      name: `${firstName} ${lastName}`,
      company: company,
      plan: plan,
      billingCycle: billingCycle,
      primaryApp: primaryApp
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
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
    console.error('Signup API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
