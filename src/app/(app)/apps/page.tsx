'use client'

import { useAuth } from '@/lib/auth-context'
import { Package, Calendar, Users, CreditCard, Building2, BarChart3, ChevronRight, Settings, Grid3X3 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import AppsSidebar from '@/components/AppsSidebar'
import SubscriptionManager from '@/components/SubscriptionManager'
import UserPermissions from '@/components/UserPermissions'

interface AppTile {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'available' | 'coming_soon' | 'planned'
  route?: string
  color: string
  features: string[]
}

const apps: AppTile[] = [
  {
    id: 'liquor-inventory',
    name: 'Liquor Inventory',
    description: 'Complete inventory management system for bars and restaurants',
    icon: Package,
    status: 'available',
    route: '/dashboard',
    color: 'from-blue-500 to-cyan-500',
    features: ['Inventory Tracking', 'Room Counting', 'Supplier Management', 'Order Reports', 'Analytics']
  },
  {
    id: 'reservation-system',
    name: 'Reservation Management',
    description: 'Table reservations and room booking system for hospitality venues',
    icon: Calendar,
    status: 'available',
    route: '/reservations',
    color: 'from-purple-500 to-pink-500',
    features: ['Table Management', '5-Day Rolling View', 'Walk-in Management', 'Status Workflow', 'Member Integration']
  },
  {
    id: 'member-database',
    name: 'Member Database',
    description: 'Comprehensive member management with family tracking and search',
    icon: Users,
    status: 'coming_soon',
    color: 'from-green-500 to-emerald-500',
    features: ['Member Profiles', 'Family Tracking', 'Sub-100ms Search', 'History Tracking', 'Reservation Links']
  },
  {
    id: 'pos-system',
    name: 'POS System',
    description: 'Point-of-sale system integrated with inventory and member data',
    icon: CreditCard,
    status: 'planned',
    color: 'from-orange-500 to-red-500',
    features: ['Payment Processing', 'Inventory Integration', 'Member Billing', 'Reporting', 'Multi-Location']
  }
]

export default function AppsPage() {
  const { user, userProfile, organization, isPlatformAdmin, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('apps')

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['apps', 'subscription'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Loading...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAppClick = (app: AppTile) => {
    if (app.status === 'available' && app.route) {
      router.push(app.route)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">✅ Available</span>
      case 'coming_soon':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">🚧 Coming Soon</span>
      case 'planned':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">📋 Planned</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex relative lg:grid lg:grid-cols-[auto_1fr]">
      {/* Sidebar Navigation */}
      <AppsSidebar
        userEmail={user?.email || ''}
        onSignOut={handleSignOut}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto h-screen ${
        sidebarCollapsed ? 'ml-20' : 'ml-80'
      } lg:ml-0`}>
        {/* Top Header Bar */}
        <div className="p-6 lg:p-8">
          {/* Header with Platform Admin Badge */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Hospitality Platform</h1>
                  <p className="text-slate-600">{organization?.Name || 'Welcome'}</p>
                </div>
              </div>
              
              {/* Platform Admin Badge */}
              {isPlatformAdmin() && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <span className="text-sm font-medium">🌟 Platform Admin</span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6 max-w-md">
              <button
                onClick={() => setActiveTab('apps')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'apps'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Apps</span>
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'subscription'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Team & Billing</span>
              </button>
            </div>

            {/* Welcome Section */}
            {activeTab === 'apps' && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Choose Your Application
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Access all your hospitality management tools from one central hub. 
                  Click on any available application to get started.
                </p>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">
                  Team & Billing Management
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                  Manage your subscription, invite team members, and control access permissions.
                </p>
              </div>
            )}
          </div>

          {/* Content Container */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-8">
            {/* Apps Content */}
            {activeTab === 'apps' && (
              <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {apps.map((app) => {
                const Icon = app.icon
                const isAvailable = app.status === 'available'
                const isHovered = hoveredApp === app.id

                return (
                  <div
                    key={app.id}
                    className={`relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 transition-all duration-300 transform hover:-translate-y-1 ${
                      isAvailable 
                        ? 'cursor-pointer border-blue-200 hover:border-blue-300 hover:shadow-xl' 
                        : 'cursor-not-allowed opacity-60 border-slate-200'
                    }`}
                    onClick={() => handleAppClick(app)}
                    onMouseEnter={() => setHoveredApp(app.id)}
                    onMouseLeave={() => setHoveredApp(null)}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(app.status)}
                    </div>

                    {/* App Icon */}
                    <div className={`w-14 h-14 bg-gradient-to-br ${app.color} rounded-xl flex items-center justify-center mb-4 ${isHovered ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* App Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                        {app.name}
                        {isAvailable && (
                          <ChevronRight className={`ml-2 h-4 w-4 text-slate-400 ${isHovered ? 'translate-x-1' : 'translate-x-0'} transition-transform duration-200`} />
                        )}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Key Features</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {app.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-slate-600">
                            <div className={`w-1.5 h-1.5 bg-gradient-to-r ${app.color} rounded-full mr-2 flex-shrink-0`}></div>
                            {feature}
                          </div>
                        ))}
                        {app.features.length > 3 && (
                          <div className="text-xs text-slate-500 mt-1">
                            +{app.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Launch Button */}
                    {isAvailable && (
                      <div className={`mt-4 opacity-0 ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                        <div className={`bg-gradient-to-r ${app.color} text-white px-4 py-2 rounded-lg font-medium text-sm text-center`}>
                          Launch Application
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Development Progress */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Development Roadmap</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">Phase 1: Complete</h4>
                  <p className="text-slate-600 text-xs">Liquor inventory management system</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">Phase 2: In Progress</h4>
                  <p className="text-slate-600 text-xs">Reservations and member database</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">Phase 3: Planned</h4>
                  <p className="text-slate-600 text-xs">POS system and analytics</p>
                </div>
              </div>
            </div>
              </>
            )}

            {/* Subscription Content */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                {/* Subscription Management */}
                <SubscriptionManager />

                {/* Team & Permissions Management */}
                {(userProfile?.role === 'owner' || userProfile?.role === 'manager') && (
                  <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-slate-800 mb-4">Team & Permissions</h3>
                    <p className="text-slate-600 mb-6">Manage team member roles and access permissions</p>
                    <UserPermissions organizationId={organization?.id} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}