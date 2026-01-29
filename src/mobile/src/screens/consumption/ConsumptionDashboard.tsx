import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wine,
  Calendar,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Send,
  RotateCcw,
  Settings,
  ArrowLeft,
  X,
  PlusCircle,
} from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import * as Haptics from 'expo-haptics';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';
import { supabase, useAuth } from '../../context/AuthContext';
import { Button, Card, LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

type ConsumptionDashboardProps = RootStackScreenProps<'ConsumptionDashboard'>;

interface Event {
  id: string;
  name: string;
  event_date: string;
  status: string;
  organization_id: string;
  created_by?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  sort_order: number;
}

interface Item {
  id: string;
  name: string;
  category_id: string;
  price: number;
  sort_order: number;
}

interface Count {
  item_id: string;
  quantity: number;
}

export const ConsumptionDashboard: React.FC = () => {
  const navigation = useNavigation<ConsumptionDashboardProps['navigation']>();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Role-based access control
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const isViewer = userProfile?.role === 'viewer';
  const canManageEvents = isOwner || isManager;
  const canUpdateCounts = !isViewer; // Viewers cannot update counts
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [showEventPicker, setShowEventPicker] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = useCallback((categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const getCategoryCount = useCallback((categoryId: string) => {
    const categoryItems = items.filter(item => item.category_id === categoryId);
    return categoryItems.reduce((sum, item) => sum + (counts[item.id] || 0), 0);
  }, [items, counts]);

  // Fetch data when userProfile is available
  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchData();
    }
  }, [userProfile?.organization_id]);

  // Refresh data when screen is focused (after returning from settings)
  useFocusEffect(
    useCallback(() => {
      if (userProfile?.organization_id && !isLoading) {
        fetchData();
      }
    }, [userProfile?.organization_id])
  );

  const fetchData = async () => {
    if (!userProfile?.organization_id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch events - filter by organization and status
      const { data: eventsData, error: eventsError } = await supabase
        .from('consumption_events')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (eventsError && !eventsError.message.includes('does not exist')) {
        console.error('Events error:', eventsError);
      }
      setEvents(eventsData || []);

      // Set first event as selected
      const activeEvent = eventsData?.[0];
      setSelectedEvent(activeEvent || null);

      // Fetch categories - filter by organization
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('consumption_categories')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('sort_order', { ascending: true });

      if (categoriesError && !categoriesError.message.includes('does not exist')) {
        console.error('Categories error:', categoriesError);
      }
      setCategories(categoriesData || []);

      // Fetch items - filter by organization
      const { data: itemsData, error: itemsError } = await supabase
        .from('consumption_items')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('sort_order', { ascending: true });

      if (itemsError && !itemsError.message.includes('does not exist')) {
        console.error('Items error:', itemsError);
      }
      setItems(itemsData || []);

      // Fetch counts for active event
      if (activeEvent) {
        await fetchCounts(activeEvent.id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't show error alert - just show empty state
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchCounts = async (eventId: string) => {
    try {
      const { data, error } = await supabase
        .from('consumption_counts')
        .select('item_id, quantity')
        .eq('event_id', eventId);

      if (error) throw error;

      const countsMap: Record<string, number> = {};
      data?.forEach(c => {
        countsMap[c.item_id] = c.quantity;
      });
      setCounts(countsMap);
    } catch (error) {
      console.error('Error fetching counts:', error);
    }
  };

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, []);

  const updateCount = useCallback(async (itemId: string, delta: number) => {
    if (!canUpdateCounts) {
      Alert.alert('View Only', 'You don\'t have permission to update counts.');
      return;
    }

    if (!selectedEvent) {
      Alert.alert('No Event', 'Please select an event first.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const currentCount = counts[itemId] || 0;
    const newCount = Math.max(0, currentCount + delta);

    // Optimistic update
    setCounts(prev => ({ ...prev, [itemId]: newCount }));

    try {
      // Upsert the count
      const { error } = await supabase
        .from('consumption_counts')
        .upsert({
          event_id: selectedEvent.id,
          item_id: itemId,
          quantity: newCount,
        }, {
          onConflict: 'event_id,item_id',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating count:', error);
      // Revert on error
      setCounts(prev => ({ ...prev, [itemId]: currentCount }));
      Alert.alert('Error', 'Failed to update count.');
    }
  }, [selectedEvent, counts, canUpdateCounts]);

  const handleEventSelect = useCallback((event: Event) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedEvent(event);
    setShowEventPicker(false);
    fetchCounts(event.id);
  }, []);

  const [isSendingReport, setIsSendingReport] = useState(false);

  const getTotalCount = useCallback(() => {
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  }, [counts]);

  const getTotalAmount = useCallback(() => {
    return items.reduce((total, item) => {
      const quantity = counts[item.id] || 0;
      return total + (quantity * item.price);
    }, 0);
  }, [items, counts]);

  const handleSendReport = useCallback(async () => {
    if (!selectedEvent || !userProfile?.organization_id) {
      Alert.alert('Error', 'Please select an event first.');
      return;
    }

    const totalCount = getTotalCount();
    if (totalCount === 0) {
      Alert.alert('Empty Report', 'There are no items to report. Add some counts first.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Send Report',
      `Send consumption report for "${selectedEvent.name}" to all email recipients?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setIsSendingReport(true);
            try {
              const response = await fetch('https://invyeasy.com/api/consumption/send-report', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  eventId: selectedEvent.id,
                  organizationId: userProfile.organization_id,
                }),
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to send report');
              }

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(
                'Report Sent!',
                `Report sent to ${data.recipientCount} recipient${data.recipientCount !== 1 ? 's' : ''}.\n\nTotal: ${data.totalItems} items - $${data.totalAmount.toFixed(2)}`
              );
            } catch (error: any) {
              console.error('Error sending report:', error);
              Alert.alert('Error', error.message || 'Failed to send report. Please try again.');
            } finally {
              setIsSendingReport(false);
            }
          },
        },
      ]
    );
  }, [selectedEvent, userProfile, getTotalCount]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Reset Counts',
      'Are you sure you want to reset all counts for this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            if (!selectedEvent) return;
            try {
              const { error } = await supabase
                .from('consumption_counts')
                .delete()
                .eq('event_id', selectedEvent.id);

              if (error) throw error;
              setCounts({});
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert('Error', 'Failed to reset counts.');
            }
          },
        },
      ]
    );
  }, [selectedEvent]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ConsumptionSettings');
  }, [navigation]);

  const handleCreateEvent = useCallback(async () => {
    if (!newEventName.trim()) {
      Alert.alert('Error', 'Please enter an event name.');
      return;
    }

    if (!userProfile?.organization_id) {
      Alert.alert('Error', 'No organization found.');
      return;
    }

    setIsCreatingEvent(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase
        .from('consumption_events')
        .insert({
          organization_id: userProfile.organization_id,
          name: newEventName.trim(),
          event_date: new Date().toISOString().split('T')[0],
          status: 'active',
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEvents(prev => [data, ...prev]);
        setSelectedEvent(data);
        setCounts({});
      }

      setShowCreateEvent(false);
      setNewEventName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Error creating event:', error);
      Alert.alert('Error', error.message || 'Failed to create event.');
    } finally {
      setIsCreatingEvent(false);
    }
  }, [newEventName, userProfile, user]);

  const getItemsByCategory = (categoryId: string) => {
    return items.filter(item => item.category_id === categoryId);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Wine size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Consumption</Text>
        </View>
        <TouchableOpacity style={styles.settingsButton} onPress={handleSettings}>
          <Settings size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Event Selector */}
      <TouchableOpacity
        style={styles.eventSelector}
        onPress={() => setShowEventPicker(!showEventPicker)}
      >
        <Calendar size={20} color={colors.primary} />
        <Text style={styles.eventName}>
          {selectedEvent?.name || 'Select Event'}
        </Text>
        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Event Picker Dropdown */}
      {showEventPicker && (
        <View style={styles.eventDropdown}>
          {/* Create New Event Button - Only for managers/owners */}
          {canManageEvents && (
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => {
                setShowEventPicker(false);
                setShowCreateEvent(true);
              }}
            >
              <PlusCircle size={20} color={colors.primary} />
              <Text style={styles.createEventText}>Create New Event</Text>
            </TouchableOpacity>
          )}

          {events.map(event => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventOption,
                selectedEvent?.id === event.id && styles.eventOptionSelected,
              ]}
              onPress={() => handleEventSelect(event)}
            >
              <Text style={[
                styles.eventOptionText,
                selectedEvent?.id === event.id && styles.eventOptionTextSelected,
              ]}>
                {event.name}
              </Text>
            </TouchableOpacity>
          ))}
          {events.length === 0 && (
            <Text style={styles.noEventsText}>
              {canManageEvents
                ? 'No events yet. Create one above!'
                : 'No events yet. Ask a manager to create one.'}
            </Text>
          )}
        </View>
      )}

      {/* Create Event Modal - Centered Popup */}
      <Modal
        visible={showCreateEvent}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateEvent(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => {
              setShowCreateEvent(false);
              setNewEventName('');
            }}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Event</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateEvent(false);
                  setNewEventName('');
                }}
                style={styles.modalCloseButton}
              >
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Event Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Friday Night Service"
              placeholderTextColor={colors.textTertiary}
              value={newEventName}
              onChangeText={setNewEventName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateEvent}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCreateEvent(false);
                  setNewEventName('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateEvent}
                disabled={isCreatingEvent}
              >
                <LinearGradient
                  colors={colors.gradientPrimary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalCreateGradient}
                >
                  <Text style={styles.modalCreateText}>
                    {isCreatingEvent ? 'Creating...' : 'Create'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Categories & Items */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {categories.map(category => {
          const isExpanded = expandedCategories.has(category.id);
          const categoryTotal = getCategoryCount(category.id);
          const categoryItems = getItemsByCategory(category.id);

          return (
            <View key={category.id} style={styles.categorySection}>
              {/* Category Header - Tap to expand */}
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryLeft}>
                  {isExpanded ? (
                    <ChevronDown size={20} color={colors.primary} />
                  ) : (
                    <ChevronRight size={20} color={colors.textSecondary} />
                  )}
                  <Text style={[
                    styles.categoryTitle,
                    isExpanded && styles.categoryTitleActive
                  ]}>
                    {category.name}
                  </Text>
                </View>
                <View style={styles.categoryRight}>
                  {categoryTotal > 0 && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{categoryTotal}</Text>
                    </View>
                  )}
                  <Text style={styles.categoryItemCount}>
                    {categoryItems.length} items
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Expanded Items */}
              {isExpanded && (
                <View style={styles.itemsList}>
                  {categoryItems.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {item.price > 0 && (
                          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                        )}
                      </View>
                      <View style={styles.counterRow}>
                        <TouchableOpacity
                          style={styles.counterButton}
                          onPress={() => updateCount(item.id, -1)}
                        >
                          <Minus size={18} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <Text style={styles.countText}>
                          {counts[item.id] || 0}
                        </Text>
                        <TouchableOpacity
                          style={[styles.counterButton, styles.counterButtonPlus]}
                          onPress={() => updateCount(item.id, 1)}
                        >
                          <Plus size={18} color={colors.textPrimary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Wine size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Categories Yet</Text>
            <Text style={styles.emptyText}>
              Add categories and items from settings to start tracking.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalsRow}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Drinks</Text>
            <Text style={styles.totalCount}>{getTotalCount()}</Text>
          </View>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Amount</Text>
            <Text style={styles.totalAmount}>${getTotalAmount().toFixed(2)}</Text>
          </View>
        </View>
        {isViewer ? (
          <View style={styles.viewOnlyBadge}>
            <Text style={styles.viewOnlyText}>View Only</Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <RotateCcw size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, isSendingReport && styles.sendButtonDisabled]}
              onPress={handleSendReport}
              disabled={isSendingReport}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color={colors.textPrimary} />
                <Text style={styles.sendButtonText}>
                  {isSendingReport ? 'Sending...' : 'Send Report'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
    gap: spacing.sm,
  },
  eventName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  eventDropdown: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginBottom: spacing.md,
    borderRadius: radius.base,
    overflow: 'hidden',
  },
  eventOption: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  eventOptionSelected: {
    backgroundColor: colors.primary + '20',
  },
  eventOptionText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  eventOptionTextSelected: {
    color: colors.primary,
    fontWeight: typography.weight.medium,
  },
  noEventsText: {
    padding: spacing.base,
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  categorySection: {
    marginBottom: spacing.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  categoryTitleActive: {
    color: colors.primary,
  },
  categoryBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  categoryBadgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  categoryItemCount: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
  },
  itemsList: {
    backgroundColor: colors.backgroundSecondary,
    borderBottomLeftRadius: radius.base,
    borderBottomRightRadius: radius.base,
    marginTop: -spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: typography.size.xs,
    color: colors.primary,
    marginTop: 2,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonPlus: {
    backgroundColor: colors.primary,
  },
  countText: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  emptyText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  totalCount: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resetButton: {
    width: 44,
    height: 44,
    borderRadius: radius.base,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    overflow: 'hidden',
    borderRadius: radius.base,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sendButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  viewOnlyBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
  },
  viewOnlyText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textTertiary,
  },
  // Create Event Button
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    gap: spacing.sm,
  },
  createEventText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    width: '85%',
    maxWidth: 400,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalCancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.base,
  },
  modalCancelText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  modalCreateButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.base,
  },
  modalCreateGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  modalCreateText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
});

export default ConsumptionDashboard;
