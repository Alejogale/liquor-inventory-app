'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, DollarSign } from 'lucide-react'
import { GuestFormData, PurchaseItem, CountryClub } from '@/types/guest-manager'

interface GuestFormProps {
  onSubmit: (data: GuestFormData) => void
  onCancel: () => void
  initialData?: GuestFormData
  clubs: CountryClub[]
  loading?: boolean
}

export default function GuestForm({ onSubmit, onCancel, initialData, clubs, loading = false }: GuestFormProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    guest_name: '',
    member_number: '',
    home_club_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    purchases: []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.guest_name.trim()) {
      newErrors.guest_name = 'Guest name is required'
    }

    if (!formData.member_number.trim()) {
      newErrors.member_number = 'Member number is required'
    }

    if (!formData.visit_date) {
      newErrors.visit_date = 'Visit date is required'
    }

    // Validate purchases
    formData.purchases.forEach((purchase, index) => {
      if (!purchase.item_description.trim()) {
        newErrors[`purchase_${index}_description`] = 'Item description is required'
      }
      if (purchase.quantity <= 0) {
        newErrors[`purchase_${index}_quantity`] = 'Quantity must be greater than 0'
      }
      if (purchase.unit_price <= 0) {
        newErrors[`purchase_${index}_price`] = 'Unit price must be greater than 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const addPurchase = () => {
    setFormData(prev => ({
      ...prev,
      purchases: [...prev.purchases, {
        item_description: '',
        quantity: 1,
        unit_price: 0
      }]
    }))
  }

  const removePurchase = (index: number) => {
    setFormData(prev => ({
      ...prev,
      purchases: prev.purchases.filter((_, i) => i !== index)
    }))
  }

  const updatePurchase = (index: number, field: keyof PurchaseItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      purchases: prev.purchases.map((purchase, i) => 
        i === index ? { ...purchase, [field]: value } : purchase
      )
    }))
  }

  const calculateTotal = () => {
    return formData.purchases.reduce((sum, purchase) => {
      return sum + (purchase.quantity * purchase.unit_price)
    }, 0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Edit Guest Visit' : 'Add New Guest Visit'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Guest Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guest Name *
              </label>
              <input
                type="text"
                value={formData.guest_name}
                onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.guest_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter guest name"
              />
              {errors.guest_name && (
                <p className="mt-1 text-sm text-red-600">{errors.guest_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Number *
              </label>
              <input
                type="text"
                value={formData.member_number}
                onChange={(e) => setFormData(prev => ({ ...prev, member_number: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.member_number ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter member number"
              />
              {errors.member_number && (
                <p className="mt-1 text-sm text-red-600">{errors.member_number}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Club
              </label>
              <select
                value={formData.home_club_id}
                onChange={(e) => setFormData(prev => ({ ...prev, home_club_id: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a club (optional)</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name} - {club.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Date *
              </label>
              <input
                type="date"
                value={formData.visit_date}
                onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.visit_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.visit_date && (
                <p className="mt-1 text-sm text-red-600">{errors.visit_date}</p>
              )}
            </div>
          </div>

          {/* Purchases Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Purchases</h3>
              <button
                type="button"
                onClick={addPurchase}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            {formData.purchases.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No purchases added yet</p>
                <p className="text-sm">Click "Add Item" to start adding purchases</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.purchases.map((purchase, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePurchase(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <input
                          type="text"
                          value={purchase.item_description}
                          onChange={(e) => updatePurchase(index, 'item_description', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`purchase_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., Golf cart rental"
                        />
                        {errors[`purchase_${index}_description`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`purchase_${index}_description`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={purchase.quantity}
                          onChange={(e) => updatePurchase(index, 'quantity', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors[`purchase_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors[`purchase_${index}_quantity`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`purchase_${index}_quantity`]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unit Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={purchase.unit_price}
                            onChange={(e) => updatePurchase(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors[`purchase_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                        </div>
                        {errors[`purchase_${index}_price`] && (
                          <p className="mt-1 text-xs text-red-600">{errors[`purchase_${index}_price`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 text-right">
                      <span className="text-sm font-medium text-gray-700">
                        Total: ${(purchase.quantity * purchase.unit_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Amount */}
            {formData.purchases.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (initialData ? 'Update Guest' : 'Add Guest')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
