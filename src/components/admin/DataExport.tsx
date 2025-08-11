'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { 
  Download, 
  FileText, 
  Database,
  Users,
  Building2,
  Package,
  Calendar,
  Loader2
} from 'lucide-react'

export default function DataExport() {
  const [loading, setLoading] = useState<string | null>(null)
  const [exportStatus, setExportStatus] = useState<string>('')
  const { isPlatformAdmin, userProfile } = useAuth()

  const exportData = async (dataType: string) => {
    setLoading(dataType)
    setExportStatus(`Exporting ${dataType}...`)

    try {
      let data: any[] = []
      let filename = ''

      switch (dataType) {
        case 'users':
          // 🚀 SECURITY: Apply organization filter unless platform admin
          let usersQuery = supabase.from('user_profiles').select('*')
          if (!isPlatformAdmin() && userProfile?.organization_id) {
            usersQuery = usersQuery.eq('organization_id', userProfile.organization_id)
          }
          const { data: users } = await usersQuery
          data = users || []
          filename = 'users_export.csv'
          break
        case 'organizations':
          // 🚀 SECURITY: Apply organization filter unless platform admin
          let orgsQuery = supabase.from('organizations').select('*')
          if (!isPlatformAdmin() && userProfile?.organization_id) {
            orgsQuery = orgsQuery.eq('id', userProfile.organization_id)
          }
          const { data: orgs } = await orgsQuery
          data = orgs || []
          filename = 'organizations_export.csv'
          break
        case 'inventory':
          // 🚀 SECURITY: Apply organization filter unless platform admin
          let itemsQuery = supabase
            .from('inventory_items')
            .select(`
              *,
              categories (name),
              suppliers (name),
              organizations (name)
            `)
          if (!isPlatformAdmin() && userProfile?.organization_id) {
            itemsQuery = itemsQuery.eq('organization_id', userProfile.organization_id)
          }
          const { data: items } = await itemsQuery
          data = items || []
          filename = 'inventory_export.csv'
          break
        case 'suppliers':
          // 🚀 SECURITY: Apply organization filter unless platform admin
          let suppliersQuery = supabase
            .from('suppliers')
            .select(`
              *,
              organizations (name)
            `)
          if (!isPlatformAdmin() && userProfile?.organization_id) {
            suppliersQuery = suppliersQuery.eq('organization_id', userProfile.organization_id)
          }
          const { data: suppliers } = await suppliersQuery
          data = suppliers || []
          filename = 'suppliers_export.csv'
          break
        case 'room_counts':
          // 🚀 SECURITY: Apply organization filter unless platform admin
          let countsQuery = supabase
            .from('room_counts')
            .select(`
              *,
              inventory_items (brand, size),
              rooms (name),
              organizations (name)
            `)
          if (!isPlatformAdmin() && userProfile?.organization_id) {
            countsQuery = countsQuery.eq('organization_id', userProfile.organization_id)
          }
          const { data: counts } = await countsQuery
          data = counts || []
          filename = 'room_counts_export.csv'
          break
        case 'all_analytics':
          // 🚀 SECURITY: Export comprehensive analytics report with organization filtering
          const orgId = userProfile?.organization_id
          const buildFilteredQueries = () => {
            if (isPlatformAdmin()) {
              // Platform admin gets all data
              return [
                supabase.from('user_profiles').select('*'),
                supabase.from('organizations').select('*'),
                supabase.from('inventory_items').select('*'),
                supabase.from('suppliers').select('*'),
                supabase.from('room_counts').select('*')
              ]
            } else if (orgId) {
              // Organization admin gets only their data
              return [
                supabase.from('user_profiles').select('*').eq('organization_id', orgId),
                supabase.from('organizations').select('*').eq('id', orgId),
                supabase.from('inventory_items').select('*').eq('organization_id', orgId),
                supabase.from('suppliers').select('*').eq('organization_id', orgId),
                supabase.from('room_counts').select('*').eq('organization_id', orgId)
              ]
            } else {
              // No access if no organization
              return [
                Promise.resolve({ data: [] }),
                Promise.resolve({ data: [] }),
                Promise.resolve({ data: [] }),
                Promise.resolve({ data: [] }),
                Promise.resolve({ data: [] })
              ]
            }
          }
          
          const [usersRes, orgsRes, itemsRes, suppliersRes, countsRes] = await Promise.all(buildFilteredQueries())
          
          const analyticsReport = {
            summary: {
              totalUsers: usersRes.data?.length || 0,
              totalOrganizations: orgsRes.data?.length || 0,
              totalItems: itemsRes.data?.length || 0,
              totalSuppliers: suppliersRes.data?.length || 0,
              totalCounts: countsRes.data?.length || 0,
              exportDate: new Date().toISOString()
            },
            users: usersRes.data || [],
            organizations: orgsRes.data || [],
            inventory: itemsRes.data || [],
            suppliers: suppliersRes.data || [],
            roomCounts: countsRes.data || []
          }
          
          downloadJSON(analyticsReport, 'complete_analytics_report.json')
          setExportStatus('Complete analytics report exported successfully!')
          setLoading(null)
          return
      }

      if (data.length === 0) {
        setExportStatus(`No ${dataType} data found to export.`)
        setLoading(null)
        return
      }

      // Convert to CSV
      const csv = convertToCSV(data)
      downloadCSV(csv, filename)
      
      setExportStatus(`${dataType} exported successfully! (${data.length} records)`)
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus(`Error exporting ${dataType}. Please try again.`)
    } finally {
      setLoading(null)
    }
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ''

    // Get all unique keys from all objects
    const allKeys = new Set<string>()
    data.forEach(item => {
      Object.keys(flattenObject(item)).forEach(key => allKeys.add(key))
    })

    const headers = Array.from(allKeys).join(',')
    const rows = data.map(item => {
      const flattened = flattenObject(item)
      return Array.from(allKeys).map(key => {
        const value = flattened[key] || ''
        // Escape commas and quotes in CSV
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value
      }).join(',')
    })

    return [headers, ...rows].join('\n')
  }

  const flattenObject = (obj: any, prefix = ''): any => {
    let flattened: any = {}
    
    for (const key in obj) {
      if (obj[key] === null || obj[key] === undefined) {
        flattened[prefix + key] = ''
      } else if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], prefix + key + '_'))
      } else {
        flattened[prefix + key] = obj[key]
      }
    }
    
    return flattened
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const exportOptions = [
    {
      id: 'users',
      title: 'User Data Export',
      description: 'Export all user profiles and account information',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'organizations',
      title: 'Organizations Export',
      description: 'Export all organization data and settings',
      icon: Building2,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'inventory',
      title: 'Inventory Data Export',
      description: 'Export all inventory items with categories and suppliers',
      icon: Package,
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'suppliers',
      title: 'Suppliers Export',
      description: 'Export all supplier information and contact details',
      icon: Building2,
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      id: 'room_counts',
      title: 'Room Counts Export',
      description: 'Export all room counting data and history',
      icon: Calendar,
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'all_analytics',
      title: 'Complete Analytics Report',
      description: 'Export comprehensive analytics report (JSON format)',
      icon: Database,
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Data Export</h1>
            <p className="text-slate-600">Export your data for analysis, backup, or compliance</p>
          </div>
          {/* 🚀 NEW: Admin Mode Indicator */}
          <div className="flex items-center space-x-3">
            {isPlatformAdmin() ? (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <span className="text-sm font-medium">🌟 Platform Admin</span>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Export All Data</span>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <span className="text-sm font-medium">🏢 Organization Admin</span>
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">Export Your Org Only</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Status */}
      {exportStatus && (
        <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-blue-700">{exportStatus}</p>
        </div>
      )}

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportOptions.map((option) => {
          const Icon = option.icon
          const isLoading = loading === option.id

          return (
            <div key={option.id} className="bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${option.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                {isLoading && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
              </div>
              
              <h3 className="text-lg font-semibold text-slate-800 mb-2">{option.title}</h3>
              <p className="text-slate-600 text-sm mb-4">{option.description}</p>
              
              <button
                onClick={() => exportData(option.id)}
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                  isLoading
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                } text-white flex items-center justify-center space-x-2`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export Data</span>
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Export Instructions */}
      <div className="mt-8 bg-white rounded-xl p-6 border border-blue-200 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Export Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
          <div>
            <h4 className="font-medium text-slate-800 mb-2">CSV Exports</h4>
            <ul className="space-y-1 text-sm">
              <li>• Compatible with Excel, Google Sheets, and other tools</li>
              <li>• Includes all available fields for each data type</li>
              <li>• Nested data is flattened for easier analysis</li>
              <li>• UTF-8 encoding for international characters</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">JSON Exports</h4>
            <ul className="space-y-1 text-sm">
              <li>• Complete data structure preservation</li>
              <li>• Ideal for developers and custom analysis</li>
              <li>• Includes metadata and relationships</li>
              <li>• Can be imported back into systems</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
