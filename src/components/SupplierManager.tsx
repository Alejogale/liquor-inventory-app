'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'

interface Supplier {
  id: number
  name: string
  email: string
  phone?: string
  contact_person?: string
  notes?: string
  created_at: string
}

interface SupplierManagerProps {
  onRefresh?: () => void
}

export default function SupplierManager({ onRefresh }: SupplierManagerProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', 1)
        .order('name')

      if (error) throw error
      setSuppliers(data || [])
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteSupplier = async (supplierId: number) => {
    if (!confirm('Are you sure? This cannot be undone.')) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId)

      if (error) throw error

      await fetchSuppliers()
      onRefresh?.()
    } catch (error: any) {
      alert('Error deleting supplier: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-white/60">Loading suppliers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Supplier Management</h2>
          <p className="text-white/60">Manage your liquor suppliers and contacts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          + Add Supplier
        </button>
      </div>

      {/* Suppliers List */}
      {suppliers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-bold text-white mb-2">No Suppliers Added</h3>
          <p className="text-white/60 mb-6">Add your first supplier to get started with order management.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Add First Supplier
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white/10 rounded-lg p-6 border border-white/20">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{supplier.name}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/60 text-sm">Email</div>
                      <div className="text-white">{supplier.email}</div>
                    </div>
                    
                    {supplier.phone && (
                      <div>
                        <div className="text-white/60 text-sm">Phone</div>
                        <div className="text-white">{supplier.phone}</div>
                      </div>
                    )}
                    
                    {supplier.contact_person && (
                      <div>
                        <div className="text-white/60 text-sm">Contact Person</div>
                        <div className="text-white">{supplier.contact_person}</div>
                      </div>
                    )}
                    
                    {supplier.notes && (
                      <div>
                        <div className="text-white/60 text-sm">Notes</div>
                        <div className="text-white">{supplier.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSupplier(supplier)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteSupplier(supplier.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Supplier Modal */}
      {(showAddModal || editingSupplier) && (
        <SupplierModal
          supplier={editingSupplier}
          onClose={() => {
            setShowAddModal(false)
            setEditingSupplier(null)
          }}
          onSaved={() => {
            fetchSuppliers()
            onRefresh?.()
            setShowAddModal(false)
            setEditingSupplier(null)
          }}
        />
      )}
    </div>
  )
}

// Supplier Add/Edit Modal Component
interface SupplierModalProps {
  supplier?: Supplier | null
  onClose: () => void
  onSaved: () => void
}

function SupplierModal({ supplier, onClose, onSaved }: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    contact_person: supplier?.contact_person || '',
    notes: supplier?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    setLoading(true)
    try {
      const supplierData = {
        organization_id: 1,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        notes: formData.notes.trim() || null
      }

      if (supplier) {
        // Update existing supplier
        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplier.id)

        if (error) throw error
      } else {
        // Create new supplier
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData])

        if (error) throw error
      }

      onSaved()
    } catch (error: any) {
      alert('Error saving supplier: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-lg border border-white/20">
        <h2 className="text-xl font-bold text-white mb-4">
          {supplier ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Supplier Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Johnson Brothers, Southern Wine & Spirits"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="orders@supplier.com"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
              required
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(555) 123-4567"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              placeholder="John Smith, Sales Rep"
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
          </div>

          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Special instructions, delivery schedules, etc."
              rows={3}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60"
            />
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
              disabled={loading || !formData.name.trim() || !formData.email.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : (supplier ? 'Update' : 'Add Supplier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
