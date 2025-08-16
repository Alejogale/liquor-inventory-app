'use client'

import { useState, useEffect, useCallback } from 'react'
import { Edit3, Save, X, Plus, Minus, Send, Download, RefreshCw, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { ConsumptionWindow as IConsumptionWindow, ConsumptionItem } from '@/types/consumption-sheet'
import InventoryService from '@/lib/consumption-sheet/inventory-service'
import QuantityControls from './QuantityControls'

interface ConsumptionWindowProps {
  window: IConsumptionWindow
  organizationId: string
  userId: string
  inventoryService: InventoryService
  isLoading?: boolean
  onDataUpdate: (items: ConsumptionItem[]) => void
  onEventNameUpdate: (newName: string) => void
  compact?: boolean
  selectedCategories?: string[]
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
}

export default function ConsumptionWindow({
  window,
  organizationId,
  userId,
  inventoryService,
  isLoading = false,
  onDataUpdate,
  onEventNameUpdate,
  compact = false,
  selectedCategories = [],
  isFullscreen = false,
  onToggleFullscreen
}: ConsumptionWindowProps) {
  // State management
  const [items, setItems] = useState<ConsumptionItem[]>(window.items || [])
  const [isEditingName, setIsEditingName] = useState(false)
  const [eventNameInput, setEventNameInput] = useState(window.eventName)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
  
  // Toggle category collapse state
  const toggleCategoryCollapse = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])
  
  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen && onToggleFullscreen) {
        onToggleFullscreen()
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, onToggleFullscreen])
  
  // Auto-sync with parent
  // Load data from inventory system - ensure each window gets its own copy
  const loadSheetData = useCallback(async () => {
    try {
      console.log('🔄 Loading inventory data for window:', window.id)
      const inventoryData = await inventoryService.getSheetData('live-inventory')
      console.log('✅ Inventory data loaded:', inventoryData.length, 'items')
      
      // Create a fresh copy for this window with unique IDs to ensure complete isolation
      const windowSpecificData = inventoryData.map(item => ({
        ...item,
        id: `${window.id}-${item.id}`, // Make ID unique per window
        quantity: 0, // Always start fresh at 0 for new windows
        originalQuantity: 0,
        lastUpdated: new Date().toISOString()
      }))
      
      setItems(windowSpecificData)
      setLastSyncTime(new Date())
      setError(null)
      onDataUpdate(windowSpecificData)
    } catch (err) {
      console.error('Failed to load inventory data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load inventory data')
    }
  }, [inventoryService, window.id, onDataUpdate])

  useEffect(() => {
    if (JSON.stringify(items) !== JSON.stringify(window.items)) {
      onDataUpdate(items)
    }
  }, [items, window.items, onDataUpdate])

  // Load initial data once per window
  useEffect(() => {
    // Only load if no items exist yet for this specific window
    if (items.length === 0 && window.items.length === 0) {
      loadSheetData()
    } else if (window.items.length > 0 && items.length === 0) {
      // Use existing window data if available
      setItems(window.items)
    }
  }, [window.items]) // Depend on window.items to handle existing data

  // Save event name
  const saveEventName = useCallback(async () => {
    if (eventNameInput.trim() === window.eventName) {
      setIsEditingName(false)
      return
    }

    try {
      await onEventNameUpdate(eventNameInput.trim())
      setIsEditingName(false)
      setSuccess('Event name updated')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to update event name:', err)
      setError(err instanceof Error ? err.message : 'Failed to update event name')
      setEventNameInput(window.eventName) // Reset to original
    }
  }, [eventNameInput, window.eventName, onEventNameUpdate])

  // Handle quantity updates
  const handleQuantityUpdate = useCallback(async (itemId: string, newQuantity: number) => {
    const item = items.find(i => i.id === itemId)
    if (!item) return

    try {
      // Update local state immediately for responsiveness
      setItems(prev => prev.map(i => 
        i.id === itemId 
          ? { ...i, quantity: newQuantity, lastUpdated: new Date().toISOString() }
          : i
      ))

      // Update in Google Sheets
      if (window.sheetConnection.isConnected) {
        await inventoryService.updateQuantity(
          window.sheetConnection.spreadsheetId, 
          item.rowIndex, 
          newQuantity
        )
      }

      setLastSyncTime(new Date())
      setError(null)
    } catch (err) {
      console.error('Failed to update quantity:', err)
      // Revert local change on error
      setItems(prev => prev.map(i => 
        i.id === itemId 
          ? { ...i, quantity: item.quantity }
          : i
      ))
      setError(err instanceof Error ? err.message : 'Failed to update quantity')
    }
  }, [items, window.sheetConnection, inventoryService])

  // Send report
  const sendReport = useCallback(async () => {
    setIsSending(true)
    try {
      const managerEmails = window.config.emailSettings.managerEmails
      await inventoryService.sendFormattedReport(window.eventId, managerEmails)
      setSuccess('Report sent successfully')
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      console.error('Failed to send report:', err)
      setError(err instanceof Error ? err.message : 'Failed to send report')
    } finally {
      setIsSending(false)
    }
  }, [window, inventoryService])

  // Calculate statistics
  const stats = {
    totalItems: items.length,
    itemsWithConsumption: items.filter(item => item.quantity > 0).length,
    totalConsumption: items.reduce((sum, item) => sum + item.quantity, 0),
    topCategories: Object.entries(
      items.reduce((acc, item) => {
        if (item.quantity > 0) {
          acc[item.category] = (acc[item.category] || 0) + item.quantity
        }
        return acc
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
  }

  return (
    <div className={`flex flex-col bg-white ${
      isFullscreen 
        ? 'fixed inset-0 z-[9999] shadow-2xl h-screen w-screen' 
        : 'h-full'
    }`}>
      {/* Window Header */}
      <div className={`bg-surface border-b border-stone-gray ${
        isFullscreen ? 'bg-primary text-white border-charcoal px-8 py-6' : 'px-4 py-3'
      }`}>
        <div className="flex items-center justify-between">
          {/* Event Name */}
          <div className="flex items-center space-x-3">
            {isEditingName ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={eventNameInput}
                  onChange={(e) => setEventNameInput(e.target.value)}
                  className="input-modern text-sm font-medium"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEventName()
                    if (e.key === 'Escape') {
                      setEventNameInput(window.eventName)
                      setIsEditingName(false)
                    }
                  }}
                  autoFocus
                />
                <button
                  onClick={saveEventName}
                  className="p-1 text-accent hover:text-primary"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEventNameInput(window.eventName)
                    setIsEditingName(false)
                  }}
                  className="p-1 text-muted hover:text-secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h3 className={`text-title ${
                  isFullscreen ? 'text-white text-headline' : 'text-primary'
                }`}>
                  {isFullscreen && '🎯 '}{window.eventName}
                </h3>
                <button
                  onClick={() => setIsEditingName(true)}
                  className={`p-1 ${
                    isFullscreen ? 'text-white/60 hover:text-white' : 'text-muted hover:text-secondary'
                  }`}
                  title="Edit event name"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Fullscreen Toggle */}
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className={`p-2 rounded-lg transition-colors ${
                  isFullscreen 
                    ? 'text-white/60 hover:text-white hover:bg-white/10' 
                    : 'text-muted hover:text-primary hover:bg-surface'
                }`}
                title={isFullscreen ? "Exit Fullscreen (ESC)" : "Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            )}
            
            {/* Refresh Button */}
            <button
              onClick={loadSheetData}
              disabled={isLoading}
              className="p-2 text-muted hover:text-primary hover:bg-surface rounded-lg transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Send Report Button */}
            {!compact && (
              <button
                onClick={sendReport}
                disabled={isSending || stats.totalConsumption === 0}
                className="button-primary text-xs sm:text-sm px-2 sm:px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send Report</span>
                    <span className="sm:hidden">Send</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mt-2 flex items-center space-x-2 text-caption text-red-600 bg-red-50 p-2 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {success && (
          <div className="mt-2 flex items-center space-x-2 text-caption text-green-600 bg-green-50 p-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-600">×</button>
          </div>
        )}

        {/* Quick Stats */}
        {!compact && (
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-caption text-muted space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="whitespace-nowrap">{stats.itemsWithConsumption}/{stats.totalItems} items tracked</span>
              <span className="whitespace-nowrap">Total: {stats.totalConsumption}</span>
              <span className="whitespace-nowrap hidden sm:inline">Last sync: {lastSyncTime.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items List - Scrollable */}
      <div className={`flex-1 overflow-y-auto relative scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 ${
        isFullscreen 
          ? 'max-h-[calc(100vh-120px)]' 
          : 'max-h-[calc(100vh-300px)]'
      }`}>
        {/* Scroll fade indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none z-5"></div>
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="text-slate-500">
                <p>No items loaded</p>
                <p className="text-sm">Loading inventory data...</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`${isFullscreen ? 'p-8' : 'p-4'}`}>
            {/* Search Bar */}
            <div className={`mb-6 px-2 sm:px-0 ${isFullscreen ? 'max-w-2xl mx-auto' : ''}`}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`input-modern pl-10 ${
                    isFullscreen 
                      ? 'px-6 py-4 text-lg' 
                      : 'px-4 py-3 text-sm sm:text-base'
                  }`}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className={`pb-4 ${isFullscreen ? 'space-y-6 max-w-4xl mx-auto' : 'space-y-4'}`}>
              {/* Group items by category and filter by search */}
              {(() => {
                console.log('🔍 Window filtering - Selected categories:', selectedCategories)
                console.log('🔍 Window filtering - Total items:', items.length)
                console.log('🔍 Window filtering - Available categories in items:', [...new Set(items.map(i => i.category))])
                
                const filteredItems = items.filter(item => 
                  // Filter by selected categories
                  (selectedCategories.length === 0 || selectedCategories.includes(item.category)) &&
                  // Filter by search term
                  (searchTerm === '' || 
                   item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   item.category.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                
                console.log('🔍 Filtered items count:', filteredItems.length)
                return Object.entries(
                  filteredItems.reduce((acc, item) => {
                  if (!acc[item.category]) {
                    acc[item.category] = []
                  }
                  acc[item.category].push(item)
                  return acc
                  }, {} as Record<string, ConsumptionItem[]>)
                )
              })().map(([category, categoryItems]) => {
                const isCollapsed = collapsedCategories.has(category)
                const totalConsumption = categoryItems.reduce((sum, item) => sum + item.quantity, 0)
                
                return (
                  <div key={category} className={isFullscreen ? "space-y-3" : "space-y-2"}>
                    {/* Category Header - Clickable */}
                    <button
                      onClick={() => toggleCategoryCollapse(category)}
                      className={`w-full sticky top-0 bg-slate-100 rounded-lg shadow-sm z-10 border border-slate-200 hover:bg-slate-200 transition-colors ${
                        isFullscreen ? 'px-6 py-4' : 'px-3 py-2'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {isCollapsed ? (
                            <ChevronRight className={`text-slate-600 ${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                          ) : (
                            <ChevronDown className={`text-slate-600 ${isFullscreen ? 'w-5 h-5' : 'w-4 h-4'}`} />
                          )}
                          <h4 className={`font-medium text-slate-900 ${isFullscreen ? 'text-lg' : ''}`}>{category}</h4>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-600">
                          <span className="hidden sm:inline">
                            {categoryItems.length} items
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            totalConsumption > 0 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {totalConsumption} consumed
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Category Items - Only show if not collapsed */}
                    {!isCollapsed && (
                      <div className={isFullscreen ? "space-y-3" : "space-y-2"}>
                        {categoryItems.map((item) => (
                          <div
                            key={item.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors space-y-2 sm:space-y-0 ${
                              isFullscreen ? 'p-5' : 'p-3'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-slate-900 ${
                                isFullscreen ? 'text-lg' : 'text-sm sm:text-base'
                              }`}>{item.brand}</div>
                              <div className={`text-slate-600 ${
                                isFullscreen ? 'text-base' : 'text-xs sm:text-sm'
                              }`}>
                                {item.availableStock ? `${item.availableStock} available` : 'Available in stock'}
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                              {/* Consumption Quantity */}
                              <div className={`text-center ${isFullscreen ? 'min-w-[4rem]' : 'min-w-[3rem]'}`}>
                                <div className={`font-mono font-semibold text-slate-900 ${
                                  isFullscreen ? 'text-2xl' : 'text-lg'
                                }`}>
                                  {item.quantity}
                                </div>
                                <div className={`text-slate-500 ${
                                  isFullscreen ? 'text-sm' : 'text-xs'
                                }`}>
                                  consumed
                                </div>
                              </div>

                              {/* Quantity Controls */}
                              <QuantityControls
                                currentQuantity={item.quantity}
                                onQuantityChange={(newQuantity) => handleQuantityUpdate(item.id, newQuantity)}
                                disabled={isLoading}
                                compact={compact}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer with summary */}
      {!compact && stats.totalItems > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-slate-600">
              <span>Total Items: {stats.totalItems}</span>
              <span>With Consumption: {stats.itemsWithConsumption}</span>
              <span>Total Consumption: {stats.totalConsumption}</span>
            </div>
            
            {stats.topCategories.length > 0 && (
              <div className="text-slate-600">
                Top: {stats.topCategories[0][0]} ({stats.topCategories[0][1]})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}