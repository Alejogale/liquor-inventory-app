'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Shield, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Save, 
  X,
  Check,
  AlertTriangle,
  Settings,
  UserCheck,
  Lock,
  Unlock,
  Search
} from 'lucide-react'

interface Permission {
  id: string
  name: string
  description: string
  category: 'inventory' | 'reports' | 'users' | 'settings' | 'admin'
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  isDefault?: boolean
  userCount: number
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
  isActive: boolean
  lastLogin?: string
  permissions: string[]
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  // Inventory Permissions
  { id: 'inventory_view', name: 'View Inventory', description: 'Can view inventory items and counts', category: 'inventory' },
  { id: 'inventory_add', name: 'Add Items', description: 'Can add new inventory items', category: 'inventory' },
  { id: 'inventory_edit', name: 'Edit Items', description: 'Can edit existing inventory items', category: 'inventory' },
  { id: 'inventory_delete', name: 'Delete Items', description: 'Can delete inventory items', category: 'inventory' },
  { id: 'inventory_count', name: 'Perform Counts', description: 'Can perform inventory counts', category: 'inventory' },
  { id: 'inventory_categories', name: 'Manage Categories', description: 'Can manage item categories', category: 'inventory' },
  { id: 'inventory_suppliers', name: 'Manage Suppliers', description: 'Can manage suppliers', category: 'inventory' },
  { id: 'inventory_rooms', name: 'Manage Rooms', description: 'Can manage rooms and locations', category: 'inventory' },
  
  // Report Permissions
  { id: 'reports_view', name: 'View Reports', description: 'Can view basic reports', category: 'reports' },
  { id: 'reports_advanced', name: 'Advanced Reports', description: 'Can access advanced analytics', category: 'reports' },
  { id: 'reports_export', name: 'Export Reports', description: 'Can export reports in various formats', category: 'reports' },
  { id: 'reports_schedule', name: 'Schedule Reports', description: 'Can schedule automated reports', category: 'reports' },
  
  // User Management Permissions
  { id: 'users_view', name: 'View Users', description: 'Can view user list', category: 'users' },
  { id: 'users_add', name: 'Add Users', description: 'Can add new users', category: 'users' },
  { id: 'users_edit', name: 'Edit Users', description: 'Can edit user information', category: 'users' },
  { id: 'users_delete', name: 'Delete Users', description: 'Can delete users', category: 'users' },
  { id: 'users_roles', name: 'Manage Roles', description: 'Can manage user roles and permissions', category: 'users' },
  
  // Settings Permissions
  { id: 'settings_view', name: 'View Settings', description: 'Can view system settings', category: 'settings' },
  { id: 'settings_edit', name: 'Edit Settings', description: 'Can modify system settings', category: 'settings' },
  { id: 'integrations_view', name: 'View Integrations', description: 'Can view integration settings', category: 'settings' },
  { id: 'integrations_edit', name: 'Edit Integrations', description: 'Can modify integration settings', category: 'settings' },
  
  // Admin Permissions
  { id: 'admin_full', name: 'Full Admin Access', description: 'Complete administrative access', category: 'admin' },
  { id: 'admin_billing', name: 'Billing Management', description: 'Can manage billing and subscriptions', category: 'admin' },
  { id: 'admin_audit', name: 'Audit Logs', description: 'Can view audit logs and activity history', category: 'admin' },
  { id: 'admin_backup', name: 'Data Backup', description: 'Can perform data backup and restore', category: 'admin' }
]

const DEFAULT_ROLES: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full access to all features and settings',
    permissions: AVAILABLE_PERMISSIONS.map(p => p.id),
    isDefault: false,
    userCount: 0
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Can manage inventory, users, and view reports',
    permissions: [
      'inventory_view', 'inventory_add', 'inventory_edit', 'inventory_count',
      'inventory_categories', 'inventory_suppliers', 'inventory_rooms',
      'reports_view', 'reports_advanced', 'reports_export',
      'users_view', 'users_add', 'users_edit',
      'settings_view', 'integrations_view'
    ],
    isDefault: false,
    userCount: 0
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Can view inventory and perform counts',
    permissions: [
      'inventory_view', 'inventory_count',
      'reports_view'
    ],
    isDefault: true,
    userCount: 0
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to inventory and reports',
    permissions: [
      'inventory_view',
      'reports_view'
    ],
    isDefault: false,
    userCount: 0
  }
]

export default function UserPermissions({ organizationId }: { organizationId?: string }) {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditingUser, setIsEditingUser] = useState(false)
  const [isEditingRole, setIsEditingRole] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organizationId) {
      fetchUsersAndRoles()
    }
  }, [organizationId])

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true)

      // Fetch users
      const { data: userProfiles } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('organization_id', organizationId)

      const usersWithPermissions = (userProfiles || []).map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        isActive: true,
        lastLogin: user.updated_at,
        permissions: getPermissionsForRole(user.role)
      }))

      // Update role user counts
      const updatedRoles = roles.map(role => ({
        ...role,
        userCount: usersWithPermissions.filter(user => user.role === role.id).length
      }))

      setUsers(usersWithPermissions)
      setRoles(updatedRoles)
    } catch (error) {
      console.error('Error fetching users and roles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPermissionsForRole = (roleId: string): string[] => {
    const role = roles.find(r => r.id === roleId)
    return role?.permissions || []
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error

      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, role: newRole, permissions: getPermissionsForRole(newRole) }
          : user
      ))

      // Refresh user counts
      fetchUsersAndRoles()
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      // In a real app, you might have an is_active field in user_profiles
      // For now, we'll just update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, isActive } : user
      ))
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const createCustomRole = async (roleData: Omit<Role, 'id' | 'userCount'>) => {
    try {
      const newRole: Role = {
        ...roleData,
        id: `custom_${Date.now()}`,
        userCount: 0
      }

      setRoles([...roles, newRole])
      setSelectedRole(newRole)
      setIsEditingRole(true)
    } catch (error) {
      console.error('Error creating custom role:', error)
    }
  }

  const updateRolePermissions = async (roleId: string, permissions: string[]) => {
    try {
      setRoles(roles.map(role => 
        role.id === roleId ? { ...role, permissions } : role
      ))

      // Update users with this role
      setUsers(users.map(user => 
        user.role === roleId 
          ? { ...user, permissions }
          : user
      ))
    } catch (error) {
      console.error('Error updating role permissions:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPermissionCategoryColor = (category: string) => {
    switch (category) {
      case 'inventory': return 'bg-blue-100 text-blue-800'
      case 'reports': return 'bg-green-100 text-green-800'
      case 'users': return 'bg-purple-100 text-purple-800'
      case 'settings': return 'bg-orange-100 text-orange-800'
      case 'admin': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading user permissions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User Permissions</h2>
          <p className="text-slate-600">Manage user roles and access control</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedRole(null)
              setIsEditingRole(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] text-white rounded-lg transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">Users</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-[var(--accent-orange-200)] rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{user.full_name}</div>
                        <div className="text-sm text-slate-600">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-sm text-slate-600 capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Details / Role Management */}
        <div className="space-y-4">
          {/* Selected User Details */}
          {selectedUser && (
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">User Details</h3>
                <button
                  onClick={() => setIsEditingUser(!isEditingUser)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Settings className="h-4 w-4 text-slate-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  {isEditingUser ? (
                    <select
                      value={selectedUser.role}
                      onChange={(e) => updateUserRole(selectedUser.id, e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 rounded-lg text-slate-700 capitalize">
                      {selectedUser.role}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <button
                    onClick={() => toggleUserStatus(selectedUser.id, !selectedUser.isActive)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedUser.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {selectedUser.isActive ? <UserCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedUser.permissions.map(permissionId => {
                      const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId)
                      return permission ? (
                        <div key={permission.id} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          <span className="text-slate-700">{permission.name}</span>
                        </div>
                      ) : null
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Roles List */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Roles</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedRole?.id === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">{role.name}</div>
                      <div className="text-sm text-slate-600">{role.userCount} users</div>
                    </div>
                    {role.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Role Permissions Editor */}
      {selectedRole && isEditingRole && (
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">
              {selectedRole.id.startsWith('custom_') ? 'Create New Role' : 'Edit Role Permissions'}
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingRole(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditingRole(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Role Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role Name</label>
                <input
                  type="text"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <input
                  type="text"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Permissions by Category */}
            <div className="space-y-6">
              {['inventory', 'reports', 'users', 'settings', 'admin'].map(category => (
                <div key={category} className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 capitalize">{category} Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {AVAILABLE_PERMISSIONS
                      .filter(permission => permission.category === category)
                      .map(permission => (
                        <label key={permission.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedRole.permissions.includes(permission.id)}
                            onChange={(e) => {
                              const newPermissions = e.target.checked
                                ? [...selectedRole.permissions, permission.id]
                                : selectedRole.permissions.filter(p => p !== permission.id)
                              setSelectedRole({ ...selectedRole, permissions: newPermissions })
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-slate-800">{permission.name}</div>
                            <div className="text-sm text-slate-600">{permission.description}</div>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 