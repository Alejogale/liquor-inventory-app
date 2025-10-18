'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Download, Mail, FileText, BarChart3, Package, Building2, Users } from 'lucide-react'

interface InventoryItem {
  id: string
  brand: string
  category_id: string
  supplier_id: string
  par_level: number
  threshold: number
  barcode?: string
  price_per_item?: number
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

interface CategoryReport {
  categoryName: string
  items: InventoryItemWithCounts[]
  totalItems: number
  totalCount: number
}

interface InventoryItemWithCounts extends InventoryItem {
  roomCounts: { roomName: string; count: number }[]
  totalCount: number
}

interface ReportSettings {
  managerEmail: string
  includeBarcodes: boolean
  includeRoomDetails: boolean
  includeSuppliers: boolean
}

export default function EnhancedReports() {
  const { user, organization } = useAuth()
  const [loading, setLoading] = useState(true)
  const [categoryReports, setCategoryReports] = useState<CategoryReport[]>([])
  const [reportSettings, setReportSettings] = useState<ReportSettings>({
    managerEmail: '',
    includeBarcodes: true,
    includeRoomDetails: true,
    includeSuppliers: true
  })
  const [lastGenerated, setLastGenerated] = useState<string>('')

  useEffect(() => {
    if (user && organization) {
      generateReports()
    }
  }, [user, organization])

  const generateReports = async () => {
    try {
      setLoading(true)
      console.log('🔄 Generating comprehensive inventory reports...')
      
      if (!user || !organization) {
        console.log('❌ No user or organization found')
        return
      }

      const organizationId = organization.id
      console.log('✅ Organization ID:', organizationId)

      // Get all inventory items with categories and suppliers
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select(`
          id, brand, category_id, supplier_id, par_level, threshold, barcode, price_per_item,
          categories(name),
          suppliers(name)
        `)
        .eq('organization_id', organizationId)

      if (itemsError) throw itemsError
      
      console.log('📦 Inventory items found:', itemsData?.length || 0)

      // Get all room counts
      const { data: countsData, error: countsError } = await supabase
        .from('room_counts')
        .select('inventory_item_id, room_id, count')
        .eq('organization_id', organizationId)

      if (countsError) throw countsError

      // Get rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('organization_id', organizationId)

      if (roomsError) throw roomsError

      // Create room lookup
      const roomLookup = new Map(roomsData?.map(room => [room.id, room.name]) || [])

      // Create counts lookup
      const countsLookup = new Map()
      countsData?.forEach(count => {
        const key = count.inventory_item_id
        if (!countsLookup.has(key)) {
          countsLookup.set(key, [])
        }
        countsLookup.get(key).push({
          roomName: roomLookup.get(count.room_id) || 'Unknown Room',
          count: count.count
        })
      })

      // Enrich items with room counts
      const itemsWithCounts: InventoryItemWithCounts[] = itemsData?.map(item => {
        const roomCounts = countsLookup.get(item.id) || []
        const totalCount = roomCounts.reduce((sum: number, rc: any) => sum + rc.count, 0)
        
        return {
          ...item,
          roomCounts,
          totalCount,
          categories: item.categories?.[0] || { name: 'Unknown' },
          suppliers: item.suppliers?.[0] || { name: 'Unknown' }
        }
      }) || []

      // Group by category
      const categoryMap = new Map<string, InventoryItemWithCounts[]>()
      itemsWithCounts.forEach(item => {
        const categoryName = item.categories?.name || 'Uncategorized'
        if (!categoryMap.has(categoryName)) {
          categoryMap.set(categoryName, [])
        }
        categoryMap.get(categoryName)!.push(item)
      })

      // Create category reports
      const reports: CategoryReport[] = Array.from(categoryMap.entries()).map(([categoryName, items]) => ({
        categoryName,
        items,
        totalItems: items.length,
        totalCount: items.reduce((sum, item) => sum + item.totalCount, 0)
      }))

      // Sort by category name
      reports.sort((a, b) => a.categoryName.localeCompare(b.categoryName))

      setCategoryReports(reports)
      setLastGenerated(new Date().toLocaleString())
      console.log('✅ Reports generated successfully')

    } catch (error) {
      console.error('❌ Error generating reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportToCsv = () => {
    // ✅ UPDATED: Use same format as import for round-trip compatibility
    const headers = ['brand', 'category_name', 'supplier_name', 'par_level', 'threshold', 'barcode', 'price_per_item']

    // Add room details as separate columns if enabled
    const roomNames = reportSettings.includeRoomDetails
      ? Array.from(new Set(categoryReports.flatMap(cat =>
          cat.items.flatMap(item =>
            item.roomCounts.map(rc => rc.roomName)
          )
        )))
      : []

    const allHeaders = [...headers, ...roomNames]
    const csvRows = [allHeaders.join(',')]

    categoryReports.forEach(category => {
      category.items.forEach(item => {
        const row = [
          item.brand,
          category.categoryName,
          reportSettings.includeSuppliers ? (item.suppliers?.name || '') : '',
          item.par_level,
          item.threshold,
          reportSettings.includeBarcodes ? (item.barcode || '') : '',
          item.price_per_item || '' // ✅ ADDED: price_per_item for import compatibility
        ]

        // Add room counts as separate columns
        if (reportSettings.includeRoomDetails) {
          roomNames.forEach(roomName => {
            const roomCount = item.roomCounts.find(rc => rc.roomName === roomName)
            row.push(roomCount ? roomCount.count.toString() : '0')
          })
        }

        csvRows.push(row.join(','))
      })
    })

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const saveManagerEmail = async () => {
    if (!reportSettings.managerEmail.trim()) {
      alert('Please enter a manager email address')
      return
    }

    try {
      // Save manager email to user profile or organization settings
      const { error } = await supabase
        .from('user_profiles')
        .update({ manager_email: reportSettings.managerEmail })
        .eq('id', user?.id)

      if (error) throw error

      alert('Manager email saved successfully!')
    } catch (error) {
      console.error('Error saving manager email:', error)
      alert('Failed to save manager email')
    }
  }

  const loadManagerEmail = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('manager_email')
        .eq('id', user?.id)
        .single()

      if (data?.manager_email) {
        setReportSettings(prev => ({
          ...prev,
          managerEmail: data.manager_email
        }))
      }
    } catch (error) {
      console.error('Error loading manager email:', error)
    }
  }

  useEffect(() => {
    if (user) {
      loadManagerEmail()
    }
  }, [user])

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Generating comprehensive inventory reports...</div>
      </div>
    )
  }

  const totalCategories = categoryReports.length
  const totalItems = categoryReports.reduce((sum, cat) => sum + cat.totalItems, 0)
  const totalCount = categoryReports.reduce((sum, cat) => sum + cat.totalCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Enhanced Inventory Reports</h2>
          <p className="text-slate-600">
            Comprehensive inventory analysis with CSV export • Generated: {lastGenerated}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCsv}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={generateReports}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Report Settings */}
      <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Report Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Manager Email
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={reportSettings.managerEmail}
                onChange={(e) => setReportSettings(prev => ({ ...prev, managerEmail: e.target.value }))}
                placeholder="manager@example.com"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={saveManagerEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reportSettings.includeBarcodes}
                onChange={(e) => setReportSettings(prev => ({ ...prev, includeBarcodes: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Include barcodes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reportSettings.includeRoomDetails}
                onChange={(e) => setReportSettings(prev => ({ ...prev, includeRoomDetails: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Include room details</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={reportSettings.includeSuppliers}
                onChange={(e) => setReportSettings(prev => ({ ...prev, includeSuppliers: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-slate-700">Include suppliers</span>
            </label>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <Package className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-slate-600 text-sm">Categories</p>
              <p className="text-2xl font-bold text-slate-800">{totalCategories}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-slate-600 text-sm">Total Items</p>
              <p className="text-2xl font-bold text-slate-800">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <Building2 className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-slate-600 text-sm">Total Count</p>
              <p className="text-2xl font-bold text-slate-800">{totalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Reports */}
      <div className="space-y-4">
        {categoryReports.map((category) => (
          <div key={category.categoryName} className="bg-white rounded-xl border border-blue-200 shadow-sm">
            <div className="p-6 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">{category.categoryName}</h3>
                  <p className="text-slate-600 text-sm">
                    {category.totalItems} items • {category.totalCount} total units
                  </p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200 bg-blue-50">
                    <th className="text-left py-3 px-6 text-slate-700 font-medium">Brand</th>
                    {reportSettings.includeBarcodes && (
                      <th className="text-left py-3 px-6 text-slate-700 font-medium">Barcode</th>
                    )}
                    {reportSettings.includeSuppliers && (
                      <th className="text-left py-3 px-6 text-slate-700 font-medium">Supplier</th>
                    )}
                    <th className="text-left py-3 px-6 text-slate-700 font-medium">Par Level</th>
                    <th className="text-left py-3 px-6 text-slate-700 font-medium">Threshold</th>
                    <th className="text-left py-3 px-6 text-slate-700 font-medium">Total Count</th>
                    {reportSettings.includeRoomDetails && (
                      <th className="text-left py-3 px-6 text-slate-700 font-medium">Room Details</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item) => (
                    <tr key={item.id} className="border-b border-blue-100 hover:bg-blue-50">
                      <td className="py-3 px-6 text-slate-800 font-medium">{item.brand}</td>
                      {reportSettings.includeBarcodes && (
                        <td className="py-3 px-6 text-slate-700">
                          <span className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">
                            {item.barcode || 'No barcode'}
                          </span>
                        </td>
                      )}
                      {reportSettings.includeSuppliers && (
                        <td className="py-3 px-6 text-slate-700">{item.suppliers?.name || 'No supplier'}</td>
                      )}
                      <td className="py-3 px-6 text-slate-700">{item.par_level}</td>
                      <td className="py-3 px-6 text-slate-700">{item.threshold}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          item.totalCount > 0 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.totalCount}
                        </span>
                      </td>
                      {reportSettings.includeRoomDetails && (
                        <td className="py-3 px-6 text-slate-700">
                          <div className="text-sm">
                            {item.roomCounts.length > 0 ? (
                              item.roomCounts.map((rc, index) => (
                                <span key={index} className="inline-block bg-slate-100 px-2 py-1 rounded mr-1 mb-1">
                                  {rc.roomName}: {rc.count}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">No room counts</span>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
