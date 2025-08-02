'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'
import { sendOrderReport } from '../lib/email-service'

interface OrderItem {
  item_id: number
  brand: string
  category_name: string
  threshold: number
  par_level: number
  current_stock: number
  needed_quantity: number
  supplier_id: number | null
  supplier_name: string | null
  supplier_email: string | null
  rooms_with_stock: { room_name: string; count: number }[]
}

interface SupplierOrderGroup {
  supplier_id: number | null
  supplier_name: string
  supplier_email: string | null
  items: OrderItem[]
  total_items: number
  total_units: number
}

export default function OrderReport() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [supplierGroups, setSupplierGroups] = useState<SupplierOrderGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [lastGenerated, setLastGenerated] = useState<string>('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierOrderGroup | null>(null)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  useEffect(() => {
    generateOrderReport()
  }, [])

  const generateOrderReport = async () => {
    try {
      setLoading(true)
      
      // Get all inventory items with categories and suppliers
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, brand, category_id, threshold, par_level, supplier_id')
        .eq('organization_id', 1)

      if (itemsError) throw itemsError

      // Get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', 1)

      if (categoriesError) throw categoriesError

      // Get suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name, email')
        .eq('organization_id', 1)

      if (suppliersError) throw suppliersError

      // Get all room counts
      const { data: countsData, error: countsError } = await supabase
        .from('room_counts')
        .select('inventory_item_id, room_id, count')
        .eq('organization_id', 1)

      if (countsError) throw countsError

      // Get rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('organization_id', 1)

      if (roomsError) throw roomsError

      // Calculate order needs
      const orderNeeds: OrderItem[] = []

      itemsData?.forEach(item => {
        const category = categoriesData?.find(c => c.id === item.category_id)
        const supplier = suppliersData?.find(s => s.id === item.supplier_id)
        const itemCounts = countsData?.filter(c => c.inventory_item_id === item.id) || []
        
        // Calculate total stock across all rooms
        const totalStock = itemCounts.reduce((sum, count) => sum + count.count, 0)
        
        // Determine if we need to order (below threshold)
        if (totalStock <= item.threshold) {
          const needed = Math.max(item.par_level - totalStock, 1)
          
          // Get room breakdown
          const roomsWithStock = itemCounts
            .filter(c => c.count > 0)
            .map(c => {
              const room = roomsData?.find(r => r.id === c.room_id)
              return {
                room_name: room?.name || 'Unknown Room',
                count: c.count
              }
            })

          orderNeeds.push({
            item_id: item.id,
            brand: item.brand,
            category_name: category?.name || 'Unknown',
            threshold: item.threshold,
            par_level: item.par_level,
            current_stock: totalStock,
            needed_quantity: needed,
            supplier_id: item.supplier_id,
            supplier_name: supplier?.name || null,
            supplier_email: supplier?.email || null,
            rooms_with_stock: roomsWithStock
          })
        }
      })

      // Group by supplier
      const supplierGroupsMap = new Map<string, SupplierOrderGroup>()
      
      orderNeeds.forEach(item => {
        const supplierId = item.supplier_id?.toString() || 'no-supplier'
        const supplierName = item.supplier_name || 'No Supplier Assigned'
        const supplierEmail = item.supplier_email
        
        if (!supplierGroupsMap.has(supplierId)) {
          supplierGroupsMap.set(supplierId, {
            supplier_id: item.supplier_id,
            supplier_name: supplierName,
            supplier_email: supplierEmail,
            items: [],
            total_items: 0,
            total_units: 0
          })
        }
        
        const group = supplierGroupsMap.get(supplierId)!
        group.items.push(item)
        group.total_items++
        group.total_units += item.needed_quantity
      })

      // Sort items within each group by category, then brand
      supplierGroupsMap.forEach(group => {
        group.items.sort((a, b) => {
          if (a.category_name !== b.category_name) {
            return a.category_name.localeCompare(b.category_name)
          }
          return a.brand.localeCompare(b.brand)
        })
      })

      const groups = Array.from(supplierGroupsMap.values())
      
      // Sort groups: suppliers with email first, then by name
      groups.sort((a, b) => {
        if (a.supplier_email && !b.supplier_email) return -1
        if (!a.supplier_email && b.supplier_email) return 1
        return a.supplier_name.localeCompare(b.supplier_name)
      })

      setOrderItems(orderNeeds)
      setSupplierGroups(groups)
      setLastGenerated(new Date().toLocaleString())
    } catch (error) {
      console.error('Error generating order report:', error)
      alert('Error generating order report')
    } finally {
      setLoading(false)
    }
  }

  const exportToCsv = () => {
    const headers = ['Supplier', 'Category', 'Brand', 'Current Stock', 'Threshold', 'Par Level', 'Order Quantity', 'Room Locations']
    
    const csvContent = [
      headers.join(','),
      ...orderItems.map(item => [
        item.supplier_name || 'No Supplier',
        item.category_name,
        item.brand,
        item.current_stock,
        item.threshold,
        item.par_level,
        item.needed_quantity,
        item.rooms_with_stock.map(r => `${r.room_name}(${r.count})`).join('; ')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `order-report-by-supplier-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleEmailSupplier = (supplier: SupplierOrderGroup) => {
    if (!supplier.supplier_email) {
      alert(`No email address for ${supplier.supplier_name}. Please add an email in the Suppliers tab.`)
      return
    }
    
    setSelectedSupplier(supplier)
    setEmailAddress(supplier.supplier_email)
    setShowEmailModal(true)
  }

  const handleEmailReport = async () => {
    if (!emailAddress.trim() || !selectedSupplier) {
      alert('Please enter an email address')
      return
    }

    setEmailLoading(true)
    try {
      // Create supplier-specific report
      const result = await sendOrderReport(
        emailAddress, 
        selectedSupplier.items, 
        'Morris County Golf Club',
        selectedSupplier.supplier_name
      )
      
      if (result.success) {
        alert(`Order report sent to ${selectedSupplier.supplier_name} successfully!`)
        setShowEmailModal(false)
        setSelectedSupplier(null)
        setEmailAddress('')
      } else {
        alert('Failed to send email: ' + result.error)
      }
    } catch (error) {
      alert('Failed to send email')
    } finally {
      setEmailLoading(false)
    }
  }

  const printReport = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60">Generating supplier order report...</div>
      </div>
    )
  }

  const totalItems = orderItems.length
  const totalUnits = orderItems.reduce((sum, item) => sum + item.needed_quantity, 0)
  const suppliersAffected = supplierGroups.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Supplier Order Report</h2>
          <p className="text-white/60">
            Items below threshold, grouped by supplier • Generated: {lastGenerated}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateOrderReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Refresh Report
          </button>
          <button
            onClick={exportToCsv}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Export CSV
          </button>
          <button
            onClick={printReport}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            Print
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{totalItems}</div>
          <div className="text-white/80">Items to Order</div>
        </div>
        <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{totalUnits}</div>
          <div className="text-white/80">Total Units Needed</div>
        </div>
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{suppliersAffected}</div>
          <div className="text-white/80">Suppliers Affected</div>
        </div>
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">
            {supplierGroups.filter(s => s.supplier_email).length}
          </div>
          <div className="text-white/80">Can Email Directly</div>
        </div>
      </div>

      {/* Supplier Groups */}
      {supplierGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-white mb-2">No Orders Needed!</h3>
          <p className="text-white/60">All inventory items are above their threshold levels.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {supplierGroups.map((supplier, index) => (
            <div key={`${supplier.supplier_id}-${index}`} className="bg-white/10 rounded-xl p-6 border border-white/20">
              {/* Supplier Header */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    🏪 {supplier.supplier_name}
                    {!supplier.supplier_email && (
                      <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                        No Email
                      </span>
                    )}
                  </h3>
                  <p className="text-white/60">
                    {supplier.total_items} items • {supplier.total_units} units needed
                    {supplier.supplier_email && (
                      <span className="text-green-400 ml-2">📧 {supplier.supplier_email}</span>
                    )}
                  </p>
                </div>
                
                {supplier.supplier_email ? (
                  <button
                    onClick={() => handleEmailSupplier(supplier)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    📧 Email {supplier.supplier_name}
                  </button>
                ) : (
                  <div className="text-white/40 text-sm">
                    Add email in Suppliers tab<br/>to enable direct ordering
                  </div>
                )}
              </div>

              {/* Items for this supplier */}
              <div className="space-y-3">
                {supplier.items.map(item => (
                  <div key={item.item_id} className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-white text-lg">{item.brand}</h4>
                        <p className="text-white/60 text-sm">{item.category_name}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-white/60">Current Stock:</span>
                            <span className="text-red-400 font-bold ml-2">{item.current_stock}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Threshold:</span>
                            <span className="text-white ml-2">{item.threshold}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Par Level:</span>
                            <span className="text-white ml-2">{item.par_level}</span>
                          </div>
                          <div>
                            <span className="text-white/60">Order:</span>
                            <span className="text-green-400 font-bold ml-2">{item.needed_quantity} units</span>
                          </div>
                        </div>
                        
                        {item.rooms_with_stock.length > 0 && (
                          <div className="mt-2">
                            <span className="text-white/60 text-sm">Current locations: </span>
                            {item.rooms_with_stock.map((room, idx) => (
                              <span key={idx} className="text-blue-400 text-sm">
                                {room.room_name} ({room.count}){idx < item.rooms_with_stock.length - 1 ? ', ' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-1">
                        <span className="text-red-400 font-bold">ORDER NOW</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">
              📧 Email Order to {selectedSupplier.supplier_name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Send to email address:
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="supplier@example.com"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                required
              />
            </div>
            
            <div className="text-xs text-white/50 bg-white/5 p-3 rounded-lg mb-4">
              <strong>Order Summary:</strong><br/>
              • {selectedSupplier.total_items} items to order<br/>
              • {selectedSupplier.total_units} total units needed<br/>
              • Professional HTML email with item details
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowEmailModal(false)
                  setSelectedSupplier(null)
                  setEmailAddress('')
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailReport}
                disabled={emailLoading || !emailAddress.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {emailLoading ? 'Sending...' : 'Send Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
