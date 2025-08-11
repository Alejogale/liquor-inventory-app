'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { checkAppAccess, startTrial, AppAccess } from '@/lib/subscription-access'
import { checkReservationTablesExist, createDefaultRoomsAndTables, getRooms, getTables } from '@/lib/reservation-db'
import { supabase } from '@/lib/supabase'
import ReservationSidebar from '@/components/ReservationSidebar'
import { 
  Calendar, Users, Clock, MapPin, FileText, User, Hash, RefreshCw, 
  UserPlus, Trash2, ToggleLeft, X, Plus, Filter, Palette, Upload 
} from 'lucide-react'

// Subscription Guard Component
function ReservationAccessGuard({ children }: { children: React.ReactNode }) {
  const { user, organization } = useAuth()
  const [accessStatus, setAccessStatus] = useState<AppAccess | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      if (!organization?.id || !user) return
      
      // Platform admin always has access
      if (user.email === 'alejogaleis@gmail.com') {
        setAccessStatus({ hasAccess: true, isTrialExpired: false, isSubscriptionActive: true })
        setLoading(false)
        return
      }

      const access = await checkAppAccess(organization.id.toString(), 'reservation-management')
      setAccessStatus(access)
      setLoading(false)
    }

    checkAccess()
  }, [organization?.id, user])

  const handleStartTrial = async () => {
    if (!organization?.id) return
    
    const success = await startTrial(organization.id.toString(), 'reservation-management')
    if (success) {
      // Refresh access status
      const access = await checkAppAccess(organization.id.toString(), 'reservation-management')
      setAccessStatus(access)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Loading...</div>
      </div>
    )
  }

  if (!accessStatus?.hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Reservation Management</h2>
            {accessStatus?.isTrialExpired ? (
              <div>
                <p className="text-slate-600 mb-6">Your trial has expired. Subscribe to continue using the reservation management system.</p>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                  Subscribe Now
                </button>
              </div>
            ) : (
              <div>
                <p className="text-slate-600 mb-6">Start your 14-day free trial to access the reservation management system.</p>
                <button
                  onClick={handleStartTrial}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Start Free Trial
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Main Reservation Component with all HTML functionality
function ReservationContent({ setShowImportPopup }: { 
  setShowImportPopup: (show: boolean) => void 
}) {
  const { user, organization } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tablesReady, setTablesReady] = useState(false)
  
  // State from HTML file
  const [activeDayIndex, setActiveDayIndex] = useState(0)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [isLunchView, setIsLunchView] = useState(false)
  const [activeHighlight, setActiveHighlight] = useState(0)
  const [showWalkInPopup, setShowWalkInPopup] = useState(false)
  
  // Data state
  const [reservations, setReservations] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [covers, setCovers] = useState<{[key: string]: number}>({
    total: 0
  })

  // Complete room state management - aligned with sidebar approach
  const getCompleteRoomStateKey = () => `complete_room_state_${organization?.id || 'default'}`
  
  const loadCompleteRoomState = async (): Promise<ReservationRoom[]> => {
    if (typeof window === 'undefined') return []
    
    // First try database
    try {
      const { data: dbRooms, error } = await supabase
        .from('custom_rooms')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('is_active', true)
        .order('name')
      
      if (!error && dbRooms && dbRooms.length > 0) {
        console.log('✅ Loaded complete room state from database')
        
        const roomState: ReservationRoom[] = dbRooms.map(room => ({
          id: room.id,
          name: room.name,
          organization_id: room.organization_id,
          capacity: room.capacity,
          is_active: room.is_active,
          isCustom: true // Mark as custom since they're saved in custom_rooms table
        }))
        
        // Update localStorage with database data
        localStorage.setItem(getCompleteRoomStateKey(), JSON.stringify(roomState))
        return roomState
      }
    } catch (error) {
      console.log('Failed to load from database, using localStorage')
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem(getCompleteRoomStateKey())
    return stored ? JSON.parse(stored) : []
  }

  // Get dates for 5-day rolling calendar
  const getDayTabs = () => {
    const dates = []
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const dayTabs = getDayTabs()

  useEffect(() => {
    initializeSystem()
  }, [organization?.id])

  // Listen for custom room changes from sidebar
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === getCompleteRoomStateKey()) {
        // Reload rooms when localStorage changes
        console.log('🔄 Complete room state changed, reloading...')
        initializeSystem()
      }
    }

    const handleRoomsChanged = (event: CustomEvent) => {
      // Use rooms directly from event detail (more efficient than reloading)
      console.log('🔄 Rooms updated from sidebar, using event data...')
      const updatedRooms = event.detail?.rooms || []
      if (updatedRooms.length >= 0) {
        setRooms(updatedRooms)
      } else {
        initializeSystem() // fallback
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('roomsChanged', handleRoomsChanged)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('roomsChanged', handleRoomsChanged)
    }
  }, [organization?.id])

  useEffect(() => {
    if (tablesReady) {
      fetchReservations()
    }
  }, [activeDayIndex, isLunchView, tablesReady])

  async function initializeSystem() {
    if (!organization?.id) return

    console.log('🔧 Initializing reservation system...')
    
    // Check if we have a saved complete room state
    const savedRoomState = await loadCompleteRoomState()
    
    if (savedRoomState && savedRoomState.length > 0) {
      console.log('📱 Loaded saved room state:', savedRoomState)
      setRooms(savedRoomState)
    } else {
      // First time - initialize with default rooms
      console.log('🏠 First time - initializing with default rooms')
      const defaultRooms: ReservationRoom[] = [
        { id: 'raynor', name: 'Raynor', organization_id: organization.id, is_active: true },
        { id: 'cov', name: 'Cov', organization_id: organization.id, is_active: true },
        { id: 'sun', name: 'Sun', organization_id: organization.id, is_active: true },
        { id: 'pubn', name: 'Pubn', organization_id: organization.id, is_active: true }
      ]
      setRooms(defaultRooms)
    }

    // Check if tables exist for reservation functionality
    const tablesExist = await checkReservationTablesExist()
    console.log('📊 Tables status:', tablesExist)
    
    if (tablesExist.rooms && tablesExist.tables && tablesExist.reservations) {
      setTablesReady(true)
    } else {
      // Try to create default setup
      console.log('🏗️ Creating default setup...')
      const created = await createDefaultRoomsAndTables(organization.id.toString())
      setTablesReady(created || true) // Continue even if creation fails
    }
    
    setLoading(false)
  }

  async function fetchReservations() {
    if (!organization?.id || !tablesReady) return

    try {
      const selectedDate = dayTabs[activeDayIndex]
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      console.log(`📅 Fetching reservations for ${dateStr}, ${isLunchView ? 'lunch' : 'dinner'}`)
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          reservation_rooms(name),
          reservation_tables(table_number)
        `)
        .eq('organization_id', organization.id)
        .eq('reservation_date', dateStr)
        .eq('service_type', isLunchView ? 'lunch' : 'dinner')
        .order('reservation_time')

      if (error) {
        console.error('Error fetching reservations:', error)
        return
      }

      setReservations(data || [])
      updateCoversCount(data || [])
    } catch (error) {
      console.error('Error in fetchReservations:', error)
    }
  }

  function updateCoversCount(reservationData: any[]) {
    // Initialize covers with all available rooms
    const newCovers: {[key: string]: number} = { total: 0 }
    
    // Add each room to covers tracking
    rooms.forEach((room: any) => {
      newCovers[room.name.toUpperCase()] = 0
    })

    reservationData.forEach((reservation: any) => {
      if (reservation.status === 'Cancelled') return
      
      const partySize = reservation.party_size || 0
      newCovers.total += partySize
      
      const roomName = reservation.reservation_rooms?.name
      if (roomName && newCovers[roomName.toUpperCase()] !== undefined) {
        newCovers[roomName.toUpperCase()] += partySize
      }
    })

    setCovers(newCovers)
  }

  async function updateReservationStatus(reservationId: string, newStatus: string) {
    if (!organization?.id) return

    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)
        .eq('organization_id', organization.id)

      if (error) {
        console.error('Error updating status:', error)
        return
      }

      // Refresh data
      fetchReservations()
    } catch (error) {
      console.error('Error in updateReservationStatus:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your reservation system...</p>
        </div>
      </div>
    )
  }

  if (!tablesReady) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Setup Error</h3>
          <p className="text-slate-600">Failed to initialize reservation system. Please contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4 lg:p-6">
      {/* Centered Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {organization?.Name} {isLunchView ? 'Lunch' : 'Dinner'} Reservations
            </h1>
            <p className="text-slate-600 text-lg">
              {dayTabs[activeDayIndex].toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          {/* Service Type Toggle */}
          <button
            onClick={() => setIsLunchView(!isLunchView)}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ToggleLeft className={`h-5 w-5 ${isLunchView ? 'text-orange-500' : 'text-blue-500'}`} />
            <span className="font-medium">Switch to {isLunchView ? 'Dinner' : 'Lunch'}</span>
          </button>
        </div>

        {/* Centered 5-Day Rolling Calendar */}
        <div className="flex justify-center space-x-3 mb-8 overflow-x-auto">
          {dayTabs.map((date, index) => (
            <button
              key={index}
              onClick={() => setActiveDayIndex(index)}
              className={`flex-shrink-0 px-6 py-3 rounded-lg font-medium transition-all ${
                activeDayIndex === index
                  ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-purple-300'
              }`}
            >
              <div className="text-sm font-semibold">
                {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Day ${index + 1}`}
              </div>
              <div className="text-xs opacity-75 mt-1">
                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </button>
          ))}
        </div>

        {/* Centered Action Buttons */}
        <div className="flex justify-center flex-wrap gap-4">
          <button
            onClick={fetchReservations}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => setShowWalkInPopup(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <UserPlus className="h-5 w-5" />
            <span>Add Walk-In</span>
          </button>
          
          
          <button
            onClick={async () => {
              if (confirm('Clear all Left/Cancelled reservations?')) {
                await clearCancelledReservations()
              }
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Trash2 className="h-5 w-5" />
            <span>Clear Left/Cancelled</span>
          </button>
        </div>
      </div>

      {/* Centered Covers Dashboard */}
      <div className="mb-10">
        <h2 className="text-center text-xl font-semibold text-slate-800 mb-6">Covers Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {/* Total Covers */}
          <div
            className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
              activeFilter === 'ALL' 
                ? 'border-purple-500 shadow-lg bg-purple-50 transform scale-105' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => setActiveFilter('ALL')}
          >
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">Total Covers</div>
              <div className="text-4xl font-bold text-purple-600">{covers.total}</div>
            </div>
          </div>

          {/* Room Cards */}
          {rooms.map((room, index) => {
            const colors = [
              { color: 'bg-red-500', borderColor: 'border-red-500', bgColor: 'bg-red-50' },
              { color: 'bg-yellow-500', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-50' },
              { color: 'bg-cyan-500', borderColor: 'border-cyan-500', bgColor: 'bg-cyan-50' },
              { color: 'bg-orange-500', borderColor: 'border-orange-500', bgColor: 'bg-orange-50' },
              { color: 'bg-green-500', borderColor: 'border-green-500', bgColor: 'bg-green-50' },
              { color: 'bg-purple-500', borderColor: 'border-purple-500', bgColor: 'bg-purple-50' }
            ];
            const roomColor = colors[index % colors.length];
            const roomKey = room.name.toUpperCase();
            return (
              <div
                key={roomKey}
                className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all hover:shadow-lg ${
                  activeFilter === roomKey
                    ? `${roomColor.borderColor} shadow-lg ${roomColor.bgColor} transform scale-105` 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setActiveFilter(roomKey)}
              >
                <div className="text-center">
                  <div className={`w-10 h-10 ${roomColor.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-1">{room.name}</div>
                  <div className="text-2xl font-bold text-slate-800">{covers[roomKey] || 0}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Centered Reservations Table */}
      <div className="max-w-full mx-auto">
        <ReservationsTable 
          reservations={reservations}
          activeFilter={activeFilter}
          activeHighlight={activeHighlight}
          setActiveHighlight={setActiveHighlight}
          onStatusUpdate={updateReservationStatus}
        />
      </div>

      {/* Walk-in Popup */}
      {showWalkInPopup && (
        <WalkInPopup
          isOpen={showWalkInPopup}
          onClose={() => setShowWalkInPopup(false)}
          rooms={rooms}
          selectedDate={dayTabs[activeDayIndex]}
          isLunchView={isLunchView}
          organizationId={organization?.id?.toString() || ''}
          onSuccess={() => {
            setShowWalkInPopup(false)
            fetchReservations()
          }}
        />
      )}

    </div>
  )
}

// Reservations Table Component with all HTML functionality
function ReservationsTable({ 
  reservations, 
  activeFilter, 
  activeHighlight, 
  setActiveHighlight, 
  onStatusUpdate 
}: any) {
  const statusOptions = [
    'Confirmed',
    'Waiting to arrive', 
    'Here',
    'Left',
    'Cancelled',
    'No Dessert',
    'Received Dessert',
    'Menus Open',
    'Ordered',
    'At The Bar'
  ]

  // Filter reservations based on active filter
  const filteredReservations = reservations.filter((res: any) => {
    if (activeFilter === 'ALL') return true
    const roomName = res.reservation_rooms?.name?.toUpperCase() || ''
    return roomName === activeFilter
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'text-green-700 bg-green-100'
      case 'waiting to arrive': return 'text-yellow-700 bg-yellow-100'
      case 'here': return 'text-green-700 bg-green-100'
      case 'left': return 'text-red-700 bg-red-100'
      case 'cancelled': return 'text-red-700 bg-red-100'
      case 'no dessert': return 'text-blue-700 bg-blue-100'
      case 'received dessert': return 'text-orange-700 bg-orange-100'
      case 'menus open': return 'text-purple-700 bg-purple-100'
      case 'ordered': return 'text-teal-700 bg-teal-100'
      case 'at the bar': return 'text-pink-700 bg-pink-100'
      default: return 'text-slate-700 bg-slate-100'
    }
  }

  const getRoomBadgeColor = (roomName: string) => {
    const colors = [
      'bg-red-500 text-white',
      'bg-yellow-500 text-black', 
      'bg-cyan-500 text-white',
      'bg-orange-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white'
    ];
    
    const roomIndex = rooms.findIndex(room => room.name.toUpperCase() === roomName?.toUpperCase())
    return roomIndex >= 0 ? colors[roomIndex % colors.length] : 'bg-slate-500 text-white'
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg">
      {/* Header with highlight buttons */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {activeFilter === 'ALL' ? 'All' : activeFilter} Reservations
            </h2>
            <p className="text-slate-600 text-sm">
              {filteredReservations.length} reservation{filteredReservations.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Highlight Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-600">Highlight:</span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3].map((highlightIndex) => (
                <button
                  key={highlightIndex}
                  onClick={() => setActiveHighlight(highlightIndex)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    activeHighlight === highlightIndex
                      ? 'ring-2 ring-offset-2 ring-slate-400'
                      : ''
                  } ${
                    highlightIndex === 0 ? 'bg-slate-200' :
                    highlightIndex === 1 ? 'bg-blue-200' :
                    highlightIndex === 2 ? 'bg-orange-200' :
                    'bg-teal-200'
                  }`}
                >
                  {highlightIndex === 0 && <Palette className="h-4 w-4 mx-auto text-slate-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Time</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Member</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Member #</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Covers</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Room</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Table #</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Notes</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Staff</th>
              <th className="text-left py-3 px-6 font-semibold text-slate-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-slate-500">
                  No reservations found
                </td>
              </tr>
            ) : (
              filteredReservations.map((reservation: any, index: number) => (
                <TableRow
                  key={reservation.id}
                  reservation={reservation}
                  statusOptions={statusOptions}
                  onStatusUpdate={onStatusUpdate}
                  getStatusColor={getStatusColor}
                  getRoomBadgeColor={getRoomBadgeColor}
                  activeHighlight={activeHighlight}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Table Row Component with highlighting functionality
function TableRow({ 
  reservation, 
  statusOptions, 
  onStatusUpdate, 
  getStatusColor, 
  getRoomBadgeColor, 
  activeHighlight 
}: any) {
  const [isHighlighted, setIsHighlighted] = useState(false)

  const handleRowClick = () => {
    if (activeHighlight > 0) {
      setIsHighlighted(!isHighlighted)
    }
  }

  const getHighlightClass = () => {
    if (!isHighlighted || activeHighlight === 0) return ''
    switch (activeHighlight) {
      case 1: return 'bg-blue-100'
      case 2: return 'bg-orange-100'  
      case 3: return 'bg-teal-100'
      default: return ''
    }
  }

  return (
    <tr
      onClick={handleRowClick}
      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
        getHighlightClass()
      } ${reservation.status === 'Cancelled' ? 'opacity-60 line-through' : ''}`}
    >
      <td className="py-3 px-6 text-slate-900 font-medium">
        {reservation.reservation_time?.slice(0, 5)}
      </td>
      <td className="py-3 px-6 text-slate-900">
        {reservation.member_name}
      </td>
      <td className="py-3 px-6 text-slate-700">
        {reservation.member_number || '-'}
      </td>
      <td className="py-3 px-6 text-slate-900 font-semibold">
        {reservation.party_size}
      </td>
      <td className="py-3 px-6">
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
          getRoomBadgeColor(reservation.reservation_rooms?.name)
        }`}>
          {reservation.reservation_rooms?.name}
        </span>
      </td>
      <td className="py-3 px-6 text-slate-700">
        {reservation.reservation_tables?.table_number || '-'}
      </td>
      <td className="py-3 px-6 text-slate-600 text-sm">
        {reservation.notes || '-'}
      </td>
      <td className="py-3 px-6 text-slate-700">
        {reservation.staff_member || '-'}
      </td>
      <td className="py-3 px-6">
        <select
          value={reservation.status}
          onChange={(e) => {
            e.stopPropagation()
            onStatusUpdate(reservation.id, e.target.value)
          }}
          onClick={(e) => e.stopPropagation()}
          className={`px-3 py-1 rounded-lg text-xs font-semibold border-0 focus:ring-2 focus:ring-purple-500 ${
            getStatusColor(reservation.status)
          }`}
        >
          {statusOptions.map((status: string) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>
    </tr>
  )
}

// Walk-in Popup Component
function WalkInPopup({ 
  isOpen, 
  onClose, 
  rooms, 
  selectedDate, 
  isLunchView, 
  organizationId,
  onSuccess 
}: any) {
  const [formData, setFormData] = useState({
    time: '',
    memberName: '',
    memberNumber: '',
    partySize: '',
    roomId: '',
    tableId: '',
    notes: '',
    staffMember: ''
  })
  const [tables, setTables] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (formData.roomId) {
      loadTables()
    }
  }, [formData.roomId])

  async function loadTables() {
    if (!formData.roomId) return
    const tablesData = await getTables(formData.roomId)
    setTables(tablesData)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!organizationId) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('reservations')
        .insert({
          organization_id: organizationId,
          room_id: formData.roomId,
          table_id: formData.tableId || null,
          reservation_date: selectedDate.toISOString().split('T')[0],
          reservation_time: formData.time,
          member_name: formData.memberName,
          member_number: formData.memberNumber || null,
          party_size: parseInt(formData.partySize),
          notes: formData.notes || null,
          staff_member: formData.staffMember || null,
          status: 'Confirmed',
          service_type: isLunchView ? 'lunch' : 'dinner',
          created_by: organizationId
        })

      if (error) {
        console.error('Error creating reservation:', error)
        return
      }

      onSuccess()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Add Walk-In Reservation</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Party Size
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Member Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.memberName}
                  onChange={(e) => setFormData({ ...formData, memberName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Member Number
                </label>
                <input
                  type="text"
                  value={formData.memberNumber}
                  onChange={(e) => setFormData({ ...formData, memberNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Room
                </label>
                <select
                  required
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value, tableId: '' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select room</option>
                  {rooms.map((room: any) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Table
                </label>
                <select
                  value={formData.tableId}
                  onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Select table (optional)</option>
                  {tables.map((table: any) => (
                    <option key={table.id} value={table.id}>
                      Table {table.table_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Staff Member
                </label>
                <input
                  type="text"
                  value={formData.staffMember}
                  onChange={(e) => setFormData({ ...formData, staffMember: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Special requests or notes..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Reservation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Main Export with Access Guard
export default function ReservationsPage() {
  const { user, signOut } = useAuth()
  const [showImportPopup, setShowImportPopup] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="text-slate-800 text-xl">Loading...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <ReservationAccessGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex relative lg:grid lg:grid-cols-[auto_1fr]">
        {/* Sidebar Navigation */}
        <ReservationSidebar
          userEmail={user?.email || ''}
          onSignOut={handleSignOut}
          onImportClick={() => setShowImportPopup(true)}
          onCollapsedChange={setSidebarCollapsed}
        />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 overflow-y-auto h-screen ${
          sidebarCollapsed ? 'ml-20' : 'ml-80'
        } lg:ml-0`}>
          <ReservationContent setShowImportPopup={setShowImportPopup} />
        </div>

        {/* Import Popup */}
        {showImportPopup && (
          <ImportPopup
            isOpen={showImportPopup}
            onClose={() => setShowImportPopup(false)}
            onSuccess={() => {
              setShowImportPopup(false)
              // Could trigger refresh here if needed
            }}
          />
        )}
      </div>
    </ReservationAccessGuard>
  )
}

// Clear cancelled reservations function
async function clearCancelledReservations() {
  try {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('status', 'Cancelled')
    
    if (error) {
      console.error('Error clearing cancelled reservations:', error)
      return false
    }
    
    console.log('Cancelled reservations cleared successfully')
    return true
  } catch (error) {
    console.error('Error clearing cancelled reservations:', error)
    return false
  }
}

// ImportPopup Component for CSV/Excel Import
function ImportPopup({ isOpen, onClose, onSuccess }: { 
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const { organization } = useAuth()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setError('')
      
      // Simple CSV preview (first few lines)
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const text = e.target?.result as string
          const lines = text.split('\n').slice(0, 5) // First 5 lines for preview
          const previewData = lines.map(line => line.split(','))
          setPreview(previewData)
        }
        reader.readAsText(selectedFile)
      }
    }
  }

  const handleImport = async () => {
    if (!file || !organization?.id) return
    
    setLoading(true)
    setError('')
    
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          setError('File must contain at least a header row and one data row')
          setLoading(false)
          return
        }
        
        const headers = lines[0].split(',').map(h => h.trim())
        const dataLines = lines.slice(1)
        
        // Expected CSV format: time,member_name,member_number,party_size,room,table_number,notes,staff,status
        const expectedHeaders = ['time', 'member_name', 'member_number', 'party_size', 'room', 'table_number', 'notes', 'staff', 'status']
        
        // Basic header validation
        const hasRequiredHeaders = expectedHeaders.some(expected => 
          headers.some(header => header.toLowerCase().includes(expected.replace('_', ' ')))
        )
        
        if (!hasRequiredHeaders) {
          setError('CSV must contain columns for: time, member name, party size, room, etc.')
          setLoading(false)
          return
        }
        
        // Process each row
        const reservations = []
        const today = new Date().toISOString().split('T')[0]
        
        for (const line of dataLines) {
          const values = line.split(',').map(v => v.trim())
          if (values.length < 3) continue // Skip incomplete rows
          
          // Map CSV columns to reservation data
          // This is a simplified mapping - you can customize based on your CSV format
          const reservation = {
            organization_id: organization.id,
            date: today, // Default to today, can be customized
            time: values[0] || '12:00',
            member_name: values[1] || 'Unknown',
            member_number: values[2] || '',
            party_size: parseInt(values[3]) || 1,
            room: values[4] || 'Main Dining',
            table_number: values[5] || '',
            notes: values[6] || '',
            staff: values[7] || '',
            status: values[8] || 'Confirmed'
          }
          
          reservations.push(reservation)
        }
        
        if (reservations.length === 0) {
          setError('No valid reservation data found in file')
          setLoading(false)
          return
        }
        
        // Insert reservations into database
        const { error: insertError } = await supabase
          .from('reservations')
          .insert(reservations)
        
        if (insertError) {
          console.error('Error importing reservations:', insertError)
          setError('Error importing reservations: ' + insertError.message)
        } else {
          console.log(`Successfully imported ${reservations.length} reservations`)
          onSuccess()
          onClose()
        }
      }
      
      reader.readAsText(file)
    } catch (error) {
      console.error('Error processing file:', error)
      setError('Error processing file. Please check the format.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Import Reservations
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select CSV or Excel file
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {/* Expected Format Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Expected CSV Format:</h4>
              <p className="text-xs text-blue-600 mb-2">
                time, member_name, member_number, party_size, room, table_number, notes, staff, status
              </p>
              <p className="text-xs text-blue-600">
                Example: "14:30, John Doe, 1234, 4, Main Dining, A1, Birthday dinner, Sarah, Confirmed"
              </p>
            </div>

            {/* File Preview */}
            {preview.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2">File Preview:</h4>
                <div className="text-xs text-slate-600 space-y-1">
                  {preview.map((row, index) => (
                    <div key={index} className={index === 0 ? 'font-medium' : ''}>
                      {row.join(' | ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Importing...' : 'Import Reservations'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}