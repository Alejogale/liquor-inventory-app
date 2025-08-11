'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { 
  Menu, 
  X, 
  ChevronDown, 
  User as UserIcon, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Building2
} from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  full_name?: string
  email?: string
  role?: 'owner' | 'manager' | 'staff' | 'viewer'
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

interface PlatformHeaderProps {
  user: User
  userProfile: UserProfile | null
  organization: Organization | null
  onSignOut: () => void
  onMenuToggle: () => void
  sidebarCollapsed: boolean
  onSidebarToggle: () => void
}

export default function PlatformHeader({
  user,
  userProfile,
  organization,
  onSignOut,
  onMenuToggle,
  sidebarCollapsed,
  onSidebarToggle
}: PlatformHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'staff': return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'owner': return 'Owner'
      case 'manager': return 'Manager'
      case 'staff': return 'Staff'
      case 'viewer': return 'Viewer'
      default: return 'User'
    }
  }

  return (
    <header className="bg-white border-b border-blue-200 shadow-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section - Menu & Organization */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop Sidebar Toggle */}
          <button
            onClick={onSidebarToggle}
            className="hidden lg:block p-2 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-slate-800 transition-colors"
          >
            {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>

          {/* Organization Info */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                {organization?.Name || 'Organization'}
              </h1>
              <p className="text-sm text-slate-600">
                {organization?.subscription_plan || 'Free'} Plan
              </p>
            </div>
          </div>
        </div>

        {/* Center Section - Search (hidden on mobile) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search across all apps..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Notifications & User */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <Bell className="h-5 w-5" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userProfile?.full_name?.charAt(0)?.toUpperCase() || 
                   userProfile?.email?.charAt(0)?.toUpperCase() || 
                   'U'}
                </span>
              </div>

              {/* User Info (hidden on mobile) */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800">
                  {userProfile?.full_name || userProfile?.email || 'User'}
                </p>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(userProfile?.role)}`}>
                    {getRoleDisplayName(userProfile?.role)}
                  </span>
                </div>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">
                    {userProfile?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {userProfile?.email || user.email}
                  </p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(userProfile?.role)}`}>
                      {getRoleDisplayName(userProfile?.role)}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserIcon className="h-4 w-4 mr-3" />
                    Profile Settings
                  </Link>
                  
                  <Link
                    href="/dashboard/organization"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Building2 className="h-4 w-4 mr-3" />
                    Organization Settings
                  </Link>
                  
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Billing & Subscription
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      onSignOut()
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="absolute right-4 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-800">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <div className="px-4 py-3 text-sm text-slate-600">
              No new notifications
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowNotifications(false)
          }}
        />
      )}
    </header>
  )
}
