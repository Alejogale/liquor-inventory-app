import { supabase } from './supabase'
import { checkAppAccess, AppId, isPlatformAdminEmail } from './subscription-access'

export type Permission = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'admin'
export type UserRole = 'owner' | 'manager' | 'staff' | 'viewer' | 'admin'

export interface UserAccess {
  hasAppAccess: boolean
  permissions: Permission[]
  isTrialExpired: boolean
  isSubscriptionActive: boolean
  trialDaysRemaining?: number
  subscriptionType?: 'individual' | 'bundle' | 'trial'
  reason?: string
}

/**
 * Check comprehensive user access for an app (subscription + custom permissions)
 */
export async function checkUserAppAccess(
  userId: string, 
  organizationId: string, 
  appId: AppId,
  userEmail?: string
): Promise<UserAccess> {
  try {
    console.log(`🔐 checkUserAppAccess Debug - Details:`)
    console.log('  userId:', userId)
    console.log('  organizationId:', organizationId)
    console.log('  appId:', appId)
    console.log('  userEmail:', userEmail)
    console.log('  isPlatformAdmin check:', isPlatformAdminEmail(userEmail))
    
    // Platform admin always has full access
    if (isPlatformAdminEmail(userEmail)) {
      console.log('✅ PLATFORM ADMIN ACCESS GRANTED!')
      return {
        hasAppAccess: true,
        permissions: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
        isTrialExpired: false,
        isSubscriptionActive: true,
        subscriptionType: 'bundle'
      }
    }
    
    console.log('⚠️ NOT PLATFORM ADMIN - continuing with subscription check...')

    // 1. Check subscription-level access first
    const subscriptionAccess = await checkAppAccess(organizationId, appId)
    
    if (!subscriptionAccess.hasAccess) {
      return {
        hasAppAccess: false,
        permissions: [],
        isTrialExpired: subscriptionAccess.isTrialExpired,
        isSubscriptionActive: subscriptionAccess.isSubscriptionActive,
        trialDaysRemaining: subscriptionAccess.trialDaysRemaining,
        subscriptionType: subscriptionAccess.subscriptionType,
        reason: 'No active subscription or trial'
      }
    }

    // 2. Check user-specific permissions
    const { data: customPermissions, error: permError } = await supabase
      .from('user_custom_permissions')
      .select('permission_type')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('app_id', appId)
      .single()

    // 3. Get user profile for role-based permissions
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      return {
        hasAppAccess: false,
        permissions: [],
        isTrialExpired: subscriptionAccess.isTrialExpired,
        isSubscriptionActive: subscriptionAccess.isSubscriptionActive,
        reason: 'User profile not found'
      }
    }

    // 4. Determine permissions based on custom permissions or role
    let permissions: Permission[] = []
    
    if (customPermissions && !permError) {
      // User has custom permissions for this app
      permissions = getPermissionsFromType(customPermissions.permission_type)
    } else {
      // Use role-based permissions
      permissions = getPermissionsFromRole(userProfile.role as UserRole)
    }

    return {
      hasAppAccess: true,
      permissions,
      isTrialExpired: subscriptionAccess.isTrialExpired,
      isSubscriptionActive: subscriptionAccess.isSubscriptionActive,
      trialDaysRemaining: subscriptionAccess.trialDaysRemaining,
      subscriptionType: subscriptionAccess.subscriptionType
    }

  } catch (error) {
    console.error('Error checking user app access:', error)
    return {
      hasAppAccess: false,
      permissions: [],
      isTrialExpired: true,
      isSubscriptionActive: false,
      reason: 'Error checking access'
    }
  }
}

/**
 * Convert permission type to permissions array
 */
function getPermissionsFromType(permissionType: string): Permission[] {
  switch (permissionType) {
    case 'admin':
      return ['view', 'create', 'edit', 'delete', 'export', 'admin']
    case 'edit':
      return ['view', 'create', 'edit', 'export']
    case 'create':
      return ['view', 'create']
    case 'view':
      return ['view']
    default:
      return ['view']
  }
}

/**
 * Convert user role to permissions array
 */
function getPermissionsFromRole(role: UserRole): Permission[] {
  switch (role) {
    case 'owner':
    case 'admin':
      return ['view', 'create', 'edit', 'delete', 'export', 'admin']
    case 'manager':
      return ['view', 'create', 'edit', 'export']
    case 'staff':
      return ['view', 'create', 'edit']
    case 'viewer':
      return ['view']
    default:
      return ['view']
  }
}

/**
 * Check if user has specific permission for an app
 */
export async function hasPermission(
  userId: string,
  organizationId: string,
  appId: AppId,
  permission: Permission,
  userEmail?: string
): Promise<boolean> {
  const access = await checkUserAppAccess(userId, organizationId, appId, userEmail)
  return access.hasAppAccess && access.permissions.includes(permission)
}