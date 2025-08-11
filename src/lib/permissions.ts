// Permission system for Hospitality Hub Platform
// Defines roles, permissions, and access control logic

export type UserRole = 'owner' | 'manager' | 'staff' | 'viewer'
export type PermissionType = 'view' | 'create' | 'edit' | 'delete' | 'export' | 'admin'
export type AppId = 'liquor-inventory' | 'reservation-management' | 'member-database' | 'pos-system'

// Default role permissions for each app
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Record<AppId, PermissionType[]>> = {
  owner: {
    'liquor-inventory': ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    'reservation-management': ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    'member-database': ['view', 'create', 'edit', 'delete', 'export', 'admin'],
    'pos-system': ['view', 'create', 'edit', 'delete', 'export', 'admin']
  },
  manager: {
    'liquor-inventory': ['view', 'create', 'edit', 'delete', 'export'],
    'reservation-management': ['view', 'create', 'edit', 'delete', 'export'],
    'member-database': ['view', 'create', 'edit', 'delete', 'export'],
    'pos-system': ['view', 'create', 'edit', 'delete', 'export']
  },
  staff: {
    'liquor-inventory': ['view', 'create', 'edit'],
    'reservation-management': ['view', 'create', 'edit'],
    'member-database': ['view', 'create'],
    'pos-system': ['view', 'create']
  },
  viewer: {
    'liquor-inventory': ['view'],
    'reservation-management': ['view'],
    'member-database': ['view'],
    'pos-system': ['view']
  }
}

// Feature-specific permissions
export const FEATURE_PERMISSIONS = {
  // User Management
  'user-management': {
    'invite-users': ['owner', 'manager'],
    'edit-user-roles': ['owner', 'manager'],
    'suspend-users': ['owner', 'manager'],
    'view-user-activity': ['owner', 'manager']
  },
  
  // Organization Settings
  'organization-settings': {
    'view-settings': ['owner', 'manager'],
    'edit-settings': ['owner'],
    'billing-management': ['owner'],
    'subscription-management': ['owner']
  },
  
  // App Management
  'app-management': {
    'activate-apps': ['owner', 'manager'],
    'configure-apps': ['owner', 'manager'],
    'view-app-analytics': ['owner', 'manager']
  },
  
  // Data Management
  'data-management': {
    'export-data': ['owner', 'manager'],
    'import-data': ['owner', 'manager'],
    'backup-data': ['owner'],
    'delete-data': ['owner']
  }
}

// Permission checking utilities
export class PermissionManager {
  private userRole: UserRole
  private customPermissions: Array<{
    appId: AppId
    permissionType: PermissionType
    isActive: boolean
    expiresAt?: Date
  }>

  constructor(userRole: UserRole, customPermissions: any[] = []) {
    this.userRole = userRole
    this.customPermissions = customPermissions.map(p => ({
      appId: p.app_id as AppId,
      permissionType: p.permission_type as PermissionType,
      isActive: p.is_active,
      expiresAt: p.expires_at ? new Date(p.expires_at) : undefined
    }))
  }

  // Check if user has permission for a specific app and action
  hasPermission(appId: AppId, permissionType: PermissionType): boolean {
    // Check if permission has expired
    const customPermission = this.customPermissions.find(p => 
      p.appId === appId && 
      p.permissionType === permissionType &&
      p.isActive &&
      (!p.expiresAt || p.expiresAt > new Date())
    )

    if (customPermission) {
      return true
    }

    // Check default role permissions
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[this.userRole]?.[appId] || []
    return rolePermissions.includes(permissionType)
  }

  // Check if user can access a specific app
  canAccessApp(appId: AppId): boolean {
    return this.hasPermission(appId, 'view')
  }

  // Check if user can perform a specific feature action
  canPerformFeature(feature: string, action: string): boolean {
    const featurePermissions = FEATURE_PERMISSIONS[feature as keyof typeof FEATURE_PERMISSIONS]
    if (!featurePermissions) return false

    const allowedRoles = featurePermissions[action as keyof typeof featurePermissions]
    if (!allowedRoles) return false

    return allowedRoles.includes(this.userRole)
  }

  // Get all permissions for a specific app
  getAppPermissions(appId: AppId): PermissionType[] {
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[this.userRole]?.[appId] || []
    const customPermissions = this.customPermissions
      .filter(p => p.appId === appId && p.isActive && (!p.expiresAt || p.expiresAt > new Date()))
      .map(p => p.permissionType)

    return [...new Set([...rolePermissions, ...customPermissions])]
  }

  // Get all apps user can access
  getAccessibleApps(): AppId[] {
    return Object.values(AppId).filter(appId => this.canAccessApp(appId))
  }
}

// React hook for permissions (to be used with auth context)
export const usePermissions = (userRole: UserRole, customPermissions: any[] = []) => {
  const permissionManager = new PermissionManager(userRole, customPermissions)
  
  return {
    hasPermission: (appId: AppId, permissionType: PermissionType) => 
      permissionManager.hasPermission(appId, permissionType),
    canAccessApp: (appId: AppId) => 
      permissionManager.canAccessApp(appId),
    canPerformFeature: (feature: string, action: string) => 
      permissionManager.canPerformFeature(feature, action),
    getAppPermissions: (appId: AppId) => 
      permissionManager.getAppPermissions(appId),
    getAccessibleApps: () => 
      permissionManager.getAccessibleApps()
  }
}

// Permission guard component
export const PermissionGuard = ({ 
  children, 
  appId, 
  permissionType, 
  fallback = null 
}: {
  children: React.ReactNode
  appId: AppId
  permissionType: PermissionType
  fallback?: React.ReactNode
}) => {
  // This would be used with the auth context
  // For now, return children (will be implemented with auth context)
  return <>{children}</>
}

// App access guard component
export const AppAccessGuard = ({ 
  children, 
  appId, 
  fallback = null 
}: {
  children: React.ReactNode
  appId: AppId
  fallback?: React.ReactNode
}) => {
  // This would be used with the auth context
  // For now, return children (will be implemented with auth context)
  return <>{children}</>
}
