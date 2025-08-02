'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

interface AddItemModalProps {
  categories: Category[]
  suppliers: Supplier[]
  onClose: () => void
  onItemAdded: () => void
}

export default function AddItemModal({
  categories,
  suppliers,
  onClose,
  onItemAdded
}: AddItemModalProps) {
  const [formData, setFormData] = useState({
    brand: '',
    threshold: 0,
    par_level: 0,
    barcode: '',
    category_id: '',
    supplier_id: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      console.log('🔄 Adding new item with data:', formData)

      // Validate required fields
      if (!formData.brand.trim()) {
        throw new Error('Brand name is required')
      }
      if (!formData.category_id) {
        throw new Error('Category is required')
      }
      if (!formData.supplier_id) {
        throw new Error('Supplier is required')
      }

      // Prepare data for insertion - NO SIZE FIELD
      const insertData = {
        brand: formData.brand.trim(),
        threshold: parseInt(formData.threshold.toString()) || 0,
        par_level: parseInt(formData.par_level.toString()) || 0,
        barcode: formData.barcode.trim() || null, // null if empty
        category_id: formData.category_id,
        supplier_id: formData.supplier_id,
        organization_id: 1 // Add required organization_id
      }

      console.log('📝 Inserting data:', insertData)

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([insertData])
        .select()

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      console.log('✅ Item added successfully:', data)
      onItemAdded()
      onClose()

    } catch (error: any) {
      console.error('💥 Error adding item:', error)
      setError(error.message || 'Failed to add item')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Add New Item</h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Jack Daniel's"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Category *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-gray-800">
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Supplier *
            </label>
            <select
              value={formData.supplier_id}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier_id: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id} className="bg-gray-800">
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Alert Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Target Level
              </label>
              <input
                type="number"
                min="0"
                value={formData.par_level}
                onChange={(e) => setFormData(prev => ({ ...prev, par_level: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Barcode (Optional)
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456789012"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2" />
                  Adding...
                </div>
              ) : (
                'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
