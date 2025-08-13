'use client'

import { useAuth } from '@/lib/auth-context'
import { Package, Calendar, Users, CreditCard, Building2, BarChart3, ChevronRight, Settings, Grid3X3 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import AppsSidebar from '@/components/AppsSidebar'
import SubscriptionManager from '@/components/SubscriptionManager'
import UserPermissions from '@/components/UserPermissions'
import TeamManagement from '@/components/TeamManagement'
import BillingDashboard from '@/components/BillingDashboard'

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
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
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">Available</span>
      case 'coming_soon':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Coming Soon</span>
      case 'planned':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">Planned</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex relative lg:grid lg:grid-cols-[auto_1fr]">
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
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hospitality Platform</h1>
                  <p className="text-gray-600">{organization?.Name || 'Welcome'}</p>
                </div>
              </div>
              
              {/* Platform Admin Badge */}
              {isPlatformAdmin() && (
                <div className="px-4 py-2 rounded-full flex items-center space-x-2 border backdrop-blur-sm"
                     style={{
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                       borderColor: 'rgba(255, 119, 0, 0.3)',
                       boxShadow: '0 4px 12px rgba(255, 119, 0, 0.2)'
                     }}>
                  <span className="text-sm font-medium text-white">🌟 Platform Admin</span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-2xl p-1 mb-8 max-w-md backdrop-blur-xl border border-white/20"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)'
                 }}>
              <button
                onClick={() => setActiveTab('apps')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'apps'
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={activeTab === 'apps' ? {
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                  boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                } : {}}
              >
                <Grid3X3 className="h-4 w-4" />
                <span>Apps</span>
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'subscription'
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={activeTab === 'subscription' ? {
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                  boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                } : {}}
              >
                <Settings className="h-4 w-4" />
                <span>Team & Billing</span>
              </button>
            </div>

            {/* Welcome Section */}
            {activeTab === 'apps' && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  Choose Your Application
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Access all your hospitality management tools from one central hub. 
                  Click on any available application to get started.
                </p>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  Team & Billing Management
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Manage your subscription, invite team members, and control access permissions.
                </p>
              </div>
            )}
          </div>

          {/* Content Container */}
          <div className="rounded-2xl border border-white/20 shadow-2xl p-8 backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 25px 50px rgba(255, 119, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
               }}>
            {/* Apps Content */}
            {activeTab === 'apps' && (
              <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {apps.map((app) => {
                const Icon = app.icon
                const isAvailable = app.status === 'available'
                const isHovered = hoveredApp === app.id

                return (
                  <div
                    key={app.id}
                    className={`relative rounded-2xl p-8 border border-white/20 backdrop-blur-sm transition-all duration-300 ${
                      isAvailable 
                        ? 'cursor-pointer hover:shadow-2xl' 
                        : 'cursor-not-allowed opacity-60'
                    }`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: isHovered ? '0 25px 50px rgba(255, 119, 0, 0.15)' : '0 8px 32px rgba(255, 119, 0, 0.05)'
                    }}
                    onClick={() => handleAppClick(app)}
                    onMouseEnter={() => setHoveredApp(app.id)}
                    onMouseLeave={() => setHoveredApp(null)}
                  >
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(app.status)}
                    </div>

                    {/* App Icon */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300"
                         style={{
                           background: app.id === 'liquor-inventory' ? 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)' :
                                     app.id === 'reservation-system' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                     app.id === 'member-database' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                                     'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                           boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)',
                           transform: isHovered ? 'scale(1.05)' : 'scale(1)'
                         }}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>

                    {/* App Info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center tracking-tight">
                        {app.name}
                        {isAvailable && (
                          <ChevronRight className={`ml-2 h-4 w-4 text-gray-400 ${isHovered ? 'translate-x-1' : 'translate-x-0'} transition-transform duration-200`} />
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {app.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Key Features</h4>
                      <div className="grid grid-cols-1 gap-1">
                        {app.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center text-xs text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
                            {feature}
                          </div>
                        ))}
                        {app.features.length > 3 && (
                          <div className="text-xs text-gray-500 mt-1">
                            +{app.features.length - 3} more features
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Launch Button */}
                    {isAvailable && (
                      <div className={`mt-6 transition-all duration-300 ${isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-2'}`}>
                        <div className="px-6 py-3 rounded-xl font-medium text-sm text-center transition-all duration-300 text-white cursor-pointer"
                             style={{
                               background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                               boxShadow: '0 4px 15px rgba(255, 119, 0, 0.4)'
                             }}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.transform = 'translateY(-1px)';
                               e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.5)';
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.transform = 'translateY(0px)';
                               e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 119, 0, 0.4)';
                             }}>
                          Launch Application
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Development Progress */}
            <div className="mt-16 pt-8">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Development Roadmap</h3>
                <p className="text-gray-600">Track our progress as we build the complete platform</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center p-6 rounded-2xl backdrop-blur-sm border border-white/20"
                     style={{
                       background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                     }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                         boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                       }}>
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-2">Phase 1: Complete</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Liquor inventory management system</p>
                </div>
                <div className="text-center p-6 rounded-2xl backdrop-blur-sm border border-white/20"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255, 119, 0, 0.1) 0%, rgba(255, 119, 0, 0.05) 100%)'
                     }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                         boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                       }}>
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-2">Phase 2: In Progress</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Reservations and member database</p>
                </div>
                <div className="text-center p-6 rounded-2xl backdrop-blur-sm border border-white/20"
                     style={{
                       background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)'
                     }}>
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                         boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)'
                       }}>
                    <CreditCard className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-base mb-2">Phase 3: Planned</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">POS system and analytics</p>
                </div>
              </div>
            </div>
              </>
            )}

            {/* Subscription Content */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                {/* Billing Dashboard */}
                <BillingDashboard />

                {/* Team Management */}
                {(userProfile?.role === 'owner' || userProfile?.role === 'manager') && (
                  <TeamManagement />
                )}

                {/* Subscription Management (Legacy) */}
                <SubscriptionManager />

                {/* Advanced Permissions (for power users) */}
                {userProfile?.role === 'owner' && (
                  <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
                       }}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Advanced Permissions</h3>
                    <p className="text-gray-600 mb-6">Fine-tune user roles and access permissions</p>
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