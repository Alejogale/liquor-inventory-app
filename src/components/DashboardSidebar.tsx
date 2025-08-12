'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Package,
  Users,
  ShoppingCart,
  Building2,
  ClipboardList,
  Crown,
  MapPin,
  Activity,
  Menu,
  X,
  LogOut,
  Home,
  Upload,
  Settings,
  BarChart3,
  CreditCard
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isAdmin: boolean
  userEmail: string
  onSignOut: () => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function DashboardSidebar({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  userEmail, 
  onSignOut,
  onCollapsedChange
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Notify parent when collapsed state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  const navigationItems = [
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage items & stock' },
    { id: 'import', label: 'Import Data', icon: Upload, description: 'Bulk upload via CSV' },
    { id: 'categories', label: 'Categories', icon: ClipboardList, description: 'Product categories' },
    { id: 'suppliers', label: 'Suppliers', icon: Users, description: 'Vendor management' },
    { id: 'rooms', label: 'Rooms', icon: MapPin, description: 'Location setup' },
    { id: 'count', label: 'Count', icon: Building2, description: 'Room counting' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, description: 'Order reports' },
    { id: 'activity', label: 'Activity & Reports', icon: Activity, description: 'Analytics, logs & CSV export' },
    { id: 'integrations', label: 'Integrations', icon: Settings, description: 'QuickBooks & more' },
    { id: 'subscription', label: 'Team & Billing', icon: CreditCard, description: 'Manage subscription & team' }
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
                  <Package className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">LiquorTrack</h1>
                    <p className="text-slate-600 text-sm">Inventory System</p>
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
                    <p className="text-slate-600 text-xs">Dashboard User</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Back to Apps Link */}
            <Link
              href="/apps"
              className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 border border-transparent hover:border-purple-200"
            >
              <Home className="h-5 w-5 flex-shrink-0 text-purple-600 group-hover:text-purple-700" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-purple-700 group-hover:text-purple-800">
                    Back to Apps
                  </p>
                  <p className="text-xs text-purple-600 group-hover:text-purple-700">
                    App launcher
                  </p>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Back to Apps
                </div>
              )}
            </Link>

            {/* Divider */}
            <div className="border-t border-slate-200 my-3"></div>

            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] border border-[var(--accent-orange-400)] shadow-lg text-white'
                      : 'hover:bg-[var(--accent-orange-50)] border border-transparent'
                  }`
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'
                  }`} />
                  
                  {!isCollapsed && (
                    <div className="ml-3 text-left">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-slate-800 group-hover:text-slate-900'
                      }`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-white/90' : 'text-slate-700 group-hover:text-slate-800'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute right-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-blue-200 space-y-2">
            {/* Admin Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`w-full flex items-center p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 border border-yellow-400 hover:from-yellow-600 hover:to-orange-600 transition-all text-white ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <Crown className="h-5 w-5 text-white flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 text-white font-medium text-sm">Admin Dashboard</span>
                )}
              </Link>
            )}

            {/* Home Button */}
            <Link
              href="/"
              className={`w-full flex items-center p-3 rounded-xl hover:bg-blue-50 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Home className="h-5 w-5 text-slate-600 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-slate-600 text-sm">Back to Home</span>
              )}
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className={`w-full flex items-center p-3 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-200 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 text-red-500 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-red-500 text-sm">Sign Out</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  )
}
