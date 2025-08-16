'use client'

import { useAuth } from '@/lib/auth-context'
import { useState, useEffect } from 'react'
import ConsumptionSidebar from '@/components/consumption-sheet/ConsumptionSidebar'
import ConsumptionTracker from '@/components/consumption-sheet/ConsumptionTracker'
import { Clock, Activity, TrendingUp, Users } from 'lucide-react'

export default function ConsumptionSheetPage() {
  const { user, userProfile, organization } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeView, setActiveView] = useState<'tracking' | 'configuration' | 'emails' | 'reports' | 'analytics'>('tracking')
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Get the correct organization ID
  const organizationId = organization?.id || (user?.email === 'alejogaleis@gmail.com' ? '34bf8aa4-1c0d-4c5b-a12d-b2d483d2c2f0' : null)

  // Load categories when organization is available
  useEffect(() => {
    const loadCategories = async () => {
      if (organizationId) {
        try {
          // Import the inventory service dynamically to avoid import issues
          const { default: InventoryService } = await import('@/lib/consumption-sheet/inventory-service')
          const inventoryService = new InventoryService(organizationId)
          const categories = await inventoryService.getCategories()
          console.log('🏷️ Categories loaded in page:', categories)
          setAvailableCategories(categories)
          setSelectedCategories(categories) // Select all by default
          console.log('🎯 Selected categories set to:', categories)
        } catch (error) {
          console.error('Failed to load categories:', error)
          // Use default categories
          const defaultCategories = ['Wine', 'Beer', 'Spirits', 'Cocktails', 'Non-Alcoholic']
          setAvailableCategories(defaultCategories)
          setSelectedCategories(defaultCategories)
        }
      }
    }
    
    loadCategories()
  }, [organizationId])

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  useEffect(() => {
    console.log('🔍 Authentication Debug:')
    console.log('  User:', user?.email || 'Not logged in')
    console.log('  Organization:', organization?.Name || 'No organization')
    console.log('  Organization ID:', organizationId || 'NULL')
    console.log('  User Profile:', userProfile?.id || 'No profile')
    
    // Initialize consumption sheet system
    if (user) {
      // Allow loading even without organization for debugging
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [user, organizationId, organization, userProfile])

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold text-slate-900">Authentication Required</div>
          <p className="text-slate-600">Please sign in to access the consumption tracking system.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-slate-900">Initializing Consumption Sheet</h2>
              <p className="text-slate-600">Setting up your tracking environment...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex"
         style={{
           background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
         }}>
      {/* Consumption Sidebar */}
      <ConsumptionSidebar
        userEmail={user?.email || 'guest@example.com'}
        onSignOut={() => {
          // Handle sign out - you may want to implement actual sign out logic
          window.location.href = '/login'
        }}
        activeView={activeView}
        onViewChange={setActiveView}
        organizationName={organization?.Name || 'Organization'}
        isCollapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
        {/* Glassmorphic Header */}
        <header className="backdrop-blur-xl border-b border-white/20 px-6 py-6 sticky top-0 z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1)'
                }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Consumption Sheet</h1>
              <p className="text-slate-600">Track event consumption with multi-window support and automated reporting</p>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-full"
                   style={{
                     background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                     border: '1px solid rgba(34, 197, 94, 0.2)'
                   }}>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">Live</span>
              </div>
              <div className="text-sm text-slate-600 px-3 py-1 rounded-full bg-white/50">
                <span className="font-medium">{organization?.Name || 'Organization'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Welcome Section with Feature Cards */}
        <div className="px-6 py-6">
          <div className="rounded-2xl p-6 mb-6 border border-white/20 backdrop-blur-xl shadow-lg"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1)'
               }}>
            <div className="max-w-4xl">
              <h2 className="text-xl font-bold text-slate-900 mb-3">
                Multi-Window Consumption Tracking
              </h2>
              <p className="text-slate-600 mb-6">
                Track liquor and beverage consumption for multiple events simultaneously with real-time updates and automated reporting.
              </p>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 rounded-xl"
                     style={{
                       background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                       border: '1px solid rgba(59, 130, 246, 0.2)'
                     }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                       }}>
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Real-time Tracking</div>
                    <div className="text-slate-600 text-xs">Live quantity updates</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-xl"
                     style={{
                       background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)',
                       border: '1px solid rgba(34, 197, 94, 0.2)'
                     }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                       }}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Multi-Window</div>
                    <div className="text-slate-600 text-xs">Track 3 events at once</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 rounded-xl"
                     style={{
                       background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
                       border: '1px solid rgba(147, 51, 234, 0.2)'
                     }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
                       style={{
                         background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
                       }}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Auto Reports</div>
                    <div className="text-slate-600 text-xs">Automated email reports</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Content Based on Active View */}
          <div className="rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg overflow-hidden"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,247,237,0.8) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
                 boxShadow: '0 8px 32px rgba(255, 119, 0, 0.1)'
               }}>
            {activeView === 'tracking' && organizationId && (
              <ConsumptionTracker
                organizationId={organizationId}
                userId={user.id}
                selectedCategories={selectedCategories}
              />
            )}
            
            {activeView === 'analytics' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Consumption Analytics</h2>
                <p className="text-slate-600">Advanced analytics and reporting coming soon...</p>
              </div>
            )}
            
            {activeView === 'configuration' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Categories & Brands</h2>
                <p className="text-slate-600 mb-8">Configure categories and brands from your inventory...</p>
                
                {/* Category Selection */}
                <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Categories to Track</h3>
                  <p className="text-slate-600 mb-6">Choose which categories to display in your consumption tracking sheets.</p>
                  
                  {availableCategories.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {availableCategories.map((category) => {
                          const isSelected = selectedCategories.includes(category)
                          return (
                            <button
                              key={category}
                              onClick={() => handleCategoryToggle(category)}
                              className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all ${
                                isSelected 
                                  ? 'border-slate-900 bg-slate-900 text-white' 
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected 
                                  ? 'bg-white border-white' 
                                  : 'border-slate-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{category}</span>
                            </button>
                          )
                        })}
                      </div>
                      
                      <div className="flex space-x-4">
                        <button
                          onClick={() => availableCategories.forEach(cat => {
                            if (!selectedCategories.includes(cat)) {
                              handleCategoryToggle(cat)
                            }
                          })}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => selectedCategories.forEach(cat => handleCategoryToggle(cat))}
                          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Clear All
                        </button>
                        <div className="flex-1"></div>
                        <span className="text-sm text-slate-600 py-2">
                          {selectedCategories.length} of {availableCategories.length} categories selected
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500">Loading categories...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeView === 'emails' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Manager Emails</h2>
                <p className="text-slate-600">Configure email recipients for consumption reports...</p>
              </div>
            )}
            
            {activeView === 'reports' && (
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Consumption Reports</h2>
                <p className="text-slate-600">Generate and view consumption reports...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}