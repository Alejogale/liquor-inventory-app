'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Maximize2, Minimize2, MoreHorizontal, Activity, Clock, CheckCircle } from 'lucide-react'
import { ConsumptionWindow, ConsumptionItem } from '@/types/consumption-sheet'
import InventoryService from '@/lib/consumption-sheet/inventory-service'
import ConsumptionWindowComponent from './ConsumptionWindow'
import WindowTabs from './WindowTabs'

interface WindowManagerProps {
  organizationId: string
  userId: string
  windows: ConsumptionWindow[]
  activeWindowId: string | null
  onActiveWindowChange: (windowId: string) => void
  onWindowClose: (windowId: string) => void
  onWindowUpdate: (windowId: string, updates: Partial<ConsumptionWindow>) => void
  inventoryService: InventoryService
  selectedCategories?: string[]
}

export default function WindowManager({
  organizationId,
  userId,
  windows,
  activeWindowId,
  onActiveWindowChange,
  onWindowClose,
  onWindowUpdate,
  inventoryService,
  selectedCategories = []
}: WindowManagerProps) {
  const [layout, setLayout] = useState<'tabs' | 'grid' | 'cascade'>('tabs')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loadingWindows, setLoadingWindows] = useState<Set<string>>(new Set())
  const [fullscreenWindowId, setFullscreenWindowId] = useState<string | null>(null)

  // Get the active window
  const activeWindow = windows.find(w => w.id === activeWindowId)

  // Handle window data updates
  const handleWindowDataUpdate = useCallback(async (windowId: string, items: ConsumptionItem[]) => {
    setLoadingWindows(prev => new Set(prev).add(windowId))
    
    try {
      // Update the window with new data
      onWindowUpdate(windowId, {
        items,
        sheetConnection: {
          ...windows.find(w => w.id === windowId)?.sheetConnection || {
            spreadsheetId: '',
            sheetName: '',
            isConnected: false,
            lastSync: ''
          },
          lastSync: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Failed to update window data:', error)
    } finally {
      setLoadingWindows(prev => {
        const updated = new Set(prev)
        updated.delete(windowId)
        return updated
      })
    }
  }, [windows, onWindowUpdate])

  // Handle event name updates
  const handleEventNameUpdate = useCallback(async (windowId: string, newEventName: string) => {
    const window = windows.find(w => w.id === windowId)
    if (!window) return

    try {
      // Update the event in Google Sheets
      await inventoryService.updateEvent(window.eventId, { eventName: newEventName })
      
      // Update local state
      onWindowUpdate(windowId, {
        eventName: newEventName
      })
    } catch (error) {
      console.error('Failed to update event name:', error)
    }
  }, [windows, inventoryService, onWindowUpdate])

  // Handle window close with confirmation
  const handleWindowClose = useCallback((windowId: string) => {
    const window = windows.find(w => w.id === windowId)
    if (!window) return

    // Show confirmation for windows with data
    if (window.items.some(item => item.quantity > 0)) {
      const confirmed = confirm(
        `Are you sure you want to close "${window.eventName}"? Any unsaved changes will be lost.`
      )
      if (!confirmed) return
    }

    onWindowClose(windowId)
  }, [windows, onWindowClose])

  // Toggle fullscreen mode for individual windows
  const toggleWindowFullscreen = useCallback((windowId: string) => {
    if (fullscreenWindowId === windowId) {
      setFullscreenWindowId(null)
    } else {
      setFullscreenWindowId(windowId)
    }
  }, [fullscreenWindowId])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Window statistics
  const getWindowStats = useCallback((window: ConsumptionWindow) => {
    const totalItems = window.items.length
    const itemsWithConsumption = window.items.filter(item => item.quantity > 0).length
    const totalConsumption = window.items.reduce((sum, item) => sum + item.quantity, 0)
    
    return {
      totalItems,
      itemsWithConsumption,
      totalConsumption,
      completionRate: totalItems > 0 ? (itemsWithConsumption / totalItems) * 100 : 0
    }
  }, [])

  if (windows.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Activity className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-slate-900">No Active Windows</h3>
            <p className="text-slate-600 mt-1">Create a new consumption tracking window to get started.</p>
          </div>
        </div>
      </div>
    )
  }

  // Check if any window is in fullscreen mode
  const fullscreenWindow = fullscreenWindowId ? windows.find(w => w.id === fullscreenWindowId) : null

  // If there's a fullscreen window, render only that window at the very top level
  if (fullscreenWindow) {
    return (
      <ConsumptionWindowComponent
        window={fullscreenWindow}
        organizationId={organizationId}
        userId={userId}
        inventoryService={inventoryService}
        isLoading={loadingWindows.has(fullscreenWindow.id)}
        onDataUpdate={(items) => handleWindowDataUpdate(fullscreenWindow.id, items)}
        onEventNameUpdate={(newName) => handleEventNameUpdate(fullscreenWindow.id, newName)}
        selectedCategories={selectedCategories}
        isFullscreen={true}
        onToggleFullscreen={() => toggleWindowFullscreen(fullscreenWindow.id)}
      />
    )
  }

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Window Controls Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Window Tabs */}
          <div className="flex-1">
            <WindowTabs
              windows={windows}
              activeWindowId={activeWindowId}
              onWindowSelect={onActiveWindowChange}
              onWindowClose={handleWindowClose}
              getWindowStats={getWindowStats}
            />
          </div>

          {/* Layout Controls */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Layout Selector */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setLayout('tabs')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  layout === 'tabs' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tab Layout"
              >
                Tabs
              </button>
              <button
                onClick={() => setLayout('grid')}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  layout === 'grid' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid Layout"
              >
                Grid
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Active Window Summary */}
        {activeWindow && (
          <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center space-x-4">
              <span>
                Event: <span className="font-medium text-slate-900">{activeWindow.eventName}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last sync: {new Date(activeWindow.sheetConnection.lastSync).toLocaleTimeString()}</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {(() => {
                const stats = getWindowStats(activeWindow)
                return (
                  <>
                    <span>{stats.itemsWithConsumption}/{stats.totalItems} items tracked</span>
                    <span>Total: {stats.totalConsumption}</span>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{Math.round(stats.completionRate)}% complete</span>
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden">
        {layout === 'tabs' && activeWindow && (
          <div className="h-full">
            <ConsumptionWindowComponent
              window={activeWindow}
              organizationId={organizationId}
              userId={userId}
              inventoryService={inventoryService}
              isLoading={loadingWindows.has(activeWindow.id)}
              onDataUpdate={(items) => handleWindowDataUpdate(activeWindow.id, items)}
              onEventNameUpdate={(newName) => handleEventNameUpdate(activeWindow.id, newName)}
              selectedCategories={selectedCategories}
              isFullscreen={false}
              onToggleFullscreen={() => toggleWindowFullscreen(activeWindow.id)}
            />
          </div>
        )}

        {layout === 'grid' && (
          <div className={`grid gap-4 p-4 h-full overflow-auto ${
            windows.length === 1 ? 'grid-cols-1' : 
            windows.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : 
            'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
          }`}>
            {windows.map((window) => (
              <div key={window.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                {/* Window Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-900 truncate">{window.eventName}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onActiveWindowChange(window.id)}
                        className="text-slate-600 hover:text-slate-900"
                        title="Focus Window"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleWindowClose(window.id)}
                        className="text-slate-600 hover:text-red-600"
                        title="Close Window"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Window Stats */}
                  <div className="mt-2 text-xs text-slate-600">
                    {(() => {
                      const stats = getWindowStats(window)
                      return `${stats.itemsWithConsumption}/${stats.totalItems} items • Total: ${stats.totalConsumption}`
                    })()}
                  </div>
                </div>

                {/* Window Content (condensed) */}
                <div className="h-64 overflow-hidden">
                  <ConsumptionWindowComponent
                    window={window}
                    organizationId={organizationId}
                    userId={userId}
                    inventoryService={inventoryService}
                    isLoading={loadingWindows.has(window.id)}
                    onDataUpdate={(items) => handleWindowDataUpdate(window.id, items)}
                    onEventNameUpdate={(newName) => handleEventNameUpdate(window.id, newName)}
                    compact={true}
                    selectedCategories={selectedCategories}
                    isFullscreen={false}
                    onToggleFullscreen={() => toggleWindowFullscreen(window.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-slate-50 border-t border-slate-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center space-x-6">
            <span>Active Windows: {windows.length}/3</span>
            <span>
              Total Items: {windows.reduce((sum, w) => sum + w.items.length, 0)}
            </span>
            <span>
              Total Consumption: {windows.reduce((sum, w) => 
                sum + w.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
              )}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Real-time sync active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}