'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface SubscriptionGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ children, fallback }: SubscriptionGuardProps) {
  const { hasValidSubscription, subscription, loading, ready, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wait for auth to be ready
    if (!ready || loading) return

    // If not logged in, don't redirect (login page will handle it)
    if (!user) return

    // If subscription is not valid, redirect to paywall
    if (!hasValidSubscription()) {
      console.log('🚫 Subscription invalid, redirecting to paywall...')
      router.push('/subscription-expired')
    }
  }, [ready, loading, user, hasValidSubscription, router])

  // Show loading state
  if (loading || !ready) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // If not logged in, show children (login page)
  if (!user) {
    return <>{children}</>
  }

  // If subscription is invalid, show nothing (redirecting)
  if (!hasValidSubscription()) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription...</p>
        </div>
      </div>
    )
  }

  // Subscription is valid, show content
  return <>{children}</>
}

// Hook for components that need subscription info
export function useSubscription() {
  const { subscription, hasValidSubscription, isPlatformAdmin } = useAuth()

  return {
    ...subscription,
    hasValidSubscription: hasValidSubscription(),
    isPlatformAdmin: isPlatformAdmin()
  }
}
