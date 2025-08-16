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
  Grid3X3,
  Crown
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
    { id: 'consumption-sheet', label: 'Consumption Sheet', icon: CreditCard, description: 'Event consumption tracking', route: '/consumption-sheet', status: 'available' },
    { id: 'guest-manager', label: 'Guest Manager', icon: Crown, description: 'Country club guest management', route: '/guest-manager', status: 'available' }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-stone-gray rounded-lg p-3 text-primary shadow-lg hover:bg-surface transition-colors"
        aria-label="Toggle sidebar menu"
      >
        {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-stone-gray shadow-lg z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      } lg:relative lg:translate-x-0 lg:col-span-1`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-stone-gray">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                  <Grid3X3 className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-title text-primary">App Launcher</h1>
                    <p className="text-caption text-secondary">Choose Your App</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-surface text-muted hover:text-primary transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            {!isCollapsed && (
              <div className="card">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm">
                      {userEmail?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-primary font-medium text-caption truncate">{userEmail || 'Guest User'}</p>
                    <p className="text-muted text-xs">App Launcher</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Current Page Indicator */}
            <div className="button-primary w-full group relative flex items-center p-3 rounded-xl border border-accent/20">
              <Home className="h-5 w-5 flex-shrink-0 text-white" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-caption font-medium text-white">App Launcher</p>
                  <p className="text-xs text-white/90">Choose your application</p>
                </div>
              )}

              {/* Active Indicator */}
              <div className="absolute right-3">
                <div className="w-2 h-2 bg-white/80 rounded-full"></div>
              </div>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  App Launcher
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-stone-gray my-3"></div>

            {/* App Links */}
            <div className="space-y-2">
              <div className={`${isCollapsed ? 'text-center' : ''}`}>
                {!isCollapsed && (
                  <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3 px-3">
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
                      className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-surface border border-transparent hover:border-stone-gray"
                    >
                      <Icon className="h-5 w-5 flex-shrink-0 text-accent group-hover:text-primary" />
                      
                      {!isCollapsed && (
                        <div className="ml-3 text-left">
                          <p className="text-caption font-medium text-primary group-hover:text-primary">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted group-hover:text-secondary">
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
                      <Icon className="h-5 w-5 flex-shrink-0 text-muted" />
                      
                      {!isCollapsed && (
                        <div className="ml-3 text-left">
                          <p className="text-caption font-medium text-muted">
                            {item.label}
                          </p>
                          <p className="text-xs text-muted">
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
          <div className="p-4 border-t border-stone-gray">
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