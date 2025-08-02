'use client'

import { useState } from 'react'
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Settings, 
  Database,
  Mail,
  Download,
  RefreshCw
} from 'lucide-react'

interface AdminNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function AdminNavigation({ activeTab, onTabChange }: AdminNavigationProps) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Analytics', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'data', label: 'Data Export', icon: Download },
    { id: 'settings', label: 'Admin Settings', icon: Settings }
  ]

  return (
    <div className="bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh All</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>
    </div>
  )
}
