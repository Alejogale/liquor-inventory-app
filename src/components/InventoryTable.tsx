'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Edit, Trash2, ChevronDown, ChevronRight, Package, Search, MapPin } from 'lucide-react'

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
}

interface Room {
  id: string
  name: string
}

interface RoomCount {
  inventory_item_id: string
  room_id: string
  count: number
}

interface ItemWithRoomCounts extends InventoryItem {
  roomCountsText: string
  totalCount: number
}

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: () => void
  selectedItems?: Set<string>  // ✅ NEW: Selected items from dashboard
  onItemSelect?: (itemId: string) => void  // ✅ NEW: Selection handler
  organizationId?: string  // 🚨 SECURITY: Add organizationId prop
}

export default function InventoryTable({ 
  items,
  organizationId,  // 🚨 SECURITY: Accept organizationId prop 
  onEdit, 
  onDelete, 
  selectedItems = new Set(), 
  onItemSelect 
}: InventoryTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [itemsWithCounts, setItemsWithCounts] = useState<ItemWithRoomCounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (items.length > 0) {
      fetchRoomCounts()
    } else {
      setItemsWithCounts([])
      setLoading(false)
    }
  }, [items])

  // Set loading to false immediately when component mounts with no items
  useEffect(() => {
    if (items.length === 0) {
      setLoading(false)
    }
  }, [])

  const fetchRoomCounts = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching rooms and counts...')

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('organization_id', organizationId)  // 🚨 SECURITY: Filter by organization
        .order('display_order')

      if (roomsError) {
        console.error('❌ Error fetching rooms:', roomsError)
        setItemsWithCounts(items.map(item => ({
          ...item,
          roomCountsText: 'Error loading rooms',
          totalCount: 0
        })))
        return
      }

      console.log('✅ Rooms loaded:', roomsData)

      // Fetch room counts (simple query without joins)
      const { data: countsData, error: countsError } = await supabase
        .from('room_counts')
        .select('inventory_item_id, room_id, count')
        .eq('organization_id', organizationId)  // 🚨 SECURITY: Filter by organization

      if (countsError) {
        console.error('❌ Error fetching room counts:', countsError)
        setItemsWithCounts(items.map(item => ({
          ...item,
          roomCountsText: 'Error loading counts',
          totalCount: 0
        })))
        return
      }

      console.log('✅ Room counts loaded:', countsData)

      // Process items with room counts
      const enrichedItems: ItemWithRoomCounts[] = items.map(item => {
        // Find all counts for this item
        const itemCounts = (countsData || []).filter(count => count.inventory_item_id === item.id)
        
        // Build room counts text
        const roomCountTexts: string[] = []
        let totalCount = 0

        // Add rooms that have counts
        itemCounts.forEach(count => {
          const room = roomsData?.find(r => r.id === count.room_id)
          if (room && count.count > 0) {
            roomCountTexts.push(`${room.name}: ${count.count}`)
            totalCount += count.count
          }
        })

        const roomCountsText = roomCountTexts.length > 0 
          ? roomCountTexts.join(' | ') 
          : 'Not counted'

        return {
          ...item,
          roomCountsText,
          totalCount
        }
      })

      setItemsWithCounts(enrichedItems)
      console.log('✅ Items enriched with room counts')

    } catch (error) {
      console.error('💥 Error in fetchRoomCounts:', error)
      setItemsWithCounts(items.map(item => ({
        ...item,
        roomCountsText: 'Error loading',
        totalCount: 0
      })))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, brand: string) => {
    if (!confirm(`Are you sure you want to delete "${brand}"?`)) return

    setDeletingId(id)
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      onDelete()
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName)
    } else {
      newExpanded.add(categoryName)
    }
    setExpandedCategories(newExpanded)
  }

  // Filter items based on search
  const filteredItems = itemsWithCounts.filter(item =>
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.suppliers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group items by category
  const groupedItems = filteredItems.reduce((groups, item) => {
    const categoryName = item.categories?.name || 'Uncategorized'
    if (!groups[categoryName]) {
      groups[categoryName] = []
    }
    groups[categoryName].push(item)
    return groups
  }, {} as Record<string, ItemWithRoomCounts[]>)

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedItems).sort()

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Loading inventory with room counts...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 text-lg">No inventory items found</p>
        <p className="text-slate-500 text-sm mt-2">Click &ldquo;Add Item&rdquo; to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand, barcode, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-slate-600 text-sm">
          Found {filteredItems.length} items matching &ldquo;{searchTerm}&rdquo;
        </div>
      )}

      {/* Categories */}
      {        sortedCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600">No items found</p>
            {searchTerm && (
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search term</p>
            )}
          </div>
        ) : (
        sortedCategories.map((categoryName) => {
          const categoryItems = groupedItems[categoryName]
          const isExpanded = expandedCategories.has(categoryName)
          
          return (
            <div key={categoryName} className="bg-white rounded-lg border border-slate-200 shadow-sm">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryName)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-600" />
                  )}
                  <h3 className="text-lg font-semibold text-slate-800">{categoryName}</h3>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                    {categoryItems.length} items
                  </span>
                </div>
              </button>

                            {/* Category Items Table */}
              {isExpanded && (
                <div className="border-t border-slate-200">
                  {categoryItems.length > 5 && (
                    <div className="px-6 py-2 bg-slate-50 text-slate-700 text-sm font-medium">
                      📜 {categoryItems.length} items - Scroll to see all
                    </div>
                  )}
                  <div className={`overflow-x-auto ${categoryItems.length > 5 ? 'max-h-96 overflow-y-auto' : ''}`}>
                    <table className="w-full">
                      <thead className="sticky top-0 bg-slate-100 z-10">
                        <tr className="border-b border-slate-200">
                          {onItemSelect && (
                            <th className="text-left py-3 px-6 w-12">
                              <div className="flex items-center justify-center">
                                {/* Placeholder checkbox for column alignment */}
                                <div className="w-4 h-4"></div>
                              </div>
                            </th>
                          )}
                          <th className="text-left py-3 px-6 text-slate-700 font-medium">Brand</th>
                          <th className="text-left py-3 px-6 text-slate-700 font-medium">Barcode</th>
                          <th className="text-left py-3 px-6 text-slate-700 font-medium">Supplier</th>
                          <th className="text-left py-3 px-6 text-slate-700 font-medium">Alert/Target</th>
                          <th className="text-left py-3 px-6 text-slate-700 font-medium">Room Counts</th>
                          <th className="text-right py-3 px-6 text-slate-700 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryItems.map((item) => (
                          <tr key={item.id} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                            selectedItems.has(item.id) ? 'bg-slate-50 ring-1 ring-slate-300' : ''
                          }`}>
                            {onItemSelect && (
                              <td className="py-3 px-6">
                                <div className="flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item.id)}
                                    onChange={() => onItemSelect(item.id)}
                                    className="rounded border-slate-300 text-slate-600 focus:ring-slate-500 cursor-pointer"
                                  />
                                </div>
                              </td>
                            )}
                            <td className="py-3 px-6 text-slate-800 font-medium">{item.brand}</td>
                            <td className="py-3 px-6 text-slate-700">
                              <span className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                                {item.barcode || 'No barcode'}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-slate-700">{item.suppliers?.name || '-'}</td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  item.threshold > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  Alert: {item.threshold}
                                </span>
                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                                  Target: {item.par_level}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  item.totalCount > 0 
                                    ? 'bg-slate-100 text-slate-700' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  Total: {item.totalCount}
                                </span>
                                <span className="text-slate-600 text-sm" title="Room breakdown">
                                  {item.roomCountsText}
                                </span>
                              </div>
                              {item.totalCount <= item.threshold && item.threshold > 0 && (
                                <div className="text-xs text-red-600 mt-1">
                                  ⚠️ Low stock alert
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => onEdit(item)}
                                  className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                                  title="Edit item"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.brand)}
                                  disabled={deletingId === item.id}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Expand/Collapse All */}
      {sortedCategories.length > 0 && (
        <div className="flex justify-center space-x-4 pt-4">
          <button
            onClick={() => setExpandedCategories(new Set(sortedCategories))}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Expand All Categories
          </button>
          <button
            onClick={() => setExpandedCategories(new Set())}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Collapse All Categories
          </button>
        </div>
      )}
    </div>
  )
}
