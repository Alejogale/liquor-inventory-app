'use client'

import { useAuth } from '@/lib/auth-context'
import { Package, Calendar, Users, CreditCard, Building2, BarChart3, ChevronRight, Settings, Grid3X3, Plus, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, ArrowUpRight, Eye, Edit, Trash2, Zap, Tag } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import AppsSidebar from '@/components/AppsSidebar'
import SubscriptionManager from '@/components/SubscriptionManager'
import UserPermissions from '@/components/UserPermissions'
import TeamManagement from '@/components/TeamManagement'
import BillingDashboard from '@/components/BillingDashboard'
import { supabase } from '@/lib/supabase'

interface AppTile {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'available' | 'coming_soon' | 'planned'
  route?: string
  color: string
  features: string[]
}

interface InventoryItem {
  id: string
  brand: string
  size: string
  threshold: number
  par_level: number
  categories: { name: string } | null
  suppliers: { name: string } | null
}

interface Reservation {
  id: string
  member_name: string
  reservation_date: string
  reservation_time: string
  party_size: number
  status: string
  service_type: string
  notes?: string
}

interface Member {
  id: string
  first_name: string
  last_name: string
  full_name: string
  member_number: string
  email?: string
  membership_type?: string
  membership_status: string
  join_date?: string
}

const apps: AppTile[] = [
  {
    id: 'liquor-inventory',
    name: 'Liquor Inventory',
    description: 'Complete inventory management system for bars and restaurants',
    icon: Package,
    status: 'available',
    route: '/dashboard',
    color: 'from-orange-500 to-red-500',
    features: ['Inventory Tracking', 'Room Counting', 'Supplier Management', 'Order Reports', 'Analytics']
  },
  {
    id: 'reservation-system',
    name: 'Reservation Management',
    description: 'Table reservations and room booking system for hospitality venues',
    icon: Calendar,
    status: 'available',
    route: '/reservations',
    color: 'from-blue-500 to-indigo-500',
    features: ['Table Management', '5-Day Rolling View', 'Walk-in Management', 'Status Workflow', 'Member Integration']
  },
  {
    id: 'member-database',
    name: 'Member Database',
    description: 'Comprehensive member management with family tracking and search',
    icon: Users,
    status: 'coming_soon',
    color: 'from-green-500 to-emerald-500',
    features: ['Member Profiles', 'Family Tracking', 'Sub-100ms Search', 'History Tracking', 'Reservation Links']
  },
  {
    id: 'pos-system',
    name: 'POS System',
    description: 'Point-of-sale system integrated with inventory and member data',
    icon: CreditCard,
    status: 'planned',
    color: 'from-purple-500 to-pink-500',
    features: ['Payment Processing', 'Inventory Integration', 'Member Billing', 'Reporting', 'Multi-Location']
  }
]

export default function AppsPage() {
  const { user, userProfile, organization, isPlatformAdmin, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [hoveredApp, setHoveredApp] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(true)
  
  // Dashboard data state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalRooms: 0,
    totalCovers: 0,
    totalMembers: 0,
    activeMembers: 0,
    recentActivity: 0,
    totalActivity: 0
  })

  // Get the correct organization ID
  const organizationId = organization?.id || (user?.email === 'alejogaleis@gmail.com' ? '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0' : null)
  
  console.log('🔍 Organization ID being used:', organizationId)
  console.log('🔍 User email:', user?.email)
  console.log('🔍 Organization object:', organization)

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['dashboard', 'subscription'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Fetch dashboard data
  useEffect(() => {
    if (user && organizationId) {
      fetchDashboardData()
    }
  }, [user, organizationId])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching dashboard data for organization:', organizationId)
      console.log('👤 Current user:', user?.email)
      console.log('🏢 Organization:', organization?.Name)
      
      // Fetch ALL inventory items for this organization (no limit)
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('brand')

      if (inventoryError) {
        console.error('Error fetching inventory:', inventoryError)
      }

      // Fetch categories and suppliers for enrichment
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organizationId)

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError)
      }

      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', organizationId)

      if (suppliersError) {
        console.error('Error fetching suppliers:', suppliersError)
      }

      // Enrich inventory data
      const enrichedInventory = inventoryData?.map(item => {
        const category = categoriesData?.find(cat => cat.id === item.category_id)
        const supplier = suppliersData?.find(sup => sup.id === item.supplier_id)
        
        return {
          ...item,
          categories: category ? { name: category.name } : null,
          suppliers: supplier ? { name: supplier.name } : null
        }
      }) || []

      // Fetch ALL reservations data for this organization (no limit)
      console.log('🔍 Fetching reservations for organization ID:', organizationId)
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('*')
        .eq('organization_id', organizationId)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })

      if (reservationsError) {
        console.error('❌ Error fetching reservations:', reservationsError)
      } else {
        console.log('✅ Reservations query successful')
      }

      // DEBUG: Check ALL reservations in database (without organization filter)
      const { data: allReservationsData, error: allReservationsError } = await supabase
        .from('reservations')
        .select('organization_id, party_size, member_name')
        .limit(10)
      
      if (!allReservationsError) {
        console.log('🔍 ALL reservations in database (first 10):', allReservationsData)
        console.log('🔍 Total reservations in entire database:', allReservationsData?.length || 0)
      }

      // DEBUG: Check for reservations with null organization_id
      const { data: nullOrgReservations, error: nullOrgError } = await supabase
        .from('reservations')
        .select('organization_id, party_size, member_name')
        .is('organization_id', null)
        .limit(5)
      
      if (!nullOrgError) {
        console.log('🔍 Reservations with NULL organization_id:', nullOrgReservations)
        console.log('🔍 Count of reservations with NULL organization_id:', nullOrgReservations?.length || 0)
      }

      // Fetch ALL members data for this organization (no limit)
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('membership_status', 'active')
        .order('last_name', { ascending: true })

      if (membersError) {
        console.error('Error fetching members:', membersError)
      }

      // Fetch ALL activity logs for this organization (no limit for stats)
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (activityError) {
        console.error('Error fetching activity logs:', activityError)
      }

      // Fetch rooms data for this organization
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization_id', organizationId)
        .order('display_order')

      if (roomsError) {
        console.error('Error fetching rooms:', roomsError)
      }

      setInventoryItems(enrichedInventory)
      setReservations(reservationsData || [])
      setMembers(membersData || [])

      // Calculate comprehensive stats
      const lowStockItems = enrichedInventory.filter(item => item.threshold > item.par_level).length
      
      // Calculate total covers (total number of people across all reservations)
      const totalCovers = reservationsData?.reduce((sum, reservation) => sum + (reservation.party_size || 0), 0) || 0
      
      console.log('🏢 Organization ID:', organizationId)
      console.log('📅 Total reservations found:', reservationsData?.length || 0)
      console.log('👥 Total covers (sum of all party sizes):', totalCovers)
      console.log('📊 Sample reservations data:', reservationsData?.slice(0, 3).map(r => ({
        id: r.id,
        member_name: r.member_name,
        party_size: r.party_size,
        reservation_date: r.reservation_date
      })))
      console.log('📊 ALL reservations for your organization:', reservationsData?.map(r => ({
        id: r.id,
        member_name: r.member_name,
        party_size: r.party_size,
        reservation_date: r.reservation_date,
        status: r.status
      })))
      
      // Show detailed breakdown of all reservations
      console.log('📋 DETAILED RESERVATION BREAKDOWN:')
      reservationsData?.forEach((r, index) => {
        console.log(`${index + 1}. ${r.member_name} - ${r.party_size} people - ${r.reservation_date} - ${r.status}`)
      })
      console.log(`TOTAL: ${reservationsData?.length || 0} reservations, ${totalCovers} covers`)
      
      const activeMembers = membersData?.length || 0
      const totalActivity = activityData?.length || 0

      console.log('📊 Dashboard Stats:', {
        totalItems: enrichedInventory.length,
        lowStockItems,
        totalCategories: categoriesData?.length || 0,
        totalSuppliers: suppliersData?.length || 0,
        totalRooms: roomsData?.length || 0,
        totalCovers,
        totalMembers: membersData?.length || 0,
        activeMembers,
        totalActivity
      })

      setStats({
        totalItems: enrichedInventory.length,
        lowStockItems,
        totalCategories: categoriesData?.length || 0,
        totalSuppliers: suppliersData?.length || 0,
        totalRooms: roomsData?.length || 0,
        totalCovers,
        totalMembers: membersData?.length || 0,
        activeMembers,
        recentActivity: totalActivity,
        totalActivity
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleAppClick = (app: AppTile) => {
    if (app.status === 'available' && app.route) {
      router.push(app.route)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">Available</span>
      case 'coming_soon':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">Coming Soon</span>
      case 'planned':
        return <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">Planned</span>
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-blue-50/20 flex relative lg:grid lg:grid-cols-[auto_1fr]">
      {/* Sidebar Navigation */}
      <AppsSidebar
        userEmail={user?.email || ''}
        onSignOut={handleSignOut}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto h-screen ${
        sidebarCollapsed ? 'ml-20' : 'ml-80'
      } lg:ml-0`}>
        {/* Top Header Bar */}
        <div className="p-6 lg:p-8">
          {/* Header with Platform Admin Badge */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hospitality Platform</h1>
                  <p className="text-gray-600">{organization?.Name || 'Welcome'}</p>
                </div>
              </div>
              
              {/* Platform Admin Badge */}
              {isPlatformAdmin() && (
                <div className="px-4 py-2 rounded-full flex items-center space-x-2 border backdrop-blur-sm"
                     style={{
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                       borderColor: 'rgba(255, 119, 0, 0.3)',
                       boxShadow: '0 4px 12px rgba(255, 119, 0, 0.2)'
                     }}>
                  <span className="text-sm font-medium text-white">🌟 Platform Admin</span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-2xl p-1 mb-8 max-w-md backdrop-blur-xl border border-white/20"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)'
                 }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={activeTab === 'dashboard' ? {
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                  boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                } : {}}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'subscription'
                    ? 'text-white shadow-lg'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
                style={activeTab === 'subscription' ? {
                  background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                  boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                } : {}}
              >
                <Settings className="h-4 w-4" />
                <span>Team & Billing</span>
              </button>
            </div>

            {/* Welcome Section */}
            {activeTab === 'dashboard' && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  Welcome to Your Command Center
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Monitor all your hospitality operations from one unified dashboard. 
                  Get insights, manage inventory, and track reservations in real-time.
                </p>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  Team & Billing Management
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Manage your subscription, invite team members, and control access permissions.
                </p>
              </div>
            )}
          </div>

          {/* Content Container */}
          <div className="rounded-2xl border border-white/20 shadow-2xl p-8 backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 25px 50px rgba(255, 119, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
               }}>
            
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <>
                {/* Quick Actions - Moved to Top */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <button
                      onClick={() => router.push('/dashboard?tab=inventory')}
                      className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 hover:bg-orange-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-orange-700 text-sm">Add Item</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/reservations')}
                      className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-blue-700 text-sm">New Booking</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=count')}
                      className="p-4 rounded-xl border border-green-200 bg-green-50/50 hover:bg-green-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-green-700 text-sm">Room Count</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=orders')}
                      className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-purple-700 text-sm">Order Report</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=categories')}
                      className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-indigo-700 text-sm">Categories</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=suppliers')}
                      className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-teal-500 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-teal-700 text-sm">Suppliers</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=rooms')}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-slate-500 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-slate-700 text-sm">Rooms</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=activity')}
                      className="p-4 rounded-xl border border-pink-200 bg-pink-50/50 hover:bg-pink-100/50 transition-all duration-200 text-center group"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-pink-700 text-sm">Analytics</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                  <div className="rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1)'
                       }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Total Items</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                             boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                           }}>
                        <Package className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
                       }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Low Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                             boxShadow: '0 8px 24px rgba(239, 68, 68, 0.3)'
                           }}>
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  

                  
                  <div className="rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                       }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Active Members</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeMembers}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                             boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                           }}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
                       }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Total Covers</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalCovers}</p>
                        <p className="text-xs text-gray-500 mt-1">Your Organization</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                             boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                           }}>
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)'
                       }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Total Activity</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalActivity}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                             boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)'
                           }}>
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl p-4 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(107, 114, 128, 0.1)'
                       }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-1">Total Rooms</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                             boxShadow: '0 8px 24px rgba(107, 114, 128, 0.3)'
                           }}>
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Liquor Inventory Section */}
                  <div className="rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg p-6"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)'
                       }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                             style={{
                               background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                               boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                             }}>
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Liquor Inventory</h3>
                          <p className="text-gray-600 text-sm">Manage your stock levels</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="px-4 py-2 text-white text-sm rounded-xl transition-all duration-300 font-medium"
                        style={{
                          background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                          boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
                        }}
                      >
                        View All
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-600 text-sm">Loading inventory...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inventoryItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-orange-100 bg-orange-50/50">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{item.brand}</p>
                              <p className="text-sm text-gray-600">{item.size} • {item.categories?.name || 'Uncategorized'}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.threshold > item.par_level 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {item.threshold > item.par_level ? 'Low Stock' : 'In Stock'}
                              </span>
                            </div>
                          </div>
                        ))}
                        {inventoryItems.length === 0 && (
                          <div className="text-center py-8 text-gray-500">
                            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No inventory items found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reservations Section */}
                  <div className="rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg p-6"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(239,246,255,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)'
                       }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                             style={{
                               background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                               boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                             }}>
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Reservations</h3>
                          <p className="text-gray-600 text-sm">Today's bookings</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/reservations')}
                        className="px-4 py-2 text-white text-sm rounded-xl transition-all duration-300 font-medium"
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {reservations.length > 0 ? (
                        reservations.slice(0, 5).map((reservation) => (
                          <div key={reservation.id} className="flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50/50">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{reservation.member_name}</p>
                              <p className="text-sm text-gray-600">{reservation.reservation_time} • {reservation.party_size} people</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <select
                                value={reservation.status}
                                onChange={async (e) => {
                                  try {
                                    const { error } = await supabase
                                      .from('reservations')
                                      .update({ status: e.target.value })
                                      .eq('id', reservation.id)
                                      .eq('organization_id', organizationId)
                                    
                                    if (error) {
                                      console.error('Error updating reservation status:', error)
                                    } else {
                                      // Refresh data after update
                                      fetchDashboardData()
                                    }
                                  } catch (error) {
                                    console.error('Error updating reservation:', error)
                                  }
                                }}
                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                                  reservation.status === 'Here' || reservation.status === 'Ordered'
                                    ? 'bg-green-100 text-green-700' 
                                    : reservation.status === 'Waiting to arrive'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <option value="Waiting to arrive">Waiting to arrive</option>
                                <option value="Here">Here</option>
                                <option value="Ordered">Ordered</option>
                                <option value="Left">Left</option>
                                <option value="Canceled">Canceled</option>
                                <option value="No Dessert">No Dessert</option>
                                <option value="Received Dessert">Received Dessert</option>
                                <option value="Menus Open">Menus Open</option>
                                <option value="At The Bar">At The Bar</option>
                              </select>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No reservations found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Database Section */}
                  <div className="rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg p-6"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,244,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)'
                       }}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                             style={{
                               background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                               boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                             }}>
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Member Database</h3>
                          <p className="text-gray-600 text-sm">Active members</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Coming Soon
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {members.length > 0 ? (
                        members.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 rounded-xl border border-green-100 bg-green-50/50">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{member.full_name}</p>
                              <p className="text-sm text-gray-600">{member.membership_type || 'Standard'} • {member.member_number}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.membership_type === 'Premium' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : member.membership_status === 'active'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {member.membership_type || 'Standard'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No members found</p>
                        </div>
                      )}
                    </div>
                  </div>


                </div>

                {/* App Status Section */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">App Status & Development</h3>
                    <p className="text-gray-600">Track our progress as we build the complete platform</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {apps.map((app) => {
                      const Icon = app.icon
                      const isAvailable = app.status === 'available'
                      
                      return (
                        <div
                          key={app.id}
                          className={`relative rounded-2xl p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 ${
                            isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                          }`}
                          style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                          }}
                          onClick={() => handleAppClick(app)}
                        >
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(app.status)}
                          </div>

                          {/* App Icon */}
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300"
                               style={{
                                 background: app.id === 'liquor-inventory' ? 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)' :
                                           app.id === 'reservation-system' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                                           app.id === 'member-database' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                                           'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                                 boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                               }}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>

                          {/* App Info */}
                          <div className="mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center tracking-tight">
                              {app.name}
                              {isAvailable && (
                                <ChevronRight className="ml-2 h-4 w-4 text-gray-400" />
                              )}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {app.description}
                            </p>
                          </div>

                          {/* Features List */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider">Key Features</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {app.features.slice(0, 3).map((feature, index) => (
                                <div key={index} className="flex items-center text-xs text-gray-600">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
                                  {feature}
                                </div>
                              ))}
                              {app.features.length > 3 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  +{app.features.length - 3} more features
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Launch Button */}
                          {isAvailable && (
                            <div className="mt-6">
                              <div className="px-6 py-3 rounded-xl font-medium text-sm text-center transition-all duration-300 text-white cursor-pointer"
                                   style={{
                                     background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                                     boxShadow: '0 4px 15px rgba(255, 119, 0, 0.4)'
                                   }}
                                   onMouseEnter={(e) => {
                                     e.currentTarget.style.transform = 'translateY(-1px)';
                                     e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.5)';
                                   }}
                                   onMouseLeave={(e) => {
                                     e.currentTarget.style.transform = 'translateY(0px)';
                                     e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 119, 0, 0.4)';
                                   }}>
                                Launch Application
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Subscription Content */}
            {activeTab === 'subscription' && (
              <div className="space-y-8">
                {/* Billing Dashboard */}
                <BillingDashboard />

                {/* Team Management */}
                {(userProfile?.role === 'owner' || userProfile?.role === 'manager') && (
                  <TeamManagement />
                )}

                {/* Subscription Management (Legacy) */}
                <SubscriptionManager />

                {/* Advanced Permissions (for power users) */}
                {userProfile?.role === 'owner' && (
                  <div className="rounded-2xl p-8 border border-white/20 backdrop-blur-xl"
                       style={{
                         background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                         backdropFilter: 'blur(20px)',
                         WebkitBackdropFilter: 'blur(20px)',
                         boxShadow: '0 8px 32px rgba(255, 119, 0, 0.05)'
                       }}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Advanced Permissions</h3>
                    <p className="text-gray-600 mb-6">Fine-tune user roles and access permissions</p>
                    <UserPermissions organizationId={organization?.id} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}