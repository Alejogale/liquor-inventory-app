import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabaseClient = createRouteHandlerClient({ cookies: () => Promise.resolve(cookieStore) })
    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: userProfile, error: profileError } = await supabaseClient
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Check if user has permission to view billing
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get organization data with subscription info
    const { data: organization, error: orgError } = await supabaseClient
      .from('organizations')
      .select(`
        id,
        Name,
        subscription_plan,
        subscription_status,
        subscription_period_start,
        subscription_period_end,
        created_at
      `)
      .eq('id', userProfile.organization_id)
      .single()

    if (orgError || !organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get usage statistics
    const currentDate = new Date()
    const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM format

    // Count active users
    const { count: activeUsers } = await supabaseClient
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userProfile.organization_id)
      .eq('status', 'active')

    // Count inventory items (as a usage metric)
    const { count: inventoryItems } = await supabaseClient
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userProfile.organization_id)

    // Get plan limits
    const planLimits = getPlanLimits(organization.subscription_plan)

    // Calculate usage percentages
    const userUsagePercent = planLimits.maxUsers === -1 ? 0 : 
      Math.round(((activeUsers || 0) / planLimits.maxUsers) * 100)
    
    const itemUsagePercent = planLimits.maxItems === -1 ? 0 :
      Math.round(((inventoryItems || 0) / planLimits.maxItems) * 100)

    // Get recent activity count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentActivity } = await supabaseClient
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userProfile.organization_id)
      .gte('created_at', thirtyDaysAgo.toISOString())

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.Name,
        plan: organization.subscription_plan,
        status: organization.subscription_status,
        currentPeriodStart: organization.subscription_period_start,
        currentPeriodEnd: organization.subscription_period_end,
        createdAt: organization.created_at
      },
      usage: {
        activeUsers: {
          current: activeUsers || 0,
          limit: planLimits.maxUsers,
          percentage: userUsagePercent
        },
        inventoryItems: {
          current: inventoryItems || 0,
          limit: planLimits.maxItems,
          percentage: itemUsagePercent
        },
        recentActivity: recentActivity || 0,
        month: currentMonth
      },
      planLimits
    })

  } catch (error) {
    console.error('Error in billing usage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getPlanLimits(plan: string) {
  const limits = {
    trial: {
      maxUsers: 5,
      maxItems: 100,
      maxApps: 1,
      features: ['Basic inventory management', 'Up to 100 items', 'Email support']
    },
    starter: {
      maxUsers: 5,
      maxItems: 500,
      maxApps: 1,
      features: ['Basic inventory management', 'Up to 500 items', 'Email support', 'Basic reporting']
    },
    professional: {
      maxUsers: 25,
      maxItems: -1, // Unlimited
      maxApps: -1, // All apps
      features: ['Advanced inventory management', 'Unlimited items', 'Priority support', 'Advanced reporting', 'Third-party integrations']
    },
    enterprise: {
      maxUsers: -1, // Unlimited
      maxItems: -1, // Unlimited
      maxApps: -1, // All apps
      features: ['Everything in Professional', 'Custom integrations', 'Dedicated support', 'Custom reporting', 'API access']
    }
  }

  return limits[plan as keyof typeof limits] || limits.trial
}