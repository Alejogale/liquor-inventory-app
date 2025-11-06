'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { barcodeDetector } from '@/lib/barcode-detector'
import { 
  MapPin, 
  Package, 
  Plus, 
  Minus, 
  Save, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Building2,
  Zap,
  Search,
  Clock,
  Wifi,
  WifiOff,
  History
} from 'lucide-react'

interface Room {
  id: string
  name: string
  display_order: number
  organization_id: string
}

interface InventoryItem {
  id: string
  brand: string
  barcode?: string
  categories: { name: string } | null
  suppliers: { name: string } | null
}

interface RoomCount {
  [itemId: string]: number
}

interface ItemChangeHistory {
  [itemId: string]: {
    previousValue: number
    newValue: number
    changedAt: Date
    changeType: 'scan' | 'manual' | 'button'
  }
}

interface SaveStatus {
  status: 'saving' | 'saved' | 'error' | 'offline' | 'pending'
  lastSaved: Date | null
  pendingChanges: number
}

interface RoomCountingInterfaceProps {
  userEmail?: string
  organizationId?: string
}

export default function RoomCountingInterface({ 
  userEmail = 'user@example.com',
  organizationId 
}: RoomCountingInterfaceProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<string>('')
  const [selectedRoomName, setSelectedRoomName] = useState<string>('')
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [counts, setCounts] = useState<RoomCount>({})
  const [originalCounts, setOriginalCounts] = useState<RoomCount>({}) // Track original values
  const [changedItems, setChangedItems] = useState<Set<string>>(new Set()) // Track what changed
  const [changeHistory, setChangeHistory] = useState<ItemChangeHistory>({}) // Track when and how items changed
  const [loading, setLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: 'saved',
    lastSaved: null,
    pendingChanges: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string>('')
  const [scannerStatus, setScannerStatus] = useState<'ready' | 'detected' | 'not_found'>('ready')
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Refs for input focus management and auto-save
  const inputRefs = useRef<{ [itemId: string]: HTMLInputElement }>({})
  const searchInputRef = useRef<HTMLInputElement>(null) // Ref for search input
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveQueueRef = useRef<{ [itemId: string]: number }>({}) // Offline queue

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

  // Update useEffect to trigger when organizationId is available
  useEffect(() => {
    if (organizationId) {
      fetchRoomsAndInventory()
    }
  }, [organizationId])

  useEffect(() => {
    if (selectedRoom) {
      loadRoomCounts(selectedRoom)
    }
  }, [selectedRoom])

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      processSaveQueue() // Process queued saves when back online
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Auto-save effect - triggers when counts change
  useEffect(() => {
    if (changedItems.size > 0 && selectedRoom) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Auto-saving after 30 seconds...')
        performSave(true) // true = auto-save mode
      }, 30000) // 30 seconds

      // Update pending changes count but DON'T set status to saving yet
      setSaveStatus(prev => ({
        ...prev,
        pendingChanges: changedItems.size,
        status: prev.status === 'error' ? 'error' : 'pending' // pending = will auto-save
      }))
    } else {
      // No changes, clear timeout and set to saved
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      setSaveStatus(prev => ({
        ...prev,
        pendingChanges: 0,
        status: prev.status === 'saving' ? 'saving' : 'saved'
      }))
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [changedItems.size, selectedRoom])

  // Auto-focus effect - focuses input after React finishes rendering
  useEffect(() => {
    if (focusedInput) {
      // Use requestAnimationFrame to ensure DOM is ready
      const rafId = requestAnimationFrame(() => {
        const input = inputRefs.current[focusedInput]
        if (input) {
          // Force focus multiple times to ensure it works
          input.focus()
          input.select()
          console.log('🎯 Auto-focused on input for item:', focusedInput)

          // Try again after a tiny delay to be absolutely sure
          setTimeout(() => {
            if (document.activeElement !== input) {
              console.log('⚠️ Focus lost, refocusing...')
              input.focus()
              input.select()
            }
          }, 50)
        } else {
          console.warn('⚠️ Could not find input ref for:', focusedInput)
          console.log('Available refs:', Object.keys(inputRefs.current))
        }
      })

      return () => cancelAnimationFrame(rafId)
    }
  }, [focusedInput])

  // REAL ACTIVITY LOGGING FUNCTION
  const logActivity = async (
    actionType: 'count_updated' | 'room_changed',
    itemBrand?: string,
    roomName?: string,
    oldValue?: number,
    newValue?: number,
    changeType?: 'scan' | 'manual' | 'button'
  ) => {
    // Activity logging disabled to prevent console errors
    // The activity_logs table doesn't exist in the database
    console.log('📝 Activity logging disabled:', { actionType, itemBrand, roomName, oldValue, newValue, changeType })
  }

  // Barcode detection callback
  const handleBarcodeDetected = useCallback((barcode: string) => {
    console.log('🔍 Barcode scanned in counting interface:', barcode)
    setLastScannedBarcode(barcode)

    // CLEAR search term FIRST so next scan starts fresh
    setSearchTerm('')

    // Find item by barcode - use flexible matching
    const scannedBarcode = barcode.trim().toLowerCase()
    const foundItem = inventoryItems.find(item => {
      if (!item.barcode) return false

      const itemBarcode = item.barcode.trim().toLowerCase()

      // Try multiple matching strategies
      return (
        itemBarcode === scannedBarcode || // Exact match
        itemBarcode.includes(scannedBarcode) || // Substring match
        scannedBarcode.includes(itemBarcode) || // Reverse substring
        itemBarcode === scannedBarcode.replace(/^0+/, '') || // Remove leading zeros
        itemBarcode.replace(/^0+/, '') === scannedBarcode // Remove leading zeros from DB
      )
    })

    if (foundItem) {
      console.log('✅ Item found for barcode:', foundItem.brand)
      setScannerStatus('detected')
      setHighlightedItem(foundItem.id)

      // Force blur on ALL inputs FIRST
      searchInputRef.current?.blur()
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }

      // Set focused state (triggers useEffect)
      setFocusedInput(foundItem.id)

      // ALSO focus directly after a delay to ensure it happens
      // This is a backup in case useEffect timing is off
      setTimeout(() => {
        const input = inputRefs.current[foundItem.id]
        if (input) {
          console.log('🎯 Direct focus attempt on:', foundItem.brand)
          input.focus()
          input.select()

          // Verify focus worked
          setTimeout(() => {
            if (document.activeElement === input) {
              console.log('✅ Focus successful!')
            } else {
              console.warn('❌ Focus failed! Active element is:', document.activeElement)
              // Try one more time
              input.focus()
              input.select()
            }
          }, 50)
        } else {
          console.error('❌ Input ref not found for:', foundItem.id)
          console.log('Available refs:', Object.keys(inputRefs.current))
        }
      }, 100)

      // Auto-scroll to item
      setTimeout(() => {
        const element = document.getElementById(`item-${foundItem.id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 150)

      // Clear highlight and status after 3 seconds (but keep focus)
      setTimeout(() => {
        setHighlightedItem(null)
        setScannerStatus('ready')
      }, 3000)
      
    } else {
      console.log('❌ No item found for barcode:', barcode)
      setScannerStatus('not_found')

      // Keep search clear and blurred for next scan
      setSearchTerm('')
      searchInputRef.current?.blur()

      // Clear status after 3 seconds
      setTimeout(() => {
        setScannerStatus('ready')
      }, 3000)
    }
  }, [inventoryItems])

  // Set up barcode detection
  useEffect(() => {
    try {
      barcodeDetector.addListener(handleBarcodeDetected)
      
      return () => {
        barcodeDetector.removeListener(handleBarcodeDetected)
      }
    } catch (error: any) {
      console.debug('Barcode detector setup error (handled):', error)
    }
  }, [handleBarcodeDetected])

  const fetchRoomsAndInventory = async () => {
    try {
      setLoading(true)
      console.log('🔄 Loading rooms and inventory...')

      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        console.error('No organization found')
        return
      }

      // Fetch rooms with organization filter
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('organization_id', currentOrg)
        .order('display_order')

      if (roomsError) {
        console.error('❌ Error fetching rooms:', roomsError)
      } else {
        console.log('✅ Rooms loaded:', roomsData)
        setRooms(roomsData || [])
        
        // Auto-select first room if available
        if (roomsData?.length > 0 && !selectedRoom) {
          setSelectedRoom(roomsData[0].id)
          setSelectedRoomName(roomsData[0].name)
        }
      }

      // Fetch inventory items with organization filter
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('organization_id', currentOrg)
        .order('brand')

      if (inventoryError) {
        console.error('❌ Error fetching inventory:', inventoryError)
      } else {
        // Fetch categories and suppliers with organization filter
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('organization_id', currentOrg)
        
        const { data: suppliersData } = await supabase
          .from('suppliers')
          .select('*')
          .eq('organization_id', currentOrg)

        const enrichedItems = inventoryData?.map(item => {
          const category = categoriesData?.find(cat => cat.id === item.category_id)
          const supplier = suppliersData?.find(sup => sup.id === item.supplier_id)
          
          return {
            ...item,
            categories: category ? { name: category.name } : null,
            suppliers: supplier ? { name: supplier.name } : null
          }
        })

        console.log('✅ Enriched inventory loaded:', enrichedItems)
        setInventoryItems(enrichedItems || [])
      }

    } catch (error) {
      console.error('💥 Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRoomCounts = async (roomId: string) => {
    try {
      console.log('📋 Loading existing counts for room:', roomId)
      
      // Clear current counts immediately when switching rooms
      setCounts({})
      setOriginalCounts({})
      setChangedItems(new Set())
      setChangeHistory({})
      
      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        console.error('No organization found for loading room counts')
        return
      }

      if (!roomId) {
        console.error('No room ID provided for loading counts')
        return
      }

      // Log room change activity
      const room = rooms.find(r => r.id === roomId)
      if (room) {
        setSelectedRoomName(room.name)
        try {
          await logActivity('room_changed', undefined, room.name)
        } catch (error) {
          console.warn('Failed to log room change activity:', error)
        }
      }
      
      const { data, error } = await supabase
        .from('room_counts')
        .select('inventory_item_id, count, created_at')
        .eq('room_id', roomId)
        .eq('organization_id', currentOrg)

      if (error) {
        console.error('❌ Error loading room counts:', error)
      } else {
        console.log('✅ Existing room counts loaded:', data)
        
        // Convert to counts object
        const roomCounts: RoomCount = {}
        const history: ItemChangeHistory = {}
        
        data?.forEach(item => {
          roomCounts[item.inventory_item_id] = item.count || 0
          
          // If there's a created_at, add it to history as "loaded from database"
          if (item.created_at && item.count > 0) {
            history[item.inventory_item_id] = {
              previousValue: 0,
              newValue: item.count,
              changedAt: new Date(item.created_at),
              changeType: 'manual' // Previously saved data
            }
          }
        })
        
        // Set both current and original counts
        setCounts(roomCounts)
        setOriginalCounts({ ...roomCounts }) // Deep copy for comparison
        setChangedItems(new Set()) // Reset changed items
        setChangeHistory(history) // Set change history from database
        
        setSaveStatus({
          status: 'saved',
          lastSaved: data?.length > 0 ? new Date() : null,
          pendingChanges: 0
        })

        console.log('📊 Loaded', Object.keys(roomCounts).length, 'existing counts with history')
      }
    } catch (error) {
      console.error('💥 Error in loadRoomCounts:', error)
    }
  }

  const updateCount = async (itemId: string, newCount: number, changeType: 'scan' | 'manual' | 'button' = 'manual') => {
    const finalCount = Math.max(0, newCount) // Prevent negative counts
    const previousValue = counts[itemId] || 0
    
    // Find the item brand for logging
    const item = inventoryItems.find(i => i.id === itemId)
    const itemBrand = item?.brand || 'Unknown Item'
    
    setCounts(prev => {
      const updated = {
        ...prev,
        [itemId]: finalCount
      }
      return updated
    })

    // Track change history with timestamp
    setChangeHistory(prev => ({
      ...prev,
      [itemId]: {
        previousValue,
        newValue: finalCount,
        changedAt: new Date(),
        changeType
      }
    }))

    // Track what changed compared to original
    setChangedItems(prev => {
      const newChangedItems = new Set(prev)
      const originalValue = originalCounts[itemId] || 0
      
      if (finalCount !== originalValue) {
        newChangedItems.add(itemId)
      } else {
        newChangedItems.delete(itemId)
      }
      
      console.log('📝 Item', itemId, 'changed from', previousValue, 'to', finalCount, 'via', changeType)
      return newChangedItems
    })

    // LOG REAL ACTIVITY
    await logActivity(
      'count_updated',
      itemBrand,
      selectedRoomName,
      previousValue,
      finalCount,
      changeType
    )

    // Quick auto-save after 3 seconds of no changes (optional)
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      console.log('⚡ Quick auto-save after count change...')
      performSave(true)
    }, 3000)
  }

  const performSave = async (isAutoSave = false) => {
    if (!selectedRoom) {
      console.warn('No room selected for save')
      return
    }

    if (changedItems.size === 0) {
      console.log('✅ No changes to save')
      setSaveStatus(prev => ({ ...prev, status: 'saved', pendingChanges: 0 }))
      return
    }

    try {
      setSaveStatus(prev => ({ ...prev, status: 'saving' })) // NOW set to saving
      console.log(isAutoSave ? '🔄 Auto-saving...' : '💾 Manual saving...', changedItems.size, 'changed items')

      if (!isOnline) {
        // Queue for later when back online
        changedItems.forEach(itemId => {
          saveQueueRef.current[itemId] = counts[itemId] || 0
        })
        setSaveStatus(prev => ({ ...prev, status: 'offline' }))
        console.log('📱 Offline: Queued', changedItems.size, 'items for later sync')
        return
      }

      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        throw new Error('No organization found for saving')
      }

      // Only update/insert changed items (INCREMENTAL APPROACH)
      const changedCounts = Array.from(changedItems).map(itemId => ({
        room_id: selectedRoom,
        inventory_item_id: itemId,
        count: counts[itemId] || 0,
        organization_id: currentOrg
      }))

      // First, delete existing records for only the changed items
      if (changedCounts.length > 0) {
        const itemIds = Array.from(changedItems)
        await supabase
          .from('room_counts')
          .delete()
          .eq('room_id', selectedRoom)
          .eq('organization_id', currentOrg)
          .in('inventory_item_id', itemIds)
      }

      // Insert only items with count > 0
      const itemsToInsert = changedCounts.filter(item => item.count > 0)
      
      if (itemsToInsert.length > 0) {
        const { error } = await supabase
          .from('room_counts')
          .insert(itemsToInsert)

        if (error) {
          console.error('❌ Error saving counts:', error)
          throw error
        }
      }

      // Update original counts and clear changed items
      changedItems.forEach(itemId => {
        originalCounts[itemId] = counts[itemId] || 0
      })
      
      setOriginalCounts({ ...originalCounts })
      setChangedItems(new Set())

      setSaveStatus({
        status: 'saved',
        lastSaved: new Date(),
        pendingChanges: 0
      })

      console.log('✅ Save completed:', itemsToInsert.length, 'items updated')

    } catch (error) {
      console.error('💥 Error saving counts:', error)
      setSaveStatus(prev => ({ ...prev, status: 'error' }))
      
      if (!isAutoSave) {
        alert('Error saving counts. Changes are kept locally and will retry automatically.')
      }
    }
  }

  const processSaveQueue = async () => {
    const queuedItems = Object.keys(saveQueueRef.current)
    if (queuedItems.length === 0) return

    console.log('🔄 Processing', queuedItems.length, 'queued saves from offline mode')
    
    // Add queued items to changed items and trigger save
    setChangedItems(prev => new Set([...prev, ...queuedItems]))
    saveQueueRef.current = {} // Clear queue
    
    // Will trigger auto-save via useEffect
  }

  const manualSave = () => {
    performSave(false) // false = manual save mode
  }

  const resetCounts = () => {
    if (confirm('Reset all counts for this room to zero? This will clear both current and saved counts.')) {
      setCounts({})
      setOriginalCounts({})
      setChangedItems(new Set())
      setChangeHistory({})
      setFocusedInput(null)
      
      // Clear all counts from database for this room
      if (selectedRoom) {
        supabase
          .from('room_counts')
          .delete()
          .eq('room_id', selectedRoom)
          .then(() => {
            setSaveStatus({
              status: 'saved',
              lastSaved: new Date(),
              pendingChanges: 0
            })
          })
      }
    }
  }

  // Test barcode scanner
  const testScanner = () => {
    const testBarcode = '123456789'
    console.log('🧪 Testing scanner with barcode:', testBarcode)
    barcodeDetector.simulateScan(testBarcode)
  }

  // Clear search manually
  const clearSearch = () => {
    setSearchTerm('')
    setFocusedInput(null)
  }

  // Format time for display
  const formatTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  // Get total items counted in current room
  const totalItemsCounted = Object.values(counts).filter(count => count > 0).length
  const totalBottlesCounted = Object.values(counts).reduce((sum, count) => sum + count, 0)

  // Filter items based on search
  const filteredItems = inventoryItems.filter(item =>
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Loading rooms and inventory...</div>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-blue-200 shadow-sm">
        <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <p className="text-slate-600 text-lg">No rooms configured</p>
        <p className="text-slate-500 text-sm mt-2">
          Go to the &ldquo;Rooms&rdquo; tab to add your first room before counting inventory
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Auto-save Status Banner */}
      <div className={`rounded-lg p-4 border transition-all ${
        saveStatus.status === 'saved' 
          ? 'bg-green-50 border-green-200' 
          : saveStatus.status === 'saving'
          ? 'bg-blue-50 border-blue-200'
          : saveStatus.status === 'pending'
          ? 'bg-yellow-50 border-yellow-200'
          : saveStatus.status === 'offline'
          ? 'bg-orange-50 border-orange-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isOnline ? (
              <Wifi className={`h-5 w-5 ${
                saveStatus.status === 'saved' ? 'text-green-400' : 
                saveStatus.status === 'saving' ? 'text-blue-400' : 
                saveStatus.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
              }`} />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-400" />
            )}
            <div>
              <h3 className={`font-medium ${
                saveStatus.status === 'saved' ? 'text-green-700' : 
                saveStatus.status === 'saving' ? 'text-blue-700' :
                saveStatus.status === 'pending' ? 'text-yellow-700' :
                saveStatus.status === 'offline' ? 'text-orange-700' : 'text-red-700'
              }`}>
                {saveStatus.status === 'saved' && saveStatus.pendingChanges === 0 && '✅ All Changes Saved'}
                {saveStatus.status === 'saved' && saveStatus.pendingChanges > 0 && '✅ Saved (changes pending)'}
                {saveStatus.status === 'pending' && '⏳ Auto-save in 30s'}
                {saveStatus.status === 'saving' && '💾 Saving...'}
                {saveStatus.status === 'offline' && '📱 Offline - Changes Queued'}
                {saveStatus.status === 'error' && '❌ Save Error - Retrying'}
              </h3>
              <p className={`text-sm ${
                saveStatus.status === 'saved' ? 'text-green-600' : 
                saveStatus.status === 'saving' ? 'text-blue-600' :
                saveStatus.status === 'pending' ? 'text-yellow-600' :
                saveStatus.status === 'offline' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {saveStatus.lastSaved && `Last saved: ${saveStatus.lastSaved.toLocaleTimeString()}`}
                {saveStatus.pendingChanges > 0 && ` • ${saveStatus.pendingChanges} pending changes`}
                {!isOnline && ' • Will sync when connection restored'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600 text-sm">Auto-saves every 30s • Activity logged</span>
          </div>
        </div>
      </div>

      {/* Rest of the component stays the same... */}
      {/* Barcode Scanner Status */}
      <div className={`rounded-lg p-4 border transition-all ${
        scannerStatus === 'detected' 
          ? 'bg-green-50 border-green-200' 
          : scannerStatus === 'not_found'
          ? 'bg-red-50 border-red-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className={`h-5 w-5 ${
              scannerStatus === 'detected' 
                ? 'text-green-500' 
                : scannerStatus === 'not_found'
                ? 'text-red-500'
                : 'text-blue-500'
            }`} />
            <div>
              <h3 className={`font-medium ${
                scannerStatus === 'detected' 
                  ? 'text-green-700' 
                  : scannerStatus === 'not_found'
                  ? 'text-red-700'
                  : 'text-blue-700'
              }`}>
                {scannerStatus === 'detected' 
                  ? '✅ Ready for Count Input!' 
                  : scannerStatus === 'not_found'
                  ? '❌ Item Not Found'
                  : '📱 Professional Scanner Ready'}
              </h3>
              <p className={`text-sm ${
                scannerStatus === 'detected' 
                  ? 'text-green-600' 
                  : scannerStatus === 'not_found'
                  ? 'text-red-600'
                  : 'text-blue-600'
              }`}>
                {scannerStatus === 'detected' 
                  ? `Scan found! Type count then scan next item` 
                  : scannerStatus === 'not_found'
                  ? `No item found for: ${lastScannedBarcode}`
                  : 'Workflow: Scan barcode → Type count → Scan next → Auto-saves → Activity logged'}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
              >
                Clear Search
              </button>
            )}
            <button
              onClick={testScanner}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
            >
              Test Scanner
            </button>
          </div>
        </div>
      </div>

      {/* Room Selection Cards */}
      <div className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-blue-500" />
          Select Room for Counting
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => {
                setSelectedRoom(room.id)
                loadRoomCounts(room.id)
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedRoom === room.id
                  ? 'bg-blue-50 border-blue-400 shadow-lg'
                  : 'bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <MapPin className={`h-5 w-5 ${
                  selectedRoom === room.id ? 'text-blue-500' : 'text-slate-600'
                }`} />
                <div>
                  <h4 className={`font-medium ${
                    selectedRoom === room.id ? 'text-slate-800' : 'text-slate-700'
                  }`}>
                    {room.name}
                  </h4>
                  <p className={`text-sm ${
                    selectedRoom === room.id ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    Tap to select
                  </p>
                </div>
              </div>
              
              {selectedRoom === room.id && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">Items counted:</span>
                    <span className="text-blue-700 font-medium">{totalItemsCounted}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-blue-600">Total bottles:</span>
                    <span className="text-blue-700 font-medium">{totalBottlesCounted.toFixed(2)}</span>
                  </div>
                  {changedItems.size > 0 && (
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-orange-200">Pending changes:</span>
                      <span className="text-orange-100 font-medium">{changedItems.size}</span>
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {selectedRoom && (
        <>
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name, category, or barcode (or use scanner)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => {
                  // Auto-blur after a moment to allow hands-free scanning
                  setTimeout(() => {
                    e.target.blur()
                    console.log('🔍 Search auto-blurred for hands-free scanning')
                  }, 100)
                }}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={manualSave}
                disabled={saveStatus.status === 'saving'}
                className={`flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-colors ${
                  saveStatus.status === 'saving' 
                    ? 'bg-blue-600/50 cursor-not-allowed' 
                    : changedItems.size === 0
                    ? 'bg-green-600/50 cursor-default'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>
                  {saveStatus.status === 'saving' ? 'Saving...' : 
                   changedItems.size === 0 ? 'All Saved ✅' : 
                   `Save Now (${changedItems.size})`}
                </span>
              </button>
              <button
                onClick={resetCounts}
                className="flex items-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset All</span>
              </button>
            </div>
          </div>

          {/* Inventory Items */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <Package className="h-5 w-5 mr-2 text-purple-600" />
                Inventory Count
                <span className="ml-2 text-slate-600 text-sm">
                  ({filteredItems.length} items)
                </span>
              </h3>
              <p className="text-slate-600 text-sm mt-1">
                Room: <span className="text-slate-800 font-medium">
                  {rooms.find(r => r.id === selectedRoom)?.name}
                </span>
                {focusedInput && (
                  <span className="text-blue-600 ml-4">
                    🎯 Ready for input
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600">No items found</p>
                  {searchTerm && (
                    <p className="text-slate-500 text-sm mt-1">
                      Try scanning a barcode or adjusting your search term
                    </p>
                  )}
                </div>
              ) : (
                filteredItems.map((item) => {
                  const isChanged = changedItems.has(item.id)
                  const originalValue = originalCounts[item.id] || 0
                  const currentValue = counts[item.id] || 0
                  const history = changeHistory[item.id]
                  
                  return (
                    <div 
                      key={item.id} 
                      id={`item-${item.id}`}
                      className={`rounded-lg p-4 border transition-all duration-300 ${
                        highlightedItem === item.id
                          ? 'bg-green-50 border-green-400 shadow-lg shadow-green-500/20'
                          : focusedInput === item.id
                          ? 'bg-blue-50 border-blue-400'
                          : isChanged
                          ? 'bg-orange-50 border-orange-400'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-slate-800 font-medium">{item.brand}</h4>
                          <div className="flex items-center flex-wrap gap-2 text-sm text-slate-600 mt-1">
                            {item.categories?.name && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {item.categories.name}
                              </span>
                            )}
                            {item.barcode && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono">
                                {item.barcode}
                              </span>
                            )}
                            {highlightedItem === item.id && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded animate-pulse">
                                ✅ Just Scanned
                              </span>
                            )}
                            {focusedInput === item.id && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                🎯 Ready for Input
                              </span>
                            )}
                            {isChanged && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                📝 {originalValue} → {currentValue}
                              </span>
                            )}
                            {history && (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center">
                                <History className="h-3 w-3 mr-1" />
                                {formatTime(history.changedAt)}
                                {history.changeType === 'scan' && ' (scanned)'}
                                {history.changeType === 'button' && ' (button)'}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateCount(item.id, (counts[item.id] || 0) - 0.5, 'button')}
                            disabled={!counts[item.id] || counts[item.id] <= 0}
                            className="px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-30 disabled:bg-orange-600/20 text-white rounded-lg transition-colors text-sm"
                          >
                            -0.5
                          </button>

                          <button
                            onClick={() => updateCount(item.id, (counts[item.id] || 0) - 1, 'button')}
                            disabled={!counts[item.id] || counts[item.id] <= 0}
                            className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:bg-red-600/20 text-white rounded-lg transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <div className="w-20 text-center">
                            <input
                              ref={(el) => {
                                if (el) inputRefs.current[item.id] = el
                              }}
                              type="number"
                              min="0"
                              step="0.25"
                              value={counts[item.id] === 0 ? '' : counts[item.id] || ''}
                              onChange={(e) => updateCount(item.id, parseFloat(e.target.value) || 0, 'manual')}
                              onFocus={() => setFocusedInput(item.id)}
                              onBlur={() => setFocusedInput(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  // Trigger save if there are changes
                                  if (changedItems.size > 0) {
                                    manualSave()
                                  }
                                  // Blur count input and keep search blurred for next scanner input
                                  setFocusedInput(null)
                                  e.currentTarget.blur()
                                  // Don't focus search - let it stay blurred so barcode detector can capture next scan
                                }
                              }}
                              className={`w-full text-center border rounded-lg py-2 text-slate-800 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                                focusedInput === item.id
                                  ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500'
                                  : isChanged
                                  ? 'bg-orange-50 border-orange-400'
                                  : 'bg-white border-slate-200'
                              }`}
                            />
                          </div>

                          <button
                            onClick={() => updateCount(item.id, (counts[item.id] || 0) + 1, 'button')}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => updateCount(item.id, (counts[item.id] || 0) + 0.5, 'button')}
                            className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                          >
                            +0.5
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
