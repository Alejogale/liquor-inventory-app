'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { 
  Building2, 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Users,
  DollarSign,
  Calendar,
  ArrowLeft,
  MoreHorizontal
} from 'lucide-react'
import Link from 'next/link'
import { CountryClub } from '@/types/guest-manager'

export default function ClubsPage() {
  const { user, organization } = useAuth()
  const [clubs, setClubs] = useState<CountryClub[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingClub, setEditingClub] = useState<CountryClub | null>(null)

  useEffect(() => {
    fetchClubs()
  }, [organization?.id])

  const fetchClubs = async () => {
    try {
      setLoading(true)
      
      if (!organization?.id) {
        setClubs([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('country_clubs')
        .select('*')
        .eq('organization_id', organization.id)
        .order('name')

      if (error) {
        console.error('Error fetching clubs:', error)
        setClubs([])
      } else {
        setClubs(data || [])
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
      setClubs([])
    } finally {
      setLoading(false)
    }
  }

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || club.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  const handleAddClub = async (clubData: Partial<CountryClub>) => {
    try {
      const { data, error } = await supabase
        .from('country_clubs')
        .insert([{
          ...clubData,
          organization_id: organization?.id
        }])
        .select()

      if (error) {
        console.error('Error adding club:', error)
        alert('Failed to add club. Please try again.')
      } else {
        setShowAddModal(false)
        fetchClubs()
      }
    } catch (error) {
      console.error('Error adding club:', error)
      alert('Failed to add club. Please try again.')
    }
  }

  const handleUpdateClub = async (id: string, clubData: Partial<CountryClub>) => {
    try {
      const { error } = await supabase
        .from('country_clubs')
        .update(clubData)
        .eq('id', id)

      if (error) {
        console.error('Error updating club:', error)
        alert('Failed to update club. Please try again.')
      } else {
        setEditingClub(null)
        fetchClubs()
      }
    } catch (error) {
      console.error('Error updating club:', error)
      alert('Failed to update club. Please try again.')
    }
  }

  const handleDeleteClub = async (id: string) => {
    if (!confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('country_clubs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting club:', error)
        alert('Failed to delete club. Please try again.')
      } else {
        fetchClubs()
      }
    } catch (error) {
      console.error('Error deleting club:', error)
      alert('Failed to delete club. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/20 via-white to-blue-100/20">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/guest-manager"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Country Clubs</h1>
              <p className="text-gray-600">Manage participating country clubs</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-4 w-4" />
            <span>Add Club</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Clubs</p>
                <p className="text-3xl font-bold text-gray-900">{clubs.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Clubs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {clubs.filter(club => club.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${clubs.reduce((sum, club) => sum + (club.total_revenue || 0), 0).toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Monthly Guests</p>
                <p className="text-3xl font-bold text-gray-900">
                  {clubs.reduce((sum, club) => sum + (club.monthly_guests || 0), 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Clubs List */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-white/20 backdrop-blur-sm">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredClubs.map((club) => (
              <div key={club.id} className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{club.name}</h3>
                    <div className="flex items-center space-x-2 text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{club.location}</span>
                    </div>
                    {club.contact_person && (
                      <p className="text-gray-600 mb-1">Contact: {club.contact_person}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      club.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {club.status}
                    </span>
                    <button
                      onClick={() => setEditingClub(club)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Monthly Guests</p>
                    <p className="text-lg font-semibold text-gray-900">{club.monthly_guests || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Total Revenue</p>
                    <p className="text-lg font-semibold text-gray-900">${(club.total_revenue || 0).toFixed(2)}</p>
                  </div>
                </div>

                {club.contact_email && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{club.contact_email}</span>
                  </div>
                )}
                {club.phone_number && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{club.phone_number}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 shadow-lg border border-white/20 backdrop-blur-sm text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first country club'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Club
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingClub) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingClub ? 'Edit Club' : 'Add New Club'}
            </h2>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const clubData = {
                name: formData.get('name') as string,
                location: formData.get('location') as string,
                contact_person: formData.get('contact_person') as string,
                contact_email: formData.get('contact_email') as string,
                phone_number: formData.get('phone_number') as string,
                status: formData.get('status') as string,
                notes: formData.get('notes') as string
              }

              if (editingClub) {
                handleUpdateClub(editingClub.id, clubData)
              } else {
                handleAddClub(clubData)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Club Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingClub?.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingClub?.location}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    name="contact_person"
                    defaultValue={editingClub?.contact_person}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    defaultValue={editingClub?.contact_email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    defaultValue={editingClub?.phone_number}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={editingClub?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={editingClub?.notes}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingClub(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingClub ? 'Update Club' : 'Add Club'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
