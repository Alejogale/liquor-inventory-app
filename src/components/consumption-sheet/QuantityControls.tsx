'use client'

import { useState, useCallback } from 'react'
import { Plus, Minus } from 'lucide-react'

interface QuantityControlsProps {
  currentQuantity: number
  onQuantityChange: (newQuantity: number) => void
  disabled?: boolean
  compact?: boolean
  min?: number
  max?: number
  step?: number
}

export default function QuantityControls({
  currentQuantity,
  onQuantityChange,
  disabled = false,
  compact = false,
  min = 0,
  max = 9999,
  step = 1
}: QuantityControlsProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  // Handle increment
  const handleIncrement = useCallback(async () => {
    if (disabled || isUpdating || currentQuantity >= max) return
    
    setIsUpdating(true)
    try {
      const newQuantity = Math.min(currentQuantity + step, max)
      await onQuantityChange(newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }, [currentQuantity, onQuantityChange, disabled, isUpdating, max, step])

  // Handle decrement
  const handleDecrement = useCallback(async () => {
    if (disabled || isUpdating || currentQuantity <= min) return
    
    setIsUpdating(true)
    try {
      const newQuantity = Math.max(currentQuantity - step, min)
      await onQuantityChange(newQuantity)
    } finally {
      setIsUpdating(false)
    }
  }, [currentQuantity, onQuantityChange, disabled, isUpdating, min, step])

  // Handle direct input
  const handleDirectInput = useCallback(async (value: string) => {
    const numericValue = parseInt(value, 10)
    if (isNaN(numericValue)) return

    const clampedValue = Math.max(min, Math.min(max, numericValue))
    if (clampedValue !== currentQuantity) {
      setIsUpdating(true)
      try {
        await onQuantityChange(clampedValue)
      } finally {
        setIsUpdating(false)
      }
    }
  }, [currentQuantity, onQuantityChange, min, max])

  const buttonSize = compact ? 'w-8 h-8' : 'w-10 h-10'
  const iconSize = compact ? 'w-3 h-3' : 'w-4 h-4'
  const inputSize = compact ? 'w-12 h-8 text-sm' : 'w-16 h-10 text-base'

  return (
    <div className="flex items-center space-x-1">
      {/* Decrement Button */}
      <button
        onClick={handleDecrement}
        disabled={disabled || isUpdating || currentQuantity <= min}
        className={`${buttonSize} flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        title="Decrease quantity"
      >
        <Minus className={iconSize} />
      </button>

      {/* Quantity Display/Input */}
      <div className="relative">
        <input
          type="number"
          value={currentQuantity}
          onChange={(e) => handleDirectInput(e.target.value)}
          disabled={disabled || isUpdating}
          min={min}
          max={max}
          step={step}
          className={`${inputSize} text-center font-mono font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        />
        
        {/* Loading Overlay */}
        {isUpdating && (
          <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
            <div className="w-3 h-3 border border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Increment Button */}
      <button
        onClick={handleIncrement}
        disabled={disabled || isUpdating || currentQuantity >= max}
        className={`${buttonSize} flex items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
        title="Increase quantity"
      >
        <Plus className={iconSize} />
      </button>
    </div>
  )
}