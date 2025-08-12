'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Users,
  Calendar,
  CreditCard,
  Building2,
  Menu,
  X,
  LogOut,
  Home,
  Grid3X3
} from 'lucide-react'

interface AppsSidebarProps {
  userEmail: string
  onSignOut: () => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function AppsSidebar({ 
  userEmail, 
  onSignOut,
  onCollapsedChange
}: AppsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Notify parent when collapsed state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  const appItems = [
    { id: 'liquor-inventory', label: 'Liquor Inventory', icon: Package, description: 'Manage inventory & stock', route: '/dashboard', status: 'available' },
    { id: 'reservation-system', label: 'Reservations', icon: Calendar, description: 'Table & room booking', route: '/reservations', status: 'available' },
    { id: 'member-database', label: 'Member Database', icon: Users, description: 'Member management', status: 'coming_soon' },
    { id: 'pos-system', label: 'POS System', icon: CreditCard, description: 'Point of sale', status: 'planned' }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-xl border border-[var(--accent-orange-200)] rounded-lg p-3 text-slate-800 shadow-lg hover:bg-[var(--accent-orange-50)] transition-colors"
        aria-label="Toggle sidebar menu"
      >
        {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/70 backdrop-blur-xl border-r border-[var(--accent-orange-200)] shadow-lg z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      } lg:relative lg:translate-x-0 lg:col-span-1`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-orange-600)] to-[var(--accent-orange-500)] rounded-xl flex items-center justify-center">
                  <Grid3X3 className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">App Launcher</h1>
                    <p className="text-slate-600 text-sm">Choose Your App</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            {!isCollapsed && (
              <div className="mt-4 p-3 bg-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium text-sm truncate">{userEmail}</p>
                    <p className="text-slate-600 text-xs">App Launcher</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Current Page Indicator */}
            <div className="w-full group relative flex items-center p-3 rounded-xl bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] border border-[var(--accent-orange-400)] shadow-lg text-white">
              <Home className="h-5 w-5 flex-shrink-0 text-white" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-white">App Launcher</p>
                  <p className="text-xs text-white/90">Choose your application</p>
                </div>
              )}

              {/* Active Indicator */}
              <div className="absolute right-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  App Launcher
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-200 my-3"></div>

            {/* App Links */}
            <div className="space-y-2">
              <div className={`${isCollapsed ? 'text-center' : ''}`}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                    Available Apps
                  </h3>
                )}
              </div>

              {appItems.map((item) => {
                const Icon = item.icon
                const isAvailable = item.status === 'available'
                
                if (isAvailable) {
                  return (
                    <Link
                      key={item.id}
                      href={item.route || '#'}
                      className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-[var(--accent-orange-50)] border border-transparent hover:border-[var(--accent-orange-200)]"
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 text-green-600 group-hover:text-green-700" />
                      
                      {!isCollapsed && (
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-green-700 group-hover:text-green-800">
                            {item.label}
                          </p>
                          <p className="text-xs text-green-600 group-hover:text-green-700">
                            {item.description}
                          </p>
                        </div>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  )
                } else {
                  return (
                    <div
                      key={item.id}
                      className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 opacity-60 cursor-not-allowed"
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 text-slate-400" />
                      
                      {!isCollapsed && (
                        <div className="ml-3 text-left">
                          <p className="text-sm font-medium text-slate-500">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.status === 'coming_soon' ? 'Coming Soon' : 'Planned'}
                          </p>
                        </div>
                      )}

                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                          {item.label} ({item.status === 'coming_soon' ? 'Coming Soon' : 'Planned'})
                        </div>
                      )}
                    </div>
                  )
                }
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-blue-200">
            <button
              onClick={onSignOut}
              className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-red-50 border border-transparent hover:border-red-200 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs opacity-75">Exit application</p>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Sign Out
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}