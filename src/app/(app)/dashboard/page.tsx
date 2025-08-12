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
  ClipboardList
} from 'lucide-react'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
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
import QuickBooksIntegration from '@/components/QuickBooksIntegration'
import SubscriptionManager from '@/components/SubscriptionManager'
import UserPermissions from '@/components/UserPermissions'
import AppAccessGuard from '@/components/AppAccessGuard'


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
  const debug = process.env.NODE_ENV !== 'production'
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
    totalRooms: 0
  })

  // Add to existing state
  const [selectedItems, setSelectedItems] = useState(new Set<string>())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkOperation, setBulkOperation] = useState<'delete' | 'move-category' | 'move-supplier' | null>(null)
  const [targetCategory, setTargetCategory] = useState('')
  const [targetSupplier, setTargetSupplier] = useState('')

  const isAdmin = user?.email === 'alejogaleis@gmail.com'

  // Get the correct organization ID - for admin, use the known organization ID if context is missing
  const organizationId = organization?.id || (isAdmin ? '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0' : null)

  useEffect(() => {
    // Admin user can load data even without organization context
    if (user && (organization || isAdmin)) {
      if (debug) {
        console.log('🔄 Loading dashboard data...', { 
          hasUser: !!user, 
          hasOrg: !!organization, 
          isAdmin: isAdmin,
          orgId: organizationId 
        })
      }
      fetchData()
    }
  }, [user, organization, isAdmin])

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['inventory', 'import', 'categories', 'suppliers', 'rooms', 'count', 'orders', 'activity', 'integrations', 'subscription'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Keep URL in sync with active tab without adding history entries
  useEffect(() => {
    const current = searchParams.get('tab') || 'inventory'
    if (current !== activeTab) {
      // Preserve current path
      const params = new URLSearchParams(Array.from(searchParams.entries()))
      params.set('tab', activeTab)
      window.history.replaceState(null, '', `?${params.toString()}`)
    }
  }, [activeTab, searchParams])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (debug) console.log('🔍 Starting data fetch...')
      if (debug) console.log('🏢 Current organization:', organization)

      if (!organizationId) {
        if (debug) console.log('⚠️ No organization found, skipping data fetch')
        return
      }

      if (debug) console.log('🏢 Using organization ID:', organizationId)

      // Fetch categories
      if (debug) console.log('📂 Fetching categories for org:', organizationId)
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name')

      if (debug) console.log('📂 Categories raw response:', { data: categoriesData, error: categoriesError })

      if (categoriesError) {
        console.error('❌ Categories error:', categoriesError)
      } else {
        if (debug) console.log('✅ Categories:', categoriesData?.length, categoriesData)
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
        if (debug) console.log('✅ Suppliers:', suppliersData?.length, suppliersData)
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
        if (debug) console.log('✅ Rooms:', roomsData?.length, roomsData)
      }

      // Fetch inventory items
      if (debug) console.log('📦 Fetching inventory items for org:', organizationId)
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', organizationId)
        .order('brand')

      if (debug) console.log('📦 Inventory raw response:', { 
        data: inventoryData?.length, 
        error: inventoryError,
        firstItem: inventoryData?.[0] 
      })

      if (inventoryError) {
        console.error('❌ Inventory error:', inventoryError)
      } else {
        if (debug) console.log('✅ Raw inventory items:', inventoryData?.length, inventoryData)

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

        if (debug) console.log('✅ Enriched inventory items:', enrichedItems?.length, enrichedItems)
        setInventoryItems(enrichedItems || [])
      }

      setCategories(categoriesData || [])
      setSuppliers(suppliersData || [])

      setStats({
        totalItems: inventoryData?.length || 0,
        totalCategories: categoriesData?.length || 0,
        totalSuppliers: suppliersData?.length || 0,
        totalRooms: roomsData?.length || 0
      })

    } catch (error) {
      console.error('Error fetching data:', error)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex relative lg:grid lg:grid-cols-[auto_1fr]">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Categories</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalCategories}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Suppliers</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalSuppliers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Rooms</p>
                  <p className="text-2xl font-bold text-slate-800">{stats.totalRooms}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg min-h-[600px]">
            {activeTab === 'inventory' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Inventory Management</h2>
                    <p className="text-slate-600 mt-1">Manage your liquor inventory items and stock levels</p>
                  </div>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Add Item
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading inventory...</p>
                  </div>
                ) : (
                  <>
                    {/* Bulk Operations Bar */}
                    {activeTab === 'inventory' && inventoryItems.length > 0 && (
                      <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="p-4 border-b border-slate-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={selectedItems.size === inventoryItems.length ? handleDeselectAll : handleSelectAll}
                                className="flex items-center space-x-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              >
                                <Check className="h-4 w-4" />
                                <span>
                                  {selectedItems.size === inventoryItems.length ? 'Deselect All' : 'Select All'}
                                </span>
                              </button>
                              
                              {selectedItems.size > 0 && (
                                <span className="text-slate-600 font-medium">
                                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                                </span>
                              )}
                            </div>

                            {selectedItems.size > 0 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation('delete')}
                                  className="flex items-center space-x-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                                
                                <button
                                  onClick={() => setBulkOperation('move-category')}
                                  className="flex items-center space-x-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
                                >
                                  <Tag className="h-4 w-4" />
                                  <span>Change Category</span>
                                </button>
                                
                                <button
                                  onClick={() => setBulkOperation('move-supplier')}
                                  className="flex items-center space-x-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors"
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
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-red-800 font-medium">Delete {selectedItems.size} items</h4>
                                <p className="text-red-600 text-sm">This action cannot be undone.</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setBulkOperation(null)}
                                  className="px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
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
                                  className="px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div>
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
                                  className="px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={handleBulkMoveSupplier}
                                  disabled={!targetSupplier}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-lg transition-colors"
                                >
                                  Change Supplier
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-slate-700 text-sm">
                        🔍 Found <span className="font-semibold text-slate-800">{inventoryItems.length}</span> items organized by category with room counts
                      </p>
                    </div>
                                          <InventoryTable
                        items={inventoryItems as any}
                        organizationId={organizationId || undefined}
                        onEdit={(item: any) => setEditingItem(item)}
                        onDelete={handleItemDeleted}
                        selectedItems={selectedItems}
onItemSelect={handleItemSelect}  // Pass selection handler
                    />
                  </>
                )}
              </div>
            )}

            {/* NEW: Import Data Tab */}
                          {activeTab === 'import' && (
                <ImportData onImportComplete={handleImportComplete} organizationId={organizationId || undefined} />
              )}

            {activeTab === 'categories' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
                    <p className="text-slate-600 mt-1">Organize your inventory into categories</p>
                  </div>
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Add Category
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-white hover:bg-blue-50 shadow-lg rounded-xl p-6 border border-blue-200 hover:border-blue-300 transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                        <ClipboardList className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-slate-800 font-semibold text-lg">{category.name}</h3>
                      <p className="text-slate-600 text-sm mt-1">Product category</p>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
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
                  <h2 className="text-2xl font-bold text-slate-800">Supplier Management</h2>
                  <p className="text-slate-600 mt-1">Manage your vendor relationships and contacts</p>
                </div>
                <SupplierManager suppliers={suppliers} onUpdate={fetchData} organizationId={organizationId || undefined} />
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Room Management</h2>
                  <p className="text-slate-600 mt-1">Configure your venue locations and rooms</p>
                </div>
                <RoomManager onUpdate={handleRoomUpdated} organizationId={organizationId || undefined} />
              </div>
            )}

            {activeTab === 'count' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Room Counting</h2>
                  <p className="text-slate-600 mt-1">Perform inventory counts by room or location</p>
                </div>
                <RoomCountingInterface 
                  userEmail={user?.email || ''} 
                  organizationId={organizationId || undefined}
                />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Order Reports</h2>
                  <p className="text-slate-600 mt-1">Generate and manage supplier orders</p>
                </div>
                <OrderReport organizationId={organizationId || undefined} />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Activity Dashboard</h2>
                  <p className="text-slate-600 mt-1">View activity logs and performance analytics</p>
                </div>
                <ActivityDashboard 
                  userEmail={user?.email || ''} 
                  organizationId={organizationId || undefined}
                />
              </div>
            )}



            {activeTab === 'integrations' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Integrations</h2>
                  <p className="text-slate-600 mt-1">Connect with QuickBooks and other business tools</p>
                </div>
                <QuickBooksIntegration user={user} />
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Subscription & Team Management</h2>
                  <p className="text-slate-600 mt-1">Manage your subscription, team members, and app access</p>
                </div>
                
                {/* Subscription Management */}
                <div className="space-y-8">
                  <SubscriptionManager />
                  
                  {/* Team & Permissions Management */}
                  {(userProfile?.role === 'owner' || userProfile?.role === 'manager') && (
                    <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-4">Team & Permissions</h3>
                      <p className="text-slate-600 mb-6">Manage team member roles and access permissions</p>
                      <UserPermissions organizationId={organization?.id} />
                    </div>
                  )}
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
          organizationId={organizationId || undefined}
        />
      )}

      {showEditCategory && editingCategory && (
        <EditCategoryModal
          category={editingCategory}
          organizationId={organizationId || undefined}
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
          organizationId={organizationId || undefined}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setEditingItem(null)}
          onItemUpdated={handleItemUpdated}
          organizationId={organizationId || undefined}
        />
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AppAccessGuard 
      appId="liquor-inventory" 
      appName="Liquor Inventory"
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
          <div className="text-slate-800 text-xl">Loading Liquor Inventory...</div>
        </div>
      }
    >
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </AppAccessGuard>
  )
}
