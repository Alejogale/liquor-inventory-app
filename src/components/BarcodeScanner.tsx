'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'

interface InventoryItem {
  id: number
  brand: string
  category_name: string
  barcode?: string
  threshold: number
  par_level: number
}

interface BarcodeScannerProps {
  onItemFound: (item: InventoryItem) => void
  onClose: () => void
}

export default function BarcodeScanner({ onItemFound, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualBarcode, setManualBarcode] = useState('')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetchItems()
    return () => {
      stopCamera()
    }
  }, [])

  const fetchItems = async () => {
    try {
      // Get inventory items with categories
      const { data: itemsData, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, brand, category_id, barcode, threshold, par_level')
        .eq('organization_id', 1)

      if (itemsError) throw itemsError

      // Get categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', 1)

      if (categoriesError) throw categoriesError

      // Combine data
      const itemsWithCategories = itemsData?.map(item => {
        const category = categoriesData?.find(c => c.id === item.category_id)
        return {
          ...item,
          category_name: category?.name || 'Unknown'
        }
      }) || []

      setItems(itemsWithCategories)
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setIsScanning(true)
    } catch (error) {
      console.error('Error starting camera:', error)
      alert('Unable to access camera. Please check permissions.')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const searchByBarcode = (barcode: string) => {
    const found = items.filter(item => 
      item.barcode && item.barcode.includes(barcode)
    )
    setSearchResults(found)
    
    if (found.length === 1) {
      onItemFound(found[0])
      onClose()
    }
  }

  const searchByName = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    
    const found = items.filter(item =>
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setSearchResults(found)
  }

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      searchByBarcode(manualBarcode.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex flex-col z-50">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">📱 Barcode Scanner</h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4">
        {/* Camera Section */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">📷 Camera Scan</h3>
          
          {!isScanning ? (
            <div className="text-center">
              <button
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Start Camera
              </button>
              <p className="text-white/60 text-sm mt-2">Point camera at barcode</p>
            </div>
          ) : (
            <div className="relative">
              <video 
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded-lg"
                autoPlay 
                playsInline 
                muted
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-red-500 w-64 h-16 rounded-lg"></div>
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={stopCamera}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  Stop Camera
                </button>
                <p className="text-white/60 text-sm mt-2">Align barcode within the red box</p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">⌨️ Manual Entry</h3>
          
          <form onSubmit={handleManualBarcodeSubmit} className="space-y-3">
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => {
                setManualBarcode(e.target.value)
                searchByBarcode(e.target.value)
              }}
              placeholder="Scan or type barcode..."
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg font-semibold"
            >
              Search by Barcode
            </button>
          </form>
        </div>

        {/* Text Search */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">🔍 Search by Name</h3>
          
          <input
            type="text"
            onChange={(e) => searchByName(e.target.value)}
            placeholder="Search brand or category..."
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
          />
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white/10 rounded-xl p-4 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">
              📦 Found {searchResults.length} item(s)
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {searchResults.map(item => (
                <div 
                  key={item.id}
                  onClick={() => {
                    onItemFound(item)
                    onClose()
                  }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white">{item.brand}</h4>
                      <p className="text-white/60 text-sm">{item.category_name}</p>
                      {item.barcode && (
                        <p className="text-green-400 text-xs font-mono">{item.barcode}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-white/60">Threshold: {item.threshold}</div>
                      <div className="text-white/60">Par: {item.par_level}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Items List */}
        <div className="bg-white/10 rounded-xl p-4 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">
            📋 All Items ({items.length})
          </h3>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  onItemFound(item)
                  onClose()
                }}
                className="bg-white/5 rounded p-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-white font-medium">{item.brand}</span>
                    <span className="text-white/60 text-sm ml-2">({item.category_name})</span>
                  </div>
                  {item.barcode && (
                    <span className="text-green-400 text-xs font-mono">{item.barcode}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
