'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'

interface Supplier {
  id: string
  name: string
}

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onItemAdded: () => void
  categoryId: string | null
  categoryName: string
  organizationId?: string
}

export default function AddItemModal({ isOpen, onClose, onItemAdded, categoryId, categoryName, organizationId }: AddItemModalProps) {
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
      // Use organizationId prop if available, otherwise fetch from database
      let currentOrg = organizationId;
      if (!currentOrg) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();

        currentOrg = profile?.organization_id;
      }

      if (!currentOrg) {
        console.error('No organization found for suppliers');
        return;
      }

      const { data, error } = await supabase
        .from('suppliers')
        .select('id, name')
        .eq('organization_id', currentOrg)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  // Add activity logging function
  const logActivity = async (actionType: string, itemId?: string, details?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) return;

      await supabase.from('activity_logs').insert({
        action_type: actionType,
        user_id: user.id,
        organization_id: profile.organization_id,
        item_id: itemId,
        details: details,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.brand.trim() || !formData.threshold || !formData.parLevel) return

    setLoading(true)
    try {
      // Get current organization from auth context
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user profile to find organization
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()

      if (!profile?.organization_id) {
        alert('No organization found for user')
        return
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([
          {
            organization_id: profile.organization_id,
            category_id: categoryId,
            brand: formData.brand.trim(),
            threshold: parseFloat(formData.threshold),
            par_level: parseFloat(formData.parLevel),
            barcode: formData.barcode.trim() || null,
            supplier_id: formData.supplierId || null
          }
        ])
        .select()

      if (error) throw error

      // Log the activity
      await logActivity('item_added', data[0]?.id, `Added ${formData.brand.trim()} to ${categoryName}`)

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
      <div className="bg-white rounded-2xl p-6 w-full max-w-md border border-blue-200 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Add Item to {categoryName}</h2>
        <p className="text-slate-600 text-sm mb-4">Add a specific brand or product</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Brand Name *
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({...formData, brand: e.target.value})}
              placeholder="e.g., Jack Daniel's, Grey Goose"
              className="w-full p-3 rounded-lg bg-white border border-blue-200 text-slate-800 placeholder-slate-400"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Supplier
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
              className="w-full p-3 rounded-lg bg-white border border-blue-200 text-slate-800"
            >
              <option value="">Select supplier (optional)</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
            {suppliers.length === 0 && (
              <p className="text-slate-500 text-xs mt-1">No suppliers added yet. Add suppliers first.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Threshold *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                placeholder="2"
                className="w-full p-3 rounded-lg bg-white border border-blue-200 text-slate-800 placeholder-slate-400"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Par Level *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.parLevel}
                onChange={(e) => setFormData({...formData, parLevel: e.target.value})}
                placeholder="6"
                className="w-full p-3 rounded-lg bg-white border border-blue-200 text-slate-800 placeholder-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Barcode (optional)
            </label>
            <input
              type="text"
              value={formData.barcode}
              onChange={(e) => setFormData({...formData, barcode: e.target.value})}
              placeholder="Scan or enter barcode"
              className="w-full p-3 rounded-lg bg-white border border-blue-200 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="text-xs text-slate-600 bg-blue-100 p-3 rounded-lg">
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
