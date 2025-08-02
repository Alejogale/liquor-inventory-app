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
  size: string
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
}

export default function EditItemModal({ item, categories, suppliers, onClose, onItemUpdated }: EditItemModalProps) {
  const [formData, setFormData] = useState({
    brand: item.brand || '',
    size: item.size || '',
    category_id: item.category_id || '',
    supplier_id: item.supplier_id || '',
    threshold: item.threshold?.toString() || '',
    par_level: item.par_level?.toString() || '',
    barcode: item.barcode || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.brand.trim() || !formData.category_id) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          brand: formData.brand.trim(),
          size: formData.size.trim(),
          category_id: formData.category_id,
          supplier_id: formData.supplier_id || null,
          threshold: formData.threshold ? parseInt(formData.threshold) : 0,
          par_level: formData.par_level ? parseInt(formData.par_level) : 0,
          barcode: formData.barcode.trim() || null
        })
        .eq('id', item.id)

      if (error) throw error

      onItemUpdated()
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-white mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g., Jack Daniel's"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="size" className="block text-sm font-medium text-white mb-2">
              Size
            </label>
            <input
              type="text"
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g., 750ml, 1L"
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-white mb-2">
            Category *
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label htmlFor="supplier_id" className="block text-sm font-medium text-white mb-2">
            Supplier
          </label>
          <select
            id="supplier_id"
            name="supplier_id"
            value={formData.supplier_id}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id} className="bg-gray-800">
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-white mb-2">
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
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="par_level" className="block text-sm font-medium text-white mb-2">
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
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="barcode" className="block text-sm font-medium text-white mb-2">
            Barcode
          </label>
          <input
            type="text"
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Scan or enter barcode"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
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
