'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import PlatformHeader from './PlatformHeader'
import PlatformSidebar from './PlatformSidebar'
import AppSwitcher from './AppSwitcher'
import { useToast } from '@/components/ui/Toast'

interface PlatformLayoutProps {
  children: React.ReactNode
  currentApp?: string
  showAppSwitcher?: boolean
}

export default function PlatformLayout({ 
  children, 
  currentApp,
  showAppSwitcher = true 
}: PlatformLayoutProps) {
  const { user, userProfile, organization, loading, signOut } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading platform...</p>
        </div>
      </div>
    )
  }

  // Show error state if no user
  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Platform Header */}
      <PlatformHeader 
        user={user}
        userProfile={userProfile}
        organization={organization}
        onSignOut={async () => { try { await signOut(); showToast({ variant: 'success', message: 'Signed out successfully.' }) } catch { showToast({ variant: 'error', message: 'Sign out failed.' }) } }}
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex">
        {/* Platform Sidebar */}
        <PlatformSidebar 
          user={user}
          userProfile={userProfile}
          organization={organization}
          currentApp={currentApp}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          showMobileMenu={showMobileMenu}
          onMobileMenuClose={() => setShowMobileMenu(false)}
          onSignOut={async () => { try { await signOut(); showToast({ variant: 'success', message: 'Signed out successfully.' }) } catch { showToast({ variant: 'error', message: 'Sign out failed.' }) } }}
        />

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'
        }`}>
          {/* App Switcher (if enabled) */}
          {showAppSwitcher && (
            <AppSwitcher 
              currentApp={currentApp}
              userProfile={userProfile}
              organization={organization}
            />
          )}

          {/* Page Content */}
          <main className="p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  )
}
