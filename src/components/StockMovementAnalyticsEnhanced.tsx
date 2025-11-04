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
  AlertCircle,
  ChevronRight,
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
  const [analytics, setAnalytics] = useState({
    byCategory: [] as { name: string; in: number; out: number; net: number }[],
    byRoom: [] as { name: string; in: number; out: number; net: number }[],
    byUser: [] as { name: string; movements: number; quantity: number }[],
    byItem: [] as { name: string; in: number; out: number; velocity: number }[],
    dailyTrend: [] as { date: string; in: number; out: number }[],
    peakHours: [] as { hour: number; count: number }[]
  })

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
    calculateAdvancedAnalytics()
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

    if (filterType !== 'ALL') {
      filtered = filtered.filter(m => m.movement_type === filterType)
    }

    if (filterDateFrom) {
      filtered = filtered.filter(m => new Date(m.created_at) >= new Date(filterDateFrom))
    }
    if (filterDateTo) {
      filtered = filtered.filter(m => new Date(m.created_at) <= new Date(filterDateTo))
    }

    if (filterUser) {
      filtered = filtered.filter(m => m.user_name === filterUser)
    }

    if (filterItem) {
      filtered = filtered.filter(m => m.item_brand.toLowerCase().includes(filterItem.toLowerCase()))
    }

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

  const calculateAdvancedAnalytics = () => {
    // By Room Analysis
    const byRoom = Object.entries(
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
      net: data.in - data.out
    })).sort((a, b) => Math.abs(b.net) - Math.abs(a.net))

    // By User Analysis
    const byUser = Object.entries(
      filteredMovements.reduce((acc, m) => {
        if (!acc[m.user_name]) acc[m.user_name] = { movements: 0, quantity: 0 }
        acc[m.user_name].movements++
        acc[m.user_name].quantity += m.quantity
        return acc
      }, {} as Record<string, { movements: number; quantity: number }>)
    ).map(([name, data]) => ({
      name,
      movements: data.movements,
      quantity: data.quantity
    })).sort((a, b) => b.movements - a.movements)

    // By Item Analysis with Velocity
    const byItem = Object.entries(
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
      velocity: data.count // movements per item
    })).sort((a, b) => b.velocity - a.velocity).slice(0, 10)

    // Daily Trend (last 30 days)
    const dailyTrend: { date: string; in: number; out: number }[] = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayMovements = filteredMovements.filter(m =>
        m.created_at.startsWith(dateStr)
      )

      dailyTrend.push({
        date: dateStr,
        in: dayMovements.filter(m => m.movement_type === 'IN').reduce((sum, m) => sum + m.quantity, 0),
        out: dayMovements.filter(m => m.movement_type === 'OUT').reduce((sum, m) => sum + m.quantity, 0)
      })
    }

    // Peak Hours Analysis
    const hourCounts = filteredMovements.reduce((acc, m) => {
      const hour = new Date(m.created_at).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    setAnalytics({
      byCategory: [], // Could add category if available
      byRoom,
      byUser,
      byItem,
      dailyTrend,
      peakHours
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
    <div className="space-y-6">
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

      {/* Primary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <span className="text-sm font-medium text-gray-600">Total Movements</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalMovements}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.movementsPerDay.toFixed(1)} per day avg</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-green-200"
             style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(255,255,255,1) 100%)' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <span className="text-sm font-medium text-gray-600">Stock IN</span>
          </div>
          <p className="text-3xl font-bold text-green-700">{stats.totalIN}</p>
          <p className="text-xs text-gray-500 mt-1">Avg {stats.avgMovementSize.toFixed(1)} per movement</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-red-200"
             style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(255,255,255,1) 100%)' }}>
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-8 h-8 text-red-600" />
            <span className="text-sm font-medium text-gray-600">Stock OUT</span>
          </div>
          <p className="text-3xl font-bold text-red-700">{stats.totalOUT}</p>
          <p className="text-xs text-gray-500 mt-1">Ratio: {stats.inOutRatio.toFixed(2)}x IN/OUT</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-orange-200"
             style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1) 0%, rgba(255,255,255,1) 100%)' }}>
          <div className="flex items-center justify-between mb-2">
            <Package className="w-8 h-8 text-orange-600" />
            <span className="text-sm font-medium text-gray-600">Net Change</span>
          </div>
          <p className={`text-3xl font-bold ${stats.netChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {stats.netChange >= 0 ? '+' : ''}{stats.netChange}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.netChange >= 0 ? 'Net Gain' : 'Net Loss'}
          </p>
        </div>
      </div>

      {/* CONTINUED IN NEXT PART - Character limit approaching */}
    </div>
  )
}
