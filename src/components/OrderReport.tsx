'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'
// Email service is now called via API route
import { useAuth } from '../lib/auth-context'

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
  price_per_item?: number | null
  total_value?: number
}

interface SupplierOrderGroup {
  supplier_id: number | null
  supplier_name: string
  supplier_email: string | null
  items: OrderItem[]
  total_items: number
  total_units: number
  total_value: number
}

interface OrderReportProps {
  organizationId?: string
}

export default function OrderReport({ organizationId }: OrderReportProps) {
  const { user, organization } = useAuth()
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [supplierGroups, setSupplierGroups] = useState<SupplierOrderGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [lastGenerated, setLastGenerated] = useState<string>('')
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierOrderGroup | null>(null)
  const [emailAddress, setEmailAddress] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [expandedSuppliers, setExpandedSuppliers] = useState<Set<number | null>>(new Set())

  useEffect(() => {
    if (user && (organization || organizationId)) {
      generateOrderReport()
    }
  }, [user, organization, organizationId])

  const generateOrderReport = async () => {
    try {
      setLoading(true)
      console.log('🔄 Starting order report generation...')
      
      if (!user || (!organization && !organizationId)) {
        console.log('❌ No user or organization found')
        alert('Authentication error: Please log in again')
        return
      }

      const currentOrganizationId = organizationId || organization?.id
      if (!currentOrganizationId) {
        console.error('❌ No organization ID available')
        alert('Organization error: Please contact support')
        return
      }
      
      console.log('✅ Organization ID for report:', currentOrganizationId)
      console.log('🔍 Using organization from:', organizationId ? 'prop' : 'auth context')
      console.log('👤 Current user:', user.email)

      // Get all inventory items with categories and suppliers
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, brand, category_id, threshold, par_level, supplier_id, price_per_item')
        .eq('organization_id', currentOrganizationId)

      if (itemsError) throw itemsError
      
      console.log('📦 Inventory items found:', itemsData?.length || 0)
      console.log('📦 Sample items:', itemsData?.slice(0, 3))

      // Get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', currentOrganizationId)

      if (categoriesError) throw categoriesError

      // Get suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('id, name, email')
        .eq('organization_id', currentOrganizationId)

      if (suppliersError) throw suppliersError

      // Get all room counts
      const { data: countsData, error: countsError } = await supabase
        .from('room_counts')
        .select('inventory_item_id, room_id, count')
        .eq('organization_id', currentOrganizationId)

      if (countsError) throw countsError

      // Get rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('organization_id', currentOrganizationId)

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
          const itemPrice = item.price_per_item || 0
          const totalValue = needed * itemPrice
          
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
            rooms_with_stock: roomsWithStock,
            price_per_item: itemPrice,
            total_value: totalValue
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
            total_units: 0,
            total_value: 0
          })
        }
        
        const group = supplierGroupsMap.get(supplierId)!
        group.items.push(item)
        group.total_items++
        group.total_units += item.needed_quantity
        group.total_value += item.total_value || 0
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

      console.log('📋 Order needs calculated:', orderNeeds.length)
      console.log('📋 Sample order needs:', orderNeeds.slice(0, 3))
      console.log('🏪 Supplier groups:', groups.length)
      
      setOrderItems(orderNeeds)
      setSupplierGroups(groups)
      setLastGenerated(new Date().toLocaleString())
    } catch (error: any) {
      console.error('❌ Error generating order report:', error)
      
      // More specific error messages
      let errorMessage = 'Error generating order report'
      if (error?.message?.includes('organization_id')) {
        errorMessage = 'Organization access error: Please check your permissions'
      } else if (error?.message?.includes('auth')) {
        errorMessage = 'Authentication error: Please log in again'
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'No data found: Please add inventory items first'
      } else if (error?.message) {
        errorMessage = `Database error: ${error.message}`
      }
      
      alert(errorMessage)
      console.error('🔍 Full error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      })
    } finally {
      setLoading(false)
    }
  }

  const exportToCsv = () => {
    // Use lowercase headers matching import format for round-trip compatibility
    const headers = ['brand', 'category_name', 'supplier_name', 'par_level', 'threshold', 'barcode', 'price_per_item']

    // Helper function to properly escape CSV values
    const escapeCSVValue = (value: any): string => {
      if (value === null || value === undefined) return ''
      const stringValue = String(value)
      // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }

    const csvRows = [headers.map(escapeCSVValue).join(',')]

    orderItems.forEach(item => {
      const row = [
        item.brand,
        item.category_name,
        item.supplier_name || '',
        item.par_level,
        item.threshold,
        '', // barcode - not available in order report
        item.price_per_item || ''
      ]
      csvRows.push(row.map(escapeCSVValue).join(','))
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-export-${new Date().toISOString().split('T')[0]}.csv`
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

  const toggleSupplierDropdown = (supplierId: number | null) => {
    const newExpanded = new Set(expandedSuppliers)
    if (newExpanded.has(supplierId)) {
      newExpanded.delete(supplierId)
    } else {
      newExpanded.add(supplierId)
    }
    setExpandedSuppliers(newExpanded)
  }

  const handleEmailReport = async () => {
    if (!emailAddress.trim() || !selectedSupplier) {
      alert('Please enter an email address')
      return
    }

    setEmailLoading(true)
    try {
      // Prepare report data
      const reportData = {
        totalItems: selectedSupplier.items.length,
        totalValue: selectedSupplier.total_value,
        supplierName: selectedSupplier.supplier_name,
        items: selectedSupplier.items
      }

      // Send email via API route
      const response = await fetch('/api/send-order-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailAddress,
          organizationName: organization?.Name || 'Morris County Golf Club',
          reportData,
          reportDate: new Date().toLocaleDateString(),
          reportUrl: window.location.href
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`Order report sent to ${selectedSupplier.supplier_name} successfully!`)
        setShowEmailModal(false)
        setSelectedSupplier(null)
        setEmailAddress('')
      } else {
        alert('Failed to send email: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error sending email:', error)
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
        <div className="text-slate-600">Generating supplier order report...</div>
      </div>
    )
  }

  const totalItems = orderItems.length
  const totalUnits = orderItems.reduce((sum, item) => sum + item.needed_quantity, 0)
  const totalOrderValue = orderItems.reduce((sum, item) => sum + (item.total_value || 0), 0)
  const suppliersAffected = supplierGroups.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Supplier Order Report</h2>
          <p className="text-slate-600">
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{totalItems}</div>
          <div className="text-slate-700">Items to Order</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{totalUnits}</div>
          <div className="text-slate-700">Total Units Needed</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            ${totalOrderValue.toFixed(2)}
          </div>
          <div className="text-slate-700">Estimated Order Value</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{suppliersAffected}</div>
          <div className="text-slate-700">Suppliers Affected</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {supplierGroups.filter(s => s.supplier_email).length}
          </div>
          <div className="text-slate-700">Can Email Directly</div>
        </div>
      </div>

      {/* Supplier Groups */}
      {supplierGroups.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Orders Needed!</h3>
          <p className="text-slate-600">All inventory items are above their threshold levels.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {supplierGroups.map((supplier, index) => {
            const isExpanded = expandedSuppliers.has(supplier.supplier_id)
            return (
              <div key={`${supplier.supplier_id}-${index}`} className="bg-white rounded-xl border border-blue-200 shadow-sm overflow-hidden">
                {/* Supplier Header - Clickable Dropdown */}
                <div 
                  className="p-6 cursor-pointer hover:bg-slate-50 transition-colors"
                  onClick={() => toggleSupplierDropdown(supplier.supplier_id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                        ▶️
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                          🏪 {supplier.supplier_name}
                          {!supplier.supplier_email && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              No Email
                            </span>
                          )}
                        </h3>
                        <p className="text-slate-600">
                          {supplier.total_items} items • {supplier.total_units} units needed • ${supplier.total_value.toFixed(2)} total value
                          {supplier.supplier_email && (
                            <span className="text-green-600 ml-2">📧 {supplier.supplier_email}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {supplier.supplier_email ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEmailSupplier(supplier)
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >
                          📧 Email {supplier.supplier_name}
                        </button>
                      ) : (
                        <div className="text-slate-500 text-sm">
                          Add email in Suppliers tab<br/>to enable direct ordering
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collapsible Items Section */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-slate-200 bg-slate-50">
                    <div className="pt-4 space-y-3">
                      {supplier.items.map(item => (
                        <div key={item.item_id} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 text-lg">{item.brand}</h4>
                              <p className="text-slate-600 text-sm">{item.category_name}</p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                                <div>
                                  <span className="text-slate-600">Current Stock:</span>
                                  <span className="text-red-600 font-bold ml-2">{item.current_stock}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Threshold:</span>
                                  <span className="text-slate-800 ml-2">{item.threshold}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Par Level:</span>
                                  <span className="text-slate-800 ml-2">{item.par_level}</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Order:</span>
                                  <span className="text-green-600 font-bold ml-2">{item.needed_quantity} units</span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Unit Price:</span>
                                  <span className="text-blue-600 font-bold ml-2">
                                    {item.price_per_item ? `$${item.price_per_item.toFixed(2)}` : 'No price'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-600">Total Value:</span>
                                  <span className="text-green-600 font-bold ml-2">
                                    ${item.total_value ? item.total_value.toFixed(2) : '0.00'}
                                  </span>
                                </div>
                              </div>
                              
                              {item.rooms_with_stock.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-slate-600 text-sm">Current locations: </span>
                                  {item.rooms_with_stock.map((room, idx) => (
                                    <span key={idx} className="text-blue-600 text-sm">
                                      {room.room_name} ({room.count}){idx < item.rooms_with_stock.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <div className="bg-red-100 border border-red-300 rounded-lg px-3 py-1">
                              <span className="text-red-700 font-bold">ORDER NOW</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-slate-200 shadow-xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              📧 Email Order to {selectedSupplier.supplier_name}
            </h3>
            
            <div className="mb-4">
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Send to email address:
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="supplier@example.com"
                className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 placeholder-slate-500"
                required
              />
            </div>
            
            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4">
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
