'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Package, ArrowRight, Lock, Sparkles, LogOut, ExternalLink, Mail, Wine, Users } from 'lucide-react'
import Link from 'next/link'

interface AppInfo {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  href: string
  color: string
  gradient: string
  available: boolean
  comingSoon?: boolean
}

export default function AppsPage() {
  const router = useRouter()
  const { user, userProfile, organization, loading, isSubscriptionActive, signOut } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Role-based access control
  const isOwner = userProfile?.role === 'owner'
  const isManager = userProfile?.role === 'manager'
  const canManageTeam = isOwner || isManager

  // Define available apps
  const apps: AppInfo[] = [
    {
      id: 'invyeasy',
      name: 'InvyEasy',
      description: 'Liquor inventory management for bars and restaurants',
      icon: <Package className="w-10 h-10" />,
      href: '/dashboard',
      color: 'text-orange-500',
      gradient: 'from-orange-500 to-amber-500',
      available: isSubscriptionActive || organization?.is_grandfathered === true,
    },
    {
      id: 'consumption-tracker',
      name: 'Consumption Tracker',
      description: 'Track drink consumption at events',
      icon: <Wine className="w-10 h-10" />,
      href: '/consumption',
      color: 'text-teal-500',
      gradient: 'from-teal-500 to-cyan-500',
      available: isSubscriptionActive || organization?.is_grandfathered === true,
    },
    // Future apps can be added here
    {
      id: 'coming-soon-1',
      name: 'Coming Soon',
      description: 'More apps are on the way',
      icon: <Sparkles className="w-10 h-10" />,
      href: '#',
      color: 'text-purple-500',
      gradient: 'from-purple-500 to-pink-500',
      available: false,
      comingSoon: true,
    },
  ]

  const handleAppClick = (app: AppInfo) => {
    if (app.comingSoon) return

    if (!app.available) {
      // Redirect to subscription page if app not available
      router.push('/subscription-expired')
      return
    }

    router.push(app.href)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <nav className="px-6 py-4 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">InvyEasy</span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Website</span>
            </Link>
            <Link
              href="mailto:support@invyeasy.com"
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Contact</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-12 pb-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Welcome back{user?.user_metadata?.first_name ? `, ${user.user_metadata.first_name}` : ''}
          </h1>
          <p className="text-slate-400 text-lg">
            {organization?.Name || 'Select an app to get started'}
          </p>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="px-6 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {apps.map((app) => (
              <button
                key={app.id}
                onClick={() => handleAppClick(app)}
                disabled={app.comingSoon}
                className={`group relative flex flex-col items-center p-6 rounded-3xl transition-all duration-300 ${
                  app.comingSoon
                    ? 'bg-slate-800/50 cursor-not-allowed'
                    : app.available
                    ? 'bg-slate-800/80 hover:bg-slate-700/80 hover:scale-105 hover:shadow-2xl cursor-pointer'
                    : 'bg-slate-800/50 cursor-pointer hover:bg-slate-700/50'
                }`}
              >
                {/* App Icon */}
                <div
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 ${
                    app.comingSoon
                      ? 'bg-slate-700'
                      : `bg-gradient-to-br ${app.gradient}`
                  } ${!app.comingSoon && app.available ? 'group-hover:scale-110' : ''}`}
                >
                  <div className={app.comingSoon ? 'text-slate-500' : 'text-white'}>
                    {app.icon}
                  </div>
                </div>

                {/* App Name */}
                <h3 className={`text-lg font-semibold mb-1 ${
                  app.comingSoon ? 'text-slate-500' : 'text-white'
                }`}>
                  {app.name}
                </h3>

                {/* App Description */}
                <p className={`text-sm text-center ${
                  app.comingSoon ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {app.description}
                </p>

                {/* Status Badge */}
                {app.comingSoon ? (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-slate-700 rounded-full">
                    <span className="text-xs text-slate-400">Soon</span>
                  </div>
                ) : !app.available ? (
                  <div className="absolute top-3 right-3 p-1.5 bg-slate-700 rounded-full">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 p-1.5 bg-green-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3.5 h-3.5 text-green-400" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Organization Section - Only for Owners/Managers */}
          {canManageTeam && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Organization</h2>
              <Link
                href="/team"
                className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Team Members</h3>
                  <p className="text-sm text-slate-400">Manage team access & roles</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            {organization?.Name}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="mailto:support@invyeasy.com"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Contact Support
            </Link>
            <button
              onClick={() => router.push('/settings')}
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
