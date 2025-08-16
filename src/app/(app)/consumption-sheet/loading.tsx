export default function ConsumptionSheetLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          {/* Loading Spinner */}
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
          
          {/* Loading Text */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900">Loading Consumption Sheet</h2>
            <p className="text-slate-600">Connecting to Google Sheets and initializing tracking system...</p>
          </div>

          {/* Loading Steps */}
          <div className="mt-8 space-y-2 text-sm text-slate-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
              <span>Authenticating with organization</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <span>Loading configuration</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              <span>Initializing tracking windows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}