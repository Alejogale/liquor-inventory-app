'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Modal from '@/components/Modal'

interface AddCategoryModalProps {
  onClose: () => void
  onCategoryAdded: () => void
}

export default function AddCategoryModal({ onClose, onCategoryAdded }: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('categories')
        .insert([
          {
            name: categoryName.trim(),
            organization_id: 1
          }
        ])

      if (error) throw error

      onCategoryAdded()
      setCategoryName('')
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error adding category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} title="Add Category">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-white mb-2">
            Category Name
          </label>
          <input
            type="text"
            id="categoryName"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="e.g., Whiskey, Vodka, Beer"
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !categoryName.trim()}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Adding...' : 'Add Category'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
