import { supabase } from './supabase'
import { config } from './config'

// Subscription-based app access system
export type AppId = 'liquor-inventory' | 'consumption-tracker' | 'reservation-management' | 'member-database' | 'pos-system'

export interface AppSubscription {
  id: string
  organization_id: string
  app_id: AppId
  subscription_status: 'active' | 'cancelled' | 'trial' | 'expired'
  subscription_plan: 'individual' | 'bundle'
  trial_ends_at?: string
  subscription_ends_at?: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}

export interface AppAccess {
  hasAccess: boolean
  isTrialExpired: boolean
  isSubscriptionActive: boolean
  trialDaysRemaining?: number
  subscriptionType?: 'individual' | 'bundle' | 'trial'
}

// Check if organization has access to specific app
export async function checkAppAccess(organizationId: string, appId: AppId, userEmail?: string): Promise<AppAccess> {
  try {
    console.log(`🔐 Checking access for org ${organizationId} to app ${appId}`)

    // Platform admins always have full access - check this FIRST
    if (userEmail && isPlatformAdminEmail(userEmail)) {
      console.log('🔑 Platform admin bypass - granting full access')
      return {
        hasAccess: true,
        isTrialExpired: false,
        isSubscriptionActive: true,
        subscriptionType: 'bundle'
      }
    }

    // Check for active subscription or trial
    // Note: Table uses 'app_name' and 'status' columns (not 'app_id' and 'subscription_status')
    let { data: subscription, error } = await supabase
      .from('app_subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('app_name', appId)
      .in('status', ['active', 'trial'])
      .maybeSingle()

    // If no specific app subscription, check if user has any active subscription (bundle-like access)
    if (!subscription && !error) {
      const { data: anySubscription, error: anyError } = await supabase
        .from('app_subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .in('status', ['active', 'trial'])
        .limit(1)
        .maybeSingle()

      // If they have any active subscription, grant access (platform admin fallback)
      subscription = anySubscription
      error = anyError
    }
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking app access:', error)
      return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
    }
    
    if (!subscription) {
      // No subscription found - check if platform admin (always has access)
      return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
    }
    
    const now = new Date()

    // Check trial status (table uses 'status' and 'subscription_end_date')
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.subscription_end_date || '')
      const isTrialActive = trialEnd > now
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        hasAccess: isTrialActive,
        isTrialExpired: !isTrialActive,
        isSubscriptionActive: false,
        trialDaysRemaining: Math.max(0, daysRemaining),
        subscriptionType: 'trial'
      }
    }

    // Check active subscription
    if (subscription.status === 'active') {
      const subscriptionEnd = subscription.subscription_end_date ? new Date(subscription.subscription_end_date) : null
      const isActive = !subscriptionEnd || subscriptionEnd > now

      return {
        hasAccess: isActive,
        isTrialExpired: false,
        isSubscriptionActive: isActive,
        subscriptionType: 'individual'
      }
    }

    return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }

  } catch (error) {
    console.error('Error checking app access:', error)
    return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
  }
}

// Get all accessible apps for organization
export async function getAccessibleApps(organizationId: string, userEmail?: string): Promise<AppId[]> {
  try {
    // Platform admins get access to ALL apps
    if (userEmail && isPlatformAdminEmail(userEmail)) {
      console.log('🔑 Platform admin - granting access to all apps')
      return ['liquor-inventory', 'consumption-tracker', 'reservation-management', 'member-database', 'pos-system']
    }

    // Note: Table uses 'app_name' and 'status' columns
    const { data: subscriptions, error } = await supabase
      .from('app_subscriptions')
      .select('app_name, status, subscription_start_date, subscription_end_date')
      .eq('organization_id', organizationId)
      .in('status', ['active', 'trial'])

    if (error) {
      console.error('Error fetching accessible apps:', error)
      return []
    }

    if (!subscriptions) return []

    const now = new Date()
    const accessibleApps: AppId[] = []

    for (const sub of subscriptions) {
      let hasAccess = false

      // Check trial
      if (sub.status === 'trial' && sub.subscription_end_date) {
        hasAccess = new Date(sub.subscription_end_date) > now
      }

      // Check active subscription
      if (sub.status === 'active') {
        hasAccess = !sub.subscription_end_date || new Date(sub.subscription_end_date) > now
      }
      
      if (hasAccess && sub.app_name) {
        // Map database app names to code app IDs
        const appNameMap: Record<string, AppId> = {
          'liquor-inventory': 'liquor-inventory',
          'consumption-sheet': 'consumption-tracker',
          'consumption-tracker': 'consumption-tracker',
          'reservation-system': 'reservation-management',
          'reservation-management': 'reservation-management',
          'member-database': 'member-database',
          'pos-system': 'pos-system'
        }
        const mappedApp = appNameMap[sub.app_name]
        if (mappedApp) {
          accessibleApps.push(mappedApp)
        }
      }
    }

    return [...new Set(accessibleApps)] // Remove duplicates

  } catch (error) {
    console.error('Error getting accessible apps:', error)
    return []
  }
}

// Start trial for specific app
export async function startTrial(organizationId: string, appId: AppId): Promise<boolean> {
  try {
    console.log(`🆓 Starting trial for org ${organizationId}, app ${appId}`)

    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14) // 14-day trial

    // Note: Table uses 'app_name' and 'status' columns
    const { error } = await supabase
      .from('app_subscriptions')
      .insert({
        organization_id: organizationId,
        app_name: appId,
        status: 'trial',
        subscription_end_date: trialEndDate.toISOString()
      })
    
    if (error) {
      console.error('Error starting trial:', error)
      return false
    }
    
    console.log('✅ Trial started successfully')
    return true
    
  } catch (error) {
    console.error('Error starting trial:', error)
    return false
  }
}

// App access guard component props
export interface AppAccessGuardProps {
  children: React.ReactNode
  appId: AppId
  organizationId: string
  fallback?: React.ReactNode
}

// Helper function to check if user is platform admin (always has access)
export function isPlatformAdminEmail(email?: string): boolean {
  return config.isPlatformAdmin(email)
}