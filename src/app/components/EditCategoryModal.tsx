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
  organization: { id: string }
  onClose: () => void
  onCategoryUpdated: () => void
}

export default function EditCategoryModal({ category, organization, onClose, onCategoryUpdated }: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(category.name)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setLoading(true)
    try {
      if (!organization?.id) {
        console.error("No organization loaded")
        setLoading(false)
        return
      }

      const { error } = await supabase
        .from('categories')
        .update({
          name: categoryName.trim()
        })
        .eq('id', category.id)
        .eq('organization_id', organization.id)

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
            className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400"
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
            disabled={loading || !categoryName.trim() || !organization?.id}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
