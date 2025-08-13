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
  BarChart3
} from 'lucide-react'

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
    maxApps: number
    features: string[]
  }
}

export default function BillingDashboard() {
  const { organization } = useAuth()
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'usage' | 'invoices'>('overview')

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
          { id: 'invoices', label: 'Invoices', icon: CreditCard }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              activeTab === id
                ? 'text-white shadow-lg'
                : 'text-gray-700 hover:text-gray-900'
            }`}
            style={activeTab === id ? {
              background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
              boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
            } : {}}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h4>
              <p className="text-gray-600">Your billing history will appear here</p>
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
    </div>
  )
}