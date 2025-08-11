'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package,
  Calendar,
  Users,
  CreditCard,
  ChevronDown,
  ExternalLink,
  Settings
} from 'lucide-react'

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

interface AppSwitcherProps {
  currentApp?: string
  userProfile: UserProfile | null
  organization: Organization | null
}

// App definitions
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

export default function AppSwitcher({
  currentApp,
  userProfile,
  organization
}: AppSwitcherProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const currentAppData = APPS.find(app => app.id === currentApp)
  const accessibleApps = APPS.filter(app => app.status === 'active')

  const canAccessApp = (appId: string) => {
    // For now, all active apps are accessible
    // This will be enhanced with permission checking
    return APPS.find(app => app.id === appId)?.status === 'active'
  }

  return (
    <div className="bg-white border-b border-blue-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Current App Info */}
          <div className="flex items-center space-x-4">
            {currentAppData ? (
              <>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${currentAppData.color}`}>
                  <currentAppData.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">{currentAppData.name}</h1>
                  <p className="text-slate-600 text-sm">{currentAppData.description}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800">Platform Dashboard</h1>
                  <p className="text-slate-600 text-sm">Manage your hospitality business</p>
                </div>
              </>
            )}
          </div>

          {/* App Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 px-4 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-700">Switch App</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <h3 className="text-sm font-medium text-slate-800">Applications</h3>
                  <p className="text-xs text-slate-600">Switch between different apps</p>
                </div>

                <div className="py-2">
                  {APPS.map((app) => {
                    const Icon = app.icon
                    const isActive = currentApp === app.id
                    const isComingSoon = app.status === 'coming-soon'
                    const canAccess = canAccessApp(app.id)

                    return (
                      <div key={app.id} className="px-4 py-2">
                        <Link
                          href={isComingSoon || !canAccess ? '#' : app.href}
                          onClick={isComingSoon || !canAccess ? (e) => e.preventDefault() : undefined}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                            isActive
                              ? 'bg-blue-50 border border-blue-200'
                              : isComingSoon || !canAccess
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isComingSoon || !canAccess
                              ? 'bg-gray-200'
                              : `bg-gradient-to-br ${app.color}`
                          }`}>
                            <Icon className={`h-4 w-4 ${
                              isComingSoon || !canAccess ? 'text-gray-400' : 'text-white'
                            }`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm font-medium ${
                                isActive ? 'text-blue-700' : 'text-slate-800'
                              }`}>
                                {app.name}
                              </p>
                              {isComingSoon && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Soon
                                </span>
                              )}
                              {isActive && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">{app.description}</p>
                          </div>

                          {!isComingSoon && canAccess && !isActive && (
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                          )}
                        </Link>
                      </div>
                    )
                  })}
                </div>

                {/* Quick Actions */}
                <div className="border-t border-slate-100 pt-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Platform Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        {currentApp && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-slate-600">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Platform
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">{currentAppData?.name}</span>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
