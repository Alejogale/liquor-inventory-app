'use client'

import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CreditCard, LogOut, ArrowRight } from 'lucide-react'

export default function SubscriptionExpiredPage() {
  const { organization, subscription, signOut, user, isPlatformAdmin } = useAuth()
  const router = useRouter()

  // Handle redirects in useEffect to avoid React render errors
  useEffect(() => {
    // If platform admin somehow lands here, redirect to apps
    if (isPlatformAdmin()) {
      router.push('/apps')
      return
    }

    // If subscription is actually valid, redirect to apps
    if (subscription.isValid) {
      router.push('/apps')
      return
    }
  }, [isPlatformAdmin, subscription.isValid, router])

  // Show loading while checking redirects
  if (isPlatformAdmin() || subscription.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleUpgrade = () => {
    // TODO: Redirect to Stripe checkout or pricing page
    router.push('/pricing')
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {subscription.status === 'expired' ? 'Trial Expired' : 'Subscription Inactive'}
          </h1>

          {/* Organization name */}
          {organization && (
            <p className="text-gray-500 mb-6">
              {organization.Name}
            </p>
          )}

          {/* Message */}
          <p className="text-gray-600 mb-8">
            {subscription.status === 'expired'
              ? 'Your 30-day free trial has ended. Upgrade now to continue using all features and keep your data safe.'
              : 'Your subscription is no longer active. Please update your payment method to continue.'}
          </p>

          {/* Trial info if applicable */}
          {subscription.trialEndsAt && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
              Trial ended on {subscription.trialEndsAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleUpgrade}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
          >
            <CreditCard className="w-5 h-5" />
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Features reminder */}
          <div className="border-t border-gray-100 pt-6 mt-6">
            <p className="text-sm text-gray-500 mb-4">With a subscription you get:</p>
            <ul className="text-sm text-gray-600 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Unlimited inventory tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Team management & permissions
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Advanced reporting & analytics
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Priority support
              </li>
            </ul>
          </div>

          {/* Sign out link */}
          <button
            onClick={handleSignOut}
            className="mt-6 text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>

          {/* User info */}
          {user?.email && (
            <p className="mt-4 text-xs text-gray-400">
              Signed in as {user.email}
            </p>
          )}
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Questions? Contact us at{' '}
          <a href="mailto:support@invyeasy.com" className="text-blue-600 hover:underline">
            support@invyeasy.com
          </a>
        </p>
      </div>
    </div>
  )
}
