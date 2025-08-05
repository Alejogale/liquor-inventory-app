'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import AdminNavigation from './AdminNavigation'
import AdminDashboard from './AdminDashboard'
import UserAnalytics from './UserAnalytics'
import RevenueAnalytics from './RevenueAnalytics'
import DataExport from './DataExport'
import AdminSettings from './AdminSettings'

export default function ComprehensiveAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboard />
      case 'users':
        return <UserAnalytics />
      case 'revenue':
        return <RevenueAnalytics />
      case 'data':
        return <DataExport />
      case 'settings':
        return <AdminSettings />
      default:
        return <AdminDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-blue-200 shadow-lg px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/dashboard"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          </div>
        </div>
      </div>

      <AdminNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="transition-all duration-300">
        {renderActiveTab()}
      </div>
    </div>
  )
}
