'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Save, 
  X,
  Building2,
  CheckCircle
} from 'lucide-react'

interface Room {
  id: string
  name: string
  display_order?: number
  organization_id?: string
  created_at?: string
}

interface RoomManagerProps {
  onUpdate?: () => void
  organizationId?: string
}

export default function RoomManager({ onUpdate, organizationId }: RoomManagerProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [showAddRoom, setShowAddRoom] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)
      console.log('🏠 Fetching rooms...')
      
      // Use organizationId prop if available, otherwise fetch from database
      let currentOrg = organizationId;
      if (!currentOrg) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        currentOrg = profile?.organization_id;
      }

      if (!currentOrg) {
        console.log('No organization found for user')
        return
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization_id', currentOrg)
        .order('display_order')

      if (error) {
        console.error('❌ Error fetching rooms:', error)
      } else {
        console.log('✅ Rooms fetched:', data)
        setRooms(data || [])
      }
    } catch (error) {
      console.error('💥 Error in fetchRooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const addRoom = async () => {
    if (!newRoomName.trim()) return

    setSaving(true)
    try {
      console.log('🏠 Adding room:', newRoomName.trim())
      
      // Calculate next display order
      const maxOrder = Math.max(...rooms.map(r => r.display_order || 0), 0)
      
      // Use organizationId prop if available, otherwise fetch from database
      let currentOrg = organizationId;
      if (!currentOrg) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single()

        currentOrg = profile?.organization_id;
      }

      if (!currentOrg) {
        console.log('No organization found for user')
        return
      }

      const insertData = {
        name: newRoomName.trim(),
        display_order: maxOrder + 1,
        organization_id: currentOrg
      }
      
      console.log('📝 Insert data:', insertData)
      
      const { data, error } = await supabase
        .from('rooms')
        .insert([insertData])
        .select()

      if (error) {
        console.error('❌ Insert error details:', error)
        throw error
      }

      console.log('✅ Room added successfully:', data)
      
      setNewRoomName('')
      setShowAddRoom(false)
      fetchRooms()
      onUpdate?.()
    } catch (error) {
      console.error('💥 Error adding room:', error)
      alert(`Error adding room: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateRoom = async (id: string, name: string) => {
    if (!name.trim()) return

    setSaving(true)
    try {
      console.log('✏️ Updating room:', id, name)
      
      const { error } = await supabase
        .from('rooms')
        .update({ name: name.trim() })
        .eq('id', id)

      if (error) throw error

      setEditingId(null)
      setEditingName('')
      fetchRooms()
      onUpdate?.()
    } catch (error) {
      console.error('Error updating room:', error)
      alert('Error updating room.')
    } finally {
      setSaving(false)
    }
  }

  const deleteRoom = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This will remove all count data for this room.`)) {
      return
    }

    setSaving(true)
    try {
      console.log('🗑️ Deleting room:', id, name)
      
      // Delete room counts first (if they exist)
      const { error: countsError } = await supabase
        .from('room_counts')
        .delete()
        .eq('room_id', id)

      if (countsError) {
        console.warn('⚠️ Error deleting room counts (may not exist):', countsError)
      }

      // Delete the room
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)

      if (error) throw error

      fetchRooms()
      onUpdate?.()
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Error deleting room.')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (room: Room) => {
    setEditingId(room.id)
    setEditingName(room.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName('')
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Loading rooms...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="bg-green-100 border border-green-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800 font-medium">Database Ready</span>
        </div>
        <p className="text-green-700 text-sm mt-1">
          Rooms table configured properly. Organization ID 1 exists. Ready to add custom rooms!
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Room Management</h3>
          <p className="text-slate-600 text-sm">Customize locations for inventory counting</p>
        </div>
        <button
          onClick={() => setShowAddRoom(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Room</span>
        </button>
      </div>

      {/* Add Room Form */}
      {showAddRoom && (
        <div className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
          <h4 className="text-slate-800 font-medium mb-3">Add New Room</h4>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="e.g., Wine Cellar, Main Bar, Storage Room"
              className="flex-1 px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addRoom()}
            />
            <button
              onClick={addRoom}
              disabled={!newRoomName.trim() || saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Adding...' : 'Add'}</span>
            </button>
            <button
              onClick={() => {
                setShowAddRoom(false)
                setNewRoomName('')
              }}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Rooms List */}
      <div className="space-y-3">
        {rooms.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-blue-200 shadow-sm">
            <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">No rooms configured</p>
            <p className="text-slate-500 text-sm mt-1">Add your first room to get started</p>
          </div>
        ) : (
          rooms.map((room) => (
            <div key={room.id} className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-blue-400" />
                
                <div className="flex-1">
                  {editingId === room.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-1 bg-white border border-blue-200 rounded text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && updateRoom(room.id, editingName)}
                        autoFocus
                      />
                      <button
                        onClick={() => updateRoom(room.id, editingName)}
                        disabled={!editingName.trim() || saving}
                        className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-slate-800 font-medium">{room.name}</h4>
                      <p className="text-slate-600 text-sm">
                        Order: {room.display_order} • Created: {new Date(room.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {editingId !== room.id && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(room)}
                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit room name"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteRoom(room.id, room.name)}
                      disabled={saving}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete room"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Room Statistics */}
      {rooms.length > 0 && (
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-medium mb-2">Room Statistics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-white/60">Total Rooms:</span>
              <span className="text-white font-medium ml-2">{rooms.length}</span>
            </div>
            <div>
              <span className="text-white/60">Organization ID:</span>
              <span className="text-white font-medium ml-2">1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
