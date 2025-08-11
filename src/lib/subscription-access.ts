import { supabase } from './supabase'

// Subscription-based app access system
export type AppId = 'liquor-inventory' | 'reservation-management' | 'member-database' | 'pos-system'

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
export async function checkAppAccess(organizationId: string, appId: AppId): Promise<AppAccess> {
  try {
    console.log(`🔐 Checking access for org ${organizationId} to app ${appId}`)
    
    // Check for active subscription or trial
    const { data: subscription, error } = await supabase
      .from('app_subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .or(`app_id.eq.${appId},subscription_plan.eq.bundle`)
      .in('subscription_status', ['active', 'trial'])
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking app access:', error)
      return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
    }
    
    if (!subscription) {
      // No subscription found - check if platform admin (always has access)
      return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
    }
    
    const now = new Date()
    
    // Check trial status
    if (subscription.subscription_status === 'trial') {
      const trialEnd = new Date(subscription.trial_ends_at || '')
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
    if (subscription.subscription_status === 'active') {
      const subscriptionEnd = subscription.subscription_ends_at ? new Date(subscription.subscription_ends_at) : null
      const isActive = !subscriptionEnd || subscriptionEnd > now
      
      return {
        hasAccess: isActive,
        isTrialExpired: false,
        isSubscriptionActive: isActive,
        subscriptionType: subscription.subscription_plan
      }
    }
    
    return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
    
  } catch (error) {
    console.error('Error checking app access:', error)
    return { hasAccess: false, isTrialExpired: true, isSubscriptionActive: false }
  }
}

// Get all accessible apps for organization
export async function getAccessibleApps(organizationId: string): Promise<AppId[]> {
  try {
    const { data: subscriptions, error } = await supabase
      .from('app_subscriptions')
      .select('app_id, subscription_plan, subscription_status, trial_ends_at, subscription_ends_at')
      .eq('organization_id', organizationId)
      .in('subscription_status', ['active', 'trial'])
    
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
      if (sub.subscription_status === 'trial' && sub.trial_ends_at) {
        hasAccess = new Date(sub.trial_ends_at) > now
      }
      
      // Check active subscription
      if (sub.subscription_status === 'active') {
        hasAccess = !sub.subscription_ends_at || new Date(sub.subscription_ends_at) > now
      }
      
      if (hasAccess) {
        if (sub.subscription_plan === 'bundle') {
          // Bundle gives access to all apps
          return ['liquor-inventory', 'reservation-management', 'member-database', 'pos-system']
        } else {
          // Individual app access
          accessibleApps.push(sub.app_id as AppId)
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
    
    const { error } = await supabase
      .from('app_subscriptions')
      .insert({
        organization_id: organizationId,
        app_id: appId,
        subscription_status: 'trial',
        subscription_plan: 'individual',
        trial_ends_at: trialEndDate.toISOString()
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
  return email === 'alejogaleis@gmail.com'
}