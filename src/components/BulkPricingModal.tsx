'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  X, 
  Upload, 
  Download, 
  Percent, 
  DollarSign, 
  Check, 
  AlertTriangle,
  Filter,
  Package
} from 'lucide-react'

interface InventoryItem {
  id: string
  brand: string
  price_per_item?: number | null
  categories: { name: string } | null
  suppliers: { name: string } | null
  category_id: string
  supplier_id: string
}

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

interface BulkPricingModalProps {
  onClose: () => void
  onPricingUpdated: () => void
  organizationId?: string
}

export default function BulkPricingModal({ onClose, onPricingUpdated, organizationId }: BulkPricingModalProps) {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [updating, setUpdating] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    supplier: '',
    hasPrice: 'all', // 'all', 'with-price', 'without-price'
    priceMin: '',
    priceMax: ''
  })

  // Bulk update states
  const [updateMode, setUpdateMode] = useState<'set-price' | 'percentage' | 'csv'>('set-price')
  const [bulkPrice, setBulkPrice] = useState('')
  const [percentageChange, setPercentageChange] = useState('')
  const [csvFile, setCsvFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [organizationId])

  const getCurrentOrganization = async () => {
    if (organizationId) return organizationId

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      return profile?.organization_id || null
    } catch (error) {
      console.error('Error getting organization:', error)
      return null
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) return

      // Fetch inventory items with pricing
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select(`
          id,
          brand,
          price_per_item,
          category_id,
          supplier_id,
          categories (name),
          suppliers (name)
        `)
        .eq('organization_id', currentOrg)
        .order('brand')

      if (itemsError) throw itemsError

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', currentOrg)
        .order('name')

      if (categoriesError) throw categoriesError

      // Fetch suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('organization_id', currentOrg)
        .order('name')

      if (suppliersError) throw suppliersError

      setItems(itemsData || [])
      setCategories(categoriesData || [])
      setSuppliers(suppliersData || [])

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter items based on current filters
  const filteredItems = items.filter(item => {
    if (filters.category && item.category_id !== filters.category) return false
    if (filters.supplier && item.supplier_id !== filters.supplier) return false
    
    if (filters.hasPrice === 'with-price' && !item.price_per_item) return false
    if (filters.hasPrice === 'without-price' && item.price_per_item) return false
    
    if (filters.priceMin && (!item.price_per_item || item.price_per_item < parseFloat(filters.priceMin))) return false
    if (filters.priceMax && (!item.price_per_item || item.price_per_item > parseFloat(filters.priceMax))) return false
    
    return true
  })

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredItems.map(item => item.id)))
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
  }

  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to update')
      return
    }

    if (updateMode === 'set-price' && !bulkPrice) {
      alert('Please enter a price')
      return
    }

    if (updateMode === 'percentage' && !percentageChange) {
      alert('Please enter a percentage change')
      return
    }

    try {
      setUpdating(true)
      const updates: { id: string; price_per_item: number }[] = []

      for (const itemId of selectedItems) {
        const item = items.find(i => i.id === itemId)
        if (!item) continue

        let newPrice: number

        if (updateMode === 'set-price') {
          newPrice = parseFloat(bulkPrice)
        } else if (updateMode === 'percentage') {
          const currentPrice = item.price_per_item || 0
          const percentage = parseFloat(percentageChange) / 100
          newPrice = currentPrice * (1 + percentage)
        } else {
          continue // CSV mode handled separately
        }

        updates.push({ id: itemId, price_per_item: Math.round(newPrice * 100) / 100 })
      }

      // Update all items
      for (const update of updates) {
        const { error } = await supabase
          .from('inventory_items')
          .update({ price_per_item: update.price_per_item })
          .eq('id', update.id)

        if (error) throw error
      }

      alert(`Successfully updated prices for ${updates.length} items`)
      onPricingUpdated()
      onClose()

    } catch (error) {
      console.error('Error updating prices:', error)
      alert('Error updating prices. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const downloadTemplate = () => {
    const headers = ['item_id', 'brand', 'current_price', 'new_price']
    const csvRows = [headers.join(',')]

    Array.from(selectedItems).forEach(itemId => {
      const item = items.find(i => i.id === itemId)
      if (item) {
        csvRows.push([
          item.id,
          `"${item.brand}"`,
          item.price_per_item || '',
          '' // Empty for user to fill
        ].join(','))
      }
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bulk-pricing-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading inventory items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Bulk Pricing Update</h2>
            <p className="text-slate-600">Update prices for multiple items at once</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full max-h-[calc(90vh-100px)]">
          {/* Sidebar - Filters and Actions */}
          <div className="w-80 border-r border-slate-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Filters */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                    <select
                      value={filters.supplier}
                      onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Suppliers</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price Status</label>
                    <select
                      value={filters.hasPrice}
                      onChange={(e) => setFilters(prev => ({ ...prev, hasPrice: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Items</option>
                      <option value="with-price">With Price</option>
                      <option value="without-price">Without Price</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Min Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={filters.priceMin}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Price</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={filters.priceMax}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$999"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Methods */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Update Method
                </h3>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="updateMode"
                      value="set-price"
                      checked={updateMode === 'set-price'}
                      onChange={(e) => setUpdateMode(e.target.value as any)}
                      className="mr-2"
                    />
                    Set Same Price
                  </label>

                  {updateMode === 'set-price' && (
                    <div className="ml-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="25.00"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="updateMode"
                      value="percentage"
                      checked={updateMode === 'percentage'}
                      onChange={(e) => setUpdateMode(e.target.value as any)}
                      className="mr-2"
                    />
                    Percentage Change
                  </label>

                  {updateMode === 'percentage' && (
                    <div className="ml-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 text-sm">%</span>
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={percentageChange}
                          onChange={(e) => setPercentageChange(e.target.value)}
                          className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="10 (for +10%)"
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Use negative values for decreases (e.g., -10 for 10% off)
                      </p>
                    </div>
                  )}

                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="updateMode"
                      value="csv"
                      checked={updateMode === 'csv'}
                      onChange={(e) => setUpdateMode(e.target.value as any)}
                      className="mr-2"
                    />
                    CSV Upload
                  </label>

                  {updateMode === 'csv' && (
                    <div className="ml-6 space-y-2">
                      <button
                        onClick={downloadTemplate}
                        disabled={selectedItems.size === 0}
                        className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 text-sm flex items-center justify-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </button>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                        className="w-full text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleBulkUpdate}
                  disabled={updating || selectedItems.size === 0 || (updateMode === 'csv' && !csvFile)}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center justify-center"
                >
                  {updating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Update {selectedItems.size} Items
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedItems(new Set())}
                  className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>

              {/* Selected Items Count */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm font-medium">
                  {selectedItems.size} of {filteredItems.length} items selected
                </p>
                {selectedItems.size > 0 && updateMode === 'set-price' && bulkPrice && (
                  <p className="text-blue-700 text-xs mt-1">
                    Total cost: ${(selectedItems.size * parseFloat(bulkPrice || '0')).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Items List */}
          <div className="flex-1 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
                  >
                    {selectedItems.size === filteredItems.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-slate-600">
                    Showing {filteredItems.length} items
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto h-full">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No items match your filters</p>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting your filter criteria</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 hover:bg-slate-50 transition-colors ${
                        selectedItems.has(item.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => handleItemSelect(item.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-medium text-slate-800">{item.brand}</p>
                            <p className="text-sm text-slate-600">
                              {item.categories?.name} • {item.suppliers?.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {item.price_per_item ? (
                            <p className="font-semibold text-green-600">
                              ${item.price_per_item.toFixed(2)}
                            </p>
                          ) : (
                            <p className="text-slate-400 text-sm">No price set</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}