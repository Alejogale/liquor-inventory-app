'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  CreditCard,
  Download,
  Calendar,
  DollarSign,
  Users,
  Package,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  TrendingUp,
  BarChart3,
  UserCircle,
  Mail,
  Save,
  Loader2,
  XCircle,
  RefreshCw,
  Settings,
  ArrowUpDown
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Usage {
  activeUsers: {
    current: number
    limit: number
    percentage: number
  }
  inventoryItems: {
    current: number
    limit: number
    percentage: number
  }
  storageAreas: {
    current: number
    limit: number
    percentage: number
  }
  recentActivity: number
  month: string
}

interface Organization {
  id: string
  name: string
  plan: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  createdAt: string
}

interface Invoice {
  id: string
  number: string
  status: string
  amount: number
  currency: string
  created: number
  dueDate: number | null
  paidAt: number | null
  hostedInvoiceUrl: string
  invoicePdf: string
  description: string
  subscription: {
    id: string
    plan: string
  } | null
}

interface BillingData {
  organization: Organization
  usage: Usage
  planLimits: {
    maxUsers: number
    maxItems: number
    maxStorageAreas: number
    features: string[]
  }
}

export default function BillingDashboard() {
  const { organization, user } = useAuth()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'invoices' | 'account'>('overview')
  const [newEmail, setNewEmail] = useState('')
  const [emailUpdateLoading, setEmailUpdateLoading] = useState(false)
  const [emailUpdateMessage, setEmailUpdateMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [reactivateLoading, setReactivateLoading] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [planChangeLoading, setPlanChangeLoading] = useState(false)

  useEffect(() => {
    if (organization?.id) {
      fetchBillingData()
      fetchInvoices()
    }
  }, [organization?.id])

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/billing/usage')
      if (response.ok) {
        const data = await response.json()
        setBillingData(data)
      }
    } catch (error) {
      console.error('Error fetching billing data:', error)
    }
  }

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/billing/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'open': return 'text-blue-600 bg-blue-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'open': return <Clock className="h-4 w-4" />
      case 'overdue': return <AlertTriangle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return 'bg-green-500'
  }

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newEmail || !newEmail.includes('@')) {
      setEmailUpdateMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    if (newEmail === user?.email) {
      setEmailUpdateMessage({ type: 'error', text: 'This is already your current email' })
      return
    }

    setEmailUpdateLoading(true)
    setEmailUpdateMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      })

      if (error) throw error

      setEmailUpdateMessage({
        type: 'success',
        text: 'Confirmation email sent! Please check both your current and new email inbox to confirm the change.'
      })
      setNewEmail('')
    } catch (error: any) {
      setEmailUpdateMessage({
        type: 'error',
        text: error.message || 'Failed to update email. Please try again.'
      })
    } finally {
      setEmailUpdateLoading(false)
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

      // Redirect to Stripe's billing portal
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
      // Refresh billing data
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
      // Refresh billing data
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
      // Refresh billing data
      fetchBillingData()
    } catch (error: any) {
      console.error('Error changing plan:', error)
      alert(error.message || 'Failed to change plan')
    } finally {
      setPlanChangeLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading billing data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-2xl p-1 max-w-lg backdrop-blur-xl border border-white/20"
           style={{
             background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
             backdropFilter: 'blur(20px)',
             WebkitBackdropFilter: 'blur(20px)'
           }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'usage', label: 'Usage', icon: TrendingUp },
          { id: 'invoices', label: 'Invoices', icon: CreditCard },
          { id: 'account', label: 'Account', icon: UserCircle }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 py-3 px-4 rounded-xl text-caption font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === id
                ? 'button-primary'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && billingData && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
               }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 capitalize">
                  {billingData.organization.plan} Plan
                </h3>
                <p className="text-gray-600">Current subscription details</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                billingData.organization.status === 'active' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {billingData.organization.status}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Billing Period</span>
                </div>
                <p className="text-sm text-gray-600">
                  {billingData.organization.currentPeriodStart && billingData.organization.currentPeriodEnd
                    ? `${new Date(billingData.organization.currentPeriodStart).toLocaleDateString()} - ${new Date(billingData.organization.currentPeriodEnd).toLocaleDateString()}`
                    : 'N/A'}
                </p>
              </div>

              <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Storage Areas</span>
                </div>
                <p className="text-sm text-gray-600">
                  {billingData.planLimits.maxStorageAreas === -1 ? 'Unlimited' : `Up to ${billingData.planLimits.maxStorageAreas} areas`}
                </p>
              </div>

              <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">User Limit</span>
                </div>
                <p className="text-sm text-gray-600">
                  {billingData.planLimits.maxUsers === -1 ? 'Unlimited' : `Up to ${billingData.planLimits.maxUsers} users`}
                </p>
              </div>

              <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900">Item Limit</span>
                </div>
                <p className="text-sm text-gray-600">
                  {billingData.planLimits.maxItems === -1 ? 'Unlimited' : `Up to ${billingData.planLimits.maxItems} items`}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Plan Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {billingData.planLimits.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Invoices Preview */}
          {invoices.length > 0 && (
            <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
                 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(invoice.status)}
                      <div>
                        <p className="font-medium text-gray-900">#{invoice.number}</p>
                        <p className="text-sm text-gray-600">{formatDate(invoice.created)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(invoice.amount, invoice.currency)}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription Management */}
          <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
               }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Manage Subscription</h3>

            {/* Cancellation Warning Banner */}
            {billingData.organization.status === 'cancelling' && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Subscription Ending Soon</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Your subscription is set to cancel at the end of the current billing period
                      ({billingData.organization.currentPeriodEnd
                        ? new Date(billingData.organization.currentPeriodEnd).toLocaleDateString()
                        : 'N/A'}).
                      You will keep access until then.
                    </p>
                    <button
                      onClick={handleReactivateSubscription}
                      disabled={reactivateLoading}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {reactivateLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Reactivating...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4" />
                          <span>Reactivate Subscription</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Manage Payment Method */}
              <div className="p-4 bg-white/50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">Payment Method</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Update your credit card or payment details through Stripe's secure portal.
                </p>
                <button
                  onClick={handleOpenBillingPortal}
                  disabled={portalLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  {portalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Opening...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4" />
                      <span>Manage Payment</span>
                    </>
                  )}
                </button>
              </div>

              {/* Change Plan */}
              {billingData.organization.status === 'active' && (
                <div className="p-4 bg-white/50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <ArrowUpDown className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Change Plan</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upgrade or downgrade your plan. Changes take effect immediately.
                  </p>
                  <button
                    onClick={() => setShowPlanModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    <span>Change Plan</span>
                  </button>
                </div>
              )}

              {/* Cancel Subscription */}
              {billingData.organization.status === 'active' && (
                <div className="p-4 bg-white/50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <XCircle className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Cancel Subscription</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Cancel your subscription. You'll keep access until the end of your billing period.
                  </p>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Subscription</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Tab */}
      {activeTab === 'usage' && billingData && (
        <div className="space-y-6">
          <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
               }}>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Usage</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Storage Areas Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Storage Areas</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {billingData.usage.storageAreas.current} / {billingData.usage.storageAreas.limit === -1 ? '∞' : billingData.usage.storageAreas.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getUsageColor(billingData.usage.storageAreas.percentage)}`}
                    style={{ width: `${Math.min(billingData.usage.storageAreas.percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {billingData.usage.storageAreas.percentage}% of limit used
                </p>
              </div>

              {/* Users Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Active Users</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {billingData.usage.activeUsers.current} / {billingData.usage.activeUsers.limit === -1 ? '∞' : billingData.usage.activeUsers.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getUsageColor(billingData.usage.activeUsers.percentage)}`}
                    style={{ width: `${Math.min(billingData.usage.activeUsers.percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {billingData.usage.activeUsers.percentage}% of limit used
                </p>
              </div>

              {/* Items Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">Inventory Items</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {billingData.usage.inventoryItems.current} / {billingData.usage.inventoryItems.limit === -1 ? '∞' : billingData.usage.inventoryItems.limit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getUsageColor(billingData.usage.inventoryItems.percentage)}`}
                    style={{ width: `${Math.min(billingData.usage.inventoryItems.percentage, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {billingData.usage.inventoryItems.percentage}% of limit used
                </p>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Recent Activity</span>
              </div>
              <div className="bg-white/50 rounded-lg p-4 border border-gray-200">
                <p className="text-2xl font-bold text-gray-900">{billingData.usage.recentActivity}</p>
                <p className="text-sm text-gray-600">Actions in the last 30 days</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
             }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Billing History</h3>
          
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted mx-auto mb-4" />
              <h4 className="text-title text-primary mb-2">No invoices yet</h4>
              <p className="text-muted">Your billing history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 bg-white/50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <div>
                          <p className="font-semibold text-gray-900">Invoice #{invoice.number}</p>
                          <p className="text-sm text-gray-600">{formatDate(invoice.created)}</p>
                          {invoice.description && (
                            <p className="text-xs text-gray-500">{invoice.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{formatCurrency(invoice.amount, invoice.currency)}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {invoice.hostedInvoiceUrl && (
                          <a
                            href={invoice.hostedInvoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View invoice"
                          >
                            <ExternalLink className="h-4 w-4 text-gray-600" />
                          </a>
                        )}
                        {invoice.invoicePdf && (
                          <a
                            href={invoice.invoicePdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4 text-gray-600" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
             style={{
               background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
               backdropFilter: 'blur(20px)',
               WebkitBackdropFilter: 'blur(20px)',
               boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
             }}>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>

          <div className="space-y-6">
            {/* Current Email Display */}
            <div className="p-4 bg-white/50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Mail className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-gray-900">Current Email</h4>
              </div>
              <p className="text-gray-700 ml-8">{user?.email || 'No email found'}</p>
            </div>

            {/* Change Email Form */}
            <div className="p-6 bg-white rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">Change Email Address</h4>
              <p className="text-sm text-gray-600 mb-4">
                We'll send a confirmation email to both your current and new email addresses.
                You'll need to confirm the change before it takes effect.
              </p>

              {emailUpdateMessage && (
                <div className={`p-4 rounded-lg mb-4 ${
                  emailUpdateMessage.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {emailUpdateMessage.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <p className={`text-sm ${
                      emailUpdateMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {emailUpdateMessage.text}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div>
                  <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    id="newEmail"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter your new email address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-400"
                    disabled={emailUpdateLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={emailUpdateLoading || !newEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {emailUpdateLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending Confirmation...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      <span>Update Email</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-gray-600">
                Are you sure you want to cancel your subscription? Here's what will happen:
              </p>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>You'll keep access until the end of your current billing period</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Your data will be preserved for 30 days after cancellation</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span>After your billing period ends, you won't be able to access premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span>You can reactivate anytime before your billing period ends</span>
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Cancel Subscription</span>
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
                <ArrowUpDown className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Change Your Plan</h3>
                <p className="text-sm text-gray-600">Current plan: <span className="font-medium capitalize">{billingData.organization.plan}</span></p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Starter Plan */}
              <div
                onClick={() => setSelectedPlan('starter')}
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

              {/* Professional Plan */}
              <div
                onClick={() => setSelectedPlan('professional')}
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

              {/* Enterprise Plan */}
              <div
                onClick={() => setSelectedPlan('enterprise')}
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
                  {selectedPlan === 'starter' && billingData.organization.plan !== 'starter'
                    ? 'Downgrading to Starter. Your new limits will take effect immediately.'
                    : selectedPlan === 'enterprise'
                    ? 'Upgrading to Enterprise. You\'ll be charged a prorated amount.'
                    : selectedPlan === 'professional' && billingData.organization.plan === 'starter'
                    ? 'Upgrading to Professional. You\'ll be charged a prorated amount.'
                    : 'Downgrading to Professional. Your new limits will take effect immediately.'
                  }
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
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Changing Plan...</span>
                  </>
                ) : (
                  <span>Confirm Plan Change</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}