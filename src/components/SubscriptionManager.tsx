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
      trial: {
        name: 'Trial',
        price: '$0',
        features: ['30-day free trial', 'All plan features', 'No credit card required']
      },
      personal: {
        name: 'Personal',
        price: '$19/month',
        features: ['2 storage areas', '150 items', '1 user', 'Mobile app access', 'Basic reports', 'Email support']
      },
      starter: {
        name: 'Starter',
        price: '$89/month',
        features: ['5 storage areas', '500 items', '5 users', 'Room-by-room counting', 'Stock alerts', 'Team collaboration', 'Basic analytics']
      },
      professional: {
        name: 'Professional',
        price: '$229/month',
        features: ['15 storage areas', '2,000 items', '15 users', 'Advanced analytics', 'Custom reports', 'Stock movement tracking', 'Priority support', 'Export to Excel']
      },
      premium: {
        name: 'Premium',
        price: '$499/month',
        features: ['50 storage areas', '10,000 items', '50 users', 'Multi-location management', 'API access', 'Custom integrations', 'Dedicated account manager', 'Monthly strategy call']
      },
      enterprise: {
        name: 'Enterprise',
        price: '$1,499/month',
        features: ['Unlimited storage areas', 'Unlimited items', 'Unlimited users', 'White-label options', 'Custom development', 'On-site training', '24/7 phone support', 'SLA guarantee']
      }
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
          <h2 className="text-2xl font-bold text-gray-900">Subscription Management</h2>
          <p className="text-gray-600">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Subscription */}
      <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
           }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
              <p className="text-gray-600">{planDetails.name} Plan</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{planDetails.price}</div>
            <div className="text-sm text-gray-600">
              {subscription?.status === 'trial' ? 'Trial period' : 'Monthly billing'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Billing Period</div>
              <div className="text-sm text-gray-600">
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
              <div className="text-sm font-medium text-gray-900">Status</div>
              <div className="text-sm text-gray-600 capitalize">{subscription?.status || 'Active'}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium text-gray-900">Next Billing</div>
              <div className="text-sm text-gray-600">
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
          <h4 className="text-sm font-medium text-gray-900 mb-3">Current Plan Features:</h4>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span>Active Subscription</span>
          </div>
          
          <div className="text-sm text-gray-600">
            <span>Payment processing will be available soon</span>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)',
             boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
           }}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
        <div className="text-center py-8">
          <DollarSign className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Billing history will be available here</p>
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