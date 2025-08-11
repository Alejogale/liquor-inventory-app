import { supabase } from './supabase'

// Database utility functions for reservation system
export interface ReservationRoom {
  id: string
  organization_id: string
  name: string
  description?: string
  capacity?: number
  is_active: boolean
  created_at: string
}

export interface ReservationTable {
  id: string
  organization_id: string
  room_id: string
  table_number: string
  seats: number
  x_position: number
  y_position: number
  width: number
  height: number
  shape: 'rectangle' | 'circle' | 'square'
  rotation: number
  is_combinable: boolean
  combined_with_table_id?: string
  is_active: boolean
  created_at: string
}

export interface Reservation {
  id: string
  organization_id: string
  member_id?: string
  room_id: string
  table_id: string
  reservation_date: string
  reservation_time: string
  member_name: string
  member_number?: string
  party_size: number
  notes?: string
  staff_member?: string
  status: 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled' | 'No Show'
  service_type: 'dinner' | 'lunch'
  created_by: string
  created_at: string
  updated_at: string
}

// Check if reservation tables exist
export async function checkReservationTablesExist() {
  try {
    console.log('🔍 Checking if reservation tables exist...')
    
    // Try to query each table to see if it exists
    const roomsCheck = await supabase.from('reservation_rooms').select('count').limit(1)
    const tablesCheck = await supabase.from('reservation_tables').select('count').limit(1)
    const reservationsCheck = await supabase.from('reservations').select('count').limit(1)
    
    return {
      rooms: !roomsCheck.error,
      tables: !tablesCheck.error,
      reservations: !reservationsCheck.error,
      errors: {
        rooms: roomsCheck.error?.message,
        tables: tablesCheck.error?.message,
        reservations: reservationsCheck.error?.message
      }
    }
  } catch (error) {
    console.error('Error checking reservation tables:', error)
    return {
      rooms: false,
      tables: false,
      reservations: false,
      errors: { general: error }
    }
  }
}

// Get all rooms for an organization
export async function getRooms(organizationId: string): Promise<ReservationRoom[]> {
  const { data, error } = await supabase
    .from('reservation_rooms')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching rooms:', error)
    return []
  }
  
  return data || []
}

// Get all tables for a room
export async function getTables(roomId: string): Promise<ReservationTable[]> {
  const { data, error } = await supabase
    .from('reservation_tables')
    .select('*')
    .eq('room_id', roomId)
    .eq('is_active', true)
    .order('table_number')
  
  if (error) {
    console.error('Error fetching tables:', error)
    return []
  }
  
  return data || []
}

// Create default rooms and tables for new organizations
export async function createDefaultRoomsAndTables(organizationId: string) {
  try {
    console.log('🏗️ Creating default rooms and tables for organization:', organizationId)
    
    // Create default rooms
    const defaultRooms = [
      { name: 'Raynor', description: 'Raynor dining room', capacity: 40 },
      { name: 'Cov', description: 'Cov dining area', capacity: 35 },
      { name: 'Sun', description: 'Sun room', capacity: 25 },
      { name: 'Pubn', description: 'Pubn area', capacity: 30 }
    ]
    
    const { data: rooms, error: roomsError } = await supabase
      .from('reservation_rooms')
      .insert(
        defaultRooms.map(room => ({
          organization_id: organizationId,
          name: room.name,
          description: room.description,
          capacity: room.capacity
        }))
      )
      .select()
    
    if (roomsError) {
      console.error('Error creating default rooms:', roomsError)
      return false
    }
    
    console.log('✅ Created default rooms:', rooms)
    
    // Create default tables for each room
    if (rooms && rooms.length > 0) {
      const defaultTables = []
      
      // Raynor - 10 tables
      for (let i = 1; i <= 10; i++) {
        defaultTables.push({
          organization_id: organizationId,
          room_id: rooms[0].id,
          table_number: `R${i}`,
          seats: 4,
          x_position: (i % 5) * 120,
          y_position: Math.floor((i - 1) / 5) * 120,
          shape: 'rectangle' as const
        })
      }
      
      // Cov - 8 tables
      for (let i = 1; i <= 8; i++) {
        defaultTables.push({
          organization_id: organizationId,
          room_id: rooms[1].id,
          table_number: `C${i}`,
          seats: 4,
          x_position: (i % 4) * 100,
          y_position: Math.floor((i - 1) / 4) * 120,
          shape: 'rectangle' as const
        })
      }
      
      // Sun - 6 tables
      for (let i = 1; i <= 6; i++) {
        defaultTables.push({
          organization_id: organizationId,
          room_id: rooms[2].id,
          table_number: `S${i}`,
          seats: 4,
          x_position: (i % 3) * 100,
          y_position: Math.floor((i - 1) / 3) * 120,
          shape: 'rectangle' as const
        })
      }
      
      // Pubn - 8 tables
      for (let i = 1; i <= 8; i++) {
        defaultTables.push({
          organization_id: organizationId,
          room_id: rooms[3].id,
          table_number: `P${i}`,
          seats: 4,
          x_position: (i % 4) * 100,
          y_position: Math.floor((i - 1) / 4) * 120,
          shape: 'rectangle' as const
        })
      }
      
      const { error: tablesError } = await supabase
        .from('reservation_tables')
        .insert(defaultTables)
      
      if (tablesError) {
        console.error('Error creating default tables:', tablesError)
        return false
      }
      
      console.log('✅ Created default tables')
    }
    
    return true
  } catch (error) {
    console.error('Error creating default rooms and tables:', error)
    return false
  }
}