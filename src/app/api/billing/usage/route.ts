import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create Supabase Admin client for data queries
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

export async function GET(request: NextRequest) {
  try {
    // Get userId and organizationId from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const organizationId = searchParams.get('organizationId')

    if (!userId || !organizationId) {
      return NextResponse.json({ error: 'User ID and Organization ID are required' }, { status: 400 })
    }

    // Get user's profile to verify access
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify user belongs to this organization
    if (userProfile.organization_id !== organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if user has permission to view billing
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get organization data with subscription info
    console.log('🔍 Querying organization with ID:', organizationId)

    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    console.log('🏢 Org query result:', JSON.stringify({ organization, orgError }, null, 2))

    if (orgError) {
      console.error('❌ Organization query error:', orgError)
      return NextResponse.json({ error: 'Organization query failed', details: orgError.message, code: orgError.code }, { status: 404 })
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found - no data returned' }, { status: 404 })
    }

    // Get usage statistics
    const currentDate = new Date()
    const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM format

    // Count active users
    const { count: activeUsers } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Count inventory items (as a usage metric)
    const { count: inventoryItems } = await supabaseAdmin
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Count storage areas (rooms)
    const { count: storageAreas } = await supabaseAdmin
      .from('storage_areas')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Use organization's limits from database (fallback to plan-based defaults)
    const maxUsers = organization.user_limit || 10
    const maxItems = organization.item_limit || 1000
    const maxStorageAreas = organization.storage_area_limit || 10

    // Calculate usage percentages
    const userUsagePercent = maxUsers === -1 ? 0 :
      Math.round(((activeUsers || 0) / maxUsers) * 100)

    const itemUsagePercent = maxItems === -1 ? 0 :
      Math.round(((inventoryItems || 0) / maxItems) * 100)

    const storageAreaUsagePercent = maxStorageAreas === -1 ? 0 :
      Math.round(((storageAreas || 0) / maxStorageAreas) * 100)

    // Get recent activity count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count: recentActivity } = await supabaseAdmin
      .from('activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Determine the plan name (prefer 'plan' column, fallback to 'subscription_tier')
    const planName = organization.plan || organization.subscription_tier || 'starter'

    return NextResponse.json({
      organization: {
        id: organization.id,
        name: organization.Name,
        plan: planName,
        status: organization.subscription_status || 'active',
        currentPeriodStart: organization.current_period_start || organization.trial_started_at,
        currentPeriodEnd: organization.current_period_end || organization.trial_ends_at,
        createdAt: organization.created_at,
        isGrandfathered: organization.is_grandfathered || false,
        billingCycle: organization.billing_cycle,
        subscriptionPrice: organization.subscription_price
      },
      usage: {
        activeUsers: {
          current: activeUsers || 0,
          limit: maxUsers,
          percentage: userUsagePercent
        },
        inventoryItems: {
          current: inventoryItems || 0,
          limit: maxItems,
          percentage: itemUsagePercent
        },
        storageAreas: {
          current: storageAreas || 0,
          limit: maxStorageAreas,
          percentage: storageAreaUsagePercent
        },
        recentActivity: recentActivity || 0,
        month: currentMonth
      },
      planLimits: {
        maxUsers: maxUsers,
        maxItems: maxItems,
        maxStorageAreas: maxStorageAreas,
        features: organization.features_enabled || ['Basic inventory management', 'Single location', 'Email support']
      }
    })

  } catch (error) {
    console.error('Error in billing usage API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
