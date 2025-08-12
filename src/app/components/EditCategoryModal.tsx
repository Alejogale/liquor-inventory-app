'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal'

interface Category {
  id: string
  name: string
}

interface EditCategoryModalProps {
  category: Category
  organizationId?: string
  onClose: () => void
  onCategoryUpdated: () => void
}

export default function EditCategoryModal({ category, organizationId, onClose, onCategoryUpdated }: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(category.name)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setLoading(true)
    try {
      // Get current organization if not provided
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
        console.error("No organization found")
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryName.trim()
        })
        .eq('id', category.id)
        .eq('organization_id', currentOrg)

      if (error) throw error

      onCategoryUpdated()
    } catch (error) {
      console.error('Error updating category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-slate-700 mb-2">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-[var(--accent-orange-200)] rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent-orange-600)]"
            placeholder="Enter category name"
            required
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
            disabled={loading || !categoryName.trim() || !organizationId}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[var(--accent-orange-600)] to-[var(--accent-orange-700)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
