'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Menu,
  X,
  LogOut,
  Grid3X3,
  ArrowLeft,
  Upload,
  Building2,
  Edit3,
  Save,
  Plus,
  Trash2
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

interface ReservationRoom {
  id: string
  name: string
  organization_id: string
  description?: string
  capacity?: number
  is_active: boolean
  isCustom?: boolean // For client-side rooms
}

interface ReservationSidebarProps {
  userEmail: string
  onSignOut: () => void
  onImportClick: () => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function ReservationSidebar({ 
  userEmail, 
  onSignOut,
  onImportClick,
  onCollapsedChange
}: ReservationSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [rooms, setRooms] = useState<ReservationRoom[]>([])
  const [editingRoom, setEditingRoom] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const { organization, user } = useAuth()

  // Local storage helpers for complete room state
  const getStorageKey = () => `reservation_rooms_${organization?.id || 'default'}`
  const getCompleteRoomStateKey = () => `complete_room_state_${organization?.id || 'default'}`
  
  const saveCustomRooms = async (customRooms: ReservationRoom[]) => {
    if (typeof window === 'undefined') return
    
    // 1. Save immediately to localStorage (instant response)
    localStorage.setItem(getStorageKey(), JSON.stringify(customRooms))
    
    // 2. Also try to save to database for permanent backup
    try {
      console.log('💾 Backing up custom rooms to database...')
      
      // First, clear existing custom rooms for this org
      await supabase
        .from('custom_rooms')
        .delete()
        .eq('organization_id', organization?.id)
      
      // Then insert new custom rooms
      if (customRooms.length > 0) {
        const { error } = await supabase
          .from('custom_rooms')
          .insert(
            customRooms.map(room => ({
              id: room.id,
              organization_id: organization?.id,
              name: room.name,
              capacity: room.capacity || 20,
              is_active: room.is_active !== false,
              created_by: user?.id
            }))
          )
        
        if (error) {
          console.log('Database backup failed (using localStorage only):', error.message)
        } else {
          console.log('✅ Custom rooms backed up to database successfully')
        }
      }
    } catch (error) {
      console.log('Database backup failed (using localStorage only):', error)
    }
    
    // Trigger custom event for same-page updates
    window.dispatchEvent(new CustomEvent('roomsChanged', { detail: { rooms: customRooms } }))
  }
  
  const loadCustomRooms = async (): Promise<ReservationRoom[]> => {
    if (typeof window === 'undefined') return []
    
    // First try to load from database (most recent/authoritative)
    try {
      console.log('📡 Loading custom rooms from database...')
      const { data: dbRooms, error } = await supabase
        .from('custom_rooms')
        .select('*')
        .eq('organization_id', organization?.id)
        .eq('is_active', true)
        .order('name')
      
      if (!error && dbRooms && dbRooms.length > 0) {
        console.log('✅ Loaded custom rooms from database:', dbRooms)
        
        // Convert to our format and also save to localStorage for offline access
        const customRooms: ReservationRoom[] = dbRooms.map(room => ({
          id: room.id,
          name: room.name,
          organization_id: room.organization_id,
          capacity: room.capacity,
          is_active: room.is_active,
          isCustom: true
        }))
        
        // Update localStorage with database data
        localStorage.setItem(getStorageKey(), JSON.stringify(customRooms))
        return customRooms
      }
    } catch (error) {
      console.log('Failed to load from database, using localStorage:', error)
    }
    
    // Fallback to localStorage if database fails
    const stored = localStorage.getItem(getStorageKey())
    const localRooms = stored ? JSON.parse(stored) : []
    console.log('📱 Using localStorage rooms:', localRooms)
    return localRooms
  }
  
  // Complete room state management
  const saveCompleteRoomState = async (allRooms: ReservationRoom[]) => {
    if (typeof window === 'undefined') return
    
    // 1. Save to localStorage immediately
    localStorage.setItem(getCompleteRoomStateKey(), JSON.stringify(allRooms))
    
    // 2. Save to database as backup
    try {
      // Clear existing custom rooms
      await supabase
        .from('custom_rooms')
        .delete()
        .eq('organization_id', organization?.id)
      
      // Save all rooms (including modified defaults) as custom rooms
      const roomsToSave = allRooms.map(room => ({
        id: room.id,
        organization_id: organization?.id,
        name: room.name,
        capacity: room.capacity || 20,
        is_active: room.is_active !== false,
        created_by: user?.id
      }))
      
      if (roomsToSave.length > 0) {
        const { error } = await supabase
          .from('custom_rooms')
          .insert(roomsToSave)
        
        if (!error) {
          console.log('✅ Complete room state backed up to database')
        } else {
          console.log('Database backup failed (using localStorage only):', error.message)
        }
      }
    } catch (error) {
      console.log('Database backup failed (using localStorage only):', error)
    }
    
    // Trigger update event
    window.dispatchEvent(new CustomEvent('roomsChanged', { detail: { rooms: allRooms } }))
  }

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

  // Notify parent when collapsed state changes
  useEffect(() => {
    onCollapsedChange?.(isCollapsed)
  }, [isCollapsed, onCollapsedChange])

  // Load rooms
  useEffect(() => {
    if (organization?.id) {
      loadRooms()
    }
  }, [organization?.id])

  const loadRooms = async () => {
    if (!organization?.id) {
      console.log('No organization ID available for loading rooms')
      return
    }

    try {
      console.log('Loading rooms for organization:', organization.id)
      
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
        // Save this initial state
        await saveCompleteRoomState(defaultRooms)
      }
    } catch (error) {
      console.error('Error loading reservation rooms:', error)
      // Fallback to default rooms
      const defaultRooms: ReservationRoom[] = [
        { id: 'raynor', name: 'Raynor', organization_id: organization.id, is_active: true },
        { id: 'cov', name: 'Cov', organization_id: organization.id, is_active: true },
        { id: 'sun', name: 'Sun', organization_id: organization.id, is_active: true },
        { id: 'pubn', name: 'Pubn', organization_id: organization.id, is_active: true }
      ]
      setRooms(defaultRooms)
    }
  }

  const handleEditRoom = (room: ReservationRoom) => {
    setEditingRoom(room.id)
    setEditingName(room.name)
  }

  const handleSaveRoom = async (roomId: string) => {
    if (!editingName.trim()) return

    const room = rooms.find(r => r.id === roomId)
    if (!room) return

    // Update the room in the current list
    const updatedRooms = rooms.map(r => 
      r.id === roomId 
        ? { ...r, name: editingName.trim(), isCustom: true }
        : r
    )
    
    // Save the complete room state
    await saveCompleteRoomState(updatedRooms)
    
    setRooms(updatedRooms)
    setEditingRoom(null)
    setEditingName('')
  }

  const handleAddRoom = async () => {
    if (!newRoomName.trim() || !organization?.id) {
      return
    }

    // Generate a unique ID for the custom room
    const customId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newRoom: ReservationRoom = {
      id: customId,
      name: newRoomName.trim(),
      organization_id: organization.id,
      is_active: true,
      capacity: 20,
      isCustom: true
    }

    // Add to current rooms list
    const updatedRooms = [...rooms, newRoom]
    setRooms(updatedRooms)
    
    // Save the complete room state
    await saveCompleteRoomState(updatedRooms)
    
    console.log('Successfully added custom room:', newRoom)
    setNewRoomName('')
    setShowAddRoom(false)
  }

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    // Simply remove the room from the current list
    const updatedRooms = rooms.filter(r => r.id !== roomId)
    
    // Save the complete updated room state
    await saveCompleteRoomState(updatedRooms)
    
    setRooms(updatedRooms)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white/80 backdrop-blur-xl border border-[var(--accent-orange-200)] rounded-lg p-3 text-slate-800 shadow-lg hover:bg-[var(--accent-orange-50)] transition-colors"
        aria-label="Toggle sidebar menu"
      >
        {isCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
      </button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white/70 backdrop-blur-xl border-r border-[var(--accent-orange-200)] shadow-lg z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-80'
      } lg:relative lg:translate-x-0 lg:col-span-1`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-[var(--accent-orange-200)]">
            <div className="flex items-center justify-between">
              <div className={`flex items-center space-x-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--accent-orange-600)] to-[var(--accent-orange-500)] rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">Reservations</h1>
                    <p className="text-slate-600 text-sm">Management System</p>
                  </div>
                )}
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 rounded-lg hover:bg-purple-50 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>

            {/* User Info */}
            {!isCollapsed && (
              <div className="mt-4 p-3 bg-[var(--accent-orange-100)] rounded-lg border border-[var(--accent-orange-200)]">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-orange-600)] to-[var(--accent-orange-400)] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 font-medium text-sm truncate">{userEmail}</p>
                    <p className="text-slate-600 text-xs">Reservation Manager</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 space-y-2 overflow-y-auto">
            {/* Back to Apps */}
            <Link
              href="/apps"
              className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-[var(--accent-orange-50)] border border-transparent hover:border-[var(--accent-orange-200)]"
            >
              <ArrowLeft className="h-5 w-5 flex-shrink-0 text-[var(--accent-orange-600)] group-hover:text-[var(--accent-orange-700)]" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-[var(--accent-orange-700)] group-hover:text-[var(--accent-orange-700)]">
                    Back to Apps
                  </p>
                  <p className="text-xs text-[var(--accent-orange-600)] group-hover:text-[var(--accent-orange-700)]">
                    App launcher
                  </p>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Back to Apps
                </div>
              )}
            </Link>

            {/* Import CSV */}
            <button
              onClick={onImportClick}
              className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-[var(--accent-orange-50)] border border-transparent hover:border-[var(--accent-orange-200)]"
            >
              <Upload className="h-5 w-5 flex-shrink-0 text-green-600 group-hover:text-green-700" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium text-green-700 group-hover:text-green-800">
                    Import CSV/Excel
                  </p>
                  <p className="text-xs text-green-600 group-hover:text-green-700">
                    Import reservations
                  </p>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Import CSV/Excel
                </div>
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-slate-200 my-4"></div>

            {/* Room Management Section */}
            <div className="space-y-2">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Room Management
                  </h3>
                  <button
                    onClick={() => setShowAddRoom(true)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Add New Room */}
              {showAddRoom && !isCollapsed && (
                <div className="px-3 py-2 bg-slate-50 rounded-lg">
                  <input
                    type="text"
                    placeholder="Room name"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-slate-200 rounded mb-2"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRoom()}
                  />
                  <div className="flex space-x-1">
                    <button
                      onClick={handleAddRoom}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRoom(false)
                        setNewRoomName('')
                      }}
                      className="px-2 py-1 text-xs bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Room List */}
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="group relative flex items-center p-2 rounded-lg hover:bg-slate-50"
                >
                  <Building2 className="h-4 w-4 flex-shrink-0 text-slate-400 mr-2" />
                  
                  {!isCollapsed && (
                    <>
                      {editingRoom === room.id ? (
                        <div className="flex-1 flex items-center space-x-1">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveRoom(room.id)}
                          />
                          <button
                            onClick={() => handleSaveRoom(room.id)}
                            className="p-1 text-green-600 hover:text-green-700"
                          >
                            <Save className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRoom(null)
                              setEditingName('')
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm text-slate-700">{room.name}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex space-x-1">
                            <button
                              onClick={() => handleEditRoom(room)}
                              className="p-1 text-blue-500 hover:text-blue-600"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="p-1 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                      {room.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-purple-200">
            <button
              onClick={onSignOut}
              className="w-full group relative flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-red-50 border border-transparent hover:border-red-200 text-red-600 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              
              {!isCollapsed && (
                <div className="ml-3 text-left">
                  <p className="text-sm font-medium">Sign Out</p>
                  <p className="text-xs opacity-75">Exit application</p>
                </div>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                  Sign Out
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}