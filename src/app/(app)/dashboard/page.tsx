'use client'
import { 
  CheckCircle, 
  Trash2, 
  Move, 
  Users, 
  Tag, 
  Check, 
  X, 
  ChevronDown,
  Package,
  Building2,
  ClipboardList,
  DollarSign
} from 'lucide-react'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useOrganizationData } from '@/lib/use-data-loading'
import { supabase } from '@/lib/supabase'
import { config } from '@/lib/config'
import { useSearchParams } from 'next/navigation'
import AddCategoryModal from '@/app/components/AddCategoryModal'
import EditCategoryModal from '@/app/components/EditCategoryModal'
import AddItemModal from '@/app/components/AddItemModal'
import EditItemModal from '@/components/EditItemModal'
import InventoryTable from '@/components/InventoryTable'
import SupplierManager from '@/components/SupplierManager'
import RoomCountingInterface from '@/components/RoomCountingInterface'
import OrderReport from '@/components/OrderReport'
import RoomManager from '@/components/RoomManager'
import ActivityDashboard from '@/components/ActivityDashboard'
import ImportData from '@/components/ImportData'
import DashboardSidebar from '@/components/DashboardSidebar'
import BillingDashboard from '@/components/BillingDashboard'
import UserPermissions from '@/components/UserPermissions'
import WelcomeOnboardingModal from '@/components/WelcomeOnboardingModal'
import BulkPricingModal from '@/components/BulkPricingModal'
import TeamPINManagement from '@/components/TeamPINManagement'
import StockMovementAnalytics from '@/components/StockMovementAnalytics'
import { SubscriptionGuard } from '@/components/SubscriptionGuard'
import { canAccessTab, getDefaultTab, hasTabPermission } from '@/lib/permissions'


interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  contact_person?: string
  notes?: string
}

interface InventoryItem {
  id: string
  brand: string
  size: string
  threshold: number
  par_level: number
  barcode?: string
  current_stock?: number
  price_per_item?: number
  categories: { name: string } | null
  suppliers: { name: string } | null
  category_id: string
  supplier_id: string
  organization_id?: string
  created_at?: string
  updated_at?: string
}

function DashboardContent() {
  const { user, userProfile, organization, signOut } = useAuth()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('inventory')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showEditCategory, setShowEditCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalRooms: 0,
    totalInventoryValue: 0
  })
  const [showValueBreakdown, setShowValueBreakdown] = useState(false)
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ categoryName: string; totalValue: number }[]>([])

  // Add to existing state
  const [selectedItems, setSelectedItems] = useState(new Set<string>())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'move-category' | 'move-supplier' | 'change-price' | null>(null)
  const [targetCategory, setTargetCategory] = useState('')
  const [targetSupplier, setTargetSupplier] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false)
  const fetchingRef = useRef(false)

  // Category selection state
  const [selectedCategories, setSelectedCategories] = useState(new Set<string>())
  const [showCategoryBulkActions, setShowCategoryBulkActions] = useState(false)

  const isAdmin = config.isPlatformAdmin(user?.email)

  // Role-based permission helpers
  const canAddItem = isAdmin || hasTabPermission(userProfile?.role, 'add_item')
  const canEditItem = isAdmin || hasTabPermission(userProfile?.role, 'edit_item')
  const canDeleteItem = isAdmin || hasTabPermission(userProfile?.role, 'delete_item')

  // Get the correct organization ID - for admin, use the known organization ID if context is missing
  const organizationId = organization?.id || (isAdmin ? '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0' : undefined)
  
  console.log('🔍 Dashboard state:', {
    user: user?.email,
    organization: organization?.Name,
    organizationId,
    isAdmin,
    loading
  })


  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['inventory', 'import', 'categories', 'suppliers', 'rooms', 'count', 'orders', 'activity', 'integrations', 'subscription'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Ensure user can only access tabs they have permission for
  useEffect(() => {
    // Skip check for platform admins (they have full access)
    if (isAdmin) return

    // Check if user can access the current tab
    if (!canAccessTab(userProfile?.role, activeTab)) {
      // Redirect to the default tab for their role
      const defaultTab = getDefaultTab(userProfile?.role)
      console.log(`🔒 User role "${userProfile?.role}" cannot access "${activeTab}", redirecting to "${defaultTab}"`)
      setActiveTab(defaultTab)
    }
  }, [activeTab, userProfile?.role, isAdmin])

  // Show welcome modal for new users
  useEffect(() => {
    if (user && !loading) {
      const hasSeenWelcome = localStorage.getItem(`welcome_seen_${user.id}`)
      if (!hasSeenWelcome) {
        setShowWelcomeModal(true)
      }
    }
  }, [user, loading])

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false)
    if (user) {
      localStorage.setItem(`welcome_seen_${user.id}`, 'true')
    }
  }

  const fetchData = useCallback(async () => {
    // Prevent duplicate fetches
    if (fetchingRef.current) {
      console.log('⏳ Fetch already in progress, skipping...')
      return
    }

    try {
      fetchingRef.current = true
      setLoading(true)
      console.log('🔍 Starting data fetch...')
      console.log('🏢 Current organization:', organization)

      if (!organizationId) {
        console.log('⚠️ No organization found, skipping data fetch')
        setLoading(false)
        fetchingRef.current = false
        return
      }

      console.log('🏢 Using organization ID:', organizationId)

      // Fetch categories
      console.log('📂 Fetching categories for org:', organizationId)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

      console.log('📂 Categories raw response:', { data: categoriesData, error: categoriesError })

      if (categoriesError) {
        console.error('❌ Categories error:', categoriesError)
      } else {
        console.log('✅ Categories:', categoriesData?.length, categoriesData)
      }

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

      if (suppliersError) {
        console.error('❌ Suppliers error:', suppliersError)
      } else {
        console.log('✅ Suppliers:', suppliersData?.length, suppliersData)
      }

      // Fetch rooms for stats
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization_id', organizationId)
        .order('display_order')

      if (roomsError) {
        console.error('❌ Rooms error:', roomsError)
      } else {
        console.log('✅ Rooms:', roomsData?.length, roomsData)
      }

      // Note: We no longer need to fetch room_counts separately
      // The inventory_items table now has a current_stock column
      // that's automatically maintained by the trigger

      // Fetch inventory items
      console.log('📦 Fetching inventory items for org:', organizationId)
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('brand')

      console.log('📦 Inventory raw response:', { 
        data: inventoryData?.length, 
        error: inventoryError,
        firstItem: inventoryData?.[0] 
      })

      if (inventoryError) {
        console.error('❌ Inventory error:', inventoryError)
      } else {
        console.log('✅ Raw inventory items:', inventoryData?.length, inventoryData)

        // Manually add category and supplier names
        const enrichedItems = inventoryData?.map(item => {
          const category = categoriesData?.find(cat => cat.id === item.category_id)
          const supplier = suppliersData?.find(sup => sup.id === item.supplier_id)
          
          return {
            ...item,
            categories: category ? { name: category.name } : null,
            suppliers: supplier ? { name: supplier.name } : null
          }
        })

        console.log('✅ Enriched inventory items:', enrichedItems?.length, enrichedItems)
        setInventoryItems(enrichedItems || [])
      }

      setCategories(categoriesData || [])
      setSuppliers(suppliersData || [])

      // Calculate total inventory value and category breakdown using current_stock
      let totalInventoryValue = 0
      const categoryValues = new Map<string, number>()

      if (inventoryData) {
        totalInventoryValue = inventoryData.reduce((total, item) => {
          // Use the current_stock column which is maintained by the trigger
          const itemValue = (item.current_stock || 0) * (item.price_per_item || 0)

          // Add to category total
          const category = categoriesData?.find(cat => cat.id === item.category_id)
          if (category) {
            const currentValue = categoryValues.get(category.name) || 0
            categoryValues.set(category.name, currentValue + itemValue)
          }

          return total + itemValue
        }, 0)
      }

      // Convert category values to array and sort by value
      const breakdown = Array.from(categoryValues.entries())
        .map(([categoryName, totalValue]) => ({ categoryName, totalValue }))
        .sort((a, b) => b.totalValue - a.totalValue)

      setCategoryBreakdown(breakdown)

      setStats({
        totalItems: inventoryData?.length || 0,
        totalCategories: categoriesData?.length || 0,
        totalSuppliers: suppliersData?.length || 0,
        totalRooms: roomsData?.length || 0,
        totalInventoryValue
      })

    } catch (error) {
      console.error('💥 Unexpected error:', error)
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }, [organizationId, organization])

  // Load data when component mounts or dependencies change
  useEffect(() => {
    // Only fetch if we have the minimum required data and organization ID is available
    if (user && organizationId && (organization || isAdmin)) {
      console.log('🔄 Loading dashboard data...', { 
        hasUser: !!user, 
        hasOrg: !!organization, 
        isAdmin: isAdmin,
        orgId: organizationId 
      })
      fetchData()
    } else {
      console.log('⚠️ Dashboard not loading data:', { 
        hasUser: !!user, 
        hasOrg: !!organization, 
        isAdmin: isAdmin,
        orgId: organizationId,
        reason: !user ? 'no user' : !organizationId ? 'no orgId' : 'no org and not admin'
      })
      // Set loading to false if we can't load data
      if (user && !organizationId) {
        setLoading(false)
      }
    }
  }, [user?.id, organizationId, organization?.id, isAdmin, fetchData])

  const handleCategoryAdded = () => {
    fetchData()
    setShowAddCategory(false)
  }

  const handleItemAdded = () => {
    fetchData()
    setShowAddItem(false)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowEditCategory(true)
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId)
        .eq("organization_id", organizationId)
      if (error) throw error
      fetchData()
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const handleCategoryUpdated = () => {
    fetchData()
    setShowEditCategory(false)
    setEditingCategory(null)
  }
  const handleItemUpdated = () => {
    console.log('🔄 Item updated, refreshing data...')
    fetchData()
    setEditingItem(null)
  }

  const handleItemDeleted = () => {
    fetchData()
  }

  const handleRoomUpdated = () => {
    fetchData()
  }

  const handleImportComplete = () => {
    fetchData() // Refresh data after import
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Bulk operations functions
  const handleSelectAll = () => {
    const allItemIds = new Set(inventoryItems.map(item => item.id))
    setSelectedItems(allItemIds)
  }

  const handleDeselectAll = () => {
    setSelectedItems(new Set())
    setShowBulkActions(false)
    setBulkOperation(null)
    setTargetCategory('')
    setTargetSupplier('')
    setNewPrice('')
  }

  // Category selection handlers
  const handleSelectAllCategories = () => {
    const allCategoryIds = new Set(categories.map(cat => cat.id))
    setSelectedCategories(allCategoryIds)
    setShowCategoryBulkActions(true)
  }

  const handleDeselectAllCategories = () => {
    setSelectedCategories(new Set())
    setShowCategoryBulkActions(false)
  }

  const handleToggleCategorySelection = (categoryId: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId)
    } else {
      newSelected.add(categoryId)
    }
    setSelectedCategories(newSelected)
    setShowCategoryBulkActions(newSelected.size > 0)
  }

  const handleBulkDeleteCategories = async () => {
    if (selectedCategories.size === 0) return

    if (confirm(`Are you sure you want to delete ${selectedCategories.size} selected categories? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .in('id', Array.from(selectedCategories))

        if (error) throw error

        console.log(`✅ Successfully deleted ${selectedCategories.size} categories`)
        await fetchDashboardData()
        handleDeselectAllCategories()
        alert(`Successfully deleted ${selectedCategories.size} categories`)
      } catch (error) {
        console.error('Error deleting categories:', error)
        alert('Failed to delete categories. Please try again.')
      }
    }
  }

  const handleItemSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (confirm(`Are you sure you want to delete ${selectedItems.size} selected items? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('inventory_items')
          .delete()
          .in('id', Array.from(selectedItems))
          .eq('organization_id', organizationId)

        if (error) {
          console.error('Error deleting items:', error)
          alert('Error deleting items. Please try again.')
        } else {
          console.log(`✅ Successfully deleted ${selectedItems.size} items`)
          await fetchData() // Refresh data
          handleDeselectAll()
          alert(`Successfully deleted ${selectedItems.size} items`)
        }
      } catch (error) {
        console.error('Error in bulk delete:', error)
        alert('Error deleting items. Please try again.')
      }
    }
  }

  const handleBulkMoveCategory = async () => {
    if (selectedItems.size === 0 || !targetCategory) return
    
    if (confirm(`Move ${selectedItems.size} selected items to the selected category?`)) {
      try {
        const { error } = await supabase
          .from('inventory_items')
          .update({ category_id: targetCategory })
          .in('id', Array.from(selectedItems))
          .eq('organization_id', organizationId)

        if (error) {
          console.error('Error moving items:', error)
          alert('Error moving items. Please try again.')
        } else {
          console.log(`✅ Successfully moved ${selectedItems.size} items to new category`)
          await fetchData() // Refresh data
          handleDeselectAll()
          alert(`Successfully moved ${selectedItems.size} items to new category`)
        }
      } catch (error) {
        console.error('Error in bulk move:', error)
        alert('Error moving items. Please try again.')
      }
    }
  }

  const handleBulkMoveSupplier = async () => {
    if (selectedItems.size === 0 || !targetSupplier) return
    
    if (confirm(`Change supplier for ${selectedItems.size} selected items?`)) {
      try {
        const { error } = await supabase
          .from('inventory_items')
          .update({ supplier_id: targetSupplier })
          .in('id', Array.from(selectedItems))
          .eq('organization_id', organizationId)

        if (error) {
          console.error('Error changing supplier:', error)
          alert('Error changing supplier. Please try again.')
        } else {
          console.log(`✅ Successfully changed supplier for ${selectedItems.size} items`)
          await fetchData() // Refresh data
          handleDeselectAll()
          alert(`Successfully changed supplier for ${selectedItems.size} items`)
        }
      } catch (error) {
        console.error('Error in bulk supplier change:', error)
        alert('Error changing supplier. Please try again.')
      }
    }
  }

  const handleBulkPriceChange = async () => {
    if (selectedItems.size === 0 || !newPrice || parseFloat(newPrice) <= 0) return
    
    const price = parseFloat(newPrice)
    if (confirm(`Change price to $${price.toFixed(2)} for ${selectedItems.size} selected items?`)) {
      try {
        const { error } = await supabase
          .from('inventory_items')
          .update({ price_per_item: price })
          .in('id', Array.from(selectedItems))
          .eq('organization_id', organizationId)

        if (error) {
          console.error('Error changing prices:', error)
          alert('Error changing prices. Please try again.')
        } else {
          console.log(`✅ Successfully changed prices for ${selectedItems.size} items`)
          await fetchData() // Refresh data
          handleDeselectAll()
          setNewPrice('') // Clear the input
          alert(`Successfully changed prices for ${selectedItems.size} items to $${price.toFixed(2)}`)
        }
      } catch (error) {
        console.error('Unexpected error changing prices:', error)
        alert('Error changing prices. Please try again.')
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-800 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/20 via-white to-slate-50/20 flex relative lg:grid lg:grid-cols-[auto_1fr]">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        userEmail={user?.email || ''}
        userRole={userProfile?.role}
        onSignOut={handleSignOut}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 overflow-y-auto h-screen ${
        sidebarCollapsed ? 'ml-20' : 'ml-80'
      } lg:ml-0`}>
        {/* Top Stats Bar */}
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 mb-8">
            <div className="rounded-2xl p-4 lg:p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[110px] lg:min-h-[120px]"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1)'
                 }}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2 truncate">Total Items</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
                     style={{
                       background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                       boxShadow: '0 8px 24px rgba(255, 119, 0, 0.3)'
                     }}>
                  <Package className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl p-4 lg:p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[110px] lg:min-h-[120px]"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(59, 130, 246, 0.1)'
                 }}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2 truncate">Categories</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalCategories}</p>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
                     style={{
                       background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                       boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                     }}>
                  <ClipboardList className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl p-4 lg:p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[110px] lg:min-h-[120px]"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                 }}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2 truncate">Suppliers</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalSuppliers}</p>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
                     style={{
                       background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                       boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                     }}>
                  <Users className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl p-4 lg:p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[110px] lg:min-h-[120px]"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)'
                 }}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2 truncate">Rooms</p>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
                </div>
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-3"
                     style={{
                       background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                       boxShadow: '0 8px 24px rgba(147, 51, 234, 0.3)'
                     }}>
                  <Building2 className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div
                onClick={() => setShowValueBreakdown(!showValueBreakdown)}
                className="rounded-2xl p-4 lg:p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[110px] lg:min-h-[120px] cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                }}>
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2 truncate">
                      Total Inventory Value
                    </p>
                    <p className={`font-bold text-gray-900 ${
                      stats.totalInventoryValue >= 1000000
                        ? 'text-base lg:text-lg'
                        : 'text-lg lg:text-xl'
                    } leading-tight`}>
                      ${stats.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 ml-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg"
                         style={{
                           background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                           boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                         }}>
                      <DollarSign className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap"
                          style={{
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                            color: '#166534'
                          }}>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${showValueBreakdown ? 'rotate-180' : ''}`} />
                      Click
                    </span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Dropdown */}
              {showValueBreakdown && categoryBreakdown.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl border border-white/20 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,247,237,0.95) 100%)',
                       backdropFilter: 'blur(20px)',
                       WebkitBackdropFilter: 'blur(20px)',
                       boxShadow: '0 20px 50px rgba(34, 197, 94, 0.15)'
                     }}>
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-2 border-b border-green-100">
                      Value by Category
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {categoryBreakdown.map((category, index) => (
                        <div
                          key={category.categoryName}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50/50 transition-colors duration-200"
                          style={{
                            background: index % 2 === 0 ? 'rgba(240, 253, 244, 0.3)' : 'transparent'
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                 style={{
                                   background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                   boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                                 }}>
                              <Tag className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {category.categoryName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-700">
                                ${category.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-xs text-gray-500">
                                {((category.totalValue / stats.totalInventoryValue) * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>


          {/* Main Content Area */}
          <div className="rounded-2xl border border-white/20 shadow-2xl min-h-[600px] backdrop-blur-xl"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 25px 50px rgba(255, 119, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
               }}>
            {activeTab === 'inventory' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h2>
                    <p className="text-gray-600 mt-1">Manage your liquor inventory items and stock levels</p>
                  </div>
                  {canAddItem && (
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowBulkPricingModal(true)}
                        className="text-green-700 bg-green-100 hover:bg-green-200 px-4 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-2 border border-green-200"
                      >
                        <DollarSign className="h-4 w-4" />
                        Bulk Pricing
                      </button>
                      <button
                        onClick={() => setShowAddItem(true)}
                        className="text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium flex items-center gap-2"
                        style={{
                          background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                          boxShadow: '0 4px 15px rgba(255, 119, 0, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0px)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 119, 0, 0.3)';
                        }}
                      >
                        Add Item
                      </button>
                    </div>
                  )}
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading inventory...</p>
                  </div>
                ) : (
                  <>
                    {/* Bulk Operations Bar */}
                    {activeTab === 'inventory' && inventoryItems.length > 0 && (
                      <div className="mb-8 rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                             backdropFilter: 'blur(20px)',
                             WebkitBackdropFilter: 'blur(20px)'
                           }}>
                        <div className="p-6 border-b border-orange-100/50">
                          <div className="flex items-center justify-between h-full">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={selectedItems.size === inventoryItems.length ? handleDeselectAll : handleSelectAll}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/30"
                                style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.7) 100%)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)';
                                }}
                              >
                                <Check className="h-4 w-4" />
                                <span>
                                  {selectedItems.size === inventoryItems.length ? 'Deselect All' : 'Select All'}
                                </span>
                              </button>
                              
                              {selectedItems.size > 0 && (
                                <span className="text-gray-600 font-medium">
                                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                                </span>
                              )}
                            </div>

                            {selectedItems.size > 0 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation('delete')}
                                  className="flex items-center space-x-2 px-4 py-2 text-red-700 rounded-xl transition-all duration-300 backdrop-blur-sm border border-red-200"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(254, 242, 242, 0.9) 0%, rgba(254, 226, 226, 0.7) 100%)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(254, 242, 242, 0.8) 0%, rgba(254, 226, 226, 0.6) 100%)';
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                                
                                <button
                                  onClick={() => setBulkOperation('move-category')}
                                  className="flex items-center space-x-2 px-4 py-2 text-green-700 rounded-xl transition-all duration-300 backdrop-blur-sm border border-green-200"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.6) 100%)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(240, 253, 244, 0.9) 0%, rgba(220, 252, 231, 0.7) 100%)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(240, 253, 244, 0.8) 0%, rgba(220, 252, 231, 0.6) 100%)';
                                  }}
                                >
                                  <Tag className="h-4 w-4" />
                                  <span>Change Category</span>
                                </button>
                                
                                <button
                                  onClick={() => setBulkOperation('move-supplier')}
                                  className="flex items-center space-x-2 px-4 py-2 text-slate-700 rounded-xl transition-all duration-300 backdrop-blur-sm border border-slate-200"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(219, 234, 254, 0.6) 100%)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 246, 255, 0.9) 0%, rgba(219, 234, 254, 0.7) 100%)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 246, 255, 0.8) 0%, rgba(219, 234, 254, 0.6) 100%)';
                                  }}
                                >
                                  <Users className="h-4 w-4" />
                                  <span>Change Supplier</span>
                                </button>
                                
                                <button
                                  onClick={() => setBulkOperation('change-price')}
                                  className="flex items-center space-x-2 px-4 py-2 text-orange-700 rounded-xl transition-all duration-300 backdrop-blur-sm border border-orange-200"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.8) 0%, rgba(254, 215, 170, 0.6) 100%)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 247, 237, 0.9) 0%, rgba(254, 215, 170, 0.7) 100%)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 247, 237, 0.8) 0%, rgba(254, 215, 170, 0.6) 100%)';
                                  }}
                                >
                                  <DollarSign className="h-4 w-4" />
                                  <span>Change Price</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bulk Operation Forms */}
                        {bulkOperation === 'delete' && (
                          <div className="p-4 bg-red-50 border-l-4 border-red-400">
                            <div className="flex items-center justify-between h-full">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-red-800 font-medium">Delete {selectedItems.size} items</h4>
                                <p className="text-red-600 text-sm">This action cannot be undone.</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation(null)}
                                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBulkDelete}
                                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                  Delete Items
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {bulkOperation === 'move-category' && (
                          <div className="p-4 bg-green-50 border-l-4 border-green-400">
                            <div className="flex items-center justify-between h-full">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-green-800 font-medium">Move {selectedItems.size} items to category</h4>
                                  <p className="text-green-600 text-sm">Select the target category below.</p>
                                </div>
                                <select
                                  value={targetCategory}
                                  onChange={(e) => setTargetCategory(e.target.value)}
                                  className="px-3 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="">Select category...</option>
                                  {categories.map((category: any) => (
                                    <option key={category.id} value={category.id}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation(null)}
                                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBulkMoveCategory}
                                  disabled={!targetCategory}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors"
                                >
                                  Move Items
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {bulkOperation === 'move-supplier' && (
                          <div className="p-4 bg-purple-50 border-l-4 border-purple-400">
                            <div className="flex items-center justify-between h-full">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-purple-800 font-medium">Change supplier for {selectedItems.size} items</h4>
                                  <p className="text-purple-600 text-sm">Select the target supplier below.</p>
                                </div>
                                <select
                                  value={targetSupplier}
                                  onChange={(e) => setTargetSupplier(e.target.value)}
                                  className="px-3 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                >
                                  <option value="">Select supplier...</option>
                                  {suppliers.map((supplier: any) => (
                                    <option key={supplier.id} value={supplier.id}>
                                      {supplier.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation(null)}
                                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBulkMoveSupplier}
                                  disabled={!targetSupplier}
                                  className="px-4 py-2 text-white rounded-lg disabled:bg-slate-300 transition-all duration-300"
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
                                  Change Supplier
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {bulkOperation === 'change-price' && (
                          <div className="p-4 bg-orange-50 border-l-4 border-orange-400">
                            <div className="flex items-center justify-between h-full">
                              <div className="flex items-center space-x-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-orange-800 font-medium">Change price for {selectedItems.size} items</h4>
                                  <p className="text-orange-600 text-sm">Enter the new price per item below.</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-orange-700 font-medium">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 w-24"
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation(null)}
                                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBulkPriceChange}
                                  disabled={!newPrice || parseFloat(newPrice) <= 0}
                                  className="px-4 py-2 text-white rounded-lg disabled:bg-slate-300 transition-all duration-300"
                                  style={{
                                    background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                                    boxShadow: '0 4px 12px rgba(255, 119, 0, 0.3)'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!e.currentTarget.disabled) {
                                      e.currentTarget.style.transform = 'translateY(-1px)';
                                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 119, 0, 0.4)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 119, 0, 0.3)';
                                  }}
                                >
                                  Change Price
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-700 text-sm">
                        🔍 Found <span className="font-semibold text-gray-900">{inventoryItems.length}</span> items organized by category with room counts
                      </p>
                    </div>
                    <InventoryTable
                      items={inventoryItems as any}
                      organizationId={organizationId}  // 🚨 SECURITY: Pass organizationId
                      onEdit={(item: any) => setEditingItem(item)}
                      onDelete={handleItemDeleted}
                      selectedItems={selectedItems}  // Pass selected items
                      onItemSelect={handleItemSelect}  // Pass selection handler
                      canEdit={canEditItem}  // Role-based permission
                      canDelete={canDeleteItem}  // Role-based permission
                    />
                  </>
                )}
              </div>
            )}

            {/* NEW: Import Data Tab */}
            {activeTab === 'import' && (
              <ImportData onImportComplete={handleImportComplete} organizationId={organizationId} />
            )}

            {activeTab === 'categories' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h2>
                    <p className="text-gray-600 mt-1">Organize your inventory into categories</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {categories.length > 0 && (
                      <button
                        onClick={selectedCategories.size === categories.length ? handleDeselectAllCategories : handleSelectAllCategories}
                        className="px-4 py-2 border-2 border-orange-500 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-all"
                      >
                        {selectedCategories.size === categories.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                    <button
                      onClick={() => setShowAddCategory(true)}
                      className="text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium"
                      style={{
                        background: 'linear-gradient(135deg, #ff7700 0%, #ff4500 100%)',
                        boxShadow: '0 4px 15px rgba(255, 119, 0, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 119, 0, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 119, 0, 0.3)';
                      }}
                    >
                      Add Category
                    </button>
                  </div>
                </div>

                {/* Selection Counter */}
                {selectedCategories.size > 0 && (
                  <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-xl flex justify-between items-center">
                    <span className="text-orange-800 font-medium">
                      {selectedCategories.size} categor{selectedCategories.size !== 1 ? 'ies' : 'y'} selected
                    </span>
                    <button
                      onClick={handleBulkDeleteCategories}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                    >
                      Delete Selected
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-2xl p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 relative"
                         style={{
                           background: selectedCategories.has(category.id)
                             ? 'linear-gradient(135deg, rgba(255,237,213,0.9) 0%, rgba(254,215,170,0.7) 100%)'
                             : 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                           backdropFilter: 'blur(10px)',
                           WebkitBackdropFilter: 'blur(10px)'
                         }}>
                      {/* Selection Checkbox */}
                      <div className="absolute top-4 right-4">
                        <input
                          type="checkbox"
                          checked={selectedCategories.has(category.id)}
                          onChange={() => handleToggleCategorySelection(category.id)}
                          className="w-5 h-5 text-orange-500 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500 cursor-pointer"
                        />
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                           style={{
                             background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                             boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
                           }}>
                        <ClipboardList className="h-6 w-6 lg:h-7 lg:w-7 text-white" />
                      </div>
                      <h3 className="text-gray-900 font-bold text-xl mb-2">{category.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">Product category</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 px-4 py-2 text-white text-sm rounded-xl transition-all duration-300 font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                            boxShadow: '0 2px 8px rgba(107, 114, 128, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(107, 114, 128, 0.3)';
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 px-4 py-2 text-white text-sm rounded-xl transition-all duration-300 font-medium"
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0px)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                          }}
                        >
                          Delete
                        </button>
                      </div>                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Supplier Management</h2>
                  <p className="text-gray-600 mt-1">Manage your vendor relationships and contacts</p>
                </div>
                <SupplierManager suppliers={suppliers} onUpdate={fetchData} organizationId={organizationId} />
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Room Management</h2>
                  <p className="text-gray-600 mt-1">Configure your venue locations and rooms</p>
                </div>
                <RoomManager onUpdate={handleRoomUpdated} organizationId={organizationId} />
              </div>
            )}

            {activeTab === 'team' && (
              <div className="p-6">
                <TeamPINManagement organizationId={organizationId} currentUserId={user?.id} />
              </div>
            )}

            {activeTab === 'count' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Room Counting</h2>
                  <p className="text-gray-600 mt-1">Perform inventory counts by room or location</p>
                </div>
                <RoomCountingInterface 
                  userEmail={user?.email || ''} 
                  organizationId={organizationId}
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Reports</h2>
                  <p className="text-gray-600 mt-1">Generate and manage supplier orders</p>
                </div>
                <OrderReport organizationId={organizationId} />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Activity Dashboard</h2>
                  <p className="text-gray-600 mt-1">View activity logs and performance analytics</p>
                </div>
                <ActivityDashboard
                  userEmail={user?.email || ''}
                  organizationId={organizationId}
                />
              </div>
            )}

            {activeTab === 'stock-movements' && (
              <div className="p-6">
                <StockMovementAnalytics organizationId={organizationId} />
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Account</h2>
                  <p className="text-gray-600 mt-1">Manage your subscription and account settings</p>
                </div>
                
                {/* Billing Management */}
                <div className="space-y-8">
                  <BillingDashboard />
                  
                  {/* Account Cancellation */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight">Account Management</h3>
                    <p className="text-gray-600 mb-6">Need to cancel your account or have billing questions?</p>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => window.open('mailto:support@liquorinventory.com?subject=Account Cancellation Request', '_blank')}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>Contact Support</span>
                      </button>
                      
                      <div className="text-sm text-gray-600">
                        <p>• Account cancellation requests</p>
                        <p>• Billing questions and support</p>
                        <p>• Feature requests and feedback</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modals (unchanged) */}
      {showAddCategory && (
        <AddCategoryModal
          onClose={() => setShowAddCategory(false)}
          onCategoryAdded={handleCategoryAdded}
          organizationId={organizationId}
        />
      )}

      {showEditCategory && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          organizationId={organizationId}
          onClose={() => setShowEditCategory(false)}
          onCategoryUpdated={handleCategoryUpdated}
        />
      )}
      {showAddItem && (
        <AddItemModal
          categories={categories}
          suppliers={suppliers}
          onClose={() => setShowAddItem(false)}
          onItemAdded={handleItemAdded}
          organizationId={organizationId}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setEditingItem(null)}
          onItemUpdated={handleItemUpdated}
          organizationId={organizationId}
        />
      )}

      {/* Welcome Onboarding Modal */}
      <WelcomeOnboardingModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        userName={userProfile?.full_name || user?.email?.split('@')[0] || 'there'}
      />

      {/* Bulk Pricing Modal */}
      {showBulkPricingModal && (
        <BulkPricingModal
          onClose={() => setShowBulkPricingModal(false)}
          onPricingUpdated={fetchData}
          organizationId={organizationId}
        />
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <SubscriptionGuard>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard...</h2>
                <p className="text-gray-600">Please wait while we prepare your inventory data</p>
              </div>
            </div>
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </SubscriptionGuard>
  )
}
