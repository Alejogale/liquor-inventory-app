'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Download,
  Filter,
  X
} from 'lucide-react'

interface InventoryMetrics {
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  averageItemValue: number
  topCategories: Array<{ name: string; count: number; value: number }>
  topSuppliers: Array<{ name: string; items: number; value: number }>
  roomUtilization: Array<{ room: string; items: number; utilization: number }>
  monthlyTrends: Array<{ month: string; items: number; value: number }>
  activitySummary: {
    itemsAdded: number
    itemsUpdated: number
    countsPerformed: number
    reportsGenerated: number
  }
  alerts: Array<{ type: string; message: string; severity: 'low' | 'medium' | 'high' }>
}

interface ReportFilters {
  dateRange: '7d' | '30d' | '90d' | '1y'
  category: string
  supplier: string
  room: string
}

export default function AdvancedReporting({ organizationId }: { organizationId?: string }) {
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: '30d',
    category: '',
    supplier: '',
    room: ''
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts' | 'export'>('overview')

  useEffect(() => {
    if (organizationId) {
      fetchAdvancedMetrics()
    }
  }, [organizationId, filters])

  const fetchAdvancedMetrics = async () => {
    try {
      setLoading(true)

      // Fetch inventory items
      const { data: items } = await supabase
        .from('inventory_items')
        .select(`
          *,
          categories(name),
          suppliers(name)
        `)
        .eq('organization_id', organizationId)

      // Fetch room counts
      const { data: roomCounts } = await supabase
        .from('room_counts')
        .select(`
          *,
          rooms(name),
          inventory_items(brand, size)
        `)
        .eq('organization_id', organizationId)

      // Fetch activity logs
      const { data: activities } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', getDateRangeFilter(filters.dateRange))

      // Calculate metrics
      const totalItems = items?.length || 0
      const totalValue = items?.reduce((sum, item) => sum + (item.size || 0), 0) || 0
      const averageItemValue = totalItems > 0 ? totalValue / totalItems : 0

      // Calculate low stock and out of stock items
      const lowStockItems = roomCounts?.filter(count => count.count < 5).length || 0
      const outOfStockItems = roomCounts?.filter(count => count.count === 0).length || 0

      // Calculate top categories
      const categoryStats = items?.reduce((acc: any, item) => {
        const categoryName = item.categories?.name || 'Uncategorized'
        if (!acc[categoryName]) {
          acc[categoryName] = { count: 0, value: 0 }
        }
        acc[categoryName].count++
        acc[categoryName].value += item.size || 0
        return acc
      }, {}) || {}

      const topCategories = Object.entries(categoryStats)
        .map(([name, stats]: [string, any]) => ({
          name,
          count: stats.count,
          value: stats.value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      // Calculate top suppliers
      const supplierStats = items?.reduce((acc: any, item) => {
        const supplierName = item.suppliers?.name || 'Unknown'
        if (!acc[supplierName]) {
          acc[supplierName] = { items: 0, value: 0 }
        }
        acc[supplierName].items++
        acc[supplierName].value += item.size || 0
        return acc
      }, {}) || {}

      const topSuppliers = Object.entries(supplierStats)
        .map(([name, stats]: [string, any]) => ({
          name,
          items: stats.items,
          value: stats.value
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      // Calculate room utilization
      const roomStats = roomCounts?.reduce((acc: any, count) => {
        const roomName = count.rooms?.name || 'Unknown'
        if (!acc[roomName]) {
          acc[roomName] = { items: 0, totalCount: 0 }
        }
        acc[roomName].items++
        acc[roomName].totalCount += count.count || 0
        return acc
      }, {}) || {}

      const roomUtilization = Object.entries(roomStats)
        .map(([room, stats]: [string, any]) => ({
          room,
          items: stats.items,
          utilization: Math.round((stats.totalCount / (stats.items * 10)) * 100) // Assuming 10 is max capacity per item
        }))
        .sort((a, b) => b.utilization - a.utilization)

      // Calculate monthly trends
      const monthlyTrends = generateMonthlyTrends(items || [], filters.dateRange)

      // Calculate activity summary
      const activitySummary = {
        itemsAdded: activities?.filter(a => a.action_type === 'item_added').length || 0,
        itemsUpdated: activities?.filter(a => a.action_type === 'item_edited').length || 0,
        countsPerformed: activities?.filter(a => a.action_type === 'count_updated').length || 0,
        reportsGenerated: activities?.filter(a => a.action_type === 'report_sent').length || 0
      }

      // Generate alerts
      const alerts = generateAlerts(items || [], roomCounts || [], activities || [])

      setMetrics({
        totalItems,
        totalValue,
        lowStockItems,
        outOfStockItems,
        averageItemValue,
        topCategories,
        topSuppliers,
        roomUtilization,
        monthlyTrends,
        activitySummary,
        alerts
      })
    } catch (error) {
      console.error('Error fetching advanced metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDateRangeFilter = (range: string) => {
    const now = new Date()
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      case '1y':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  const generateMonthlyTrends = (items: any[], dateRange: string) => {
    // Generate mock monthly trends based on date range
    const months = []
    const now = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        items: Math.floor(Math.random() * 100) + 50,
        value: Math.floor(Math.random() * 10000) + 5000
      })
    }
    
    return months
  }

  const generateAlerts = (items: any[], roomCounts: any[], activities: any[]) => {
    const alerts = []
    
    // Low stock alerts
    const lowStockCount = roomCounts.filter(count => count.count < 5).length
    if (lowStockCount > 0) {
      alerts.push({
        type: 'low_stock',
        message: `${lowStockCount} items are running low on stock`,
        severity: 'medium' as const
      })
    }
    
    // Out of stock alerts
    const outOfStockCount = roomCounts.filter(count => count.count === 0).length
    if (outOfStockCount > 0) {
      alerts.push({
        type: 'out_of_stock',
        message: `${outOfStockCount} items are out of stock`,
        severity: 'high' as const
      })
    }
    
    // High activity alerts
    if (activities.length > 100) {
      alerts.push({
        type: 'high_activity',
        message: 'High inventory activity detected',
        severity: 'low' as const
      })
    }
    
    return alerts
  }

  const exportReport = (format: 'pdf' | 'csv' | 'excel') => {
    // Implement export functionality
    console.log(`Exporting report as ${format}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading advanced analytics...</div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">No data available for advanced reporting</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Advanced Analytics</h2>
          <p className="text-slate-600">Comprehensive inventory insights and business intelligence</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-slate-700 bg-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'trends', label: 'Trends', icon: LineChart },
          { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
          { id: 'export', label: 'Export', icon: Download }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-800'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-slate-800">{metrics.totalItems.toLocaleString()}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-slate-800">${metrics.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Low Stock Items</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.lowStockItems}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Out of Stock</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.outOfStockItems}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-lg">
                  <X className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Categories by Value</h3>
              <div className="space-y-3">
                {metrics.topCategories.map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-700">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">${category.value.toLocaleString()}</div>
                      <div className="text-sm text-slate-500">{category.count} items</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Suppliers */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Suppliers</h3>
              <div className="space-y-3">
                {metrics.topSuppliers.map((supplier, index) => (
                  <div key={supplier.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-700">{supplier.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">{supplier.items} items</div>
                      <div className="text-sm text-slate-500">${supplier.value.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.activitySummary.itemsAdded}</div>
                <div className="text-sm text-slate-600">Items Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.activitySummary.itemsUpdated}</div>
                <div className="text-sm text-slate-600">Items Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.activitySummary.countsPerformed}</div>
                <div className="text-sm text-slate-600">Counts Performed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.activitySummary.reportsGenerated}</div>
                <div className="text-sm text-slate-600">Reports Generated</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Monthly Trends</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {metrics.monthlyTrends.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t w-full"
                    style={{ 
                      height: `${(data.value / Math.max(...metrics.monthlyTrends.map(d => d.value))) * 200}px`
                    }}
                  />
                  <span className="text-slate-600 text-sm mt-2">{data.month}</span>
                  <span className="text-slate-800 text-xs font-medium">${data.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {metrics.alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600">No alerts at this time</p>
            </div>
          ) : (
            metrics.alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'high'
                    ? 'bg-red-50 border-red-200'
                    : alert.severity === 'medium'
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === 'high'
                      ? 'text-red-600'
                      : alert.severity === 'medium'
                      ? 'text-orange-600'
                      : 'text-blue-600'
                  }`} />
                  <span className="text-slate-800">{alert.message}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Export Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => exportReport('pdf')}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="font-semibold text-slate-800">PDF Report</div>
                <div className="text-sm text-slate-600">Comprehensive report with charts</div>
              </button>
              
              <button
                onClick={() => exportReport('csv')}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="font-semibold text-slate-800">CSV Export</div>
                <div className="text-sm text-slate-600">Raw data for analysis</div>
              </button>
              
              <button
                onClick={() => exportReport('excel')}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-left"
              >
                <div className="font-semibold text-slate-800">Excel Report</div>
                <div className="text-sm text-slate-600">Formatted spreadsheet</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 