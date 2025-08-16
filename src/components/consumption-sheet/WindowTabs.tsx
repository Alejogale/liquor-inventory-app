'use client'

import { useState } from 'react'
import { X, MoreHorizontal, Activity, Clock } from 'lucide-react'
import { ConsumptionWindow } from '@/types/consumption-sheet'

interface WindowTabsProps {
  windows: ConsumptionWindow[]
  activeWindowId: string | null
  onWindowSelect: (windowId: string) => void
  onWindowClose: (windowId: string) => void
  getWindowStats: (window: ConsumptionWindow) => {
    totalItems: number
    itemsWithConsumption: number
    totalConsumption: number
    completionRate: number
  }
}

export default function WindowTabs({
  windows,
  activeWindowId,
  onWindowSelect,
  onWindowClose,
  getWindowStats
}: WindowTabsProps) {
  const [hoveredTabId, setHoveredTabId] = useState<string | null>(null)

  // Handle tab close with event prevention
  const handleTabClose = (e: React.MouseEvent, windowId: string) => {
    e.stopPropagation()
    onWindowClose(windowId)
  }

  if (windows.length === 0) {
    return null
  }

  return (
    <div className="flex items-center space-x-1 overflow-x-auto">
      {windows.map((window) => {
        const isActive = window.id === activeWindowId
        const isHovered = hoveredTabId === window.id
        const stats = getWindowStats(window)
        
        return (
          <div
            key={window.id}
            className={`relative flex items-center min-w-0 px-4 py-2 cursor-pointer transition-all duration-200 rounded-lg group ${
              isActive
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            onClick={() => onWindowSelect(window.id)}
            onMouseEnter={() => setHoveredTabId(window.id)}
            onMouseLeave={() => setHoveredTabId(null)}
          >
            {/* Tab Content */}
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              {/* Activity Indicator */}
              <div className="flex-shrink-0">
                <div className={`w-2 h-2 rounded-full ${
                  stats.itemsWithConsumption > 0 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-white/60' 
                      : 'bg-slate-400'
                }`} />
              </div>

              {/* Event Name */}
              <div className="min-w-0 flex-1">
                <div className={`font-medium text-sm truncate ${
                  isActive ? 'text-white' : 'text-slate-900'
                }`}>
                  {window.eventName}
                </div>
                
                {/* Stats - shown on hover or when active */}
                {(isHovered || isActive) && (
                  <div className={`text-xs mt-1 flex items-center space-x-2 ${
                    isActive ? 'text-white/80' : 'text-slate-600'
                  }`}>
                    <span className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span>{stats.itemsWithConsumption}/{stats.totalItems}</span>
                    </span>
                    <span>•</span>
                    <span>Total: {stats.totalConsumption}</span>
                    <span>•</span>
                    <span>{Math.round(stats.completionRate)}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={(e) => handleTabClose(e, window.id)}
              className={`flex-shrink-0 p-1 rounded-md transition-colors ml-2 ${
                isActive
                  ? 'hover:bg-white/20 text-white/80 hover:text-white'
                  : 'hover:bg-slate-300 text-slate-500 hover:text-slate-700'
              } group-hover:opacity-100 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
              title="Close window"
            >
              <X className="w-3 h-3" />
            </button>

            {/* Window Status Indicator */}
            <div className="absolute -top-1 -right-1">
              {window.sheetConnection.isConnected ? (
                <div className="w-2 h-2 bg-green-500 rounded-full border border-white shadow-sm" 
                     title="Connected to Google Sheets" />
              ) : (
                <div className="w-2 h-2 bg-yellow-500 rounded-full border border-white shadow-sm" 
                     title="Connecting..." />
              )}
            </div>

            {/* Progress Bar */}
            {stats.totalItems > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-b-lg overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    isActive ? 'bg-white' : 'bg-slate-900'
                  }`}
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Tab Overflow Indicator */}
      {windows.length >= 3 && (
        <div className="flex-shrink-0 text-slate-500">
          <MoreHorizontal className="w-4 h-4" />
        </div>
      )}

      {/* New Tab Button */}
      {windows.length < 3 && (
        <button
          className="flex-shrink-0 p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Add new window"
        >
          <div className="w-4 h-4 border-2 border-dashed border-current rounded" />
        </button>
      )}
    </div>
  )
}