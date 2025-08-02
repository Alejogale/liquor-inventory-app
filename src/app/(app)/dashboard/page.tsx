'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import AddCategoryModal from '@/app/components/AddCategoryModal'
import AddItemModal from '@/app/components/AddItemModal'
import EditItemModal from '@/components/EditItemModal'
import InventoryTable from '@/components/InventoryTable'
import SupplierManager from '@/components/SupplierManager'
import RoomCountingInterface from '@/components/RoomCountingInterface'
import OrderReport from '@/components/OrderReport'
import RoomManager from '@/components/RoomManager'
import ActivityDashboard from '@/components/ActivityDashboard'
import DashboardSidebar from '@/components/DashboardSidebar'
import {
  Package,
  Users,
  ShoppingCart,
  Building2,
  ClipboardList
} from 'lucide-react'

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
  category_id: string
  supplier_id: string
  threshold: number
  par_level: number
  barcode?: string
  categories: { name: string } | null
  suppliers: { name: string } | null
}

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('inventory')
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    totalSuppliers: 0,
    totalRooms: 0
  })

  const isAdmin = user?.email === 'alejogaleis@gmail.com'

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('🔍 Starting data fetch...')

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (categoriesError) {
        console.error('❌ Categories error:', categoriesError)
      } else {
        console.log('✅ Categories:', categoriesData?.length, categoriesData)
      }

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
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
        .order('display_order')

      if (roomsError) {
        console.error('❌ Rooms error:', roomsError)
      } else {
        console.log('✅ Rooms:', roomsData?.length, roomsData)
      }

      // Fetch inventory items
      console.log('📦 Fetching inventory items...')
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('brand')

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

      setStats({
        totalItems: inventoryData?.length || 0,
        totalCategories: categoriesData?.length || 0,
        totalSuppliers: suppliersData?.length || 0,
        totalRooms: roomsData?.length || 0
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

  const handleItemUpdated = () => {
    fetchData()
    setEditingItem(null)
  }

  const handleItemDeleted = () => {
    fetchData()
  }

  const handleRoomUpdated = () => {
    fetchData()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Sidebar Navigation */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        userEmail={user?.email || ''}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-80 transition-all duration-300">
        {/* Top Stats Bar */}
        <div className="p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Total Items</p>
                  <p className="text-2xl font-bold text-white">{stats.totalItems}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Categories</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCategories}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Suppliers</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSuppliers}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Rooms</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRooms}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 min-h-[600px]">
            {activeTab === 'inventory' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
                    <p className="text-white/60 mt-1">Manage your liquor inventory items and stock levels</p>
                  </div>
                  <button
                    onClick={() => setShowAddItem(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold"
                  >
                    Add Item
                  </button>
                </div>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Loading inventory...</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/80 text-sm">
                        🔍 Found <span className="font-semibold text-white">{inventoryItems.length}</span> items organized by category with room counts
                      </p>
                    </div>
                    <InventoryTable
                      items={inventoryItems}
                      onEdit={setEditingItem}
                      onDelete={handleItemDeleted}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Categories</h2>
                    <p className="text-white/60 mt-1">Organize your inventory into categories</p>
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
                    <div key={category.id} className="bg-white/5 hover:bg-white/10 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                        <ClipboardList className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                      <p className="text-white/60 text-sm mt-1">Product category</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Supplier Management</h2>
                  <p className="text-white/60 mt-1">Manage your vendor relationships and contacts</p>
                </div>
                <SupplierManager suppliers={suppliers} onUpdate={fetchData} />
              </div>
            )}

            {activeTab === 'rooms' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Room Management</h2>
                  <p className="text-white/60 mt-1">Configure your venue locations and rooms</p>
                </div>
                <RoomManager onUpdate={handleRoomUpdated} />
              </div>
            )}

            {activeTab === 'count' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Room Counting</h2>
                  <p className="text-white/60 mt-1">Perform inventory counts by room or location</p>
                </div>
                <RoomCountingInterface userEmail={user?.email || ''} />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Order Reports</h2>
                  <p className="text-white/60 mt-1">Generate and manage supplier orders</p>
                </div>
                <OrderReport />
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Reports & Analytics</h2>
                  <p className="text-white/60 mt-1">View activity logs and performance analytics</p>
                </div>
                <ActivityDashboard userEmail={user?.email || ''} />
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
        />
      )}

      {showAddItem && (
        <AddItemModal
          categories={categories}
          suppliers={suppliers}
          onClose={() => setShowAddItem(false)}
          onItemAdded={handleItemAdded}
        />
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          categories={categories}
          suppliers={suppliers}
          onClose={() => setEditingItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </div>
  )
}
