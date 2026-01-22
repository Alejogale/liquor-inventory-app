'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Wine,
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Mail,
  Tag,
  DollarSign,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react'

interface Category {
  id: string
  name: string
  sort_order: number
  items?: Item[]
}

interface Item {
  id: string
  category_id: string
  name: string
  price: number
  sort_order: number
}

interface EmailRecipient {
  id: string
  email: string
  name: string | null
  is_active: boolean
}

interface Event {
  id: string
  name: string
  event_date: string
  status: 'active' | 'completed'
  total_items: number
  total_amount: number
  created_at: string
}

export default function ConsumptionSettingsPage() {
  const router = useRouter()
  const { user, userProfile, organization, loading } = useAuth()

  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState<'categories' | 'emails' | 'events'>('categories')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Form state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemCategoryId, setNewItemCategoryId] = useState<string | null>(null)
  const [newEmail, setNewEmail] = useState('')
  const [newEmailName, setNewEmailName] = useState('')

  // Edit state
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editingItemName, setEditingItemName] = useState('')
  const [editingItemPrice, setEditingItemPrice] = useState('')
  const [editingEvent, setEditingEvent] = useState<string | null>(null)
  const [editingEventName, setEditingEventName] = useState('')

  // Load data
  const loadData = useCallback(async () => {
    if (!userProfile?.organization_id) return

    setLoadingData(true)
    setError(null)

    try {
      // Load categories with items
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('consumption_categories')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('sort_order', { ascending: true })

      if (categoriesError) throw categoriesError

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('consumption_items')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (itemsError) throw itemsError

      // Combine categories with their items
      const categoriesWithItems = (categoriesData || []).map(cat => ({
        ...cat,
        items: (itemsData || []).filter(item => item.category_id === cat.id)
      }))

      setCategories(categoriesWithItems)

      // Load email recipients
      const { data: emailsData, error: emailsError } = await supabase
        .from('consumption_email_recipients')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: true })

      if (emailsError) throw emailsError

      setEmailRecipients(emailsData || [])

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('consumption_events')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false })

      if (eventsError) throw eventsError

      setEvents(eventsData || [])

    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load settings')
    } finally {
      setLoadingData(false)
    }
  }, [userProfile?.organization_id])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadData()
    }
  }, [userProfile?.organization_id, loadData])

  // Show messages temporarily
  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  // Category functions
  const addCategory = async () => {
    if (!newCategoryName.trim() || !userProfile?.organization_id) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('consumption_categories')
        .insert({
          organization_id: userProfile.organization_id,
          name: newCategoryName.trim(),
          sort_order: categories.length
        })
        .select()
        .single()

      if (error) throw error

      setCategories([...categories, { ...data, items: [] }])
      setNewCategoryName('')
      showSuccess('Category added')
    } catch (err) {
      console.error('Error adding category:', err)
      showError('Failed to add category')
    } finally {
      setSaving(false)
    }
  }

  const updateCategory = async (categoryId: string) => {
    if (!editingCategoryName.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_categories')
        .update({ name: editingCategoryName.trim() })
        .eq('id', categoryId)

      if (error) throw error

      setCategories(categories.map(cat =>
        cat.id === categoryId ? { ...cat, name: editingCategoryName.trim() } : cat
      ))
      setEditingCategory(null)
      showSuccess('Category updated')
    } catch (err) {
      console.error('Error updating category:', err)
      showError('Failed to update category')
    } finally {
      setSaving(false)
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Delete this category and all its items?')) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_categories')
        .delete()
        .eq('id', categoryId)

      if (error) throw error

      setCategories(categories.filter(cat => cat.id !== categoryId))
      showSuccess('Category deleted')
    } catch (err) {
      console.error('Error deleting category:', err)
      showError('Failed to delete category')
    } finally {
      setSaving(false)
    }
  }

  // Item functions
  const addItem = async (categoryId: string) => {
    if (!newItemName.trim() || !userProfile?.organization_id) return

    const category = categories.find(c => c.id === categoryId)
    const itemCount = category?.items?.length || 0

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('consumption_items')
        .insert({
          organization_id: userProfile.organization_id,
          category_id: categoryId,
          name: newItemName.trim(),
          price: parseFloat(newItemPrice) || 0,
          sort_order: itemCount
        })
        .select()
        .single()

      if (error) throw error

      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...(cat.items || []), data] }
          : cat
      ))
      setNewItemName('')
      setNewItemPrice('')
      setNewItemCategoryId(null)
      showSuccess('Item added')
    } catch (err) {
      console.error('Error adding item:', err)
      showError('Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  const updateItem = async (itemId: string, categoryId: string) => {
    if (!editingItemName.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_items')
        .update({
          name: editingItemName.trim(),
          price: parseFloat(editingItemPrice) || 0
        })
        .eq('id', itemId)

      if (error) throw error

      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items?.map(item =>
                item.id === itemId
                  ? { ...item, name: editingItemName.trim(), price: parseFloat(editingItemPrice) || 0 }
                  : item
              )
            }
          : cat
      ))
      setEditingItem(null)
      showSuccess('Item updated')
    } catch (err) {
      console.error('Error updating item:', err)
      showError('Failed to update item')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (itemId: string, categoryId: string) => {
    if (!confirm('Delete this item?')) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: cat.items?.filter(item => item.id !== itemId) }
          : cat
      ))
      showSuccess('Item deleted')
    } catch (err) {
      console.error('Error deleting item:', err)
      showError('Failed to delete item')
    } finally {
      setSaving(false)
    }
  }

  // Email functions
  const addEmailRecipient = async () => {
    if (!newEmail.trim() || !userProfile?.organization_id) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newEmail.trim())) {
      showError('Please enter a valid email address')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('consumption_email_recipients')
        .insert({
          organization_id: userProfile.organization_id,
          email: newEmail.trim().toLowerCase(),
          name: newEmailName.trim() || null,
          is_active: true
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          showError('This email is already added')
          return
        }
        throw error
      }

      setEmailRecipients([...emailRecipients, data])
      setNewEmail('')
      setNewEmailName('')
      showSuccess('Email recipient added')
    } catch (err) {
      console.error('Error adding email:', err)
      showError('Failed to add email recipient')
    } finally {
      setSaving(false)
    }
  }

  const toggleEmailActive = async (emailId: string, currentState: boolean) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_email_recipients')
        .update({ is_active: !currentState })
        .eq('id', emailId)

      if (error) throw error

      setEmailRecipients(emailRecipients.map(e =>
        e.id === emailId ? { ...e, is_active: !currentState } : e
      ))
    } catch (err) {
      console.error('Error toggling email:', err)
      showError('Failed to update email')
    } finally {
      setSaving(false)
    }
  }

  const deleteEmailRecipient = async (emailId: string) => {
    if (!confirm('Remove this email recipient?')) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_email_recipients')
        .delete()
        .eq('id', emailId)

      if (error) throw error

      setEmailRecipients(emailRecipients.filter(e => e.id !== emailId))
      showSuccess('Email recipient removed')
    } catch (err) {
      console.error('Error deleting email:', err)
      showError('Failed to remove email recipient')
    } finally {
      setSaving(false)
    }
  }

  // Event functions
  const updateEvent = async (eventId: string) => {
    if (!editingEventName.trim()) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_events')
        .update({ name: editingEventName.trim() })
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.map(e =>
        e.id === eventId ? { ...e, name: editingEventName.trim() } : e
      ))
      setEditingEvent(null)
      showSuccess('Event renamed')
    } catch (err) {
      console.error('Error updating event:', err)
      showError('Failed to rename event')
    } finally {
      setSaving(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Delete this event? This will also delete all consumption counts for this event.')) return

    setSaving(true)
    try {
      // First delete counts for this event
      await supabase
        .from('consumption_counts')
        .delete()
        .eq('event_id', eventId)

      // Then delete the event
      const { error } = await supabase
        .from('consumption_events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.filter(e => e.id !== eventId))
      showSuccess('Event deleted')
    } catch (err) {
      console.error('Error deleting event:', err)
      showError('Failed to delete event')
    } finally {
      setSaving(false)
    }
  }

  const markEventCompleted = async (eventId: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_events')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status: 'completed' as const } : e
      ))
      showSuccess('Event marked as completed')
    } catch (err) {
      console.error('Error completing event:', err)
      showError('Failed to complete event')
    } finally {
      setSaving(false)
    }
  }

  const reactivateEvent = async (eventId: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('consumption_events')
        .update({
          status: 'active',
          completed_at: null
        })
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status: 'active' as const } : e
      ))
      showSuccess('Event reactivated')
    } catch (err) {
      console.error('Error reactivating event:', err)
      showError('Failed to reactivate event')
    } finally {
      setSaving(false)
    }
  }

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <nav className="px-6 py-4 border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/consumption"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wine className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Settings</span>
          </div>
        </div>
      </nav>

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="px-6 py-3">
          <div className={`max-w-4xl mx-auto p-4 rounded-xl ${
            success ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            {success || error}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 bg-slate-800/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'categories'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              Categories & Items
            </button>
            <button
              onClick={() => setActiveTab('emails')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'emails'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Recipients
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'events'
                  ? 'bg-teal-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8">
        <div className="max-w-4xl mx-auto">

          {/* Categories & Items Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              {/* Add Category */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Add New Category</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                    placeholder="e.g., VODKA, TEQUILA, WINE..."
                    className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={addCategory}
                    disabled={saving || !newCategoryName.trim()}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Categories List */}
              {categories.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50">
                  <Tag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No categories yet. Add your first category above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                      {/* Category Header */}
                      <div
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        )}

                        {editingCategory === category.id ? (
                          <div className="flex-1 flex gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              className="flex-1 px-3 py-1 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                              autoFocus
                            />
                            <button
                              onClick={() => updateCategory(category.id)}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 font-semibold text-white">{category.name}</span>
                            <span className="text-sm text-slate-500">{category.items?.length || 0} items</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingCategory(category.id)
                                setEditingCategoryName(category.name)
                              }}
                              className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteCategory(category.id)
                              }}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Items List */}
                      {expandedCategories.has(category.id) && (
                        <div className="border-t border-slate-700/50 p-4 space-y-3">
                          {/* Add Item Form */}
                          {newItemCategoryId === category.id ? (
                            <div className="flex gap-2 bg-slate-900/50 p-3 rounded-xl">
                              <input
                                type="text"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Item name..."
                                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                                autoFocus
                              />
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                  type="number"
                                  value={newItemPrice}
                                  onChange={(e) => setNewItemPrice(e.target.value)}
                                  placeholder="0.00"
                                  step="0.01"
                                  min="0"
                                  className="w-28 pl-8 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                                />
                              </div>
                              <button
                                onClick={() => addItem(category.id)}
                                disabled={!newItemName.trim()}
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 disabled:opacity-50"
                              >
                                Add
                              </button>
                              <button
                                onClick={() => {
                                  setNewItemCategoryId(null)
                                  setNewItemName('')
                                  setNewItemPrice('')
                                }}
                                className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setNewItemCategoryId(category.id)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-600 rounded-xl text-slate-400 hover:border-teal-500 hover:text-teal-400 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Item
                            </button>
                          )}

                          {/* Items */}
                          {category.items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-xl">
                              {editingItem === item.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingItemName}
                                    onChange={(e) => setEditingItemName(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                  />
                                  <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                      type="number"
                                      value={editingItemPrice}
                                      onChange={(e) => setEditingItemPrice(e.target.value)}
                                      step="0.01"
                                      min="0"
                                      className="w-28 pl-8 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                                    />
                                  </div>
                                  <button
                                    onClick={() => updateItem(item.id, category.id)}
                                    className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingItem(null)}
                                    className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className="flex-1 text-white">{item.name}</span>
                                  <span className="text-teal-400 font-medium">${item.price.toFixed(2)}</span>
                                  <button
                                    onClick={() => {
                                      setEditingItem(item.id)
                                      setEditingItemName(item.name)
                                      setEditingItemPrice(item.price.toString())
                                    }}
                                    className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteItem(item.id, category.id)}
                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}

                          {(!category.items || category.items.length === 0) && newItemCategoryId !== category.id && (
                            <p className="text-center text-slate-500 py-2">No items in this category</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Email Recipients Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-6">
              {/* Add Email */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Add Email Recipient</h3>
                <p className="text-xs text-slate-500 mb-3">These people will receive consumption reports when you send them.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <input
                    type="text"
                    value={newEmailName}
                    onChange={(e) => setNewEmailName(e.target.value)}
                    placeholder="Name (optional)"
                    className="sm:w-48 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={addEmailRecipient}
                    disabled={saving || !newEmail.trim()}
                    className="px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Email Recipients List */}
              {emailRecipients.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50">
                  <Mail className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No email recipients yet. Add people who should receive reports.</p>
                </div>
              ) : (
                <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 divide-y divide-slate-700/50">
                  {emailRecipients.map((recipient) => (
                    <div key={recipient.id} className="flex items-center gap-4 p-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        recipient.is_active ? 'bg-teal-500/20' : 'bg-slate-700'
                      }`}>
                        <Mail className={`w-5 h-5 ${recipient.is_active ? 'text-teal-400' : 'text-slate-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${recipient.is_active ? 'text-white' : 'text-slate-500'}`}>
                          {recipient.email}
                        </p>
                        {recipient.name && (
                          <p className="text-sm text-slate-500 truncate">{recipient.name}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleEmailActive(recipient.id, recipient.is_active)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          recipient.is_active
                            ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        }`}
                      >
                        {recipient.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => deleteEmailRecipient(recipient.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              {/* Events Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm text-slate-400">
                  Manage your events here. You can rename, mark as completed, or delete events.
                  Active events appear in the main Consumption Tracker.
                </p>
              </div>

              {/* Events List */}
              {events.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50">
                  <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No events yet. Create an event from the main Consumption Tracker page.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {events.map((event) => (
                    <div key={event.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                      <div className="flex items-center gap-4 p-4">
                        {/* Status Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.status === 'active' ? 'bg-teal-500/20' : 'bg-slate-700'
                        }`}>
                          {event.status === 'active' ? (
                            <Clock className="w-5 h-5 text-teal-400" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-slate-500" />
                          )}
                        </div>

                        {/* Event Info */}
                        {editingEvent === event.id ? (
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editingEventName}
                              onChange={(e) => setEditingEventName(e.target.value)}
                              className="flex-1 px-3 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-teal-500"
                              autoFocus
                            />
                            <button
                              onClick={() => updateEvent(event.id)}
                              disabled={saving}
                              className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setEditingEvent(null)}
                              className="p-2 text-slate-400 hover:bg-slate-600 rounded-lg"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <p className={`font-semibold truncate ${event.status === 'active' ? 'text-white' : 'text-slate-400'}`}>
                                {event.name}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-slate-500">
                                  {new Date(event.event_date).toLocaleDateString()}
                                </span>
                                {(event.total_items > 0 || event.total_amount > 0) && (
                                  <>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-sm text-slate-500">
                                      {event.total_items} drinks
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span className="text-sm text-teal-400 font-medium">
                                      ${event.total_amount?.toFixed(2) || '0.00'}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              event.status === 'active'
                                ? 'bg-teal-500/20 text-teal-400'
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              {event.status === 'active' ? 'Active' : 'Completed'}
                            </span>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  setEditingEvent(event.id)
                                  setEditingEventName(event.name)
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Rename"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {event.status === 'active' ? (
                                <button
                                  onClick={() => markEventCompleted(event.id)}
                                  disabled={saving}
                                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                                  title="Mark as completed"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => reactivateEvent(event.id)}
                                  disabled={saving}
                                  className="p-2 text-slate-400 hover:text-teal-400 hover:bg-teal-500/20 rounded-lg transition-colors"
                                  title="Reactivate"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteEvent(event.id)}
                                disabled={saving}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
