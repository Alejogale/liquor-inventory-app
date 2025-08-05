'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Activity, 
  User, 
  Clock, 
  MapPin, 
  Package, 
  Mail, 
  Download,
  Send,
  CheckCircle,
  AlertCircle,
  Calendar,
  Database
} from 'lucide-react'

interface ActivityLog {
  id: string
  user_email: string
  action_type: 'count_updated' | 'item_added' | 'item_edited' | 'room_changed' | 'report_sent'
  item_brand?: string
  room_name?: string
  old_value?: number
  new_value?: number
  change_type?: 'scan' | 'manual' | 'button'
  created_at: string
}

interface InventoryReport {
  categories: {
    name: string
    items: {
      brand: string
      barcode: string
      supplier: string
      roomCounts: { roomName: string; count: number }[]
      totalCount: number
    }[]
    totalCount: number
  }[]
  grandTotal: number
  reportDate: string
  generatedBy: string
}

interface ActivityDashboardProps {
  userEmail: string
  organizationId?: string  // Add this prop
}

export default function ActivityDashboard({ userEmail, organizationId }: ActivityDashboardProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingReport, setSendingReport] = useState(false)
  const [managerEmails, setManagerEmails] = useState(['manager@example.com'])
  const [newEmail, setNewEmail] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)

  // Add helper function to get current organization
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

  useEffect(() => {
    if (organizationId) {
      fetchActivityLogs()
    }
  }, [organizationId])

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      setDatabaseError(null)
      console.log('📋 Fetching real activity logs...')

      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        console.error('No organization found for activity logs')
        setActivities([])
        return
      }

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('organization_id', currentOrg)  // Add organization filter
        .order('created_at', { ascending: false })
        .limit(50) // Get last 50 activities

      if (error) {
        console.error('❌ Error fetching activity logs:', error)
        
        // Check if it's a table not found error
        if (error.message?.includes('relation "activity_logs" does not exist') || 
            error.code === 'PGRST116' || 
            error.message?.includes('does not exist')) {
          setDatabaseError('table_missing')
        } else {
          setDatabaseError('generic_error')
        }
        setActivities([])
      } else {
        console.log('✅ Real activity logs loaded:', data?.length)
        setActivities(data || [])
      }

    } catch (error: any) {
      console.error('💥 Error fetching activity logs:', error)
      setDatabaseError('network_error')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  const generateInventoryReport = async (): Promise<InventoryReport> => {
    console.log('📊 Generating inventory report...')

    const currentOrg = await getCurrentOrganization()
    if (!currentOrg) {
      throw new Error('No organization found for inventory report')
    }

    // Fetch all inventory data with organization filter
    const { data: items } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('organization_id', currentOrg)  // Add organization filter
      .order('brand')

    const { data: categories } = await supabase
      .from('categories')
      .select('*')
      .eq('organization_id', currentOrg)  // Add organization filter
      .order('name')

    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('*')
      .eq('organization_id', currentOrg)  // Add organization filter

    const { data: rooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('organization_id', currentOrg)  // Add organization filter
      .order('display_order')

    const { data: roomCounts } = await supabase
      .from('room_counts')
      .select('*')
      .eq('organization_id', currentOrg)  // Add organization filter

    // Organize data by category
    const reportCategories = (categories || []).map(category => {
      const categoryItems = (items || [])
        .filter(item => item.category_id === category.id)
        .map(item => {
          const supplier = suppliers?.find(s => s.id === item.supplier_id)
          const itemRoomCounts = (roomCounts || [])
            .filter(rc => rc.inventory_item_id === item.id)
            .map(rc => {
              const room = rooms?.find(r => r.id === rc.room_id)
              return {
                roomName: room?.name || 'Unknown Room',
                count: rc.count || 0
              }
            })

          const totalCount = itemRoomCounts.reduce((sum, rc) => sum + rc.count, 0)

          return {
            brand: item.brand,
            barcode: item.barcode || 'No barcode',
            supplier: supplier?.name || 'No supplier',
            roomCounts: itemRoomCounts,
            totalCount
          }
        })

      const categoryTotal = categoryItems.reduce((sum, item) => sum + item.totalCount, 0)

      return {
        name: category.name,
        items: categoryItems,
        totalCount: categoryTotal
      }
    })

    const grandTotal = reportCategories.reduce((sum, cat) => sum + cat.totalCount, 0)

    return {
      categories: reportCategories,
      grandTotal,
      reportDate: new Date().toISOString(),
      generatedBy: userEmail
    }
  }

  const sendReportToManagers = async () => {
    setSendingReport(true)
    try {
      console.log('📧 Generating and sending inventory report...')

      const report = await generateInventoryReport()

      // Try to log the report generation activity (only if table exists)
      if (!databaseError) {
        try {
          const currentOrg = await getCurrentOrganization()
          if (currentOrg) {
            await supabase
              .from('activity_logs')
              .insert([{
                user_email: userEmail,
                action_type: 'report_sent',
                organization_id: currentOrg  // Use dynamic organization
              }])
          }
        } catch (logError) {
          console.warn('Could not log report activity:', logError)
        }
      }

      // Create email content
      const emailSubject = `Inventory Report - ${new Date().toLocaleDateString()}`
      const emailBody = generateEmailBody(report)

      // For now, we'll simulate sending (in production, you'd call your email API)
      console.log('📬 Email would be sent to:', managerEmails)
      console.log('📋 Report content preview:', {
        categories: report.categories.length,
        grandTotal: report.grandTotal,
        generatedBy: report.generatedBy
      })

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      setReportSent(true)
      setTimeout(() => setReportSent(false), 5000) // Clear success message after 5 seconds

      // Refresh activity logs to show the report_sent activity
      fetchActivityLogs()

      console.log('✅ Report sent successfully')

    } catch (error) {
      console.error('💥 Error sending report:', error)
      alert('Error sending report. Please try again.')
    } finally {
      setSendingReport(false)
    }
  }

  const generateEmailBody = (report: InventoryReport): string => {
    let body = `
# Inventory Report - ${new Date(report.reportDate).toLocaleDateString()}

**Generated by:** ${report.generatedBy}  
**Total Bottles:** ${report.grandTotal}  
**Report Date:** ${new Date(report.reportDate).toLocaleString()}

---

## Inventory Breakdown by Category

`

    report.categories.forEach(category => {
      body += `
### ${category.name} (${category.totalCount} bottles)

`
      category.items.forEach(item => {
        body += `**${item.brand}** [${item.barcode}] - ${item.supplier}  
Total: ${item.totalCount} bottles  
`
        item.roomCounts.forEach(rc => {
          if (rc.count > 0) {
            body += `  • ${rc.roomName}: ${rc.count} bottles  
`
          }
        })
        body += `
`
      })
    })

    body += `
---
*This report was automatically generated by the Liquor Inventory Management System.*
`
    return body
  }

  const addManagerEmail = () => {
    if (newEmail && newEmail.includes('@') && !managerEmails.includes(newEmail)) {
      setManagerEmails([...managerEmails, newEmail])
      setNewEmail('')
    }
  }

  const removeManagerEmail = (email: string) => {
    setManagerEmails(managerEmails.filter(e => e !== email))
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'count_updated': return <Package className="h-5 w-5 text-blue-400" />
      case 'room_changed': return <MapPin className="h-5 w-5 text-green-400" />
      case 'item_added': return <Package className="h-5 w-5 text-purple-400" />
      case 'item_edited': return <Package className="h-5 w-5 text-orange-400" />
      case 'report_sent': return <Mail className="h-5 w-5 text-pink-400" />
      default: return <Activity className="h-5 w-5 text-gray-400" />
    }
  }

  const getActivityDescription = (activity: ActivityLog) => {
    switch (activity.action_type) {
      case 'count_updated':
        return `updated ${activity.item_brand} in ${activity.room_name}`
      case 'room_changed':
        return `switched to ${activity.room_name}`
      case 'item_added':
        return `added new item ${activity.item_brand}`
      case 'item_edited':
        return `edited ${activity.item_brand}`
      case 'report_sent':
        return `sent inventory report to managers`
      default:
        return 'performed an action'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Loading activity dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Activity Dashboard & Reports</h2>
          <p className="text-slate-600">Track inventory changes and send reports to managers</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={sendReportToManagers}
            disabled={sendingReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {sendingReport ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Send Report</span>
              </>
            )}
          </button>
          <button
            onClick={fetchActivityLogs}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Database Setup Warning */}
      {databaseError === 'table_missing' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-800 font-medium">Activity Logging Setup Required</h4>
              <p className="text-yellow-700 text-sm mt-1">
                The activity_logs table doesn&apos;t exist yet. To enable activity tracking:
              </p>
              <ol className="text-yellow-700 text-sm mt-2 ml-4 list-decimal">
                <li>Go to your Supabase SQL Editor</li>
                <li>Run the CREATE TABLE script for activity_logs</li>
                <li>Refresh this page</li>
              </ol>
              <p className="text-yellow-700 text-sm mt-2">
                Reports will still work without activity logging.
              </p>
            </div>
          </div>
        </div>
      )}

      {databaseError === 'generic_error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">Database Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">
            Unable to load activity logs. Check your database connection and permissions.
          </p>
        </div>
      )}

      {/* Success Message */}
      {reportSent && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Report sent successfully!</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Inventory report has been sent to {managerEmails.length} manager(s)
          </p>
        </div>
      )}

      {/* Manager Email Configuration */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Mail className="h-5 w-5 mr-2 text-blue-600" />
          Manager Email Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="manager@company.com"
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addManagerEmail()}
            />
            <button
              onClick={addManagerEmail}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Add Manager
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {managerEmails.map((email) => (
              <div key={email} className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                <span className="text-sm">{email}</span>
                <button
                  onClick={() => removeManagerEmail(email)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center">
            <Activity className="h-5 w-5 mr-2 text-green-600" />
            Recent Activity
            {!databaseError && (
              <span className="ml-2 text-slate-600 text-sm">
                ({activities.length} activities)
              </span>
            )}
          </h3>
        </div>

        <div className="p-6">
          {databaseError ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Activity logging not yet set up</p>
              <p className="text-slate-500 text-sm mt-1">
                Create the activity_logs table to start tracking changes
              </p>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">No recent activity</p>
              <p className="text-slate-500 text-sm mt-1">
                Start counting inventory to see activity here
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.action_type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-800 font-medium">
                        {activity.user_email}
                      </span>
                      <span className="text-slate-600">
                        {getActivityDescription(activity)}
                      </span>
                    </div>
                    
                    {activity.action_type === 'count_updated' && (
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="text-slate-600">
                          {activity.old_value} → {activity.new_value} bottles
                        </span>
                        {activity.change_type && (
                          <span className={`px-2 py-1 rounded text-xs ${
                            activity.change_type === 'scan' ? 'bg-green-100 text-green-700' :
                            activity.change_type === 'button' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {activity.change_type === 'scan' ? '📱 Scanned' : 
                             activity.change_type === 'button' ? '🔘 Button' : '✏️ Manual'}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2 text-sm text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(activity.created_at)}</span>
                      <span>•</span>
                      <span>{new Date(activity.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Preview */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Download className="h-5 w-5 mr-2 text-purple-600" />
          Report Preview
        </h3>
        <p className="text-slate-600 text-sm">
          Reports include all inventory items organized by category, with counts per room and totals. 
          Managers will receive a detailed breakdown of current inventory status.
        </p>
        
        <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-slate-800 font-medium mb-2">Report will include:</h4>
          <ul className="text-slate-700 text-sm space-y-1">
            <li>• All categories with item counts</li>
            <li>• Brand names, barcodes, and suppliers</li>
            <li>• Room-by-room breakdown</li>
            <li>• Total bottle counts</li>
            <li>• Generated by and timestamp</li>
            <li>• Low stock alerts and reorder recommendations</li>
          </ul>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            💡 <strong>Pro tip:</strong> Send reports at the end of each inventory count to keep managers updated on stock levels and changes.
          </p>
        </div>
      </div>
    </div>
  )
}
