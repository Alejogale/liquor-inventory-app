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
  CreditCard,
  Mail
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
    { id: 'subscription', label: 'Billing & Account', icon: CreditCard, description: 'Manage subscription & billing' }
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-slate-200 rounded-lg p-3 text-slate-800 shadow-lg hover:bg-slate-50 transition-colors"
        aria-label="Toggle sidebar menu"
      >
        {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full border-r border-white/20 shadow-2xl z-40 transition-all duration-300 backdrop-blur-xl ${
        isCollapsed ? 'w-20' : 'w-80'
      } lg:relative lg:translate-x-0 lg:col-span-1`}
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 25px 50px rgba(255, 119, 0, 0.1)'
           }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-orange-100/50">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                     style={{
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                       boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                     }}>
                  <Package className="h-7 w-7 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Liquor Inventory</h1>
                    <p className="text-gray-600 text-sm">Management System</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-slate-50 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            {!isCollapsed && (
              <div className="mt-6 p-4 rounded-2xl border border-white/30 backdrop-blur-sm"
                   style={{
                     background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,247,237,0.5) 100%)'
                   }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                       style={{
                         background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                       }}>
                    <span className="text-white font-bold text-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-semibold text-sm truncate">{userEmail}</p>
                    <p className="text-gray-600 text-xs">Dashboard User</p>
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
                  className={`w-full group relative flex items-center p-3 rounded-xl transition-all duration-300 border ${
                    isActive
                      ? 'button-primary border-accent/20'
                      : 'border-transparent bg-surface hover:bg-white/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-secondary group-hover:text-primary'
                  }`} />
                  
                  {!isCollapsed && (
                    <div className="ml-3 text-left">
                      <p className={`text-sm font-semibold ${
                        isActive ? 'text-white' : 'text-primary group-hover:text-primary'
                      }`}>
                        {item.label}
                      </p>
                      <p className={`text-xs ${
                        isActive ? 'text-white/90' : 'text-muted group-hover:text-secondary'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  )}

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="absolute right-3">
                      <div className="w-2 h-2 bg-white/80 rounded-full shadow-sm"></div>
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
          <div className="p-4 border-t border-orange-100/50 space-y-3">
            {/* Admin Button */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 text-white shadow-lg ${
                  isCollapsed ? 'justify-center' : ''
                }`}
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
                }}
              >
                <Crown className="h-5 w-5 text-white flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3 text-white font-semibold text-sm">Admin Dashboard</span>
                )}
              </Link>
            )}

            {/* Home Button */}
            <Link
              href="/"
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              style={{
                background: 'rgba(255,255,255,0.5)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
              }}
            >
              <Home className="h-5 w-5 text-gray-600 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-gray-700 text-sm font-medium">Back to Home</span>
              )}
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={onSignOut}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-200 ${
                isCollapsed ? 'justify-center' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.7) 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%)';
              }}
            >
              <LogOut className="h-5 w-5 text-red-500 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 text-red-600 text-sm font-medium">Sign Out</span>
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
