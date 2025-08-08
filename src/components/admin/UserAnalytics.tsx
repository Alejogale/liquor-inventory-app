'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Users,
  Building,
  TrendingUp,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  UserCheck
} from 'lucide-react'

interface UserAnalytics {
  totalUsers: number
  totalOrganizations: number
  activeUsers: number
  newUsersThisMonth: number
  usersByOrganization: Array<{
    organization_name: string
    user_count: number
  }>
  usersByMonth: Array<{
    month: string
    count: number
  }>
  topOrganizations: Array<{
    name: string
    activity_count: number
    user_count: number
  }>
  recentActivity: Array<{
    id: string
    user_email: string
    action_type: string
    created_at: string
    organization_name: string
  }>
}

export default function UserAnalytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })

      // Fetch total organizations
      const { count: totalOrganizations } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true })

      // Fetch active users (users who have activity in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: activeUsersData } = await supabase
        .from('activity_logs')
        .select('user_email')
        .gte('created_at', thirtyDaysAgo.toISOString())
        
      const uniqueActiveUsers = new Set(activeUsersData?.map(log => log.user_email) || [])
      const activeUsers = uniqueActiveUsers.size

      // Fetch new users this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const { count: newUsersThisMonth } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString())

      // Fetch users by organization
      const { data: usersByOrg } = await supabase
        .from('user_profiles')
        .select(`
          organization_id,
          organizations!inner(name)
        `)

      const orgUserCounts = usersByOrg?.reduce((acc: any, user: any) => {
        const orgName = user.organizations?.name || 'Unknown'
        acc[orgName] = (acc[orgName] || 0) + 1
        return acc
      }, {}) || {}

      const usersByOrganization = Object.entries(orgUserCounts).map(([name, count]) => ({
        organization_name: name,
        user_count: count as number
      }))

      // Fetch users by month (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      
      const { data: monthlyUsers } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString())

      const monthlyUserCounts = monthlyUsers?.reduce((acc: any, user) => {
        const date = new Date(user.created_at)
        const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        acc[monthKey] = (acc[monthKey] || 0) + 1
        return acc
      }, {}) || {}

      const usersByMonth = Object.entries(monthlyUserCounts).map(([month, count]) => ({
        month,
        count: count as number
      }))

      // Fetch top organizations by activity
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select(`
          organization_id,
          organizations!inner(name)
        `)
        .gte('created_at', thirtyDaysAgo.toISOString())

      const orgActivityCounts = activityData?.reduce((acc: any, activity: any) => {
        const orgName = activity.organizations?.name || 'Unknown'
        acc[orgName] = (acc[orgName] || 0) + 1
        return acc
      }, {}) || {}

      const topOrganizations = Object.entries(orgActivityCounts)
        .map(([name, activity_count]) => ({
          name,
          activity_count: activity_count as number,
          user_count: orgUserCounts[name] || 0
        }))
        .sort((a, b) => b.activity_count - a.activity_count)
        .slice(0, 10)

      // Fetch recent activity
      const { data: recentActivity } = await supabase
        .from('activity_logs')
        .select(`
          id,
          user_email,
          action_type,
          created_at,
          organizations!inner(name)
        `)
        .order('created_at', { ascending: false })
        .limit(20)

      const formattedRecentActivity = recentActivity?.map(activity => ({
        id: activity.id,
        user_email: activity.user_email,
        action_type: activity.action_type,
        created_at: activity.created_at,
        organization_name: activity.organizations?.name || 'Unknown'
      })) || []

      setAnalytics({
        totalUsers: totalUsers || 0,
        totalOrganizations: totalOrganizations || 0,
        activeUsers,
        newUsersThisMonth: newUsersThisMonth || 0,
        usersByOrganization,
        usersByMonth,
        topOrganizations,
        recentActivity: formattedRecentActivity
      })

    } catch (error) {
      console.error('Error fetching user analytics:', error)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-white/20 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-300">{error}</p>
      </div>
    )
  }

  if (!analytics) return null

  return (
    <div className="p-8 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-slate-800">{analytics.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Organizations</p>
              <p className="text-2xl font-bold text-slate-800">{analytics.totalOrganizations.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Active Users (30d)</p>
              <p className="text-2xl font-bold text-slate-800">{analytics.activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">New This Month</p>
              <p className="text-2xl font-bold text-slate-800">{analytics.newUsersThisMonth.toLocaleString()}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Organization */}
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-blue-600" />
            Users by Organization
          </h3>
          <div className="space-y-3">
            {analytics.usersByOrganization.slice(0, 8).map((org, index) => (
              <div key={`${org.organization_name}-${index}`} className="flex items-center justify-between">
                <span className="text-slate-700 truncate">{org.organization_name}</span>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 rounded-full px-2 py-1">
                    <span className="text-xs text-blue-700 font-medium">{org.user_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Organizations by Activity */}
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
          <h3 className="text-xl font-semibold text-slate-800 mb-4">Top Organizations by Activity</h3>
          <div className="space-y-4">
            {analytics.topOrganizations.map((org, index) => (
              <div key={`${org.name}-${index}-${org.activity_count}`} className="flex items-center justify-between py-3 border-b border-blue-100 last:border-b-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-slate-800 font-medium">{org.name}</p>
                    <p className="text-slate-600 text-sm">{org.user_count} users</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-800 font-semibold">{org.activity_count}</p>
                  <p className="text-slate-600 text-sm">activities</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-600" />
          Recent User Activity
        </h3>
        <div className="space-y-3">
          {analytics.recentActivity.slice(0, 10).map((activity, index) => (
            <div key={`${activity.id}-${index}`} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-b-0">
              <div>
                <p className="text-slate-700">{activity.user_email}</p>
                <p className="text-slate-600 text-sm">{activity.organization_name}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-800 capitalize">{activity.action_type.replace('_', ' ')}</p>
                <p className="text-slate-600 text-sm">
                  {new Date(activity.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
