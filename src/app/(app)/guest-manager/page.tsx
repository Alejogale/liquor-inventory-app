'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  DollarSign, 
  Building2, 
  Calendar,
  Plus,
  TrendingUp,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown
} from 'lucide-react'
import Link from 'next/link'
import { CountryClub, GuestVisit, GuestManagerStats } from '@/types/guest-manager'
import GuestManagerSidebar from '@/components/guest-manager/GuestManagerSidebar'

export default function GuestManagerDashboard() {
  const { user, organization, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [stats, setStats] = useState<GuestManagerStats>({
    total_guests_today: 0,
    total_revenue_today: 0,
    active_clubs: 0,
    monthly_guests: 0,
    monthly_revenue: 0
  })
  const [recentGuests, setRecentGuests] = useState<GuestVisit[]>([])
  const [topClubs, setTopClubs] = useState<CountryClub[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Always try to fetch data, even if organization is not available yet
    fetchDashboardData()
  }, [organization?.id])



  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      


      // If organization ID is not available, set default stats
      if (!organization?.id) {
        console.log('Organization ID not available, setting default stats')
        setStats({
          total_guests_today: 0,
          total_revenue_today: 0,
          active_clubs: 0,
          monthly_guests: 0,
          monthly_revenue: 0
        })
        setRecentGuests([])
        setTopClubs([])
        setLoading(false)
        return
      }
      
      // Fetch today's stats
      const today = new Date().toISOString().split('T')[0]
      const { data: todayGuests, error: todayError } = await supabase
        .from('guest_visits')
        .select('total_amount')
        .eq('organization_id', organization.id)
        .eq('visit_date', today)

      if (todayError) {
        console.error('Error fetching today\'s guests:', todayError)
      }

      const totalGuestsToday = todayGuests?.length || 0
      const totalRevenueToday = todayGuests?.reduce((sum, guest) => sum + (guest.total_amount || 0), 0) || 0

      // Fetch monthly stats
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
      const { data: monthlyGuests, error: monthlyError } = await supabase
        .from('guest_visits')
        .select('total_amount')
        .eq('organization_id', organization.id)
        .gte('visit_date', firstDayOfMonth)

      if (monthlyError) {
        console.error('Error fetching monthly guests:', monthlyError)
      }

      const monthlyGuestsCount = monthlyGuests?.length || 0
      const monthlyRevenue = monthlyGuests?.reduce((sum, guest) => sum + (guest.total_amount || 0), 0) || 0

      // Fetch active clubs count
      const { data: activeClubs, error: clubsError } = await supabase
        .from('country_clubs')
        .select('id')
        .eq('organization_id', organization.id)
        .eq('status', 'active')

      if (clubsError) {
        console.error('Error fetching active clubs:', clubsError)
      }

      const activeClubsCount = activeClubs?.length || 0

      // Fetch recent guests
      const { data: recent, error: recentError } = await supabase
        .from('guest_visits')
        .select(`
          *,
          home_club:country_clubs(name, location)
        `)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recentError) {
        console.error('Error fetching recent guests:', recentError)
      }

      // Fetch top clubs by revenue - only if there are actual clubs with data
      const { data: clubs, error: topClubsError } = await supabase
        .from('country_clubs')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('status', 'active')
        .gt('total_revenue', 0) // Only clubs with actual revenue
        .order('total_revenue', { ascending: false })
        .limit(5)

      if (topClubsError) {
        console.error('Error fetching top clubs:', topClubsError)
      }

      setStats({
        total_guests_today: totalGuestsToday,
        total_revenue_today: totalRevenueToday,
        active_clubs: activeClubsCount,
        monthly_guests: monthlyGuestsCount,
        monthly_revenue: monthlyRevenue
      })

      setRecentGuests(recent || [])
      setTopClubs(clubs || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values on error
      setStats({
        total_guests_today: 0,
        total_revenue_today: 0,
        active_clubs: 0,
        monthly_guests: 0,
        monthly_revenue: 0
      })
      setRecentGuests([])
      setTopClubs([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'billed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Guest Manager Dashboard</h1>
                <p className="text-gray-600">Manage guest visits and country club relationships</p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/guest-manager/guests"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Guest</span>
                </Link>
                <Link
                  href="/guest-manager/clubs"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Manage Clubs</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Today's Guests</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.total_guests_today}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-gray-500">No guests today</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Today's Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">${stats.total_revenue_today.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-gray-500">No revenue today</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Active Clubs</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.active_clubs}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                        <Building2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-gray-500">No active clubs</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">${stats.monthly_revenue.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className="text-gray-500">{stats.monthly_guests} guests this month</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  {/* Recent Guests */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Recent Guests</h2>
                      <Link
                        href="/guest-manager/guests"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <span>View All</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {recentGuests.length > 0 ? (
                        recentGuests.map((guest) => (
                          <div key={guest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {guest.guest_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{guest.guest_name}</p>
                                <p className="text-sm text-gray-600">
                                  {guest.home_club?.name || 'No club specified'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(guest.status)}`}>
                                {guest.status}
                              </span>
                              <span className="font-semibold text-gray-900">${guest.total_amount.toFixed(2)}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No guests yet</h3>
                          <p className="text-gray-600 mb-4">Start by adding your first guest visit</p>
                          <Link
                            href="/guest-manager/guests"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Guest
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Top Clubs */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Top Performing Clubs</h2>
                      <Link
                        href="/guest-manager/clubs"
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <span>View All</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                    
                    <div className="space-y-4">
                      {topClubs.length > 0 ? (
                        topClubs.map((club, index) => (
                          <div key={club.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{club.name}</p>
                                <p className="text-sm text-gray-600">{club.location}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${club.total_revenue.toFixed(2)}</p>
                              <p className="text-sm text-gray-600">{club.monthly_guests} guests</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs yet</h3>
                          <p className="text-gray-600 mb-4">Add your first country club to get started</p>
                          <Link
                            href="/guest-manager/clubs"
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add First Club
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Link
                    href="/guest-manager/guests"
                    className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 mb-4 group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Guests</h3>
                    <p className="text-gray-600 text-sm">Add, edit, and track guest visits</p>
                  </Link>

                  <Link
                    href="/guest-manager/clubs"
                    className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 mb-4 group-hover:scale-110 transition-transform">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Country Clubs</h3>
                    <p className="text-gray-600 text-sm">Manage participating clubs</p>
                  </Link>

                  <Link
                    href="/guest-manager/billing"
                    className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Billing & Reports</h3>
                    <p className="text-gray-600 text-sm">Generate reports and export data</p>
                  </Link>

                  <Link
                    href="/guest-manager/export"
                    className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 mb-4 group-hover:scale-110 transition-transform">
                      <Download className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data</h3>
                    <p className="text-gray-600 text-sm">Export guest data to CSV</p>
                  </Link>
                </div>
              </>
            )}
          </div>
        )
      case 'guests':
        return (
          <div className="p-6 lg:p-8">
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Guest Management</h2>
              <p className="text-gray-600 mb-6">Navigate to the guests page for detailed management</p>
              <Link
                href="/guest-manager/guests"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Guest Management
              </Link>
            </div>
          </div>
        )
      case 'clubs':
        return (
          <div className="p-6 lg:p-8">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Country Clubs</h2>
              <p className="text-gray-600 mb-6">Club management coming soon</p>
              <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </div>
            </div>
          </div>
        )
      case 'billing':
        return (
          <div className="p-6 lg:p-8">
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Billing & Reports</h2>
              <p className="text-gray-600 mb-6">Billing management coming soon</p>
              <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </div>
            </div>
          </div>
        )
      case 'export':
        return (
          <div className="p-6 lg:p-8">
            <div className="text-center py-12">
              <Download className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Export Data</h2>
              <p className="text-gray-600 mb-6">Export functionality coming soon</p>
              <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-lg">
                <Clock className="h-4 w-4 mr-2" />
                Coming Soon
              </div>
            </div>
          </div>
        )
      default:
        return (
          <div className="p-6 lg:p-8">
            <div className="text-center py-12">
              <Crown className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Guest Manager</h2>
              <p className="text-gray-600">Select a tab from the sidebar to get started</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-white to-blue-100/20 flex relative lg:grid lg:grid-cols-[auto_1fr]">
      {/* Sidebar Navigation */}
      <GuestManagerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={user?.email || 'Guest'}
        onSignOut={handleSignOut}
        onCollapsedChange={setSidebarCollapsed}
      />
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto h-screen ${
        sidebarCollapsed ? 'ml-20' : 'ml-80'
      } lg:ml-0`}>
        <div className="min-h-full">
          {loading && !organization?.id ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Guest Manager...</p>
              </div>
            </div>
          ) : (
            renderActiveTab()
          )}
        </div>
      </div>
    </div>
  )
}
