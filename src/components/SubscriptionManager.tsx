'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface Subscription {
  id: string
  status: string
  plan: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  stripe_subscription_id?: string
  stripe_price_id?: string
}

export default function SubscriptionManager() {
  const { organization } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    if (organization?.id) {
      fetchSubscription()
    } else if (organization === null) {
      // Organization data is loaded but user doesn't have one
      setLoading(false)
    }
  }, [organization?.id])

  const fetchSubscription = async () => {
    try {
      if (!organization?.id) {
        console.warn('No organization ID available for subscription fetch')
        return
      }

      const { data, error } = await supabase
        .from('organizations')
        .select(`
          id,
          subscription_status,
          subscription_plan,
          subscription_period_start,
          subscription_period_end,
          stripe_subscription_id,
          stripe_price_id
        `)
        .eq('id', organization.id)
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setSubscription({
        id: data.id,
        status: data.subscription_status || 'trial',
        plan: data.subscription_plan || 'starter',
        current_period_start: data.subscription_period_start,
        current_period_end: data.subscription_period_end,
        cancel_at_period_end: false,
        stripe_subscription_id: data.stripe_subscription_id,
        stripe_price_id: data.stripe_price_id
      })
    } catch (error) {
      console.error('Error fetching subscription:', error)
      // Set a default state instead of leaving it null
      setSubscription({
        id: organization?.id || '',
        status: 'trial',
        plan: 'starter',
        current_period_start: '',
        current_period_end: '',
        cancel_at_period_end: false
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async (newPlan: string) => {
    setUpgrading(true)
    try {
      // Redirect to Stripe checkout for plan upgrade
      const response = await fetch('/api/stripe/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: getPriceId(newPlan),
          billingPeriod: 'month'
        })
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error)
      alert('Error upgrading subscription. Please try again.')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.')) {
      return
    }

    setCanceling(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription?.stripe_subscription_id
        })
      })

      if (response.ok) {
        await fetchSubscription()
        alert('Subscription cancelled successfully. You will have access until the end of your current billing period.')
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      alert('Error cancelling subscription. Please try again.')
    } finally {
      setCanceling(false)
    }
  }

  const getPriceId = (plan: string) => {
    const priceIds = {
      starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
      professional: process.env.NEXT_PUBLIC_STRIPE_PROFESSIONAL_PRICE_ID,
      enterprise: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID
    }
    return priceIds[plan as keyof typeof priceIds]
  }

  const getPlanDetails = (plan: string) => {
    const plans = {
      trial: { name: 'Trial', price: '$0', features: ['Basic inventory management', 'Up to 100 items', 'Email support'] },
      starter: { name: 'Starter', price: '$29/month', features: ['Basic inventory management', 'Up to 500 items', 'Email support', 'Basic reporting'] },
      professional: { name: 'Professional', price: '$79/month', features: ['Advanced inventory management', 'Unlimited items', 'Priority support', 'Advanced reporting', 'QuickBooks integration'] },
      enterprise: { name: 'Enterprise', price: '$199/month', features: ['Everything in Professional', 'Custom integrations', 'Dedicated support', 'Custom reporting', 'API access'] }
    }
    return plans[plan as keyof typeof plans] || plans.trial
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Loading subscription details...</div>
      </div>
    )
  }

  if (!organization?.id) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <h3 className="text-lg font-semibold text-yellow-800">Organization Setup Required</h3>
        </div>
        <p className="text-yellow-700 mb-4">
          You need to be part of an organization to manage subscriptions. Please contact your administrator or create an organization.
        </p>
        <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
          Contact Support
        </button>
      </div>
    )
  }

  const planDetails = getPlanDetails(subscription?.plan || 'trial')

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Subscription Management</h2>
          <p className="text-slate-600">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="bg-white rounded-lg border border-blue-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Current Plan</h3>
              <p className="text-slate-600">{planDetails.name} Plan</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-800">{planDetails.price}</div>
            <div className="text-sm text-slate-600">
              {subscription?.status === 'trial' ? 'Trial period' : 'Monthly billing'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-sm font-medium text-slate-800">Billing Period</div>
              <div className="text-sm text-slate-600">
                {subscription?.current_period_start && subscription?.current_period_end
                  ? `${new Date(subscription.current_period_start).toLocaleDateString()} - ${new Date(subscription.current_period_end).toLocaleDateString()}`
                  : 'N/A'
                }
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-medium text-slate-800">Status</div>
              <div className="text-sm text-slate-600 capitalize">{subscription?.status || 'Active'}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <div>
              <div className="text-sm font-medium text-slate-800">Next Billing</div>
              <div className="text-sm text-slate-600">
                {subscription?.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-800 mb-3">Current Plan Features:</h4>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          {subscription?.plan !== 'enterprise' && (
            <button
              onClick={() => handleUpgrade(getNextPlan(subscription?.plan || 'trial'))}
              disabled={upgrading}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>{upgrading ? 'Processing...' : 'Upgrade Plan'}</span>
            </button>
          )}

          {subscription?.status !== 'trial' && subscription?.stripe_subscription_id && (
            <button
              onClick={handleCancel}
              disabled={canceling}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>{canceling ? 'Processing...' : 'Cancel Subscription'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Billing History</h3>
        <div className="text-center py-8">
          <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600">Billing history will be available here</p>
        </div>
      </div>
    </div>
  )
}

const getNextPlan = (currentPlan: string) => {
  const planOrder = ['trial', 'starter', 'professional', 'enterprise']
  const currentIndex = planOrder.indexOf(currentPlan)
  return planOrder[Math.min(currentIndex + 1, planOrder.length - 1)]
} 