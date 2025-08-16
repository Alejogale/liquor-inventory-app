'use client'

import { useState } from 'react'
import { X, Plus, Trash2, DollarSign } from 'lucide-react'
import { PurchaseItem, GuestVisit } from '@/types/guest-manager'

interface AddItemsFormProps {
  guest: GuestVisit
  onSubmit: (purchases: PurchaseItem[]) => void
  onCancel: () => void
  loading?: boolean
}

export default function AddItemsForm({ guest, onSubmit, onCancel, loading = false }: AddItemsFormProps) {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([
    {
      item_description: '',
      quantity: 1,
      unit_price: 0
    }
  ])

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate purchases
    purchases.forEach((purchase, index) => {
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
      onSubmit(purchases)
    }
  }

  const addPurchase = () => {
    setPurchases(prev => [...prev, {
      item_description: '',
      quantity: 1,
      unit_price: 0
    }])
  }

  const removePurchase = (index: number) => {
    setPurchases(prev => prev.filter((_, i) => i !== index))
  }

  const updatePurchase = (index: number, field: keyof PurchaseItem, value: string | number) => {
    setPurchases(prev => prev.map((purchase, i) => 
      i === index ? { ...purchase, [field]: value } : purchase
    ))
  }

  const calculateTotal = () => {
    return purchases.reduce((sum, purchase) => {
      return sum + (purchase.quantity * purchase.unit_price)
    }, 0)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Items to Guest Visit</h2>
            <p className="text-gray-600">
              {guest.guest_name} - {guest.member_number}
            </p>
            <p className="text-sm text-gray-500">
              Current Total: ${guest.total_amount?.toFixed(2) || '0.00'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Purchase Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Purchase Items</h3>
              <button
                type="button"
                onClick={addPurchase}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-4">
              {purchases.map((purchase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                    {purchases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePurchase(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Description
                      </label>
                      <input
                        type="text"
                        value={purchase.item_description}
                        onChange={(e) => updatePurchase(index, 'item_description', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`purchase_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Golf Cart Rental, Lunch, Pro Shop Item"
                      />
                      {errors[`purchase_${index}_description`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`purchase_${index}_description`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={purchase.quantity}
                        onChange={(e) => updatePurchase(index, 'quantity', parseInt(e.target.value) || 1)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`purchase_${index}_quantity`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`purchase_${index}_quantity`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`purchase_${index}_quantity`]}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unit Price ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={purchase.unit_price}
                        onChange={(e) => updatePurchase(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`purchase_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors[`purchase_${index}_price`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`purchase_${index}_price`]}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-end">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        Total: ${(purchase.quantity * purchase.unit_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900">New Items Total:</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">Combined Total (Current + New):</span>
              <span className="text-lg font-semibold text-gray-900">
                ${((guest.total_amount || 0) + calculateTotal()).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || purchases.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Items...' : 'Add Items'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
