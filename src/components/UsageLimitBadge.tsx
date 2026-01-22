'use client'

import { AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

interface UsageLimitBadgeProps {
  current: number
  limit: number
  label: string
  showProgressBar?: boolean
  className?: string
}

export default function UsageLimitBadge({
  current,
  limit,
  label,
  showProgressBar = false,
  className = ''
}: UsageLimitBadgeProps) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : Math.round((current / limit) * 100)
  const isNearLimit = percentage >= 75 && percentage < 90
  const isAtLimit = percentage >= 90

  const getColor = () => {
    if (isUnlimited) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (isAtLimit) return 'text-red-600 bg-red-50 border-red-200'
    if (isNearLimit) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  const getIcon = () => {
    if (isUnlimited) return <CheckCircle className="h-4 w-4" />
    if (isAtLimit) return <AlertTriangle className="h-4 w-4" />
    if (isNearLimit) return <TrendingUp className="h-4 w-4" />
    return <CheckCircle className="h-4 w-4" />
  }

  const getProgressBarColor = () => {
    if (isAtLimit) return 'bg-red-500'
    if (isNearLimit) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${getColor()}`}>
        {getIcon()}
        <span>
          {label}: {current}/{isUnlimited ? '∞' : limit}
        </span>
        {!isUnlimited && (
          <span className="text-xs opacity-75">
            ({percentage}%)
          </span>
        )}
      </div>

      {showProgressBar && !isUnlimited && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
