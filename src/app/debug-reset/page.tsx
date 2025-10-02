'use client'

import { useEffect, useState } from 'react'

export default function DebugResetPage() {
  const [urlInfo, setUrlInfo] = useState<any>({})

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fullUrl = window.location.href
      const hash = window.location.hash
      const search = window.location.search
      const pathname = window.location.pathname
      
      // Parse hash parameters
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashParamsObj: any = {}
      hashParams.forEach((value, key) => {
        hashParamsObj[key] = value
      })
      
      // Parse search parameters
      const urlParams = new URLSearchParams(window.location.search)
      const urlParamsObj: any = {}
      urlParams.forEach((value, key) => {
        urlParamsObj[key] = value
      })
      
      setUrlInfo({
        fullUrl,
        hash,
        search,
        pathname,
        hashParams: hashParamsObj,
        urlParams: urlParamsObj,
        timestamp: new Date().toISOString()
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Password Reset Debug Info</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">URL Information</h2>
          <pre className="bg-slate-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(urlInfo, null, 2)}
          </pre>
          
          <div className="mt-6 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
            <p className="text-blue-800 text-sm">
              Click the reset password link from your email and replace the URL path with `/debug-reset` 
              to see exactly what parameters are being passed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}