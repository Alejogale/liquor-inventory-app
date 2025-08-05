'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from './Modal'

interface Category {
  id: string
  name: string
}

interface Supplier {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  brand: string
  category_id: string
  supplier_id: string
  threshold: number
  par_level: number
  barcode?: string
}

interface EditItemModalProps {
  item: InventoryItem
  categories: Category[]
  suppliers: Supplier[]
  onClose: () => void
  onItemUpdated: () => void
  organizationId?: string  // Add this prop
}

export default function EditItemModal({ item, categories, suppliers, onClose, onItemUpdated, organizationId }: EditItemModalProps) {
  console.log('🔍 EditItemModal received item:', item)
  console.log('🔍 Item ID type:', typeof item.id, 'Value:', item.id)
  const [formData, setFormData] = useState({
    brand: item.brand || '',
    category_id: item.category_id || '',
    supplier_id: item.supplier_id || '',
    threshold: item.threshold?.toString() || '',
    par_level: item.par_level?.toString() || '',
    barcode: item.barcode || ''
  })
  const [loading, setLoading] = useState(false)

  // Add helper function to get current organization
  const getCurrentOrganization = async () => {
    if (organizationId) return organizationId

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      return profile?.organization_id || null
    } catch (error) {
      console.error('Error getting organization:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.brand.trim() || !formData.category_id) return

    setLoading(true)
    try {
      // Simplified approach - just update the item directly (removed size field)
      const updateData = {
        brand: formData.brand.trim(),
        category_id: formData.category_id,
        supplier_id: formData.supplier_id || null,
        threshold: formData.threshold ? parseInt(formData.threshold) : 0,
        par_level: formData.par_level ? parseInt(formData.par_level) : 0,
        barcode: formData.barcode.trim() || null
      }

      console.log('🔄 Updating item:', item.id)
      console.log('🔄 Update data:', JSON.stringify(updateData, null, 2))

      // Try a simpler approach - use update without select
      const { error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', item.id)

      if (error) {
        console.error('❌ Update error:', error)
        throw error
      }

      console.log('✅ Item updated successfully')

      onItemUpdated()
      onClose() // Make sure modal closes after successful update
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Error updating item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Inventory Item" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-slate-700 mb-2">
            Brand Name *
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Jack Daniel's"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-slate-700 mb-2">
            Category *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="supplier_id" className="block text-sm font-medium text-slate-700 mb-2">
            Supplier
          </label>
          <select
            id="supplier_id"
            name="supplier_id"
            value={formData.supplier_id}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-slate-700 mb-2">
              Low Stock Alert
            </label>
            <input
              type="number"
              id="threshold"
              name="threshold"
              value={formData.threshold}
              onChange={handleChange}
              placeholder="5"
              min="0"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="par_level" className="block text-sm font-medium text-slate-700 mb-2">
              Target Stock
            </label>
            <input
              type="number"
              id="par_level"
              name="par_level"
              value={formData.par_level}
              onChange={handleChange}
              placeholder="10"
              min="0"
              className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-slate-700 mb-2">
            Barcode
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Scan or enter barcode"
            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.brand.trim() || !formData.category_id}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update Item'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
