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

// ============================================
// Dashboard Tab Permissions (Role-based)
// ============================================

export type TabPermission =
  | 'view_inventory'
  | 'import_data'
  | 'manage_categories'
  | 'manage_suppliers'
  | 'manage_rooms'
  | 'manage_team'
  | 'view_stock_analytics'
  | 'count_inventory'
  | 'view_orders'
  | 'view_activity'
  | 'manage_subscription'
  | 'add_item'
  | 'edit_item'
  | 'delete_item'

// Define tab permissions for each role
const roleTabPermissions: Record<string, TabPermission[]> = {
  owner: [
    'view_inventory',
    'import_data',
    'manage_categories',
    'manage_suppliers',
    'manage_rooms',
    'manage_team',
    'view_stock_analytics',
    'count_inventory',
    'view_orders',
    'view_activity',
    'manage_subscription',
    'add_item',
    'edit_item',
    'delete_item'
  ],
  manager: [
    'view_inventory',
    'import_data',
    'manage_categories',
    'manage_suppliers',
    'manage_rooms',
    'manage_team',
    'view_stock_analytics',
    'count_inventory',
    'view_orders',
    'view_activity',
    'add_item',
    'edit_item',
    'delete_item'
  ],
  staff: [
    // Staff (bartenders/servers) can only view inventory and count
    'view_inventory',
    'count_inventory'
  ],
  viewer: [
    'view_inventory'
  ]
}

// Map navigation tab IDs to required permissions
export const tabPermissionMap: Record<string, TabPermission> = {
  'inventory': 'view_inventory',
  'import': 'import_data',
  'categories': 'manage_categories',
  'suppliers': 'manage_suppliers',
  'rooms': 'manage_rooms',
  'team': 'manage_team',
  'stock-movements': 'view_stock_analytics',
  'count': 'count_inventory',
  'orders': 'view_orders',
  'activity': 'view_activity',
  'subscription': 'manage_subscription'
}

/**
 * Check if a role has a specific tab permission (synchronous)
 */
export function hasTabPermission(role: string | undefined, permission: TabPermission): boolean {
  if (!role) return false

  const normalizedRole = role.toLowerCase()
  const permissions = roleTabPermissions[normalizedRole]

  if (!permissions) {
    // Unknown role defaults to viewer
    return roleTabPermissions.viewer.includes(permission)
  }

  return permissions.includes(permission)
}

/**
 * Check if a role can access a specific dashboard tab
 */
export function canAccessTab(role: string | undefined, tabId: string): boolean {
  const permission = tabPermissionMap[tabId]
  if (!permission) return false
  return hasTabPermission(role, permission)
}

/**
 * Get all accessible tab IDs for a role
 */
export function getAccessibleTabs(role: string | undefined): string[] {
  return Object.entries(tabPermissionMap)
    .filter(([_, permission]) => hasTabPermission(role, permission))
    .map(([tabId]) => tabId)
}

/**
 * Get the default tab for a role
 */
export function getDefaultTab(role: string | undefined): string {
  const accessible = getAccessibleTabs(role)
  // Staff defaults to count tab, others to inventory
  if (role?.toLowerCase() === 'staff' && accessible.includes('count')) {
    return 'count'
  }
  return accessible[0] || 'inventory'
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: string | undefined): string {
  if (!role) return 'Unknown'

  const displayNames: Record<string, string> = {
    'owner': 'Owner',
    'manager': 'Manager',
    'staff': 'Staff',
    'viewer': 'Viewer',
    'admin': 'Admin'
  }

  return displayNames[role.toLowerCase()] || role
}

/**
 * Check if a user can modify another user's role
 */
export function canModifyRole(currentRole: string | undefined, targetRole: string): boolean {
  if (!currentRole) return false

  const roleHierarchy: Record<string, number> = {
    'owner': 4,
    'admin': 4,
    'manager': 3,
    'staff': 2,
    'viewer': 1
  }

  const currentLevel = roleHierarchy[currentRole.toLowerCase()] || 0
  const targetLevel = roleHierarchy[targetRole.toLowerCase()] || 0

  // Owner/admin can do anything
  if (currentRole.toLowerCase() === 'owner' || currentRole.toLowerCase() === 'admin') {
    return true
  }

  // Others can only assign roles lower than their own
  return currentLevel > targetLevel
}