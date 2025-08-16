'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  BarChart3,
  Settings,
  Mail,
  Plus,
  Eye,
  Clock,
  Users,
  FileText,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Package,
  AlertCircle
} from 'lucide-react'

interface ConsumptionSidebarProps {
  userEmail: string
  onSignOut: () => void
  activeView: 'tracking' | 'configuration' | 'emails' | 'reports' | 'analytics'
  onViewChange: (view: 'tracking' | 'configuration' | 'emails' | 'reports' | 'analytics') => void
  organizationName?: string
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function ConsumptionSidebar({
  userEmail,
  onSignOut,
  activeView,
  onViewChange,
  organizationName,
  isCollapsed = false,
  onCollapsedChange
}: ConsumptionSidebarProps) {
  const [isCollapsedLocal, setIsCollapsedLocal] = useState(isCollapsed)

  const toggleCollapse = () => {
    const newCollapsed = !isCollapsedLocal
    setIsCollapsedLocal(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  const consumptionFeatures = [
    {
      id: 'tracking',
      name: 'Live Tracking',
      description: 'Track consumption in real-time',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      count: 3 // Active windows count
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'View consumption reports',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      count: null
    },
    {
      id: 'configuration',
      name: 'Categories & Brands',
      description: 'Manage inventory items',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      count: null
    },
    {
      id: 'emails',
      name: 'Manager Emails',
      description: 'Configure report recipients',
      icon: Mail,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      count: 5 // Email count
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Generate consumption reports',
      icon: FileText,
      color: 'text-slate-600',
      bgColor: 'bg-slate-100',
      count: null
    }
  ]

  const quickActions = [
    {
      name: 'New Event',
      icon: Plus,
      color: 'text-green-600',
      action: () => console.log('New Event')
    },
    {
      name: 'Send Report',
      icon: Mail,
      color: 'text-blue-600',
      action: () => console.log('Send Report')
    },
    {
      name: 'View Stats',
      icon: TrendingUp,
      color: 'text-purple-600',
      action: () => onViewChange('analytics')
    }
  ]

  return (
    <div className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ${
      isCollapsedLocal ? 'w-20' : 'w-80'
    } fixed left-0 top-0 h-full z-30`}>
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          {!isCollapsedLocal && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                   style={{
                     background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                   }}>
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg">Consumption</h1>
                <p className="text-slate-500 text-xs">{organizationName || 'Live Tracking'}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={toggleCollapse}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isCollapsedLocal ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Back to Apps */}
        {!isCollapsedLocal && (
          <div className="mb-6">
            <Link 
              href="/apps"
              className="flex items-center space-x-3 text-slate-600 hover:text-slate-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back to Apps</span>
            </Link>
          </div>
        )}

        {/* Consumption Features */}
        <div className="space-y-2">
          {!isCollapsedLocal && (
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Consumption Features
            </h3>
          )}
          
          {consumptionFeatures.map((feature) => {
            const isActive = activeView === feature.id
            return (
              <button
                key={feature.id}
                onClick={() => onViewChange(feature.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-white/20' : feature.bgColor
                }`}>
                  <feature.icon className={`w-4 h-4 ${
                    isActive ? 'text-white' : feature.color
                  }`} />
                </div>
                
                {!isCollapsedLocal && (
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{feature.name}</div>
                        <div className={`text-xs ${
                          isActive ? 'text-slate-300' : 'text-slate-500'
                        }`}>
                          {feature.description}
                        </div>
                      </div>
                      {feature.count && (
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {feature.count}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        {!isCollapsedLocal && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                    <action.icon className={`w-3 h-3 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Status Section */}
        {!isCollapsedLocal && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">Live Connection</span>
            </div>
            <p className="text-xs text-green-600">Real-time inventory tracking active</p>
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="border-t border-slate-200 p-4">
        {!isCollapsedLocal && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {userEmail?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-800 font-medium text-sm truncate">{userEmail || 'Guest User'}</p>
                <p className="text-slate-600 text-xs">Consumption Manager</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={onSignOut}
          className={`w-full flex items-center space-x-3 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
            isCollapsedLocal ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsedLocal && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  )
}