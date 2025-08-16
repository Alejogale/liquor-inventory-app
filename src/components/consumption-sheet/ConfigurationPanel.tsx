'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Settings, Save, X, AlertCircle, Check, Tag, Package } from 'lucide-react'
import { WindowConfig } from '@/types/consumption-sheet'
import { GoogleAppsScriptAPI } from '@/types/consumption-sheet'

interface ConfigurationPanelProps {
  windowId: string
  config: WindowConfig
  onConfigChange: (config: WindowConfig) => void
  googleApiClient: GoogleAppsScriptAPI
}

export default function ConfigurationPanel({
  windowId,
  config,
  onConfigChange,
  googleApiClient
}: ConfigurationPanelProps) {
  // State
  const [activeTab, setActiveTab] = useState<'categories' | 'brands' | 'sheets'>('categories')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newBrandName, setNewBrandName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Load initial configuration
  useEffect(() => {
    if (config.categories.length === 0) {
      loadConfiguration()
    }
  }, [])

  // Load configuration from Google Sheets
  const loadConfiguration = useCallback(async () => {
    setIsLoading(true)
    try {
      const categories = await googleApiClient.getCategories()
      const brands: Record<string, string[]> = {}
      
      for (const category of categories) {
        brands[category] = await googleApiClient.getBrands(category)
      }

      onConfigChange({
        ...config,
        categories,
        brands
      })
    } catch (err) {
      console.error('Failed to load configuration:', err)
      setError(err instanceof Error ? err.message : 'Failed to load configuration')
    } finally {
      setIsLoading(false)
    }
  }, [config, googleApiClient, onConfigChange])

  // Add category
  const addCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return

    const categoryName = newCategoryName.trim()
    
    // Check for duplicates
    if (config.categories.includes(categoryName)) {
      setError('Category already exists')
      return
    }

    setIsLoading(true)
    try {
      await googleApiClient.addCategory(categoryName)
      
      const updatedConfig = {
        ...config,
        categories: [...config.categories, categoryName],
        brands: {
          ...config.brands,
          [categoryName]: []
        }
      }
      
      onConfigChange(updatedConfig)
      setNewCategoryName('')
      setSuccess(`Added category: ${categoryName}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to add category:', err)
      setError(err instanceof Error ? err.message : 'Failed to add category')
    } finally {
      setIsLoading(false)
    }
  }, [newCategoryName, config, googleApiClient, onConfigChange])

  // Delete category
  const deleteCategory = useCallback(async (categoryName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the category "${categoryName}" and all its brands?`
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await googleApiClient.deleteCategory(categoryName)
      
      const updatedBrands = { ...config.brands }
      delete updatedBrands[categoryName]
      
      const updatedConfig = {
        ...config,
        categories: config.categories.filter(cat => cat !== categoryName),
        brands: updatedBrands
      }
      
      onConfigChange(updatedConfig)
      setSuccess(`Deleted category: ${categoryName}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to delete category:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete category')
    } finally {
      setIsLoading(false)
    }
  }, [config, googleApiClient, onConfigChange])

  // Add brand
  const addBrand = useCallback(async () => {
    if (!newBrandName.trim() || !selectedCategory) return

    const brandName = newBrandName.trim()
    const categoryBrands = config.brands[selectedCategory] || []
    
    // Check for duplicates
    if (categoryBrands.includes(brandName)) {
      setError('Brand already exists in this category')
      return
    }

    setIsLoading(true)
    try {
      await googleApiClient.addBrand(selectedCategory, brandName)
      
      const updatedConfig = {
        ...config,
        brands: {
          ...config.brands,
          [selectedCategory]: [...categoryBrands, brandName]
        }
      }
      
      onConfigChange(updatedConfig)
      setNewBrandName('')
      setSuccess(`Added brand: ${brandName} to ${selectedCategory}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to add brand:', err)
      setError(err instanceof Error ? err.message : 'Failed to add brand')
    } finally {
      setIsLoading(false)
    }
  }, [newBrandName, selectedCategory, config, googleApiClient, onConfigChange])

  // Delete brand
  const deleteBrand = useCallback(async (categoryName: string, brandName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the brand "${brandName}" from ${categoryName}?`
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      await googleApiClient.deleteBrand(categoryName, brandName)
      
      const updatedConfig = {
        ...config,
        brands: {
          ...config.brands,
          [categoryName]: config.brands[categoryName].filter(brand => brand !== brandName)
        }
      }
      
      onConfigChange(updatedConfig)
      setSuccess(`Deleted brand: ${brandName}`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Failed to delete brand:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete brand')
    } finally {
      setIsLoading(false)
    }
  }, [config, googleApiClient, onConfigChange])

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Configuration Panel</h2>
        <p className="text-slate-600">
          Manage categories and brands for consumption tracking. Changes will affect all new consumption sheets.
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4" />
              <span>Categories ({config.categories.length})</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('brands')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'brands'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>Brands ({Object.values(config.brands).flat().length})</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sheets'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Sheet Settings</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add Category */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add New Category</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g., Wine, Beer, Spirits"
                className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCategoryName.trim() && !isLoading) {
                    addCategory()
                  }
                }}
              />
              <button
                onClick={addCategory}
                disabled={!newCategoryName.trim() || isLoading}
                className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Current Categories</h3>
            
            {config.categories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-secondary">No categories configured</p>
                <button
                  onClick={loadConfiguration}
                  className="mt-2 text-slate-600 hover:text-slate-900 font-medium"
                >
                  Load from Google Sheets
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {config.categories.map((category) => (
                  <div key={category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <div className="font-medium text-slate-900">{category}</div>
                      <div className="text-sm text-slate-500">
                        {config.brands[category]?.length || 0} brands
                      </div>
                    </div>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                      title={`Delete ${category}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'brands' && (
        <div className="space-y-6">
          {/* Add Brand */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Add New Brand</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                >
                  <option value="">Choose a category...</option>
                  {config.categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="e.g., Grey Goose, Macallan 18"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newBrandName.trim() && selectedCategory && !isLoading) {
                      addBrand()
                    }
                  }}
                />
                <button
                  onClick={addBrand}
                  disabled={!newBrandName.trim() || !selectedCategory || isLoading}
                  className="px-6 py-3 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Brand</span>
                </button>
              </div>
            </div>
          </div>

          {/* Brands by Category */}
          <div className="space-y-6">
            {config.categories.map((category) => (
              <div key={category} className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">
                  {category} ({config.brands[category]?.length || 0} brands)
                </h3>
                
                {!config.brands[category] || config.brands[category].length === 0 ? (
                  <p className="text-slate-500 text-sm">No brands in this category</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {config.brands[category].map((brand) => (
                      <div key={brand} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-900">{brand}</span>
                        <button
                          onClick={() => deleteBrand(category, brand)}
                          className="p-1 text-slate-500 hover:text-red-600 rounded transition-colors"
                          title={`Delete ${brand}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Sheet Configuration */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Google Sheets Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sheet Name
                  </label>
                  <input
                    type="text"
                    value={config.sheetSettings.sheetName}
                    onChange={(e) => onConfigChange({
                      ...config,
                      sheetSettings: {
                        ...config.sheetSettings,
                        sheetName: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Range
                  </label>
                  <input
                    type="text"
                    value={config.sheetSettings.dataRange}
                    onChange={(e) => onConfigChange({
                      ...config,
                      sheetSettings: {
                        ...config.sheetSettings,
                        dataRange: e.target.value
                      }
                    })}
                    placeholder="A:D"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Configuration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-slate-900">Categories</div>
                <div className="text-slate-600">{config.categories.length} configured</div>
              </div>
              <div>
                <div className="font-medium text-slate-900">Brands</div>
                <div className="text-slate-600">{Object.values(config.brands).flat().length} total</div>
              </div>
              <div>
                <div className="font-medium text-slate-900">Manager Emails</div>
                <div className="text-slate-600">{config.emailSettings.managerEmails.length} configured</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              <span>Updating configuration...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}