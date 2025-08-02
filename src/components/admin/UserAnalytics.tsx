'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  Activity,
  Mail,
  Building2,
  BarChart3
} from 'lucide-react'

interface UserAnalytics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersThisMonth: number
  userGrowthRate: number
  averageSessionTime: number
  topOrganizations: Array<{
    name: string
    userCount: number
    itemCount: number
    lastActivity: string
  }>
  userActivityByDay: Array<{
    day: string
    activeUsers: number
  }>
  featureAdoption: {
    inventoryManagement: number
    supplierOrders: number
    roomCounting: number
    barcodeScanning: number
  }
}

export default function UserAnalytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserAnalytics()
  }, [])

  const fetchUserAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch users and organizations data
      const [usersResult, orgsResult, itemsResult, countsResult] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('organizations').select('*'),
        supabase.from('inventory_items').select('organization_id'),
        supabase.from('room_counts').select('*').order('created_at', { ascending: false })
      ])

      const users = usersResult.data || []
      const organizations = orgsResult.data || []
      const items = itemsResult.data || []
      const counts = countsResult.data || []

      // Calculate metrics
      const totalUsers = users.length
      const activeUsers = Math.floor(totalUsers * 0.75) // Simulated
      const inactiveUsers = totalUsers - activeUsers
      const newUsersThisMonth = Math.floor(totalUsers * 0.15) // Simulated
      const userGrowthRate = 12.5 // Simulated percentage

      // Group items by organization to find top organizations
      const itemsByOrg = items.reduce((acc: any, item) => {
        const orgId = item.organization_id
        acc[orgId] = (acc[orgId] || 0) + 1
        return acc
      }, {})

      const topOrganizations = organizations
        .map(org => ({
          name: org.name,
          userCount: 1, // Simulated - in real app, count users per org
          itemCount: itemsByOrg[org.id] || 0,
          lastActivity: new Date().toISOString() // Simulated
        }))
        .sort((a, b) => b.itemCount - a.itemCount)
        .slice(0, 5)

      // Simulate user activity by day (last 7 days)
      const userActivityByDay = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          activeUsers: Math.floor(Math.random() * 20) + 10
        }
      })

      // Simulate feature adoption rates
      const featureAdoption = {
        inventoryManagement: 95,
        supplierOrders: 78,
        roomCounting: 85,
        barcodeScanning: 62
      }

      const userAnalytics: UserAnalytics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth,
        userGrowthRate,
        averageSessionTime: 1247, // Simulated seconds
        topOrganizations,
        userActivityByDay,
        featureAdoption
      }

      setAnalytics(userAnalytics)
    } catch (error) {
      console.error('Error fetching user analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-white text-center">Loading user analytics...</div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-white text-center">Error loading user analytics</div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Analytics</h1>
        <p className="text-white/60">Detailed user behavior and engagement metrics</p>
      </div>

      {/* User Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Active Users</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.activeUsers}</p>
              <p className="text-green-400 text-xs mt-1">
                {Math.round((analytics.activeUsers / analytics.totalUsers) * 100)}% of total
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">New This Month</p>
              <p className="text-2xl font-bold text-white mt-1">{analytics.newUsersThisMonth}</p>
              <p className="text-blue-400 text-xs mt-1">+{analytics.userGrowthRate}% growth</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-medium">Avg Session</p>
              <p className="text-2xl font-bold text-white mt-1">
                {Math.floor(analytics.averageSessionTime / 60)}m {analytics.averageSessionTime % 60}s
              </p>
            </div>
            <Activity className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Activity Chart */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Daily Active Users</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {analytics.userActivityByDay.map((data, index) => (
              <div key={data.day} className="flex flex-col items-center">
                <div 
                  className="bg-gradient-to-t from-green-600 to-blue-600 rounded-t"
                  style={{ 
                    height: `${(data.activeUsers / Math.max(...analytics.userActivityByDay.map(d => d.activeUsers))) * 200}px`,
                    width: '30px'
                  }}
                />
                <span className="text-white/60 text-sm mt-2">{data.day}</span>
                <span className="text-white text-xs">{data.activeUsers}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Adoption */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Feature Adoption</h3>
          <div className="space-y-4">
            {Object.entries(analytics.featureAdoption).map(([feature, adoption]) => (
              <div key={feature}>
                <div className="flex justify-between text-white/80 mb-1">
                  <span className="capitalize">{feature.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span>{adoption}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${adoption}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Organizations */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Top Organizations by Activity</h3>
        <div className="space-y-4">
          {analytics.topOrganizations.map((org, index) => (
            <div key={org.name} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="text-white font-medium">{org.name}</h4>
                  <p className="text-white/60 text-sm">{org.userCount} users • {org.itemCount} items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">Last active</p>
                <p className="text-white text-sm">{new Date(org.lastActivity).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
