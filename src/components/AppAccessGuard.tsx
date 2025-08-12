'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useAuth } from '@/lib/auth-context'
import { checkUserAppAccess, UserAccess } from '@/lib/permissions'
import { startTrial, AppId } from '@/lib/subscription-access'
import { Package, Calendar, Users, CreditCard, Clock, Shield } from 'lucide-react'

interface AppAccessGuardProps {
  children: ReactNode
  appId: AppId
  appName: string
  fallback?: ReactNode
}

const APP_ICONS = {
  'liquor-inventory': Package,
  'reservation-management': Calendar,
  'member-database': Users,
  'pos-system': CreditCard
}

const APP_COLORS = {
  'liquor-inventory': 'from-blue-500 to-cyan-500',
  'reservation-management': 'from-purple-500 to-pink-500',
  'member-database': 'from-green-500 to-emerald-500',
  'pos-system': 'from-orange-500 to-red-500'
}

export default function AppAccessGuard({ children, appId, appName, fallback }: AppAccessGuardProps) {
  const { user, organization, isPlatformAdmin } = useAuth()
  const [accessStatus, setAccessStatus] = useState<UserAccess | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingTrial, setStartingTrial] = useState(false)

  // Check for admin user - but don't early return to avoid hooks error
  const isAdminUser = user?.email === 'alejogaleis@gmail.com'
  
  if (isAdminUser) {
    console.log('🚨 ADMIN USER DETECTED - FULL ACCESS GRANTED!')
  }

  const IconComponent = APP_ICONS[appId]
  const colorClass = APP_COLORS[appId]

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        console.log('❌ No user found')
        setLoading(false)
        return
      }
      
      // Platform admin bypass - skip all subscription checks
      if (isPlatformAdmin()) {
        console.log('✅ PLATFORM ADMIN DETECTED - BYPASSING ALL CHECKS!')
        setAccessStatus({
          hasAppAccess: true,
          permissions: ['view', 'create', 'edit', 'delete', 'export', 'admin'],
          isTrialExpired: false,
          isSubscriptionActive: true,
          subscriptionType: 'bundle'
        })
        setLoading(false)
        return
      }
      
      if (!organization?.id) {
        console.log('❌ Missing organization:', {
          hasUser: !!user,
          hasOrg: !!organization?.id,
          userEmail: user?.email,
          orgId: organization?.id
        })
        setLoading(false)
        return
      }
      
      console.log(`🔐 AppAccessGuard Debug - Checking access for ${appId}`)
      console.log('👤 User Details:', {
        id: user.id,
        email: user.email,
        isPlatformAdmin: isPlatformAdmin()
      })
      console.log('🏢 Organization Details:', {
        id: organization.id,
        name: organization.Name
      })
      
      const access = await checkUserAppAccess(
        user.id, 
        organization.id.toString(), 
        appId,
        user.email
      )
      
      console.log(`📊 Access result for ${appId}:`, access)
      setAccessStatus(access)
      setLoading(false)
    }

    checkAccess()
  }, [organization?.id, user, appId, isPlatformAdmin])

  const handleStartTrial = async () => {
    if (!organization?.id) return
    
    setStartingTrial(true)
    console.log(`🆓 Starting trial for ${appId}...`)
    
    const success = await startTrial(organization.id.toString(), appId)
    if (success) {
      // Refresh access status
      const access = await checkUserAppAccess(
        user!.id,
        organization.id.toString(),
        appId,
        user!.email
      )
      setAccessStatus(access)
    }
    setStartingTrial(false)
  }

  const handleSubscribe = () => {
    console.log('🚀 Redirecting to subscription management...')
    window.location.href = '/apps?tab=subscription'
  }

  if (loading) {
    if (fallback) return <>{fallback}</>
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200">
            <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mx-auto mb-6`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{appName}</h2>
            <div className="flex items-center justify-center space-x-2 text-slate-600">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Checking access...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || (!organization && !isAdminUser)) {
    console.log('🔍 AppAccessGuard Debug:', {
      user: user ? 'exists' : 'null',
      organization: organization ? 'exists' : 'null',
      userEmail: user?.email,
      orgName: organization?.Name,
      userId: user?.id,
      userProfile: user ? 'exists' : 'null',
      isAdminUser: isAdminUser
    })
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Authentication Required</h2>
            <p className="text-slate-600 mb-6">You need to be logged in and part of an organization to access this app.</p>
            <div className="text-xs text-gray-500 mb-4">
              Debug: User: {user ? '✅' : '❌'} | Org: {organization ? '✅' : '❌'}
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 w-full"
              >
                Go to Login
              </button>
              <button 
                onClick={() => {
                  console.log('🔄 Force refreshing page...')
                  window.location.reload()
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 w-full"
              >
                Force Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!accessStatus?.hasAppAccess && !isAdminUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200">
            <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-xl flex items-center justify-center mx-auto mb-6`}>
              <IconComponent className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{appName}</h2>
            
            {accessStatus?.reason && (
              <p className="text-sm text-slate-500 mb-4">
                {accessStatus.reason}
              </p>
            )}
            
            {accessStatus?.isTrialExpired ? (
              <div>
                <p className="text-slate-600 mb-6">
                  {accessStatus.trialDaysRemaining !== undefined 
                    ? `Your trial expired. Subscribe to continue using ${appName.toLowerCase()}.`
                    : `You need an active subscription to access ${appName.toLowerCase()}.`
                  }
                </p>
                <button 
                  onClick={handleSubscribe}
                  className={`bg-gradient-to-r ${colorClass} text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 transform hover:scale-105`}
                >
                  Subscribe Now
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-600 mb-6">
                  Start your 14-day free trial to access {appName.toLowerCase()}.
                </p>
                <button
                  onClick={handleStartTrial}
                  disabled={startingTrial}
                  className={`bg-gradient-to-r ${colorClass} text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {startingTrial ? 'Starting Trial...' : 'Start Free Trial'}
                </button>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <button 
                onClick={() => window.location.href = '/apps'}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
              >
                ← Back to Apps
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User has access - render the protected content
  return <>{children}</>
}
