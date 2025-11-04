'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  User,
  Package,
  MapPin,
  BarChart3,
  FileText,
  Activity,
  Zap,
  Clock,
  Award
} from 'lucide-react'

interface StockMovement {
  id: string
  inventory_item_id: number
  item_brand: string
  item_size: string | null
  user_id: string
  user_name: string
  movement_type: 'IN' | 'OUT'
  quantity: number
  previous_stock: number
  new_stock: number
  room_id: number | null
  room_name: string | null
  notes: string | null
  reason_category: string | null
  created_at: string
  organization_id: string
}

interface StockMovementAnalyticsProps {
  organizationId: string
}

export default function StockMovementAnalytics({ organizationId }: StockMovementAnalyticsProps) {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // Filters
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterUser, setFilterUser] = useState('')
  const [filterItem, setFilterItem] = useState('')
  const [filterRoom, setFilterRoom] = useState('')

  // Stats
  const [stats, setStats] = useState({
    totalMovements: 0,
    totalIN: 0,
    totalOUT: 0,
    netChange: 0,
    mostActiveUser: '',
    mostMovedItem: '',
    avgMovementSize: 0,
    movementsPerDay: 0,
    inOutRatio: 0
  })

  // Advanced Analytics
  const [roomAnalytics, setRoomAnalytics] = useState<any[]>([])
  const [staffAnalytics, setStaffAnalytics] = useState<any[]>([])
  const [itemAnalytics, setItemAnalytics] = useState<any[]>([])
  const [dailyTrend, setDailyTrend] = useState<any[]>([])
  const [peakHours, setPeakHours] = useState<any[]>([])

  // Unique values for filters
  const [uniqueUsers, setUniqueUsers] = useState<string[]>([])
  const [uniqueItems, setUniqueItems] = useState<string[]>([])
  const [uniqueRooms, setUniqueRooms] = useState<string[]>([])

  useEffect(() => {
    if (organizationId) {
      fetchStockMovements()
    }
  }, [organizationId])

  useEffect(() => {
    applyFilters()
  }, [movements, filterType, filterDateFrom, filterDateTo, filterUser, filterItem, filterRoom])

  useEffect(() => {
    calculateStats()
  }, [filteredMovements])

  useEffect(() => {
    if (filteredMovements.length === 0) return

    // Room Performance Analysis
    const roomData = Object.entries(
      filteredMovements.reduce((acc, m) => {
        const room = m.room_name || 'Unknown'
        if (!acc[room]) acc[room] = { in: 0, out: 0 }
        if (m.movement_type === 'IN') acc[room].in += m.quantity
        else acc[room].out += m.quantity
        return acc
      }, {} as Record<string, { in: number; out: number }>)
    ).map(([name, data]) => ({
      name,
      in: data.in,
      out: data.out,
      net: data.in - data.out,
      total: data.in + data.out
    })).sort((a, b) => b.total - a.total).slice(0, 10)

    setRoomAnalytics(roomData)

    // Staff Performance Analysis
    const staffData = Object.entries(
      filteredMovements.reduce((acc, m) => {
        if (!acc[m.user_name]) acc[m.user_name] = { movements: 0, quantity: 0 }
        acc[m.user_name].movements++
        acc[m.user_name].quantity += m.quantity
        return acc
      }, {} as Record<string, { movements: number; quantity: number }>)
    ).map(([name, data]) => ({
      name,
      movements: data.movements,
      quantity: data.quantity,
      avg: data.quantity / data.movements
    })).sort((a, b) => b.movements - a.movements)

    setStaffAnalytics(staffData)

    // Top Items by Velocity
    const itemData = Object.entries(
      filteredMovements.reduce((acc, m) => {
        if (!acc[m.item_brand]) acc[m.item_brand] = { in: 0, out: 0, count: 0 }
        if (m.movement_type === 'IN') acc[m.item_brand].in += m.quantity
        else acc[m.item_brand].out += m.quantity
        acc[m.item_brand].count++
        return acc
      }, {} as Record<string, { in: number; out: number; count: number }>)
    ).map(([name, data]) => ({
      name,
      in: data.in,
      out: data.out,
      velocity: data.count,
      turnover: data.out / (data.in || 1)
    })).sort((a, b) => b.velocity - a.velocity).slice(0, 10)

    setItemAnalytics(itemData)

    // Daily Trend (Last 7 days)
    const dailyData: any[] = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayMovements = filteredMovements.filter(m =>
        m.created_at.startsWith(dateStr)
      )

      dailyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        in: dayMovements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
        out: dayMovements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0),
        movements: dayMovements.length
      })
    }

    setDailyTrend(dailyData)

    // Peak Hours
    const hourCounts = filteredMovements.reduce((acc, m) => {
      const hour = new Date(m.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const peakData = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setPeakHours(peakData)

  }, [filteredMovements])

  const fetchStockMovements = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching stock movements:', error)
        return
      }

      setMovements(data || [])

      // Extract unique values for filters
      const users = Array.from(new Set(data?.map(m => m.user_name) || []))
      const items = Array.from(new Set(data?.map(m => m.item_brand) || []))
      const rooms = Array.from(new Set(data?.map(m => m.room_name).filter(Boolean) || []))

      setUniqueUsers(users)
      setUniqueItems(items)
      setUniqueRooms(rooms as string[])

    } catch (error) {
      console.error('Error fetching movements:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...movements]

    // Type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(m => m.movement_type === filterType)
    }

    // Date range filter
    if (filterDateFrom) {
      filtered = filtered.filter(m => new Date(m.created_at) >= new Date(filterDateFrom))
    }
    if (filterDateTo) {
      filtered = filtered.filter(m => new Date(m.created_at) <= new Date(filterDateTo))
    }

    // User filter
    if (filterUser) {
      filtered = filtered.filter(m => m.user_name === filterUser)
    }

    // Item filter
    if (filterItem) {
      filtered = filtered.filter(m => m.item_brand.toLowerCase().includes(filterItem.toLowerCase()))
    }

    // Room filter
    if (filterRoom) {
      filtered = filtered.filter(m => m.room_name === filterRoom)
    }

    setFilteredMovements(filtered)
  }

  const calculateStats = () => {
    const totalIN = filteredMovements
      .filter(m => m.movement_type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0)

    const totalOUT = filteredMovements
      .filter(m => m.movement_type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0)

    // Most active user
    const userCounts = filteredMovements.reduce((acc, m) => {
      acc[m.user_name] = (acc[m.user_name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostActiveUser = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Most moved item
    const itemCounts = filteredMovements.reduce((acc, m) => {
      acc[m.item_brand] = (acc[m.item_brand] || 0) + m.quantity
      return acc
    }, {} as Record<string, number>)

    const mostMovedItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

    // Additional metrics
    const avgMovementSize = filteredMovements.length > 0
      ? (totalIN + totalOUT) / filteredMovements.length
      : 0

    const dateRange = filteredMovements.length > 0
      ? (new Date(filteredMovements[0].created_at).getTime() - new Date(filteredMovements[filteredMovements.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)
      : 1

    const movementsPerDay = dateRange > 0 ? filteredMovements.length / dateRange : filteredMovements.length

    const inOutRatio = totalOUT > 0 ? totalIN / totalOUT : totalIN > 0 ? 999 : 0

    setStats({
      totalMovements: filteredMovements.length,
      totalIN,
      totalOUT,
      netChange: totalIN - totalOUT,
      mostActiveUser,
      mostMovedItem,
      avgMovementSize,
      movementsPerDay,
      inOutRatio
    })
  }

  const exportToCSV = () => {
    setExporting(true)

    try {
      const headers = [
        'Date',
        'Time',
        'Type',
        'Item',
        'Size',
        'Quantity',
        'Previous Stock',
        'New Stock',
        'Room',
        'User',
        'Notes',
        'Reason Category'
      ]

      const rows = filteredMovements.map(m => [
        new Date(m.created_at).toLocaleDateString(),
        new Date(m.created_at).toLocaleTimeString(),
        m.movement_type,
        m.item_brand,
        m.item_size || '',
        m.quantity,
        m.previous_stock,
        m.new_stock,
        m.room_name || '',
        m.user_name,
        m.notes || '',
        m.reason_category || ''
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `stock-movements-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      window.URL.revokeObjectURL(url)

      alert(`✅ Exported ${filteredMovements.length} stock movements to CSV`)
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Failed to export CSV')
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => {
    setFilterType('ALL')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterUser('')
    setFilterItem('')
    setFilterRoom('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Stock Movement Analytics</h2>
          <p className="text-gray-600 mt-1">Comprehensive insights and trend analysis</p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={exporting || filteredMovements.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}
        >
          <Download className="w-5 h-5" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            <span className="text-xs font-medium text-gray-600">Total Movements</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.totalMovements}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.movementsPerDay.toFixed(1)} per day avg</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-green-200"
             style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(255,255,255,1) 100%)' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-xs font-medium text-gray-600">Stock IN</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.totalIN}</p>
          <p className="text-xs text-gray-500 mt-1">Avg {stats.avgMovementSize.toFixed(1)} per move</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-red-200"
             style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(255,255,255,1) 100%)' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-6 h-6 text-red-600" />
            <span className="text-xs font-medium text-gray-600">Stock OUT</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{stats.totalOUT}</p>
          <p className="text-xs text-gray-500 mt-1">Ratio: {stats.inOutRatio.toFixed(2)}x IN/OUT</p>
        </div>

        <div className="bg-white rounded-lg p-4 shadow border border-orange-200"
             style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.08) 0%, rgba(255,255,255,1) 100%)' }}>
          <div className="flex items-center justify-between mb-2">
            <Package className="w-6 h-6 text-orange-600" />
            <span className="text-xs font-medium text-gray-600">Net Change</span>
          </div>
          <p className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {stats.netChange >= 0 ? '+' : ''}{stats.netChange}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.netChange >= 0 ? 'Net Gain' : 'Net Loss'}
          </p>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Daily Trend - Compact Table */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">7-Day Activity Summary</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Date</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">IN</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">OUT</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Net</th>
                  <th className="text-right py-2 px-3 font-medium text-gray-600">Movements</th>
                </tr>
              </thead>
              <tbody>
                {dailyTrend.map((day, idx) => {
                  const net = day.in - day.out
                  return (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-700">{day.date}</td>
                      <td className="py-2 px-3 text-right text-green-600 font-medium">{day.in}</td>
                      <td className="py-2 px-3 text-right text-red-600 font-medium">{day.out}</td>
                      <td className={`py-2 px-3 text-right font-semibold ${net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {net >= 0 ? '+' : ''}{net}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-600">{day.movements}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {dailyTrend.length === 0 && (
            <p className="text-center text-gray-500 py-4 text-sm">No trend data available</p>
          )}
        </div>

        {/* Room Performance */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Rooms</h3>
          </div>

          <div className="space-y-2">
            {roomAnalytics.slice(0, 5).map((room, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium">{idx + 1}.</span>
                  <span className="font-medium text-gray-700">{room.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-600">↑{room.in}</span>
                  <span className="text-red-600">↓{room.out}</span>
                  <span className={`font-bold ${room.net >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {room.net >= 0 ? '+' : ''}{room.net}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {roomAnalytics.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">No room data available</p>
          )}
        </div>

        {/* Staff Productivity */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Staff Activity</h3>
          </div>

          <div className="space-y-2">
            {staffAnalytics.map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm hover:bg-gray-100">
                <div className="flex items-center gap-2">
                  {idx === 0 && <Award className="w-3 h-3 text-yellow-500" />}
                  <span className="font-medium text-gray-700">{staff.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-600">{staff.movements} moves</span>
                  <span className="text-gray-600">{staff.quantity} units</span>
                  <span className="text-gray-500">avg {staff.avg.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>

          {staffAnalytics.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">No staff data available</p>
          )}
        </div>

        {/* Top Items by Velocity */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Most Active Items</h3>
          </div>

          <div className="space-y-2">
            {itemAnalytics.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm hover:bg-gray-100">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700 truncate">{item.name}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                    <span className="text-green-600">↑{item.in}</span>
                    <span className="text-red-600">↓{item.out}</span>
                  </div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold text-orange-600">{item.velocity}</div>
                  <div className="text-xs text-gray-500">moves</div>
                </div>
              </div>
            ))}
          </div>

          {itemAnalytics.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">No item data available</p>
          )}
        </div>

        {/* Peak Hours Analysis */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">Busiest Hours</h3>
          </div>

          <div className="space-y-2">
            {peakHours.map((peak, idx) => {
              const hourStr = peak.hour === 0 ? '12 AM' :
                             peak.hour < 12 ? `${peak.hour} AM` :
                             peak.hour === 12 ? '12 PM' :
                             `${peak.hour - 12} PM`

              return (
                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-sm hover:bg-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-medium">{idx + 1}.</span>
                    <span className="font-medium text-gray-700">{hourStr}</span>
                  </div>
                  <span className="text-gray-900 font-semibold">{peak.count}</span>
                </div>
              )
            })}
          </div>

          {peakHours.length === 0 && (
            <p className="text-center text-gray-500 py-6 text-sm">No peak hour data available</p>
          )}
        </div>

        {/* Net Change Breakdown */}
        <div className="bg-white rounded-lg p-4 shadow border border-gray-200 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Net Change Summary</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* By Room Net Change */}
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Gaining</h4>
              <div className="space-y-1">
                {roomAnalytics
                  .filter(r => r.net > 0)
                  .sort((a, b) => b.net - a.net)
                  .slice(0, 3)
                  .map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-green-50 rounded text-sm">
                      <span className="text-gray-700 truncate">{room.name}</span>
                      <span className="font-semibold text-green-700 ml-2">+{room.net}</span>
                    </div>
                  ))}
                {roomAnalytics.filter(r => r.net > 0).length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-2">No gains</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Losing</h4>
              <div className="space-y-1">
                {roomAnalytics
                  .filter(r => r.net < 0)
                  .sort((a, b) => a.net - b.net)
                  .slice(0, 3)
                  .map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-red-50 rounded text-sm">
                      <span className="text-gray-700 truncate">{room.name}</span>
                      <span className="font-semibold text-red-700 ml-2">{room.net}</span>
                    </div>
                  ))}
                {roomAnalytics.filter(r => r.net < 0).length === 0 && (
                  <p className="text-xs text-gray-500 text-center py-2">No losses</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Insights</h4>
              <div className="space-y-1 text-sm">
                <div className="py-1.5 px-2 bg-blue-50 rounded flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Top Room</span>
                  <span className="font-semibold text-gray-900 truncate ml-2">{roomAnalytics[0]?.name || 'N/A'}</span>
                </div>
                <div className="py-1.5 px-2 bg-purple-50 rounded flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Peak Hour</span>
                  <span className="font-semibold text-gray-900">
                    {peakHours[0] ? `${peakHours[0].hour === 0 ? '12 AM' : peakHours[0].hour < 12 ? `${peakHours[0].hour} AM` : peakHours[0].hour === 12 ? '12 PM' : `${peakHours[0].hour - 12} PM`}` : 'N/A'}
                  </span>
                </div>
                <div className="py-1.5 px-2 bg-orange-50 rounded flex justify-between items-center">
                  <span className="text-gray-600 text-xs">Avg Size</span>
                  <span className="font-semibold text-gray-900">{stats.avgMovementSize.toFixed(1)} units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Movement Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">From Date</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">To Date</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* User Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">User</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>

          {/* Item Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Item</label>
            <input
              type="text"
              value={filterItem}
              onChange={(e) => setFilterItem(e.target.value)}
              placeholder="Search items..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Room Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Room</label>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Rooms</option>
              {uniqueRooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={clearFilters}
          className="mt-3 text-xs text-orange-600 hover:text-orange-700 font-medium"
        >
          Clear All Filters
        </button>
      </div>

      {/* Movements Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No stock movements found
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{new Date(movement.created_at).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{new Date(movement.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        movement.movement_type === 'IN'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.movement_type === 'IN' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {movement.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{movement.item_brand}</div>
                      {movement.item_size && <div className="text-xs text-gray-500">{movement.item_size}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="text-xs text-gray-500">From: {movement.previous_stock}</div>
                      <div className="text-xs text-gray-500">To: {movement.new_stock}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.room_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        {movement.user_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            <span className="text-gray-700">Most Active User:</span>
            <span className="font-semibold text-gray-900">{stats.mostActiveUser}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            <span className="text-gray-700">Most Moved Item:</span>
            <span className="font-semibold text-gray-900">{stats.mostMovedItem}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
