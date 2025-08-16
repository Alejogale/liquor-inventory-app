'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { ConsumptionWindow, ConsumptionEvent, WindowConfig } from '@/types/consumption-sheet'
import InventoryService from '@/lib/consumption-sheet/inventory-service'
import WindowManager from './WindowManager'

interface ConsumptionTrackerProps {
  organizationId: string
  userId: string
  windowId?: string
  initialEvent?: ConsumptionEvent
  onEventChange?: (event: ConsumptionEvent) => void
  selectedCategories?: string[]
}

export default function ConsumptionTracker({ 
  organizationId, 
  userId, 
  windowId, 
  initialEvent,
  onEventChange,
  selectedCategories = []
}: ConsumptionTrackerProps) {
  // Core state
  const [windows, setWindows] = useState<ConsumptionWindow[]>([])
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null)
  // Removed activeTab - now always shows tracking interface
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting')

  // Inventory service client
  const [inventoryService] = useState(() => new InventoryService(organizationId))
  
  // Manager emails
  const [managerEmails, setManagerEmails] = useState<string[]>([])
  
  // Configuration
  const [globalConfig, setGlobalConfig] = useState<WindowConfig>({
    categories: ['Wine', 'Beer', 'Spirits', 'Cocktails', 'Non-Alcoholic'],
    brands: {
      'Wine': ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir', 'Sauvignon Blanc'],
      'Beer': ['Draft Beer', 'Bottle Beer', 'Premium Beer'],
      'Spirits': ['Vodka', 'Whiskey', 'Gin', 'Rum', 'Tequila'],
      'Cocktails': ['House Cocktails', 'Premium Cocktails', 'Specialty Drinks'],
      'Non-Alcoholic': ['Soft Drinks', 'Coffee', 'Tea', 'Water']
    },
    emailSettings: {
      managerEmails: [
        'alejogaleis@gmail.com',
        'Stierney@morriscgc.com',
        'acuevas@morriscgc.com', 
        'ksalvatore@morriscgc.com',
        'Ddepalma@morriscgc.com'
      ],
      reportTemplate: 'default' as const,
      autoSend: false
    },
    sheetSettings: {
      sheetId: '',
      sheetName: 'Consumption Sheet',
      dataRange: 'A:D',
      headerRow: 1,
      startColumn: 'A',
      endColumn: 'D'
    }
  })

  // Initialize the consumption tracker
  useEffect(() => {
    const initializeTracker = async () => {
      try {
        setIsLoading(true)
        setConnectionStatus('connecting')
        
        // Check if we have a valid organization ID
        if (!organizationId) {
          console.warn('⚠️ No organization ID available - using default configuration with mock data')
          setError('Organization not found. Using demo data for testing. Please log in to access your inventory.')
          setConnectionStatus('connected') // Still allow demo mode
          
          // Set up default configuration with mock data
          setGlobalConfig(prev => ({
            ...prev,
            categories: ['Wine', 'Beer', 'Spirits', 'Cocktails', 'Non-Alcoholic'],
            brands: {
              'Wine': ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir'],
              'Beer': ['Draft Beer', 'Bottle Beer', 'Premium Beer'],
              'Spirits': ['Vodka', 'Whiskey', 'Gin', 'Rum', 'Tequila'],
              'Cocktails': ['House Cocktails', 'Premium Cocktails'],
              'Non-Alcoholic': ['Soft Drinks', 'Coffee', 'Tea', 'Water']
            }
          }))
          
          // Create initial demo window if none exist
          if (windows.length === 0) {
            await createNewWindow()
          }
          
          setIsLoading(false)
          return
        }
        
        // Load manager emails
        const emails = await inventoryService.getManagerEmails()
        setManagerEmails(emails)
        
        // Load configuration from inventory system
        console.log('🔄 Loading consumption sheet configuration...')
        console.log('🏢 Organization ID:', organizationId)
        
        const categories = await inventoryService.getCategories()
        console.log('📋 Categories loaded:', categories)
        
        // Ensure unique categories to prevent duplicate React keys
        const uniqueCategories = [...new Set(categories)]
        console.log('📋 Unique categories:', uniqueCategories.length)
        
        const brands: Record<string, string[]> = {}
        
        // Load brands for each unique category
        for (const category of uniqueCategories) {
          brands[category] = await inventoryService.getBrands(category)
          console.log(`🏷️ Brands for ${category}:`, brands[category]?.length || 0)
        }
        
        if (uniqueCategories.length > 0) {
          setGlobalConfig(prev => ({
            ...prev,
            categories: uniqueCategories,
            brands: Object.keys(brands).length > 0 ? brands : prev.brands,
            emailSettings: {
              ...prev.emailSettings,
              managerEmails: emails
            }
          }))
        }

        // Create initial window if none exist
        if (windows.length === 0) {
          await createNewWindow()
        }

        setConnectionStatus('connected')
      } catch (err) {
        console.error('Failed to initialize consumption tracker:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize tracker')
        setConnectionStatus('disconnected')
      } finally {
        setIsLoading(false)
      }
    }

    initializeTracker()
  }, [organizationId])

  // Create a new consumption window
  const createNewWindow = useCallback(async () => {
    if (windows.length >= 3) {
      setError('Maximum of 3 windows allowed')
      return
    }

    try {
      setIsLoading(true)
      
      // Create new event
      const eventName = `Event ${windows.length + 1} - ${new Date().toLocaleDateString()}`
      const eventId = await inventoryService.createEvent(eventName)
      
      const newWindow: ConsumptionWindow = {
        id: `window_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId,
        eventName,
        position: (windows.length + 1) as 1 | 2 | 3,
        isActive: windows.length === 0, // First window is active by default
        sheetConnection: {
          spreadsheetId: '',
          sheetName: 'Consumption Sheet',
          isConnected: false,
          lastSync: new Date().toISOString()
        },
        items: [],
        config: { ...globalConfig }
      }

      setWindows(prev => [...prev, newWindow])
      
      if (windows.length === 0) {
        setActiveWindowId(newWindow.id)
      }
      
    } catch (err) {
      console.error('Failed to create new window:', err)
      setError(err instanceof Error ? err.message : 'Failed to create window')
    } finally {
      setIsLoading(false)
    }
  }, [windows, globalConfig, inventoryService])

  // Close a window
  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => {
      const filtered = prev.filter(w => w.id !== windowId)
      
      // If we closed the active window, activate the first remaining window
      if (activeWindowId === windowId && filtered.length > 0) {
        setActiveWindowId(filtered[0].id)
      } else if (filtered.length === 0) {
        setActiveWindowId(null)
      }
      
      return filtered
    })
  }, [activeWindowId])

  // Update window configuration
  const updateWindowConfig = useCallback((windowId: string, newConfig: WindowConfig) => {
    setWindows(prev => prev.map(window => 
      window.id === windowId 
        ? { ...window, config: newConfig }
        : window
    ))
  }, [])

  // Handle email updates
  const handleEmailsUpdate = useCallback(async (emails: string[]) => {
    try {
      await inventoryService.updateManagerEmails(emails)
      setManagerEmails(emails)
      
      // Update all window configurations
      setGlobalConfig(prev => ({
        ...prev,
        emailSettings: {
          ...prev.emailSettings,
          managerEmails: emails
        }
      }))
      
    } catch (err) {
      console.error('Failed to update manager emails:', err)
      setError(err instanceof Error ? err.message : 'Failed to update emails')
    }
  }, [inventoryService])

  // Connection status indicator
  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2 text-sm">
      {connectionStatus === 'connected' && (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-600">Connected</span>
        </>
      )}
      {connectionStatus === 'connecting' && (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-yellow-600">Connecting...</span>
        </>
      )}
      {connectionStatus === 'disconnected' && (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-600">Disconnected</span>
        </>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
            <p className="text-slate-600">Initializing consumption tracker...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs and connection status */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-slate-900">Consumption Tracking</h2>
            <ConnectionStatus />
          </div>
          
          {/* Window count and new window button */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600">
              {windows.length}/3 windows
            </span>
            
            <button
              onClick={createNewWindow}
              disabled={windows.length >= 3}
              className="inline-flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Window</span>
            </button>
          </div>
        </div>

      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <span className="sr-only">Dismiss</span>
              ×
            </button>
          </div>
        </div>
      )}

      {/* Tracking Interface - Always Visible */}
      <div className="flex-1 overflow-hidden">
        <WindowManager
          organizationId={organizationId}
          userId={userId}
          windows={windows}
          activeWindowId={activeWindowId}
          onActiveWindowChange={setActiveWindowId}
          onWindowClose={closeWindow}
          onWindowUpdate={(windowId, updates) => {
            setWindows(prev => prev.map(w => 
              w.id === windowId ? { ...w, ...updates } : w
            ))
          }}
          inventoryService={inventoryService}
          selectedCategories={selectedCategories}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-4">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
            {windows.length > 0 && (
              <span>Active events: {windows.filter(w => w.isActive).length}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Real-time sync enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}