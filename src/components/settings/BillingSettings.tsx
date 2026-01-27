'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Loader2,
  XCircle,
  RefreshCw,
  Settings,
  ArrowUpDown,
  Calendar,
  Users,
  Package,
  ExternalLink,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface BillingData {
  organization: {
    id: string
    name: string
    plan: string
    status: string
    hasStripeSubscription: boolean
    currentPeriodStart: string
    currentPeriodEnd: string
  }
  usage: {
    activeUsers: { current: number; limit: number }
    inventoryItems: { current: number; limit: number }
    storageAreas: { current: number; limit: number }
  }
  planLimits: {
    maxUsers: number
    maxItems: number
    maxStorageAreas: number
    features: string[]
  }
}

export default function BillingSettings() {
  const { user, organization, userProfile } = useAuth()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)

  // Loading states
  const [cancelLoading, setCancelLoading] = useState(false)
  const [reactivateLoading, setReactivateLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [planChangeLoading, setPlanChangeLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const isOwner = userProfile?.role === 'owner'

  useEffect(() => {
    if (user?.id && organization?.id) {
      fetchBillingData()
    }
  }, [user?.id, organization?.id])

  const fetchBillingData = async () => {
    if (!user || !organization) return

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/billing/usage?userId=${user.id}&organizationId=${organization.id}`)
      if (response.ok) {
        const data = await response.json()
        setBillingData(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load billing data')
      }
    } catch (err) {
      setError('Failed to load billing data')
      console.error('Error fetching billing data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenBillingPortal = async () => {
    if (!user || !organization) return

    setPortalLoading(true)
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          organizationId: organization.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to open billing portal')
      }

      window.location.href = result.url
    } catch (error: any) {
      console.error('Error opening billing portal:', error)
      alert(error.message || 'Failed to open billing portal')
    } finally {
      setPortalLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user || !organization) return

    setCancelLoading(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          organizationId: organization.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel subscription')
      }

      alert(`Subscription will be cancelled on ${new Date(result.cancelAt).toLocaleDateString()}. You will keep access until then.`)
      setShowCancelModal(false)
      fetchBillingData()
    } catch (error: any) {
      console.error('Error cancelling subscription:', error)
      alert(error.message || 'Failed to cancel subscription')
    } finally {
      setCancelLoading(false)
    }
  }

  const handleReactivateSubscription = async () => {
    if (!user || !organization) return

    setReactivateLoading(true)
    try {
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          organizationId: organization.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to reactivate subscription')
      }

      alert('Subscription has been reactivated!')
      fetchBillingData()
    } catch (error: any) {
      console.error('Error reactivating subscription:', error)
      alert(error.message || 'Failed to reactivate subscription')
    } finally {
      setReactivateLoading(false)
    }
  }

  const handleChangePlan = async () => {
    if (!user || !organization || !selectedPlan) return

    setPlanChangeLoading(true)
    try {
      const response = await fetch('/api/stripe/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          organizationId: organization.id,
          newPlan: selectedPlan
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change plan')
      }

      alert(`Plan changed to ${selectedPlan}!`)
      setShowPlanModal(false)
      setSelectedPlan(null)
      fetchBillingData()
    } catch (error: any) {
      console.error('Error changing plan:', error)
      alert(error.message || 'Failed to change plan')
    } finally {
      setPlanChangeLoading(false)
    }
  }

  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Billing Access Restricted</h3>
        <p className="text-gray-500">Only organization owners can manage billing settings.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Billing</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchBillingData}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      {billingData && (
        <div className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {billingData.organization.plan} Plan
              </h3>
              <p className="text-gray-600 text-sm">Your current subscription</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              billingData.organization.status === 'active'
                ? 'bg-green-100 text-green-800'
                : billingData.organization.status === 'cancelling'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {billingData.organization.status === 'cancelling' ? 'Cancelling' : billingData.organization.status}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {billingData.usage.activeUsers.current} / {billingData.planLimits.maxUsers === -1 ? '∞' : billingData.planLimits.maxUsers} users
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {billingData.usage.inventoryItems.current} / {billingData.planLimits.maxItems === -1 ? '∞' : billingData.planLimits.maxItems} items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">
                {billingData.organization.currentPeriodEnd
                  ? `Renews ${new Date(billingData.organization.currentPeriodEnd).toLocaleDateString()}`
                  : 'No billing date'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Warning */}
      {billingData?.organization.status === 'cancelling' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Subscription Ending Soon</h4>
              <p className="text-sm text-amber-700 mt-1">
                Your subscription will end on {billingData.organization.currentPeriodEnd
                  ? new Date(billingData.organization.currentPeriodEnd).toLocaleDateString()
                  : 'the end of your billing period'}.
                You'll keep access until then.
              </p>
              <button
                onClick={handleReactivateSubscription}
                disabled={reactivateLoading}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {reactivateLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Reactivate Subscription
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscribe CTA - Show if on trial or no active subscription */}
      {billingData && (billingData.organization.status === 'trial' || billingData.organization.status === 'expired' || billingData.organization.status !== 'active') && (
        <div className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                {billingData?.organization.status === 'trial' ? 'Upgrade Your Plan' : 'Subscribe to InvyEasy'}
              </h3>
              <p className="text-white/90 text-sm mb-4">
                {billingData?.organization.status === 'trial'
                  ? 'Your trial is active. Subscribe now to keep access when it ends.'
                  : 'Choose a plan that fits your business needs and unlock all features.'}
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                View Plans & Subscribe
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Manage Subscription</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Manage Payment */}
          <div className="p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-gray-600" />
              <h5 className="font-medium text-gray-900">Payment Method</h5>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Update your card or payment details.
            </p>
            <button
              onClick={handleOpenBillingPortal}
              disabled={portalLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {portalLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Opening...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Manage Payment
                </>
              )}
            </button>
          </div>

          {/* Change Plan */}
          {billingData?.organization.status === 'active' && (
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <ArrowUpDown className="w-5 h-5 text-gray-600" />
                <h5 className="font-medium text-gray-900">Change Plan</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Upgrade or downgrade your plan.
              </p>
              <button
                onClick={() => setShowPlanModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                Change Plan
              </button>
            </div>
          )}

          {/* Cancel Subscription */}
          {billingData?.organization.status === 'active' && (
            <div className="p-4 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-gray-600" />
                <h5 className="font-medium text-gray-900">Cancel Subscription</h5>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Cancel at end of billing period.
              </p>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Cancel Subscription
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Are you sure you want to cancel? Here's what will happen:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Keep access until billing period ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Data preserved for 30 days after</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>Lose premium features after period ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>Can reactivate anytime before it ends</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Change Modal */}
      {showPlanModal && billingData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-full">
                <ArrowUpDown className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change Your Plan</h3>
                <p className="text-sm text-gray-600">Current: <span className="font-medium capitalize">{billingData.organization.plan}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Starter */}
              <div
                onClick={() => billingData.organization.plan !== 'starter' && setSelectedPlan('starter')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'starter'
                    ? 'border-orange-500 bg-orange-50'
                    : billingData.organization.plan === 'starter'
                    ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">Starter</h4>
                <p className="text-2xl font-bold text-gray-900 mb-2">$29<span className="text-sm font-normal text-gray-600">/mo</span></p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Up to 3 users</li>
                  <li>Up to 500 items</li>
                  <li>5 storage areas</li>
                </ul>
                {billingData.organization.plan === 'starter' && (
                  <div className="mt-2 text-xs font-medium text-gray-500">Current Plan</div>
                )}
              </div>

              {/* Professional */}
              <div
                onClick={() => billingData.organization.plan !== 'professional' && setSelectedPlan('professional')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'professional'
                    ? 'border-orange-500 bg-orange-50'
                    : billingData.organization.plan === 'professional'
                    ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">Professional</h4>
                  <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">Popular</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">$79<span className="text-sm font-normal text-gray-600">/mo</span></p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Up to 10 users</li>
                  <li>Up to 2000 items</li>
                  <li>20 storage areas</li>
                </ul>
                {billingData.organization.plan === 'professional' && (
                  <div className="mt-2 text-xs font-medium text-gray-500">Current Plan</div>
                )}
              </div>

              {/* Enterprise */}
              <div
                onClick={() => billingData.organization.plan !== 'enterprise' && setSelectedPlan('enterprise')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPlan === 'enterprise'
                    ? 'border-orange-500 bg-orange-50'
                    : billingData.organization.plan === 'enterprise'
                    ? 'border-gray-300 bg-gray-50 opacity-60 cursor-not-allowed'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900 mb-1">Enterprise</h4>
                <p className="text-2xl font-bold text-gray-900 mb-2">$199<span className="text-sm font-normal text-gray-600">/mo</span></p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>Unlimited users</li>
                  <li>Unlimited items</li>
                  <li>Unlimited storage</li>
                </ul>
                {billingData.organization.plan === 'enterprise' && (
                  <div className="mt-2 text-xs font-medium text-gray-500">Current Plan</div>
                )}
              </div>
            </div>

            {selectedPlan && selectedPlan !== billingData.organization.plan && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <p className="text-sm text-blue-800">
                  {['starter'].includes(selectedPlan) && !['starter'].includes(billingData.organization.plan)
                    ? 'Downgrading will take effect immediately with new limits.'
                    : 'Upgrading will charge a prorated amount for the remainder of your billing period.'}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPlanModal(false)
                  setSelectedPlan(null)
                }}
                disabled={planChangeLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                disabled={planChangeLoading || !selectedPlan || selectedPlan === billingData.organization.plan}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {planChangeLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Changing...
                  </>
                ) : (
                  'Confirm Change'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
