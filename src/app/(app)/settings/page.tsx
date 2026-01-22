'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { User, Shield, Bell, ArrowLeft, CreditCard } from 'lucide-react'
import ProfileSettings from '@/components/settings/ProfileSettings'
import SecuritySettings from '@/components/settings/SecuritySettings'
import BillingSettings from '@/components/settings/BillingSettings'

type SettingsTab = 'profile' | 'security' | 'billing' | 'notifications'

export default function SettingsPage() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User, description: 'Manage your personal information' },
    { id: 'security' as const, label: 'Security', icon: Shield, description: 'Password and two-factor authentication' },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard, description: 'Manage subscription and payments' },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Email preferences (coming soon)' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-slate-50/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {activeTab === 'profile' && (
            <ProfileSettings user={user} userProfile={userProfile} />
          )}
          {activeTab === 'security' && (
            <SecuritySettings user={user} userProfile={userProfile} />
          )}
          {activeTab === 'billing' && (
            <BillingSettings />
          )}
          {activeTab === 'notifications' && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
              <p className="text-gray-500">Email notification settings coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
