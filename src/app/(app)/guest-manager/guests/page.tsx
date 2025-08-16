'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useOrganizationData } from '@/lib/use-data-loading'
import { supabase } from '@/lib/supabase'
import { sendGuestReportEmail } from '@/lib/email-service'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Building2,
  DollarSign,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import GuestForm from '@/components/guest-manager/GuestForm'
import AddItemsForm from '@/components/guest-manager/AddItemsForm'
import { GuestVisit, CountryClub, GuestFormData, PurchaseItem } from '@/types/guest-manager'

export default function GuestManagementPage() {
  const { organization, ready } = useAuth()
  const [guests, setGuests] = useState<GuestVisit[]>([])
  const [clubs, setClubs] = useState<CountryClub[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<GuestVisit | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [showAddItemsForm, setShowAddItemsForm] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<GuestVisit | null>(null)
  const [addItemsLoading, setAddItemsLoading] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    clubId: '',
    dateFrom: '',
    dateTo: ''
  })
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  // Use the new data loading hook for clubs
  const { data: clubsData, loading: clubsLoading, refetch: refetchClubs } = useOrganizationData(
    async (organizationId: string) => {
      const { data, error } = await supabase
        .from('country_clubs')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .order('name')
      
      if (error) throw error
      return data || []
    },
    { dependencies: [] }
  )

  // Use the new data loading hook for guests
  const { data: guestsData, loading: guestsLoading, refetch: refetchGuests } = useOrganizationData(
    async (organizationId: string) => {
      let query = supabase
        .from('guest_visits')
        .select(`
          *,
          home_club:country_clubs(name, location, contact_person, contact_email)
        `)
        .eq('organization_id', organizationId)
        .order('visit_date', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.search) {
        query = query.or(`guest_name.ilike.%${filters.search}%,member_number.ilike.%${filters.search}%`)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.clubId) {
        query = query.eq('home_club_id', filters.clubId)
      }
      if (filters.dateFrom) {
        query = query.gte('visit_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('visit_date', filters.dateTo)
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit
      query = query.range(offset, offset + pagination.limit - 1)

      const { data, error } = await query
      if (error) throw error

      // Get total count for pagination
      const { count } = await supabase
        .from('guest_visits')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      setPagination(prev => ({
        ...prev,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pagination.limit)
      }))

      return data || []
    },
    { dependencies: [filters, pagination.page] }
  )

  // Update local state when data changes
  useEffect(() => {
    if (clubsData) {
      setClubs(clubsData)
    }
  }, [clubsData])

  useEffect(() => {
    if (guestsData) {
      setGuests(guestsData)
    }
  }, [guestsData])

  const loading = clubsLoading || guestsLoading

  // Refetch function for manual refresh
  const refetchData = () => {
    refetchClubs()
    refetchGuests()
  }

  const handleSubmit = async (formData: GuestFormData) => {
    try {
      setFormLoading(true)
      
      // Calculate total amount from purchases
      const totalAmount = formData.purchases.reduce((sum, purchase) => {
        const total = purchase.quantity * purchase.unit_price
        return sum + total
      }, 0)

      // Insert guest visit
      const { data: guestVisit, error: visitError } = await supabase
        .from('guest_visits')
        .insert({
          guest_name: formData.guest_name,
          member_number: formData.member_number,
          home_club_id: formData.home_club_id || null,
          visit_date: formData.visit_date,
          total_amount: totalAmount,
          status: 'active',
          organization_id: organization?.id
        })
        .select()
        .single()

      if (visitError) {
        console.error('Error creating guest visit:', visitError)
        alert('Failed to create guest visit. Please try again.')
        return
      }

      // Insert purchases if any
      if (formData.purchases.length > 0) {
        const purchases = formData.purchases.map(purchase => ({
          guest_visit_id: guestVisit.id,
          item_description: purchase.item_description,
          quantity: purchase.quantity,
          unit_price: purchase.unit_price,
          total_price: purchase.quantity * purchase.unit_price,
          organization_id: organization?.id
        }))

        const { error: purchaseError } = await supabase
          .from('guest_purchases')
          .insert(purchases)

        if (purchaseError) {
          console.error('Error creating purchases:', purchaseError)
          // Note: The guest visit was created successfully, so we don't fail the entire request
        }
      }

                  setShowForm(false)
            setEditingGuest(null)
            refetchData()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (guestId: string) => {
    if (!confirm('Are you sure you want to delete this guest visit?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('guest_visits')
        .delete()
        .eq('id', guestId)
        .eq('organization_id', organization?.id)

      if (error) {
        console.error('Error deleting guest:', error)
        alert('Failed to delete guest. Please try again.')
      } else {
        refetchData()
      }
    } catch (error) {
      console.error('Error deleting guest:', error)
      alert('Error deleting guest')
    }
  }

  const handleAddItems = (guest: GuestVisit) => {
    setSelectedGuest(guest)
    setShowAddItemsForm(true)
  }

  const handleAddItemsSubmit = async (purchases: PurchaseItem[]) => {
    if (!selectedGuest) return

    try {
      setAddItemsLoading(true)

      // Insert new purchases
      const purchasesToInsert = purchases.map(purchase => ({
        guest_visit_id: selectedGuest.id,
        item_description: purchase.item_description,
        quantity: purchase.quantity,
        unit_price: purchase.unit_price,
        total_price: purchase.quantity * purchase.unit_price,
        organization_id: organization?.id
      }))

      const { error: purchaseError } = await supabase
        .from('guest_purchases')
        .insert(purchasesToInsert)

      if (purchaseError) {
        console.error('Error adding purchases:', purchaseError)
        alert('Failed to add items. Please try again.')
        return
      }

      // The total_amount will be automatically updated by the database trigger
      setShowAddItemsForm(false)
      setSelectedGuest(null)
      refetchData()
    } catch (error) {
      console.error('Error adding items:', error)
      alert('Error adding items')
    } finally {
      setAddItemsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      // Build query with current filters
      let query = supabase
        .from('guest_visits')
        .select(`
          *,
          home_club:country_clubs(name, location, contact_person, contact_email),
          purchases:guest_purchases(*)
        `)
        .eq('organization_id', organization?.id)

      // Apply filters
      if (filters.search) {
        query = query.or(`guest_name.ilike.%${filters.search}%,member_number.ilike.%${filters.search}%`)
      }
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.clubId) {
        query = query.eq('home_club_id', filters.clubId)
      }
      if (filters.dateFrom) {
        query = query.gte('visit_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('visit_date', filters.dateTo)
      }

      const { data: exportData, error } = await query

      if (error) {
        console.error('Error fetching data for export:', error)
        alert('Failed to export data. Please try again.')
        return
      }

      // Create CSV content with daily tracking
      const csvHeaders = [
        'Guest Name',
        'Member Number',
        'Home Club',
        'Club Location',
        'Visit Date',
        'Visit Day',
        'Total Amount',
        'Status',
        'Items Purchased',
        'Created Date'
      ]

      const csvRows = exportData?.map(guest => [
        guest.guest_name,
        guest.member_number,
        guest.home_club?.name || 'No club specified',
        guest.home_club?.location || '',
        guest.visit_date,
        new Date(guest.visit_date).toLocaleDateString('en-US', { weekday: 'long' }),
        guest.total_amount?.toFixed(2) || '0.00',
        guest.status,
        guest.purchases?.map(p => `${p.item_description} (${p.quantity}x $${p.unit_price})`).join('; ') || 'No purchases',
        new Date(guest.created_at).toLocaleDateString()
      ]) || []

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `guest_visits_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting data:', error)
      alert('Failed to export data. Please try again.')
    }
  }

  const handleExportByClub = async (clubId?: string) => {
    try {
      // Get all clubs if no specific club
      const { data: clubsData } = await supabase
        .from('country_clubs')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('status', 'active')

      const clubs = clubsData || []

      if (clubId) {
        // Export specific club
        await exportClubData(clubId, clubs.find(c => c.id === clubId))
      } else {
        // Export all clubs
        for (const club of clubs) {
          await exportClubData(club.id, club)
        }
      }
    } catch (error) {
      console.error('Error exporting club data:', error)
      alert('Failed to export club data. Please try again.')
    }
  }

  const exportClubData = async (clubId: string, club: any) => {
    try {
      // Get guest visits for this club
      const { data: clubData, error } = await supabase
        .from('guest_visits')
        .select(`
          *,
          purchases:guest_purchases(*)
        `)
        .eq('organization_id', organization?.id)
        .eq('home_club_id', clubId)
        .order('visit_date', { ascending: false })

      if (error) {
        console.error(`Error fetching data for club ${club.name}:`, error)
        return
      }

      if (!clubData || clubData.length === 0) {
        console.log(`No data found for club ${club.name}`)
        return
      }

      // Create CSV content for club
      const csvHeaders = [
        'Club Name',
        'Club Location',
        'Guest Name',
        'Member Number',
        'Visit Date',
        'Visit Day',
        'Total Amount',
        'Status',
        'Items Purchased',
        'Created Date'
      ]

      const csvRows = clubData.map(guest => [
        club.name,
        club.location,
        guest.guest_name,
        guest.member_number,
        guest.visit_date,
        new Date(guest.visit_date).toLocaleDateString('en-US', { weekday: 'long' }),
        guest.total_amount?.toFixed(2) || '0.00',
        guest.status,
        guest.purchases?.map(p => `${p.item_description} (${p.quantity}x $${p.unit_price})`).join('; ') || 'No purchases',
        new Date(guest.created_at).toLocaleDateString()
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create and download CSV file for club
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${club.name.replace(/[^a-zA-Z0-9]/g, '_')}_guests_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error(`Error exporting data for club ${club.name}:`, error)
    }
  }

  const handleSendClubReport = async (clubId?: string) => {
    try {
      // Get club data
      const { data: clubsData } = await supabase
        .from('country_clubs')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('status', 'active')

      const clubs = clubsData || []

      if (clubId) {
        // Send report for specific club
        await sendClubEmail(clubId, clubs.find(c => c.id === clubId))
      } else {
        // Send reports for all clubs
        for (const club of clubs) {
          await sendClubEmail(club.id, club)
        }
      }
    } catch (error) {
      console.error('Error sending club reports:', error)
      alert('Failed to send club reports. Please try again.')
    }
  }

  const sendClubEmail = async (clubId: string, club: any) => {
    try {
      // Get guest visits for this club
      const { data: clubData, error } = await supabase
        .from('guest_visits')
        .select(`
          *,
          purchases:guest_purchases(*)
        `)
        .eq('organization_id', organization?.id)
        .eq('home_club_id', clubId)
        .order('visit_date', { ascending: false })

      if (error || !clubData || clubData.length === 0) {
        console.log(`No data found for club ${club.name}`)
        return
      }

      // Send email using the new email service
      const result = await sendGuestReportEmail({
        to: club.contact_email,
        clubName: club.name,
        clubLocation: club.location,
        contactPerson: club.contact_person,
        guestData: clubData,
        totalGuests: clubData.length,
        totalRevenue: clubData.reduce((sum, guest) => sum + (guest.total_amount || 0), 0),
        reportDate: new Date().toLocaleDateString()
      })

      if (result.success) {
        console.log(`✅ Email sent successfully to ${club.name}`)
      } else {
        console.error(`❌ Failed to send email to ${club.name}:`, result.error)
      }
    } catch (error) {
      console.error(`❌ Error sending email to ${club.name}:`, error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'billed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Link
              href="/guest-manager"
              className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm w-fit"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Guest Management</h1>
              <p className="text-sm lg:text-base text-gray-600">Manage guest visits and track purchases</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={handleExport}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Export All</span>
              </button>
              <button
                onClick={() => handleExportByClub()}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Export by Club</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => handleSendClubReport()}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg"
              >
                <Mail className="h-4 w-4" />
                <span>Send Reports</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                <Plus className="h-4 w-4" />
                <span>Add Guest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-lg border border-white/20 backdrop-blur-sm mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Guest name or member number"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="billed">Billed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Club</label>
              <select
                value={filters.clubId}
                onChange={(e) => setFilters(prev => ({ ...prev, clubId: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Clubs</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Guest List */}
        <div className="bg-white rounded-2xl shadow-lg border border-white/20 backdrop-blur-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading guests...</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-4">No guests found</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add your first guest
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 lg:p-6 border-b border-gray-200">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-900">
                  Guest Visits ({pagination.total})
                </h2>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Home Club
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visit Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {guests.map((guest) => (
                      <tr key={guest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {guest.guest_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              #{guest.member_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {guest.home_club?.name || 'No club specified'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {guest.home_club?.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(guest.visit_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${guest.total_amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(guest.status)}`}>
                            {guest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAddItems(guest)}
                              className="text-green-600 hover:text-green-900"
                              title="Add Items"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingGuest(guest)
                                setShowForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Guest"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(guest.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Guest"
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

              {/* Mobile Cards */}
              <div className="lg:hidden">
                <div className="p-4 space-y-4">
                  {guests.map((guest) => (
                    <div key={guest.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{guest.guest_name}</h3>
                          <p className="text-sm text-gray-600">#{guest.member_number}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddItems(guest)}
                            className="p-2 text-green-600 hover:text-green-900 bg-green-50 rounded-lg"
                            title="Add Items"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingGuest(guest)
                              setShowForm(true)
                            }}
                            className="p-2 text-blue-600 hover:text-blue-900 bg-blue-50 rounded-lg"
                            title="Edit Guest"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(guest.id)}
                            className="p-2 text-red-600 hover:text-red-900 bg-red-50 rounded-lg"
                            title="Delete Guest"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Club:</span>
                          <p className="font-medium">{guest.home_club?.name || 'No club specified'}</p>
                          {guest.home_club?.location && (
                            <p className="text-gray-600 text-xs">{guest.home_club.location}</p>
                          )}
                        </div>
                        <div>
                          <span className="text-gray-500">Visit Date:</span>
                          <p className="font-medium">{formatDate(guest.visit_date)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-medium text-green-600">${guest.total_amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(guest.status)}`}>
                            {guest.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-4 lg:px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div className="text-sm text-gray-700 text-center sm:text-left">
                      Showing page {pagination.page} of {pagination.totalPages}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Guest Form Modal */}
      {showForm && (
        <GuestForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingGuest(null)
          }}
          initialData={editingGuest ? {
            guest_name: editingGuest.guest_name,
            member_number: editingGuest.member_number,
            home_club_id: editingGuest.home_club_id || '',
            visit_date: editingGuest.visit_date,
            purchases: editingGuest.purchases || []
          } : undefined}
          clubs={clubs}
          loading={formLoading}
        />
      )}

      {/* Add Items Form Modal */}
      {showAddItemsForm && selectedGuest && (
        <AddItemsForm
          guest={selectedGuest}
          onSubmit={handleAddItemsSubmit}
          onCancel={() => {
            setShowAddItemsForm(false)
            setSelectedGuest(null)
          }}
          loading={addItemsLoading}
        />
      )}
    </div>
  )
}
