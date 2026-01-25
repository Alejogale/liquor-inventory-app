'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Wine,
  Settings,
  Home,
  Plus,
  Send,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Minus,
  Calendar,
  X,
  Check,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: string
  name: string
  sort_order: number
  items: Item[]
}

interface Item {
  id: string
  category_id: string
  name: string
  price: number
  sort_order: number
}

interface Event {
  id: string
  name: string
  event_date: string
  status: 'active' | 'completed'
  total_items: number
  total_amount: number
}

interface CountData {
  [itemId: string]: number
}

export default function ConsumptionPage() {
  const router = useRouter()
  const { user, userProfile, organization, loading, isSubscriptionActive } = useAuth()
  const [mounted, setMounted] = useState(false)

  // Data state
  const [categories, setCategories] = useState<Category[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeEvent, setActiveEvent] = useState<Event | null>(null)
  const [counts, setCounts] = useState<CountData>({})
  const [loadingData, setLoadingData] = useState(true)

  // UI state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [showEventModal, setShowEventModal] = useState(false)
  const [showEventSelector, setShowEventSelector] = useState(false)
  const [newEventName, setNewEventName] = useState('')
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0])
  const [creatingEvent, setCreatingEvent] = useState(false)
  const [sendingReport, setSendingReport] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Check subscription access
  useEffect(() => {
    if (!loading && user && !isSubscriptionActive && !organization?.is_grandfathered) {
      router.push('/subscription-expired')
    }
  }, [loading, user, isSubscriptionActive, organization, router])

  // Load all data
  const loadData = useCallback(async () => {
    if (!userProfile?.organization_id) return

    setLoadingData(true)
    try {
      // Load categories with items
      const { data: categoriesData, error: catError } = await supabase
        .from('consumption_categories')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('sort_order', { ascending: true })

      if (catError) throw catError

      const { data: itemsData, error: itemsError } = await supabase
        .from('consumption_items')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (itemsError) throw itemsError

      const categoriesWithItems = (categoriesData || []).map(cat => ({
        ...cat,
        items: (itemsData || []).filter(item => item.category_id === cat.id)
      }))

      setCategories(categoriesWithItems)

      // Expand all categories by default
      setExpandedCategories(new Set(categoriesWithItems.map(c => c.id)))

      // Load active events
      const { data: eventsData, error: eventsError } = await supabase
        .from('consumption_events')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (eventsError) throw eventsError

      setEvents(eventsData || [])

      // Set active event (first one or none)
      if (eventsData && eventsData.length > 0) {
        setActiveEvent(eventsData[0])
        await loadCounts(eventsData[0].id)
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoadingData(false)
    }
  }, [userProfile?.organization_id])

  // Load counts for an event
  const loadCounts = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('consumption_counts')
        .select('item_id, quantity')
        .eq('event_id', eventId)

      if (error) throw error

      const countsMap: CountData = {}
      data?.forEach(row => {
        countsMap[row.item_id] = row.quantity
      })
      setCounts(countsMap)
    } catch (err) {
      console.error('Error loading counts:', err)
    }
  }

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadData()
    }
  }, [userProfile?.organization_id, loadData])

  // Set up real-time subscription for counts
  useEffect(() => {
    if (!activeEvent?.id) return

    const channel = supabase
      .channel(`consumption_counts_${activeEvent.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'consumption_counts',
          filter: `event_id=eq.${activeEvent.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newData = payload.new as { item_id: string; quantity: number }
            setCounts(prev => ({
              ...prev,
              [newData.item_id]: newData.quantity
            }))
          } else if (payload.eventType === 'DELETE') {
            const oldData = payload.old as { item_id: string }
            setCounts(prev => {
              const newCounts = { ...prev }
              delete newCounts[oldData.item_id]
              return newCounts
            })
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeEvent?.id])

  // Show messages temporarily
  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 5000)
  }

  // Create new event
  const createEvent = async () => {
    if (!newEventName.trim() || !userProfile?.organization_id) return

    setCreatingEvent(true)
    try {
      const { data, error } = await supabase
        .from('consumption_events')
        .insert({
          organization_id: userProfile.organization_id,
          name: newEventName.trim(),
          event_date: newEventDate,
          status: 'active',
          created_by: user?.id
        })
        .select()
        .single()

      if (error) throw error

      setEvents([data, ...events])
      setActiveEvent(data)
      setCounts({})
      setShowEventModal(false)
      setNewEventName('')
      showSuccess('Event created')
    } catch (err) {
      console.error('Error creating event:', err)
      showError('Failed to create event')
    } finally {
      setCreatingEvent(false)
    }
  }

  // Switch active event
  const switchEvent = async (event: Event) => {
    setActiveEvent(event)
    await loadCounts(event.id)
    setShowEventSelector(false)
  }

  // Increment/decrement count
  const updateCount = async (itemId: string, increment: number) => {
    if (!activeEvent?.id) return

    // Optimistic update
    const currentCount = counts[itemId] || 0
    const newCount = Math.max(0, currentCount + increment)
    setCounts(prev => ({ ...prev, [itemId]: newCount }))

    try {
      const { data, error } = await supabase.rpc('increment_consumption_count', {
        p_event_id: activeEvent.id,
        p_item_id: itemId,
        p_increment: increment,
        p_user_id: user?.id
      })

      if (error) throw error

      // Update with actual server value
      setCounts(prev => ({ ...prev, [itemId]: data }))
    } catch (err) {
      console.error('Error updating count:', err)
      // Revert on error
      setCounts(prev => ({ ...prev, [itemId]: currentCount }))
      showError('Failed to update count')
    }
  }

  // Calculate totals
  const calculateTotals = () => {
    let totalItems = 0
    let totalAmount = 0

    categories.forEach(cat => {
      cat.items.forEach(item => {
        const count = counts[item.id] || 0
        totalItems += count
        totalAmount += count * item.price
      })
    })

    return { totalItems, totalAmount }
  }

  // Send report
  const sendReport = async () => {
    if (!activeEvent?.id || !userProfile?.organization_id) return

    setSendingReport(true)
    try {
      const response = await fetch('/api/consumption/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEvent.id,
          organizationId: userProfile.organization_id
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send report')
      }

      showSuccess('Report sent successfully!')
    } catch (err) {
      console.error('Error sending report:', err)
      showError(err instanceof Error ? err.message : 'Failed to send report')
    } finally {
      setSendingReport(false)
    }
  }

  // Reset counts
  const resetCounts = async () => {
    if (!activeEvent?.id) return
    if (!confirm('Reset all counts to zero for this event?')) return

    setResetting(true)
    try {
      const { error } = await supabase
        .from('consumption_counts')
        .delete()
        .eq('event_id', activeEvent.id)

      if (error) throw error

      setCounts({})
      showSuccess('Counts reset')
    } catch (err) {
      console.error('Error resetting counts:', err)
      showError('Failed to reset counts')
    } finally {
      setResetting(false)
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

  const { totalItems, totalAmount } = calculateTotals()
  const hasCategories = categories.length > 0 && categories.some(c => c.items.length > 0)

  // Role-based access control
  const isOwner = userProfile?.role === 'owner'
  const isManager = userProfile?.role === 'manager'
  const canManageEvents = isOwner || isManager

  if (!mounted || loading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-32">
      {/* Top Navigation Bar */}
      <nav className="px-4 py-3 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white hidden sm:block">Consumption</span>
          </div>

          {/* Event Selector */}
          {activeEvent && (
            <button
              onClick={() => setShowEventSelector(!showEventSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-xl text-white hover:bg-slate-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-teal-400" />
              <span className="max-w-[120px] sm:max-w-[200px] truncate">{activeEvent.name}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/consumption/settings"
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <Link
              href="/apps"
              className="p-2 text-slate-400 hover:text-white transition-colors"
            >
              <Home className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Event Selector Dropdown */}
      {showEventSelector && (
        <div className="fixed inset-0 z-50" onClick={() => setShowEventSelector(false)}>
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-3 border-b border-slate-700">
              <h3 className="font-semibold text-white">Switch Event</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {events.map(event => (
                <button
                  key={event.id}
                  onClick={() => switchEvent(event)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors ${
                    activeEvent?.id === event.id ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <Calendar className={`w-5 h-5 ${activeEvent?.id === event.id ? 'text-teal-400' : 'text-slate-500'}`} />
                  <div className="flex-1 text-left">
                    <p className="text-white font-medium">{event.name}</p>
                    <p className="text-sm text-slate-400">{new Date(event.event_date).toLocaleDateString()}</p>
                  </div>
                  {activeEvent?.id === event.id && (
                    <Check className="w-5 h-5 text-teal-400" />
                  )}
                </button>
              ))}
            </div>
            {canManageEvents && (
              <div className="p-3 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowEventSelector(false)
                    setShowEventModal(true)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Event
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="px-4 py-2 sticky top-14 z-30">
          <div className={`max-w-4xl mx-auto p-3 rounded-xl flex items-center gap-2 ${
            success ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
          }`}>
            {error && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {success && <Check className="w-5 h-5 flex-shrink-0" />}
            <span className="text-sm">{success || error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* No Categories Setup */}
          {!hasCategories ? (
            <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700/50">
              <Wine className="w-16 h-16 text-teal-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Get Started
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Set up your categories and items first, then create an event to start tracking consumption.
              </p>
              <Link
                href="/consumption/settings"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                <Settings className="w-5 h-5" />
                Configure Categories & Items
              </Link>
            </div>
          ) : !activeEvent ? (
            /* No Active Event */
            <div className="bg-slate-800/50 rounded-2xl p-8 text-center border border-slate-700/50">
              <Calendar className="w-16 h-16 text-teal-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                {canManageEvents ? 'Create an Event' : 'No Active Events'}
              </h2>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                {canManageEvents
                  ? 'Start tracking consumption by creating a new event.'
                  : 'There are no active events at the moment. Ask a manager or owner to create an event.'}
              </p>
              {canManageEvents && (
                <button
                  onClick={() => setShowEventModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                  Create Event
                </button>
              )}
            </div>
          ) : (
            /* Counting Interface */
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedCategories.has(category.id) ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                      <span className="font-semibold text-white">{category.name}</span>
                    </div>
                    <span className="text-sm text-slate-400">
                      {category.items.reduce((sum, item) => sum + (counts[item.id] || 0), 0)} drinks
                    </span>
                  </button>

                  {/* Items */}
                  {expandedCategories.has(category.id) && (
                    <div className="border-t border-slate-700/50">
                      {category.items.map(item => {
                        const count = counts[item.id] || 0
                        return (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/30 last:border-b-0">
                            {/* Item Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-medium truncate">{item.name}</p>
                              <p className="text-sm text-teal-400">${item.price.toFixed(2)}</p>
                            </div>

                            {/* Counter */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateCount(item.id, -1)}
                                disabled={count === 0}
                                className="w-12 h-12 flex items-center justify-center bg-slate-700 text-white rounded-xl hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
                              >
                                <Minus className="w-6 h-6" />
                              </button>
                              <span className="w-14 text-center text-xl font-bold text-white">
                                {count}
                              </span>
                              <button
                                onClick={() => updateCount(item.id, 1)}
                                className="w-12 h-12 flex items-center justify-center bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors active:scale-95"
                              >
                                <Plus className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                        )
                      })}
                      {category.items.length === 0 && (
                        <p className="px-4 py-6 text-center text-slate-500">No items in this category</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      {activeEvent && hasCategories && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700/50 px-4 py-4 z-40">
          <div className="max-w-4xl mx-auto">
            {/* Totals */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-slate-400">Total Drinks</p>
                <p className="text-2xl font-bold text-white">{totalItems}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">Total Amount</p>
                <p className="text-2xl font-bold text-teal-400">${totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={resetCounts}
                disabled={resetting || totalItems === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className={`w-5 h-5 ${resetting ? 'animate-spin' : ''}`} />
                Reset
              </button>
              <button
                onClick={sendReport}
                disabled={sendingReport || totalItems === 0}
                className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {sendingReport ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowEventModal(false)}>
          <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Create New Event</h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Event Name</label>
                <input
                  type="text"
                  value={newEventName}
                  onChange={e => setNewEventName(e.target.value)}
                  placeholder="e.g., Wedding Reception, Corporate Party..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Event Date</label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={e => setNewEventDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
            <div className="p-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                disabled={creatingEvent || !newEventName.trim()}
                className="flex-1 px-4 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {creatingEvent ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
