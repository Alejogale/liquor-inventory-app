'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../app/lib/supabase'

interface Supplier {
  id: string
  name: string
  email: string
  phone?: string
  contact_person?: string
  notes?: string
  created_at?: string
}

interface SupplierManagerProps {
  suppliers?: Supplier[]  // Add this prop
  onUpdate?: () => void   // Add this prop (rename from onRefresh)
  onRefresh?: () => void  // Keep for backward compatibility
  organizationId?: string // Add for consistency
}

export default function SupplierManager({ 
  suppliers: externalSuppliers, 
  onUpdate, 
  onRefresh, 
  organizationId 
}: SupplierManagerProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  // Add helper function to get current organization
  const getCurrentOrganization = async () => {
    if (organizationId) return organizationId;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      return profile?.organization_id || user.user_metadata?.organization_id;
    } catch (error) {
      console.error('Error getting organization:', error);
      return null;
    }
  };

  useEffect(() => {
    if (externalSuppliers) {
      setSuppliers(externalSuppliers);
      setLoading(false);
    } else {
      fetchSuppliers();
    }
  }, [externalSuppliers, organizationId]);

  const fetchSuppliers = async () => {
    try {
      const currentOrg = await getCurrentOrganization();
      if (!currentOrg) {
        console.error('No organization found for suppliers');
        setSuppliers([]);
        return;
      }

      console.log(`📋 Fetching suppliers for organization: ${currentOrg}`);

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('organization_id', currentOrg)
        .order('name');

      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      
      console.log(`✅ Loaded ${data?.length || 0} suppliers`);
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (supplierId: string) => {
    if (!confirm('Are you sure? This will permanently delete this supplier and cannot be undone.')) return

    try {
      // Get current organization for security
      const currentOrg = await getCurrentOrganization()
      if (!currentOrg) {
        alert('Error: No organization found')
        return
      }

      console.log(`🗑️ Deleting supplier ${supplierId} for organization ${currentOrg}`)

      // First check if supplier exists and belongs to this organization
      const { data: existingSupplier, error: checkError } = await supabase
        .from('suppliers')
        .select('id, name, organization_id')
        .eq('id', supplierId)
        .eq('organization_id', currentOrg)
        .single()

      if (checkError || !existingSupplier) {
        alert('Error: Supplier not found or access denied')
        return
      }

      // Check if supplier is being used by any inventory items
      const { data: itemsUsingSupplier, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, brand')
        .eq('supplier_id', supplierId)
        .eq('organization_id', currentOrg)
        .limit(5)

      if (itemsError) {
        console.error('Error checking supplier usage:', itemsError)
      }

      if (itemsUsingSupplier && itemsUsingSupplier.length > 0) {
        const itemNames = itemsUsingSupplier.map(item => item.brand).join(', ')
        if (!confirm(`Warning: This supplier is used by ${itemsUsingSupplier.length} inventory items (${itemNames}${itemsUsingSupplier.length > 5 ? '...' : ''}). Delete anyway?`)) {
          return
        }
      }

      // Delete the supplier
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId)
        .eq('organization_id', currentOrg) // Extra security check

      if (error) throw error

      console.log(`✅ Successfully deleted supplier: ${existingSupplier.name}`)
      
      await fetchSuppliers()
      onRefresh?.()
      onUpdate?.()
      
      alert(`Supplier "${existingSupplier.name}" has been deleted successfully.`)
    } catch (error: any) {
      console.error('Delete supplier error:', error)
      alert('Error deleting supplier: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600">Loading suppliers...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Supplier Management</h2>
          <p className="text-slate-600">Manage your liquor suppliers and contacts</p>
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
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Suppliers Added</h3>
          <p className="text-slate-600 mb-6">Add your first supplier to get started with order management.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Add First Supplier
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-lg p-6 border border-blue-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{supplier.name}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-slate-600 text-sm">Email</div>
                      <div className="text-slate-800">{supplier.email}</div>
                    </div>
                    
                    {supplier.phone && (
                      <div>
                        <div className="text-slate-600 text-sm">Phone</div>
                        <div className="text-slate-800">{supplier.phone}</div>
                      </div>
                    )}
                    
                    {supplier.contact_person && (
                      <div>
                        <div className="text-slate-600 text-sm">Contact Person</div>
                        <div className="text-slate-800">{supplier.contact_person}</div>
                      </div>
                    )}
                    
                    {supplier.notes && (
                      <div>
                        <div className="text-slate-600 text-sm">Notes</div>
                        <div className="text-slate-800">{supplier.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingSupplier(supplier)}
                    className="bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] hover:opacity-90 text-white px-4 py-2 rounded-lg"
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
          organizationId={organizationId}
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
  organizationId?: string
}

function SupplierModal({ supplier, onClose, onSaved, organizationId }: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    contact_person: supplier?.contact_person || '',
    notes: supplier?.notes || ''
  })
  const [loading, setLoading] = useState(false)

  // Add helper function to get current organization
  const getCurrentOrganization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      return profile?.organization_id || user.user_metadata?.organization_id;
    } catch (error) {
      console.error('Error getting organization:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    setLoading(true)
    try {
      // Use the organizationId prop if available, otherwise fetch from database
      let currentOrg = organizationId;
      if (!currentOrg) {
        currentOrg = await getCurrentOrganization();
      }
      
      if (!currentOrg) {
        alert('Error: No organization found. Please try again.');
        return;
      }

      const supplierData = {
        organization_id: currentOrg,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        notes: formData.notes.trim() || null
      }

      if (supplier) {
        // Update existing supplier with organization check
        console.log(`📝 Updating supplier ${supplier.id} for organization ${currentOrg}`)
        
        // First verify the supplier belongs to this organization
        const { data: existingSupplier, error: checkError } = await supabase
          .from('suppliers')
          .select('id, organization_id')
          .eq('id', supplier.id)
          .eq('organization_id', currentOrg)
          .single()

        if (checkError || !existingSupplier) {
          throw new Error('Supplier not found or access denied')
        }

        const { error } = await supabase
          .from('suppliers')
          .update(supplierData)
          .eq('id', supplier.id)
          .eq('organization_id', currentOrg) // Extra security check

        if (error) throw error
        
        console.log(`✅ Successfully updated supplier: ${formData.name}`)
      } else {
        // Create new supplier
        console.log(`➕ Creating new supplier: ${formData.name} for organization ${currentOrg}`)
        
        const { error } = await supabase
          .from('suppliers')
          .insert([supplierData])

        if (error) throw error
        
        console.log(`✅ Successfully created supplier: ${formData.name}`)
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
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg border border-slate-200 shadow-xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          {supplier ? 'Edit Supplier' : 'Add New Supplier'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Supplier Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Johnson Brothers, Southern Wine & Spirits"
              className="w-full p-3 rounded-lg bg-white border border-[var(--accent-orange-200)] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="orders@supplier.com"
              className="w-full p-3 rounded-lg bg-white border border-[var(--accent-orange-200)] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="(555) 123-4567"
              className="w-full p-3 rounded-lg bg-white border border-[var(--accent-orange-200)] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Contact Person
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
              placeholder="John Smith, Sales Rep"
              className="w-full p-3 rounded-lg bg-white border border-[var(--accent-orange-200)] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-medium mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Special instructions, delivery schedules, etc."
              rows={3}
              className="w-full p-3 rounded-lg bg-white border border-[var(--accent-orange-200)] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
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
              className="flex-1 bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] hover:opacity-90 text-white p-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : (supplier ? 'Update' : 'Add Supplier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
