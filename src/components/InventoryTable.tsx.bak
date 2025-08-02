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
}

export default function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
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

  const fetchRoomCounts = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching rooms and counts...')

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
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
        <div className="text-white/60">Loading inventory with room counts...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-white/30 mx-auto mb-4" />
        <p className="text-white/60 text-lg">No inventory items found</p>
        <p className="text-white/40 text-sm mt-2">Click "Add Item" to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by brand, barcode, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="text-white/60 text-sm">
          Found {filteredItems.length} items matching "{searchTerm}"
        </div>
      )}

      {/* Categories */}
      {sortedCategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-white/60">No items found</p>
          {searchTerm && (
            <p className="text-white/40 text-sm mt-1">Try adjusting your search term</p>
          )}
        </div>
      ) : (
        sortedCategories.map((categoryName) => {
          const categoryItems = groupedItems[categoryName]
          const isExpanded = expandedCategories.has(categoryName)
          
          return (
            <div key={categoryName} className="bg-white/5 rounded-lg border border-white/10">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(categoryName)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-white/60" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-white/60" />
                  )}
                  <h3 className="text-lg font-semibold text-white">{categoryName}</h3>
                  <span className="bg-white/10 text-white/80 px-3 py-1 rounded-full text-sm">
                    {categoryItems.length} items
                  </span>
                </div>
              </button>

              {/* Category Items Table */}
              {isExpanded && (
                <div className="border-t border-white/10">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Brand</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Barcode</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Supplier</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Alert/Target</th>
                          <th className="text-left py-3 px-6 text-white/80 font-medium">Room Counts</th>
                          <th className="text-right py-3 px-6 text-white/80 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryItems.map((item) => (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-6 text-white font-medium">{item.brand}</td>
                            <td className="py-3 px-6 text-white/80">
                              <span className="bg-white/10 px-2 py-1 rounded text-sm font-mono">
                                {item.barcode || 'No barcode'}
                              </span>
                            </td>
                            <td className="py-3 px-6 text-white/80">{item.suppliers?.name || '-'}</td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  item.threshold > 0 ? 'bg-orange-500/20 text-orange-300' : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  Alert: {item.threshold}
                                </span>
                                <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded text-sm">
                                  Target: {item.par_level}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-sm font-medium ${
                                  item.totalCount > 0 
                                    ? 'bg-blue-500/20 text-blue-300' 
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  Total: {item.totalCount}
                                </span>
                                <span className="text-white/60 text-sm" title="Room breakdown">
                                  {item.roomCountsText}
                                </span>
                              </div>
                              {item.totalCount <= item.threshold && item.threshold > 0 && (
                                <div className="text-xs text-red-400 mt-1">
                                  ⚠️ Low stock alert
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-6">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => onEdit(item)}
                                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-white/10 rounded-lg transition-colors"
                                  title="Edit item"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id, item.brand)}
                                  disabled={deletingId === item.id}
                                  className="p-2 text-red-400 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
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
            className="px-4 py-2 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors"
          >
            Expand All Categories
          </button>
          <button
            onClick={() => setExpandedCategories(new Set())}
            className="px-4 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition-colors"
          >
            Collapse All Categories
          </button>
        </div>
      )}
    </div>
  )
}
