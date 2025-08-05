'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Users,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight
} from 'lucide-react'

interface RevenueAnalytics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  lifetimeValue: number
  revenueGrowth: number
  subscriptionTiers: {
    starter: { count: number; revenue: number }
    professional: { count: number; revenue: number }
    enterprise: { count: number; revenue: number }
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
    customers: number
  }>
  revenueByTier: Array<{
    tier: string
    revenue: number
    percentage: number
  }>
}

export default function RevenueAnalytics() {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRevenueAnalytics()
  }, [])

  const fetchRevenueAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch organizations data
      const { data: organizations } = await supabase
        .from('organizations')
        .select('*')

      const totalOrgs = organizations?.length || 0

      // Simulate subscription distribution
      const starterCount = Math.floor(totalOrgs * 0.4)
      const professionalCount = Math.floor(totalOrgs * 0.5)
      const enterpriseCount = totalOrgs - starterCount - professionalCount

      const subscriptionTiers = {
        starter: { 
          count: starterCount, 
          revenue: starterCount * 29 
        },
        professional: { 
          count: professionalCount, 
          revenue: professionalCount * 79 
        },
        enterprise: { 
          count: enterpriseCount, 
          revenue: enterpriseCount * 199 
        }
      }

      const monthlyRecurringRevenue = 
        subscriptionTiers.starter.revenue + 
        subscriptionTiers.professional.revenue + 
        subscriptionTiers.enterprise.revenue

      const totalRevenue = monthlyRecurringRevenue * 8 // Simulate 8 months of operation
      const averageRevenuePerUser = totalOrgs > 0 ? monthlyRecurringRevenue / totalOrgs : 0
      const lifetimeValue = averageRevenuePerUser * 24 // Simulate 24 month retention

      // Generate monthly revenue history
      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const month = new Date()
        month.setMonth(month.getMonth() - (5 - i))
        const growthFactor = 0.15 * i // 15% growth per month
        const baseRevenue = monthlyRecurringRevenue * (0.3 + growthFactor)
        
        return {
          month: month.toLocaleDateString('en-US', { month: 'short' }),
          revenue: Math.floor(baseRevenue),
          customers: Math.floor(totalOrgs * (0.4 + growthFactor))
        }
      })

      // Calculate revenue by tier percentages
      const totalTierRevenue = monthlyRecurringRevenue
      const revenueByTier = [
        {
          tier: 'Starter ($29)',
          revenue: subscriptionTiers.starter.revenue,
          percentage: (subscriptionTiers.starter.revenue / totalTierRevenue) * 100
        },
        {
          tier: 'Professional ($79)',
          revenue: subscriptionTiers.professional.revenue,
          percentage: (subscriptionTiers.professional.revenue / totalTierRevenue) * 100
        },
        {
          tier: 'Enterprise ($199)',
          revenue: subscriptionTiers.enterprise.revenue,
          percentage: (subscriptionTiers.enterprise.revenue / totalTierRevenue) * 100
        }
      ]

      const revenueAnalytics: RevenueAnalytics = {
        totalRevenue,
        monthlyRecurringRevenue,
        averageRevenuePerUser,
        churnRate: 5.2, // Simulated percentage
        lifetimeValue,
        revenueGrowth: 15.8, // Simulated percentage
        subscriptionTiers,
        monthlyRevenue,
        revenueByTier
      }

      setAnalytics(revenueAnalytics)
    } catch (error) {
      console.error('Error fetching revenue analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="text-white text-center">Loading revenue analytics...</div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-white text-center">Error loading revenue analytics</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Revenue Analytics</h1>
        <p className="text-white/60">Financial performance and subscription metrics</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.totalRevenue)}</p>
              <p className="text-green-400 text-xs mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{analytics.revenueGrowth}% growth
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.monthlyRecurringRevenue)}</p>
              <p className="text-blue-400 text-xs mt-1">Current month</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Avg Revenue Per User</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.averageRevenuePerUser)}</p>
              <p className="text-purple-400 text-xs mt-1">Per month</p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Customer Lifetime Value</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(analytics.lifetimeValue)}</p>
              <p className="text-yellow-400 text-xs mt-1">24-month projection</p>
            </div>
            <CreditCard className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Starter Plan</h3>
            <span className="text-green-400 font-bold">$29/mo</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.subscriptionTiers.starter.count}</p>
          <p className="text-white/60 text-sm">customers</p>
          <p className="text-green-400 text-sm mt-2">{formatCurrency(analytics.subscriptionTiers.starter.revenue)}/month</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Professional Plan</h3>
            <span className="text-blue-400 font-bold">$79/mo</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.subscriptionTiers.professional.count}</p>
          <p className="text-white/60 text-sm">customers</p>
          <p className="text-blue-400 text-sm mt-2">{formatCurrency(analytics.subscriptionTiers.professional.revenue)}/month</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Enterprise Plan</h3>
            <span className="text-purple-400 font-bold">$199/mo</span>
          </div>
          <p className="text-2xl font-bold text-white">{analytics.subscriptionTiers.enterprise.count}</p>
          <p className="text-white/60 text-sm">customers</p>
          <p className="text-purple-400 text-sm mt-2">{formatCurrency(analytics.subscriptionTiers.enterprise.revenue)}/month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Growth */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Monthly Revenue Growth</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.monthlyRevenue.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center">
                <div 
                  className="bg-gradient-to-t from-green-600 to-emerald-400 rounded-t"
                  style={{ 
                    height: `${(data.revenue / Math.max(...analytics.monthlyRevenue.map(d => d.revenue))) * 200}px`,
                    width: '40px'
                  }}
                />
                <span className="text-white/60 text-sm mt-2">{data.month}</span>
                <span className="text-white text-xs">{formatCurrency(data.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Tier */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Revenue by Subscription Tier</h3>
          <div className="space-y-4">
            {analytics.revenueByTier.map((tier, index) => (
              <div key={tier.tier}>
                <div className="flex justify-between text-white/80 mb-1">
                  <span>{tier.tier}</span>
                  <span>{formatCurrency(tier.revenue)} ({tier.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      index === 0 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                      index === 1 ? 'bg-gradient-to-r from-blue-500 to-blue-400' :
                      'bg-gradient-to-r from-purple-500 to-purple-400'
                    }`}
                    style={{ width: `${tier.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
