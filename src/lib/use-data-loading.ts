import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './auth-context'

interface UseDataLoadingOptions {
  enabled?: boolean
  retryCount?: number
  retryDelay?: number
  dependencies?: any[]
}

export function useDataLoading<T>(
  fetchFunction: () => Promise<T>,
  options: UseDataLoadingOptions = {}
) {
  const { ready, organization } = useAuth()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const {
    enabled = true,
    retryCount: maxRetries = 3,
    retryDelay = 1000,
    dependencies = []
  } = options

  const fetchData = useCallback(async () => {
    if (!enabled || !ready) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching data...', { ready, organizationId: organization?.id })
      
      const result = await fetchFunction()
      setData(result)
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error('❌ Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying... (${retryCount + 1}/${maxRetries})`)
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, retryDelay)
      }
    } finally {
      setLoading(false)
    }
  }, [enabled, ready, organization?.id, fetchFunction, retryCount, maxRetries, retryDelay, ...dependencies])

  // Auto-fetch when ready state changes
  useEffect(() => {
    if (ready && enabled) {
      fetchData()
    }
  }, [ready, enabled, ...dependencies])

  // Retry when retry count changes
  useEffect(() => {
    if (retryCount > 0 && retryCount <= maxRetries) {
      fetchData()
    }
  }, [retryCount])

  const refetch = useCallback(() => {
    setRetryCount(0)
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    retryCount
  }
}

// Hook for components that need organization context
export function useOrganizationData<T>(
  fetchFunction: (organizationId: string) => Promise<T>,
  options: UseDataLoadingOptions = {}
) {
  const { ready, organization } = useAuth()
  
  const fetchWithOrg = useCallback(async () => {
    if (!organization?.id) {
      throw new Error('No organization ID available')
    }
    return await fetchFunction(organization.id)
  }, [organization?.id, fetchFunction])

  return useDataLoading(fetchWithOrg, {
    ...options,
    enabled: options.enabled !== false && !!organization?.id,
    dependencies: [organization?.id, ...(options.dependencies || [])]
  })
}
