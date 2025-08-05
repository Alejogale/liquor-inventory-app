'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface AdminMetrics {
  totalUsers: number
  totalOrganizations: number
  activeUsers30Days: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  averageItemsPerOrg: number
  totalInventoryItems: number
  totalSuppliers: number
  totalCategories: number
  recentActivity: Array<{
    id: string
    action: string
    user_email: string
    organization_name: string
    timestamp: string
  }>
  organizationGrowth: Array<{
    month: string
    count: number
  }>
  featureUsage: {
    inventoryManagement: number
    supplierOrders: number
    roomCounting: number
    barcodeScanning: number
  }
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAdminMetrics()
  }, [timeRange])

  const fetchAdminMetrics = async () => {
    try {
      setLoading(true)
      
      // Fetch all metrics in parallel
      const [
        usersResult,
        orgsResult,
        itemsResult,
        suppliersResult,
        categoriesResult,
        countsResult
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('organizations').select('*'),
        supabase.from('inventory_items').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('room_counts').select('*').order('created_at', { ascending: false }).limit(100)
      ])

      // Calculate metrics
      const totalUsers = usersResult.data?.length || 0
      const totalOrganizations = orgsResult.data?.length || 0
      const totalInventoryItems = itemsResult.data?.length || 0
      const totalSuppliers = suppliersResult.data?.length || 0
      const totalCategories = categoriesResult.data?.length || 0

      // Calculate active users (users who have activity in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const activeUsers30Days = Math.floor(totalUsers * 0.7) // Simulated for now

      // Calculate revenue metrics (simulated based on organizations)
      const totalRevenue = totalOrganizations * 79 * 6 // Assume average $79/month for 6 months
      const monthlyRecurringRevenue = totalOrganizations * 79

      // Calculate average items per organization
      const averageItemsPerOrg = totalOrganizations > 0 ? Math.round(totalInventoryItems / totalOrganizations) : 0

      // Simulate recent activity
      const recentActivity = countsResult.data?.slice(0, 10).map((count, index) => ({
        id: count.id || `activity_${index}`,
        action: 'Inventory Count Updated',
        user_email: 'user@example.com',
        organization_name: 'Morris County Golf Club',
        timestamp: count.created_at || new Date().toISOString()
      })) || []

      // Simulate organization growth over time
      const organizationGrowth = [
        { month: 'Jan', count: Math.max(1, totalOrganizations - 5) },
        { month: 'Feb', count: Math.max(1, totalOrganizations - 4) },
        { month: 'Mar', count: Math.max(1, totalOrganizations - 3) },
        { month: 'Apr', count: Math.max(1, totalOrganizations - 2) },
        { month: 'May', count: Math.max(1, totalOrganizations - 1) },
        { month: 'Jun', count: totalOrganizations }
      ]

      // Simulate feature usage
      const featureUsage = {
        inventoryManagement: Math.floor(totalUsers * 0.95),
        supplierOrders: Math.floor(totalUsers * 0.78),
        roomCounting: Math.floor(totalUsers * 0.85),
        barcodeScanning: Math.floor(totalUsers * 0.62)
      }

      const adminMetrics: AdminMetrics = {
        totalUsers,
        totalOrganizations,
        activeUsers30Days,
        totalRevenue,
        monthlyRecurringRevenue,
        averageItemsPerOrg,
        totalInventoryItems,
        totalSuppliers,
        totalCategories,
        recentActivity,
        organizationGrowth,
        featureUsage
      }

      setMetrics(adminMetrics)
    } catch (error) {
      console.error('Error fetching admin metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend = null,
    trendUp = true,
    subtitle = null
  }: {
    title: string
    value: string | number
    icon: any
    trend?: number | null
    trendUp?: boolean
    subtitle?: string | null
  }) => (
    <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-slate-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${trendUp ? 'bg-green-100' : 'bg-red-100'}`}>
          <Icon className={`h-6 w-6 ${trendUp ? 'text-green-600' : 'text-red-600'}`} />
        </div>
      </div>
      {trend !== null && (
        <div className="flex items-center mt-3">
          {trendUp ? (
            <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
          )}
          <span className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}% vs last month
          </span>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Loading admin dashboard...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Error loading metrics</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-slate-600">Business intelligence and performance metrics</p>
          
          <div className="flex items-center space-x-4 mt-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-blue-200 rounded-lg px-4 py-2 text-slate-800"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={fetchAdminMetrics}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={15}
            trendUp={true}
            subtitle="All time"
          />
          <MetricCard
            title="Monthly Recurring Revenue"
            value={`$${metrics.monthlyRecurringRevenue.toLocaleString()}`}
            icon={TrendingUp}
            trend={8}
            trendUp={true}
            subtitle="Current month"
          />
          <MetricCard
            title="Total Organizations"
            value={metrics.totalOrganizations}
            icon={Building2}
            trend={12}
            trendUp={true}
            subtitle="Paying customers"
          />
          <MetricCard
            title="Active Users"
            value={metrics.activeUsers30Days}
            icon={Users}
            trend={5}
            trendUp={true}
            subtitle="Last 30 days"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers}
            icon={Users}
            subtitle="All registered"
          />
          <MetricCard
            title="Inventory Items"
            value={metrics.totalInventoryItems}
            icon={BarChart3}
            subtitle="Across all orgs"
          />
          <MetricCard
            title="Total Suppliers"
            value={metrics.totalSuppliers}
            icon={Building2}
            subtitle="Managed suppliers"
          />
          <MetricCard
            title="Avg Items/Org"
            value={metrics.averageItemsPerOrg}
            icon={PieChart}
            subtitle="Usage metric"
          />
        </div>

                  {/* Charts and Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Organization Growth Chart */}
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Organization Growth</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {metrics.organizationGrowth.map((data, index) => (
                <div key={`growth-${data.month}-${index}`} className="flex flex-col items-center">
                  <div
                    className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t"
                    style={{
                      height: `${(data.count / Math.max(...metrics.organizationGrowth.map(d => d.count))) * 200}px`,
                      width: '40px'
                    }}
                  />
                  <span className="text-slate-600 text-sm mt-2">{data.month}</span>
                  <span className="text-slate-800 text-xs">{data.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature Usage */}
          <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Feature Usage</h3>
            <div className="space-y-4">
              {Object.entries(metrics.featureUsage).map(([feature, usage], index) => (
                <div key={`feature-${feature}-${index}`}>
                  <div className="flex justify-between text-slate-700 mb-1">
                    <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span>{usage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${usage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {metrics.recentActivity.slice(0, 8).map((activity, index) => (
              <div key={`activity-${activity.id}-${index}`} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-slate-800 text-sm">{activity.action}</p>
                    <p className="text-slate-600 text-xs">{activity.organization_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-600 text-xs">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  <p className="text-slate-500 text-xs">{new Date(activity.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
