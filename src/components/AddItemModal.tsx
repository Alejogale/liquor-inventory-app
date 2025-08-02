'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'

interface Supplier {
  id: number
  name: string
}

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: () => void
  categoryId: number | null
  categoryName: string
}

export default function AddItemModal({ isOpen, onClose, onItemAdded, categoryId, categoryName }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    brand: '',
    threshold: '',
    parLevel: '',
    barcode: '',
    supplierId: ''
  })
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({ brand: '', threshold: '', parLevel: '', barcode: '', supplierId: '' })
      fetchSuppliers()
    }
  }, [isOpen])

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('organization_id', 1)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.brand.trim() || !formData.threshold || !formData.parLevel) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert([
          {
            organization_id: 1,
            category_id: categoryId,
            brand: formData.brand.trim(),
            threshold: parseFloat(formData.threshold),
            par_level: parseFloat(formData.parLevel),
            barcode: formData.barcode.trim() || null,
            supplier_id: formData.supplierId ? parseInt(formData.supplierId) : null
          }
        ])

      if (error) throw error

      onItemAdded()
      onClose()
    } catch (error: any) {
      alert('Error adding item: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/20">
        <h2 className="text-xl font-bold text-white mb-2">Add Item to {categoryName}</h2>
        <p className="text-white/60 text-sm mb-4">Add a specific brand or product</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="e.g., Jack Daniel's, Grey Goose"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Supplier
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="">Select supplier (optional)</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-white/50 text-xs mt-1">No suppliers added yet. Add suppliers first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Threshold *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                placeholder="2"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                required
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Par Level *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.parLevel}
                onChange={(e) => setFormData({...formData, parLevel: e.target.value})}
                placeholder="6"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Barcode (optional)
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              placeholder="Scan or enter barcode"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
          </div>

          <div className="text-xs text-white/50 bg-white/5 p-3 rounded-lg">
            <strong>Threshold:</strong> Minimum bottles before reordering<br/>
            <strong>Par Level:</strong> Ideal number of bottles to stock<br/>
            <strong>Supplier:</strong> Who to order this item from
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.brand.trim() || !formData.threshold || !formData.parLevel}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
