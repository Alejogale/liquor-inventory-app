'use client'

import { useAuth } from '@/lib/auth-context'
import { Package, Calendar, Users, CreditCard, Building2, BarChart3, ChevronRight, Settings, Grid3X3, Plus, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, ArrowUpRight, Eye, Edit, Trash2, Zap, Tag, Crown } from 'lucide-react'
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
    id: 'consumption-sheet',
    name: 'Consumption Sheet',
    description: 'Real-time event consumption tracking with multi-window support',
    icon: CreditCard,
    status: 'available',
    route: '/consumption-sheet',
    color: 'from-purple-500 to-pink-500',
    features: ['Real-time Tracking', 'Multi-Window Support', 'Automated Reports', 'Manager Emails', 'Google Sheets']
  },
  {
    id: 'guest-manager',
    name: 'Guest Manager',
    description: 'Country club guest management with billing and export functionality',
    icon: Crown,
    status: 'available',
    route: '/guest-manager',
    color: 'from-indigo-500 to-purple-500',
    features: ['Guest Tracking', 'Country Club Management', 'Purchase Tracking', 'CSV Export', 'Billing Reports']
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
    totalActivity: 0,
    totalConsumptionToday: 0,
    activeEvents: 0
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
        totalActivity,
        totalConsumptionToday: 0, // TODO: Implement consumption tracking integration
        activeEvents: 0 // TODO: Implement active events tracking
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
    <div className="min-h-screen bg-white flex relative lg:grid lg:grid-cols-[auto_1fr]">
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
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-headline text-primary">Hospitality Platform</h1>
                  <p className="text-body text-muted">{organization?.Name || 'Welcome'}</p>
                </div>
              </div>
              
              {/* Platform Admin Badge */}
              {isPlatformAdmin() && (
                <div className="px-4 py-2 rounded-full flex items-center space-x-2 bg-accent border border-accent/20 shadow-md">
                  <span className="text-caption font-medium text-white">🌟 Platform Admin</span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-lg p-1 mb-8 max-w-md bg-surface border border-stone-gray">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 py-3 px-4 rounded-md text-caption font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'dashboard'
                    ? 'button-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`flex-1 py-3 px-4 rounded-md text-caption font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'subscription'
                    ? 'button-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Team & Billing</span>
              </button>
            </div>

            {/* Welcome Section */}
            {activeTab === 'dashboard' && (
              <div className="text-center mb-12">
                <h2 className="text-headline text-primary mb-4">
                  Welcome to Your Command Center
                </h2>
                <p className="text-body text-muted max-w-2xl mx-auto leading-relaxed">
                  Monitor all your hospitality operations from one unified dashboard. 
                  Get insights, manage inventory, and track reservations in real-time.
                </p>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="text-center mb-12">
                <h2 className="text-headline text-primary mb-4">
                  Team & Billing Management
                </h2>
                <p className="text-body text-muted max-w-2xl mx-auto leading-relaxed">
                  Manage your subscription, invite team members, and control access permissions.
                </p>
              </div>
            )}
          </div>

          {/* Content Container */}
          <div className="card-elevated">
            
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <>
                {/* Quick Actions - Moved to Top */}
                <div className="mb-8">
                  <h3 className="text-title text-primary mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                    <button
                      onClick={() => router.push('/dashboard?tab=inventory')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                          <Plus className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Add Item</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/reservations')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">New Booking</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=count')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Room Count</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=orders')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Order Report</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=categories')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Categories</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=suppliers')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Suppliers</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/dashboard?tab=rooms')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Rooms</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => router.push('/consumption-sheet')}
                      className="card group hover:shadow-md transition-all duration-200 text-center"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-600 to-pink-800 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-primary group-hover:text-accent text-caption">Consumption</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                  <div className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption text-muted mb-1">Total Items</p>
                        <p className="text-headline text-primary">{stats.totalItems}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption text-muted mb-1">Low Stock</p>
                        <p className="text-headline text-primary">{stats.lowStockItems}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  

                  
                  <div className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption text-muted mb-1">Active Members</p>
                        <p className="text-headline text-primary">{stats.activeMembers}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption text-muted mb-1">Total Covers</p>
                        <p className="text-headline text-primary">{stats.totalCovers}</p>
                        <p className="text-xs text-muted mt-1">Your Organization</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-charcoal flex items-center justify-center shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption text-muted mb-1">Total Activity</p>
                        <p className="text-headline text-primary">{stats.totalActivity}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-slate-gray flex items-center justify-center shadow-md">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-caption text-muted mb-1">Total Rooms</p>
                        <p className="text-headline text-primary">{stats.totalRooms}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-slate-gray flex items-center justify-center shadow-md">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* App Sections Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Liquor Inventory Section */}
                  <div className="card-elevated">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shadow-md">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-title text-primary">Liquor Inventory</h3>
                          <p className="text-caption text-muted">Manage your stock levels</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="button-primary"
                      >
                        View All
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-stone-gray border-t-accent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-caption text-muted">Loading inventory...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {inventoryItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-gray bg-surface">
                            <div className="flex-1">
                              <p className="font-medium text-primary">{item.brand}</p>
                              <p className="text-caption text-muted">{item.size} • {item.categories?.name || 'Uncategorized'}</p>
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
                          <div className="text-center py-8 text-muted">
                            <Package className="w-8 h-8 mx-auto mb-2 text-stone-gray" />
                            <p>No inventory items found</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reservations Section */}
                  <div className="card-elevated">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-md">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                        <div>
                          <h3 className="text-title text-primary">Reservations</h3>
                          <p className="text-caption text-muted">Today's bookings</p>
                        </div>
                      </div>
                      <button
                        onClick={() => router.push('/reservations')}
                        className="button-secondary"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {reservations.length > 0 ? (
                        reservations.slice(0, 5).map((reservation) => (
                          <div key={reservation.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-gray bg-surface">
                            <div className="flex-1">
                              <p className="font-medium text-primary">{reservation.member_name}</p>
                              <p className="text-caption text-muted">{reservation.reservation_time} • {reservation.party_size} people</p>
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
                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-accent cursor-pointer ${
                                  reservation.status === 'Here' || reservation.status === 'Ordered'
                                    ? 'bg-green-100 text-green-700' 
                                    : reservation.status === 'Waiting to arrive'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-surface text-muted'
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
                        <div className="text-center py-8 text-muted">
                          <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-gray" />
                          <p>No reservations found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Member Database Section */}
                  <div className="card-elevated">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                                              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                        <div>
                          <h3 className="text-title text-primary">Member Database</h3>
                          <p className="text-caption text-muted">Active members</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        Coming Soon
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {members.length > 0 ? (
                        members.slice(0, 5).map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-gray bg-surface">
                            <div className="flex-1">
                              <p className="font-medium text-primary">{member.full_name}</p>
                              <p className="text-caption text-muted">{member.membership_type || 'Standard'} • {member.member_number}</p>
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
                        <div className="text-center py-8 text-muted">
                          <Users className="w-8 h-8 mx-auto mb-2 text-stone-gray" />
                          <p>No members found</p>
                        </div>
                      )}
                    </div>
                  </div>


                </div>

                {/* App Status Section */}
                <div className="mt-8 pt-8 border-t border-stone-gray">
                  <div className="text-center mb-8">
                    <h3 className="text-headline text-primary mb-3">App Status & Development</h3>
                    <p className="text-body text-muted">Track our progress as we build the complete platform</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {apps.map((app) => {
                      const Icon = app.icon
                      const isAvailable = app.status === 'available'
                      
                      return (
                        <div
                          key={app.id}
                          className={`relative card-elevated transition-all duration-200 ${
                            isAvailable ? 'cursor-pointer hover:shadow-xl' : 'cursor-not-allowed opacity-60'
                          }`}
                          onClick={() => handleAppClick(app)}
                        >
                          {/* Status Badge */}
                          <div className="absolute top-4 right-4">
                            {getStatusBadge(app.status)}
                          </div>

                          {/* App Icon */}
                          <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-6 shadow-md transition-transform duration-200 ${
                                 app.id === 'liquor-inventory' ? 'bg-gradient-to-br from-blue-600 to-blue-800' :
                                 app.id === 'reservation-system' ? 'bg-gradient-to-br from-green-600 to-green-800' :
                                 app.id === 'member-database' ? 'bg-gradient-to-br from-purple-600 to-purple-800' :
                                 app.id === 'consumption-sheet' ? 'bg-gradient-to-br from-pink-600 to-pink-800' :
                                 'bg-gradient-to-br from-gray-600 to-gray-800'
                               }`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>

                          {/* App Info */}
                          <div className="mb-4">
                            <h3 className="text-title text-primary mb-2 flex items-center">
                              {app.name}
                              {isAvailable && (
                                <ChevronRight className="ml-2 h-4 w-4 text-muted" />
                              )}
                            </h3>
                            <p className="text-caption text-muted leading-relaxed">
                              {app.description}
                            </p>
                          </div>

                          {/* Features List */}
                          <div className="space-y-2">
                            <h4 className="text-xs font-medium text-secondary uppercase tracking-wider">Key Features</h4>
                            <div className="grid grid-cols-1 gap-1">
                              {app.features.slice(0, 3).map((feature, index) => (
                                <div key={index} className="flex items-center text-xs text-muted">
                                  <div className="w-1.5 h-1.5 bg-slate-gray rounded-full mr-2 flex-shrink-0"></div>
                                  {feature}
                                </div>
                              ))}
                              {app.features.length > 3 && (
                                <div className="text-xs text-muted mt-1">
                                  +{app.features.length - 3} more features
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Launch Button */}
                          {isAvailable && (
                            <div className="mt-6">
                              <div className="button-primary w-full text-center cursor-pointer">
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
                  <div className="card-elevated">
                    <h3 className="text-title text-primary mb-4">Advanced Permissions</h3>
                    <p className="text-body text-muted mb-6">Fine-tune user roles and access permissions</p>
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