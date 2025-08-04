'use client'

import { useState } from 'react'
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
  Settings
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  isAdmin: boolean
  userEmail: string
  onSignOut: () => void
}

export default function DashboardSidebar({ 
  activeTab, 
  setActiveTab, 
  isAdmin, 
  userEmail, 
  onSignOut 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Manage items & stock' },
    { id: 'import', label: 'Import Data', icon: Upload, description: 'Bulk upload via CSV' },
    { id: 'categories', label: 'Categories', icon: ClipboardList, description: 'Product categories' },
    { id: 'suppliers', label: 'Suppliers', icon: Users, description: 'Vendor management' },
    { id: 'rooms', label: 'Rooms', icon: MapPin, description: 'Location setup' },
    { id: 'count', label: 'Count', icon: Building2, description: 'Room counting' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, description: 'Order reports' },
    { id: 'activity', label: 'Reports', icon: Activity, description: 'Analytics & logs' },
    { id: 'integrations', label: 'Integrations', icon: Settings, description: 'QuickBooks & more' }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-2 text-white"
      >
        {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/10 backdrop-blur-md border-r border-white/20 z-40 transition-all duration-300 ${
        isCollapsed ? '-translate-x-full lg:w-20' : 'w-80 lg:w-80'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-white">LiquorTrack</h1>
                    <p className="text-white/60 text-sm">Inventory System</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            {!isCollapsed && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{userEmail}</p>
                    <p className="text-white/60 text-xs">Dashboard User</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/50 to-purple-600/50 border border-blue-400/30 shadow-lg'
                      : 'hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-white/60 group-hover:text-white'
                  }`} />
                  
                  {!isCollapsed && (
                    <div className="ml-3 text-left">
                      <p className={`text-sm font-medium ${
                        isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                      }`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-white/70' : 'text-white/50 group-hover:text-white/70'
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
          <div className="p-4 border-t border-white/20 space-y-2">
            {/* Admin Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`w-full flex items-center p-3 rounded-xl bg-gradient-to-r from-yellow-600/50 to-orange-600/50 border border-yellow-400/30 hover:from-yellow-600/70 hover:to-orange-600/70 transition-all ${
                  isCollapsed ? 'justify-center' : ''
                }`}
              >
                <Crown className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 text-white font-medium text-sm">Admin Dashboard</span>
                )}
              </Link>
            )}

            {/* Home Button */}
            <Link
              href="/"
              className={`w-full flex items-center p-3 rounded-xl hover:bg-white/10 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <Home className="h-5 w-5 text-white/60 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-white/80 text-sm">Back to Home</span>
              )}
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className={`w-full flex items-center p-3 rounded-xl hover:bg-red-600/20 border border-transparent hover:border-red-500/30 transition-all ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5 text-red-400 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-red-400 text-sm">Sign Out</span>
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
