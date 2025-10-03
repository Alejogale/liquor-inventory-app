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

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useOrganizationData } from '@/lib/use-data-loading'
import { supabase } from '@/lib/supabase'
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
import SubscriptionManager from '@/components/SubscriptionManager'
import UserPermissions from '@/components/UserPermissions'
import WelcomeOnboardingModal from '@/components/WelcomeOnboardingModal'
import BulkPricingModal from '@/components/BulkPricingModal'


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

  // Add to existing state
  const [selectedItems, setSelectedItems] = useState(new Set<string>())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'move-category' | 'move-supplier' | null>(null)
  const [targetCategory, setTargetCategory] = useState('')
  const [targetSupplier, setTargetSupplier] = useState('')
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showBulkPricingModal, setShowBulkPricingModal] = useState(false)

  const isAdmin = user?.email === 'alejogaleis@gmail.com'

  // Get the correct organization ID - for admin, use the known organization ID if context is missing
  const organizationId = organization?.id || (isAdmin ? '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0' : undefined)
  
  console.log('🔍 Dashboard state:', {
    user: user?.email,
    organization: organization?.Name,
    organizationId,
    isAdmin,
    loading
  })

  useEffect(() => {
    // Admin user can load data even without organization context
    if (user && (organization || isAdmin)) {
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
        orgId: organizationId 
      })
      // Set loading to false if we can't load data
      setLoading(false)
    }
  }, [user, organization, isAdmin])

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['inventory', 'import', 'categories', 'suppliers', 'rooms', 'count', 'orders', 'activity', 'integrations', 'subscription'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

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

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Starting data fetch...')
      console.log('🏢 Current organization:', organization)

      if (!organizationId) {
        console.log('⚠️ No organization found, skipping data fetch')
        setLoading(false)
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

      // Fetch room counts for total value calculation
      console.log('📊 Fetching room counts for org:', organizationId)
      const { data: roomCountsData, error: roomCountsError } = await supabase
        .from('room_counts')
        .select('inventory_item_id, count')
        .eq('organization_id', organizationId)

      if (roomCountsError) {
        console.error('❌ Room counts error:', roomCountsError)
      } else {
        console.log('✅ Room counts:', roomCountsData?.length, roomCountsData)
      }

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

      // Calculate total inventory value
      let totalInventoryValue = 0
      if (inventoryData && roomCountsData) {
        totalInventoryValue = inventoryData.reduce((total, item) => {
          // Get total count for this item across all rooms
          const itemCounts = roomCountsData.filter(count => count.inventory_item_id === item.id)
          const totalCount = itemCounts.reduce((sum, count) => sum + count.count, 0)
          const itemValue = totalCount * (item.price_per_item || 0)
          return total + itemValue
        }, 0)
      }

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
    }
  }

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
            
            <div className="rounded-2xl p-4 lg:p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300 min-h-[110px] lg:min-h-[120px]"
                 style={{
                   background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                   boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)'
                 }}>
              <div className="flex items-center justify-between h-full">
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-gray-600 text-xs lg:text-sm font-medium mb-1 lg:mb-2 truncate">Total Inventory Value</p>
                  <p className={`font-bold text-gray-900 whitespace-nowrap overflow-hidden ${
                    stats.totalInventoryValue >= 1000000 
                      ? 'text-lg lg:text-xl' 
                      : 'text-xl lg:text-2xl'
                  }`}>
                    ${stats.totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                     style={{
                       background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                       boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                     }}>
                  <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                </div>
              </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="rounded-2xl p-6 border border-white/20 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-300"
                         style={{
                           background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,247,237,0.6) 100%)',
                           backdropFilter: 'blur(10px)',
                           WebkitBackdropFilter: 'blur(10px)'
                         }}>
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




            {activeTab === 'subscription' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Billing & Account</h2>
                  <p className="text-gray-600 mt-1">Manage your subscription and account settings</p>
                </div>
                
                {/* Billing Management */}
                <div className="space-y-8">
                  <SubscriptionManager />
                  
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
  )
}
