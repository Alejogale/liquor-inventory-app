'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'
import {
  Package,
  Calendar,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Home,
  Plus,
  Crown,
  UserPlus,
  Building2,
  Activity,
  FileText,
  Globe
} from 'lucide-react'

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  role?: string
  status?: 'active' | 'suspended' | 'inactive'
  organization_id?: string
  job_title?: string
}

interface Organization {
  id: string
  Name: string
  slug: string
  subscription_status: string
  subscription_plan: string
  owner_id?: string
  created_by?: string
  stripe_customer_id?: string
  address?: string
  phone?: string
  industry?: string
  trial_ends_at?: string
}

interface PlatformSidebarProps {
  user: User
  userProfile: UserProfile | null
  organization: Organization | null
  currentApp?: string
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  showMobileMenu: boolean
  onMobileMenuClose: () => void
  onSignOut: () => void
}

// App definitions with icons and descriptions
const APPS = [
  {
    id: 'liquor-inventory',
    name: 'Liquor Inventory',
    description: 'Complete inventory management',
    icon: Package,
    color: 'from-blue-500 to-blue-600',
    href: '/apps/liquor-inventory',
    status: 'active'
  },
  {
    id: 'reservation-management',
    name: 'Reservation Management',
    description: 'Table reservations & guest management',
    icon: Calendar,
    color: 'from-green-500 to-green-600',
    href: '/apps/reservation-management',
    status: 'active'
  },
  {
    id: 'member-database',
    name: 'Member Database',
    description: 'Member management & search',
    icon: Users,
    color: 'from-purple-500 to-purple-600',
    href: '/apps/member-database',
    status: 'active'
  },
  {
    id: 'pos-system',
    name: 'POS System',
    description: 'Point of sale integration',
    icon: CreditCard,
    color: 'from-orange-500 to-orange-600',
    href: '/apps/pos-system',
    status: 'coming-soon'
  }
]

// Platform navigation items
const PLATFORM_NAV = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Platform overview',
    icon: Home,
    href: '/dashboard',
    roles: ['owner', 'manager', 'staff', 'viewer']
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Cross-app insights',
    icon: BarChart3,
    href: '/dashboard/analytics',
    roles: ['owner', 'manager']
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'Manage team members',
    icon: UserPlus,
    href: '/dashboard/users',
    roles: ['owner', 'manager']
  },
  {
    id: 'organization',
    name: 'Organization',
    description: 'Company settings',
    icon: Building2,
    href: '/dashboard/organization',
    roles: ['owner', 'manager']
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Subscription management',
    icon: CreditCard,
    href: '/dashboard/billing',
    roles: ['owner']
  },
  {
    id: 'activity',
    name: 'Activity Logs',
    description: 'Audit trail & reports',
    icon: Activity,
    href: '/dashboard/activity',
    roles: ['owner', 'manager']
  }
]

export default function PlatformSidebar({
  user,
  userProfile,
  organization,
  currentApp,
  collapsed,
  onCollapsedChange,
  showMobileMenu,
  onMobileMenuClose,
  onSignOut
}: PlatformSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState<'apps' | 'platform'>('apps')

  const canAccessFeature = (roles: string[]) => {
    return userProfile?.role && roles.includes(userProfile.role)
  }

  const filteredPlatformNav = PLATFORM_NAV.filter(item => canAccessFeature(item.roles))

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => onCollapsedChange(!collapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-blue-200 rounded-lg p-3 text-slate-800 shadow-lg hover:bg-blue-50 transition-colors"
        aria-label="Toggle sidebar menu"
      >
        {collapsed ? <Plus className="h-6 w-6" /> : <Settings className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-blue-200 shadow-lg z-40 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-80'
      } lg:relative lg:translate-x-0 lg:col-span-1 ${
        showMobileMenu ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${collapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                {!collapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">Hospitality Hub</h1>
                    <p className="text-slate-600 text-sm">One Platform, Multiple Apps</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={() => onCollapsedChange(!collapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            {!collapsed && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userProfile?.full_name?.charAt(0)?.toUpperCase() || 
                       userProfile?.email?.charAt(0)?.toUpperCase() || 
                       'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium text-sm truncate">
                      {userProfile?.full_name || userProfile?.email || 'User'}
                    </p>
                    <p className="text-slate-600 text-xs capitalize">
                      {userProfile?.role || 'User'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          {!collapsed && (
            <div className="px-4 py-2 border-b border-blue-200">
              <div className="flex space-x-1 bg-blue-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveSection('apps')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'apps'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Apps
                </button>
                <button
                  onClick={() => setActiveSection('platform')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'platform'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Platform
                </button>
              </div>
            </div>
          )}

          {/* Navigation Content */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {activeSection === 'apps' ? (
              // Apps Section
              <div className="space-y-3">
                <div className={`${collapsed ? 'text-center' : 'flex items-center justify-between'}`}>
                  {!collapsed && (
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Applications
                    </h3>
                  )}
                  {collapsed && <Package className="h-5 w-5 mx-auto text-slate-600" />}
                </div>

                {APPS.map((app) => {
                  const Icon = app.icon
                  const isActive = currentApp === app.id
                  const isComingSoon = app.status === 'coming-soon'
                  
                  return (
                    <div key={app.id} className="relative">
                      <Link
                        href={isComingSoon ? '#' : app.href}
                        onClick={isComingSoon ? (e) => e.preventDefault() : undefined}
                        className={`block group relative ${
                          isComingSoon ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        <div className={`p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400 shadow-lg text-white'
                            : isComingSoon
                            ? 'bg-gray-100 border border-gray-200 text-gray-500'
                            : 'hover:bg-blue-50 border border-transparent'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive 
                                ? 'bg-white/20' 
                                : isComingSoon
                                ? 'bg-gray-200'
                                : `bg-gradient-to-br ${app.color}`
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                isActive ? 'text-white' : isComingSoon ? 'text-gray-400' : 'text-white'
                              }`} />
                            </div>
                            
                            {!collapsed && (
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className={`text-sm font-medium ${
                                    isActive ? 'text-white' : isComingSoon ? 'text-gray-500' : 'text-slate-800'
                                  }`}>
                                    {app.name}
                                  </p>
                                  {isComingSoon && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Soon
                                    </span>
                                  )}
                                </div>
                                <p className={`text-xs ${
                                  isActive ? 'text-white/90' : isComingSoon ? 'text-gray-400' : 'text-slate-600'
                                }`}>
                                  {app.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {app.name}
                          {isComingSoon && ' (Coming Soon)'}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              // Platform Section
              <div className="space-y-3">
                <div className={`${collapsed ? 'text-center' : 'flex items-center justify-between'}`}>
                  {!collapsed && (
                    <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Platform
                    </h3>
                  )}
                  {collapsed && <Settings className="h-5 w-5 mx-auto text-slate-600" />}
                </div>

                {filteredPlatformNav.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  
                  return (
                    <div key={item.id} className="relative">
                      <Link
                        href={item.href}
                        className="block group"
                      >
                        <div className={`p-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400 shadow-lg text-white'
                            : 'hover:bg-blue-50 border border-transparent'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Icon className={`h-5 w-5 flex-shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'
                            }`} />
                            
                            {!collapsed && (
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  isActive ? 'text-white' : 'text-slate-800 group-hover:text-slate-900'
                                }`}>
                                  {item.name}
                                </p>
                                <p className={`text-xs ${
                                  isActive ? 'text-white/90' : 'text-slate-700 group-hover:text-slate-800'
                                }`}>
                                  {item.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Active Indicator */}
                          {isActive && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Tooltip for collapsed state */}
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-blue-200 space-y-2">
            {/* Admin Button (if owner/manager) */}
            {(userProfile?.role === 'owner' || userProfile?.role === 'manager') && (
              <Link
                href="/admin"
                className={`w-full flex items-center p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 border border-yellow-400 hover:from-yellow-600 hover:to-orange-600 transition-all text-white ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <Crown className="h-5 w-5 text-white flex-shrink-0" />
                {!collapsed && (
                  <span className="ml-3 text-white font-medium text-sm">Admin</span>
                )}
              </Link>
            )}

            {/* Home Button */}
            <Link
              href="/"
              className={`w-full flex items-center p-3 rounded-xl hover:bg-blue-50 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <Home className="h-5 w-5 text-slate-600 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-slate-600 text-sm">Back to Home</span>
              )}
            </Link>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className={`w-full flex items-center p-3 rounded-xl hover:bg-red-50 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 text-red-600 flex-shrink-0" />
              {!collapsed && (
                <span className="ml-3 text-red-600 text-sm">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}
    </>
  )
}
