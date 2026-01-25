import React, { useState, useCallback, useEffect } from 'react';
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
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  Clock,
  CheckCircle,
  DollarSign,
  BarChart3,
  TrendingUp,
} from 'lucide-react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

interface Category {
  id: string;
  name: string;
  sort_order: number;
  items?: Item[];
}

interface Item {
  id: string;
  category_id: string;
  name: string;
  price: number;
  sort_order: number;
}

interface EmailRecipient {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
}

interface Event {
  id: string;
  name: string;
  event_date: string;
  status: 'active' | 'completed';
  total_items: number;
  total_amount: number;
  created_at: string;
}

type TabType = 'categories' | 'emails' | 'events' | 'analytics';

interface MonthlyData {
  month: string;
  year: number;
  monthNum: number;
  totalItems: number;
  totalAmount: number;
  eventCount: number;
}

export const ConsumptionSettings: React.FC = () => {
  const navigation = useNavigation();
  const { user, userProfile } = useAuth();

  // Role-based access control
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canManageEvents = isOwner || isManager;

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [emailRecipients, setEmailRecipients] = useState<EmailRecipient[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Modal state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState<Category | null>(null);
  const [showEditItem, setShowEditItem] = useState<{ item: Item; categoryId: string } | null>(null);
  const [showEditEvent, setShowEditEvent] = useState<Event | null>(null);

  // Form state
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmailName, setNewEmailName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editItemName, setEditItemName] = useState('');
  const [editItemPrice, setEditItemPrice] = useState('');
  const [editEventName, setEditEventName] = useState('');

  // Load data
  const loadData = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('consumption_categories')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('sort_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Load items
      const { data: itemsData, error: itemsError } = await supabase
        .from('consumption_items')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (itemsError) throw itemsError;

      // Combine categories with their items
      const categoriesWithItems = (categoriesData || []).map(cat => ({
        ...cat,
        items: (itemsData || []).filter(item => item.category_id === cat.id),
      }));

      setCategories(categoriesWithItems);

      // Load email recipients
      const { data: emailsData, error: emailsError } = await supabase
        .from('consumption_email_recipients')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: true });

      if (emailsError) throw emailsError;
      setEmailRecipients(emailsData || []);

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('consumption_events')
        .select('*')
        .eq('organization_id', userProfile.organization_id)
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load settings.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    if (userProfile?.organization_id) {
      loadData();
    }
  }, [userProfile?.organization_id, loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, [loadData]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  // Toggle category expansion
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

  // Category functions
  const addCategory = async () => {
    if (!newCategoryName.trim() || !userProfile?.organization_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase
        .from('consumption_categories')
        .insert({
          organization_id: userProfile.organization_id,
          name: newCategoryName.trim(),
          sort_order: categories.length,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories([...categories, { ...data, items: [] }]);
      setShowAddCategory(false);
      setNewCategoryName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateCategory = async () => {
    if (!editCategoryName.trim() || !showEditCategory) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('consumption_categories')
        .update({ name: editCategoryName.trim() })
        .eq('id', showEditCategory.id);

      if (error) throw error;

      setCategories(categories.map(cat =>
        cat.id === showEditCategory.id ? { ...cat, name: editCategoryName.trim() } : cat
      ));
      setShowEditCategory(null);
      setEditCategoryName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Failed to update category.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    Alert.alert(
      'Delete Category',
      'Delete this category and all its items?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              const { error } = await supabase
                .from('consumption_categories')
                .delete()
                .eq('id', categoryId);

              if (error) throw error;

              setCategories(categories.filter(cat => cat.id !== categoryId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  // Item functions
  const addItem = async (categoryId: string) => {
    if (!newItemName.trim() || !userProfile?.organization_id) return;

    const category = categories.find(c => c.id === categoryId);
    const itemCount = category?.items?.length || 0;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase
        .from('consumption_items')
        .insert({
          organization_id: userProfile.organization_id,
          category_id: categoryId,
          name: newItemName.trim(),
          price: parseFloat(newItemPrice) || 0,
          sort_order: itemCount,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...(cat.items || []), data] }
          : cat
      ));
      setShowAddItem(null);
      setNewItemName('');
      setNewItemPrice('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateItem = async () => {
    if (!editItemName.trim() || !showEditItem) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('consumption_items')
        .update({
          name: editItemName.trim(),
          price: parseFloat(editItemPrice) || 0,
        })
        .eq('id', showEditItem.item.id);

      if (error) throw error;

      setCategories(categories.map(cat =>
        cat.id === showEditItem.categoryId
          ? {
              ...cat,
              items: cat.items?.map(item =>
                item.id === showEditItem.item.id
                  ? { ...item, name: editItemName.trim(), price: parseFloat(editItemPrice) || 0 }
                  : item
              ),
            }
          : cat
      ));
      setShowEditItem(null);
      setEditItemName('');
      setEditItemPrice('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async (itemId: string, categoryId: string) => {
    Alert.alert(
      'Delete Item',
      'Delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              const { error } = await supabase
                .from('consumption_items')
                .delete()
                .eq('id', itemId);

              if (error) throw error;

              setCategories(categories.map(cat =>
                cat.id === categoryId
                  ? { ...cat, items: cat.items?.filter(item => item.id !== itemId) }
                  : cat
              ));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  // Email functions
  const addEmailRecipient = async () => {
    if (!newEmail.trim() || !userProfile?.organization_id) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { data, error } = await supabase
        .from('consumption_email_recipients')
        .insert({
          organization_id: userProfile.organization_id,
          email: newEmail.trim().toLowerCase(),
          name: newEmailName.trim() || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          Alert.alert('Duplicate', 'This email is already added.');
          return;
        }
        throw error;
      }

      setEmailRecipients([...emailRecipients, data]);
      setShowAddEmail(false);
      setNewEmail('');
      setNewEmailName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error adding email:', error);
      Alert.alert('Error', 'Failed to add email recipient.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEmailActive = async (emailId: string, currentState: boolean) => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const { error } = await supabase
        .from('consumption_email_recipients')
        .update({ is_active: !currentState })
        .eq('id', emailId);

      if (error) throw error;

      setEmailRecipients(emailRecipients.map(e =>
        e.id === emailId ? { ...e, is_active: !currentState } : e
      ));
    } catch (error) {
      console.error('Error toggling email:', error);
      Alert.alert('Error', 'Failed to update email.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEmailRecipient = async (emailId: string) => {
    Alert.alert(
      'Remove Recipient',
      'Remove this email recipient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              const { error } = await supabase
                .from('consumption_email_recipients')
                .delete()
                .eq('id', emailId);

              if (error) throw error;

              setEmailRecipients(emailRecipients.filter(e => e.id !== emailId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting email:', error);
              Alert.alert('Error', 'Failed to remove email recipient.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  // Event functions
  const updateEvent = async () => {
    if (!editEventName.trim() || !showEditEvent) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('consumption_events')
        .update({ name: editEventName.trim() })
        .eq('id', showEditEvent.id);

      if (error) throw error;

      setEvents(events.map(e =>
        e.id === showEditEvent.id ? { ...e, name: editEventName.trim() } : e
      ));
      setShowEditEvent(null);
      setEditEventName('');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert('Error', 'Failed to rename event.');
    } finally {
      setIsSaving(false);
    }
  };

  const markEventCompleted = async (eventId: string) => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('consumption_events')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status: 'completed' as const } : e
      ));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error completing event:', error);
      Alert.alert('Error', 'Failed to complete event.');
    } finally {
      setIsSaving(false);
    }
  };

  const reactivateEvent = async (eventId: string) => {
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('consumption_events')
        .update({
          status: 'active',
          completed_at: null,
        })
        .eq('id', eventId);

      if (error) throw error;

      setEvents(events.map(e =>
        e.id === eventId ? { ...e, status: 'active' as const } : e
      ));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error reactivating event:', error);
      Alert.alert('Error', 'Failed to reactivate event.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Delete this event? This will also delete all consumption counts for this event.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              // First delete counts for this event
              await supabase
                .from('consumption_counts')
                .delete()
                .eq('event_id', eventId);

              // Then delete the event
              const { error } = await supabase
                .from('consumption_events')
                .delete()
                .eq('id', eventId);

              if (error) throw error;

              setEvents(events.filter(e => e.id !== eventId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  // Analytics calculations
  const getAnalyticsData = useCallback(() => {
    const eventsWithData = events.filter(e => e.total_items > 0 || e.total_amount > 0);

    // Total stats
    const totalEvents = events.length;
    const totalItems = events.reduce((sum, e) => sum + (e.total_items || 0), 0);
    const totalAmount = events.reduce((sum, e) => sum + (e.total_amount || 0), 0);
    const avgRevenuePerEvent = totalEvents > 0 ? totalAmount / totalEvents : 0;
    const avgItemsPerEvent = totalEvents > 0 ? totalItems / totalEvents : 0;

    // Monthly breakdown
    const monthlyMap = new Map<string, MonthlyData>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    events.forEach(event => {
      const date = new Date(event.event_date);
      const monthNum = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${monthNum}`;

      const existing = monthlyMap.get(key);
      if (existing) {
        existing.totalItems += event.total_items || 0;
        existing.totalAmount += event.total_amount || 0;
        existing.eventCount += 1;
      } else {
        monthlyMap.set(key, {
          month: monthNames[monthNum],
          year,
          monthNum,
          totalItems: event.total_items || 0,
          totalAmount: event.total_amount || 0,
          eventCount: 1,
        });
      }
    });

    // Sort by date (most recent first)
    const monthlyData = Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthNum - a.monthNum;
    });

    return {
      totalEvents,
      totalItems,
      totalAmount,
      avgRevenuePerEvent,
      avgItemsPerEvent,
      monthlyData,
      eventsWithData,
    };
  }, [events]);

  // Render modal for adding/editing
  const renderModal = (
    visible: boolean,
    title: string,
    onClose: () => void,
    onSave: () => void,
    children: React.ReactNode
  ) => (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <X size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          {children}
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={onSave}
              disabled={isSaving}
            >
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalSaveGradient}
              >
                <Text style={styles.modalSaveText}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading settings..." />
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
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tabs - Email and Stats tabs only visible to managers/owners */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'categories' && styles.tabActive]}
          onPress={() => {
            setActiveTab('categories');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <Tag size={16} color={activeTab === 'categories' ? colors.textPrimary : colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'categories' && styles.tabTextActive]}>
            Items
          </Text>
        </TouchableOpacity>
        {canManageEvents && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'emails' && styles.tabActive]}
            onPress={() => {
              setActiveTab('emails');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Mail size={16} color={activeTab === 'emails' ? colors.textPrimary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'emails' && styles.tabTextActive]}>
              Email
            </Text>
          </TouchableOpacity>
        )}
        {canManageEvents && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'events' && styles.tabActive]}
            onPress={() => {
              setActiveTab('events');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Calendar size={16} color={activeTab === 'events' ? colors.textPrimary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
              Events
            </Text>
          </TouchableOpacity>
        )}
        {canManageEvents && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
            onPress={() => {
              setActiveTab('analytics');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <BarChart3 size={16} color={activeTab === 'analytics' ? colors.textPrimary : colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
        )}
      </View>

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
        {/* Categories & Items Tab */}
        {activeTab === 'categories' && (
          <View style={styles.section}>
            {/* Add Category Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddCategory(true)}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>

            {/* Categories List */}
            {categories.length === 0 ? (
              <View style={styles.emptyState}>
                <Tag size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Categories</Text>
                <Text style={styles.emptyText}>
                  Add your first category to start tracking items.
                </Text>
              </View>
            ) : (
              categories.map(category => {
                const isExpanded = expandedCategories.has(category.id);
                return (
                  <View key={category.id} style={styles.categoryCard}>
                    {/* Category Header */}
                    <TouchableOpacity
                      style={styles.categoryHeader}
                      onPress={() => toggleCategory(category.id)}
                    >
                      <View style={styles.categoryLeft}>
                        {isExpanded ? (
                          <ChevronDown size={20} color={colors.primary} />
                        ) : (
                          <ChevronRight size={20} color={colors.textSecondary} />
                        )}
                        <Text style={[styles.categoryName, isExpanded && styles.categoryNameActive]}>
                          {category.name}
                        </Text>
                      </View>
                      <View style={styles.categoryRight}>
                        <Text style={styles.categoryCount}>
                          {category.items?.length || 0} items
                        </Text>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => {
                            setShowEditCategory(category);
                            setEditCategoryName(category.name);
                          }}
                        >
                          <Edit2 size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.iconButton}
                          onPress={() => deleteCategory(category.id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {/* Items List */}
                    {isExpanded && (
                      <View style={styles.itemsList}>
                        {/* Add Item Button */}
                        <TouchableOpacity
                          style={styles.addItemButton}
                          onPress={() => setShowAddItem(category.id)}
                        >
                          <Plus size={16} color={colors.primary} />
                          <Text style={styles.addItemText}>Add Item</Text>
                        </TouchableOpacity>

                        {category.items?.map(item => (
                          <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => {
                                setShowEditItem({ item, categoryId: category.id });
                                setEditItemName(item.name);
                                setEditItemPrice(item.price.toString());
                              }}
                            >
                              <Edit2 size={14} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.iconButton}
                              onPress={() => deleteItem(item.id, category.id)}
                            >
                              <Trash2 size={14} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        ))}

                        {(!category.items || category.items.length === 0) && (
                          <Text style={styles.noItemsText}>No items in this category</Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Email Recipients Tab */}
        {activeTab === 'emails' && (
          <View style={styles.section}>
            <Text style={styles.sectionDescription}>
              These people will receive consumption reports when you send them.
            </Text>

            {/* Add Email Button */}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddEmail(true)}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add Email Recipient</Text>
            </TouchableOpacity>

            {/* Email Recipients List */}
            {emailRecipients.length === 0 ? (
              <View style={styles.emptyState}>
                <Mail size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Recipients</Text>
                <Text style={styles.emptyText}>
                  Add email recipients to receive consumption reports.
                </Text>
              </View>
            ) : (
              emailRecipients.map(recipient => (
                <View key={recipient.id} style={styles.emailCard}>
                  <View style={[styles.emailIcon, !recipient.is_active && styles.emailIconInactive]}>
                    <Mail size={20} color={recipient.is_active ? colors.primary : colors.textTertiary} />
                  </View>
                  <View style={styles.emailInfo}>
                    <Text style={[styles.emailAddress, !recipient.is_active && styles.emailAddressInactive]}>
                      {recipient.email}
                    </Text>
                    {recipient.name && (
                      <Text style={styles.emailName}>{recipient.name}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[styles.statusBadge, recipient.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive]}
                    onPress={() => toggleEmailActive(recipient.id, recipient.is_active)}
                  >
                    <Text style={[styles.statusText, recipient.is_active && styles.statusTextActive]}>
                      {recipient.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => deleteEmailRecipient(recipient.id)}
                  >
                    <Trash2 size={16} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <View style={styles.section}>
            <Text style={styles.sectionDescription}>
              Manage your events. Active events appear in the main tracker.
            </Text>

            {/* Events List */}
            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Calendar size={48} color={colors.textTertiary} />
                <Text style={styles.emptyTitle}>No Events</Text>
                <Text style={styles.emptyText}>
                  Create events from the main Consumption Tracker.
                </Text>
              </View>
            ) : (
              events.map(event => (
                <View key={event.id} style={styles.eventCard}>
                  <View style={[styles.eventIcon, event.status !== 'active' && styles.eventIconCompleted]}>
                    {event.status === 'active' ? (
                      <Clock size={20} color={colors.primary} />
                    ) : (
                      <CheckCircle size={20} color={colors.textTertiary} />
                    )}
                  </View>
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventName, event.status !== 'active' && styles.eventNameCompleted]}>
                      {event.name}
                    </Text>
                    <View style={styles.eventMeta}>
                      <Text style={styles.eventDate}>
                        {new Date(event.event_date).toLocaleDateString()}
                      </Text>
                      {(event.total_items > 0 || event.total_amount > 0) && (
                        <>
                          <Text style={styles.eventDot}> - </Text>
                          <Text style={styles.eventStats}>
                            {event.total_items} drinks
                          </Text>
                          <Text style={styles.eventDot}> - </Text>
                          <Text style={styles.eventAmount}>
                            ${event.total_amount?.toFixed(2) || '0.00'}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={[styles.eventStatus, event.status === 'active' ? styles.eventStatusActive : styles.eventStatusCompleted]}>
                    <Text style={[styles.eventStatusText, event.status === 'active' && styles.eventStatusTextActive]}>
                      {event.status === 'active' ? 'Active' : 'Done'}
                    </Text>
                  </View>
                  <View style={styles.eventActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        setShowEditEvent(event);
                        setEditEventName(event.name);
                      }}
                    >
                      <Edit2 size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {event.status === 'active' ? (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => markEventCompleted(event.id)}
                      >
                        <CheckCircle size={16} color={colors.success} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => reactivateEvent(event.id)}
                      >
                        <Clock size={16} color={colors.primary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => deleteEvent(event.id)}
                    >
                      <Trash2 size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <View style={styles.section}>
            {(() => {
              const analytics = getAnalyticsData();
              return (
                <>
                  {/* Summary Cards */}
                  <View style={styles.analyticsGrid}>
                    <View style={styles.analyticsCard}>
                      <Text style={styles.analyticsValue}>{analytics.totalEvents}</Text>
                      <Text style={styles.analyticsLabel}>Total Events</Text>
                    </View>
                    <View style={styles.analyticsCard}>
                      <Text style={styles.analyticsValue}>{analytics.totalItems}</Text>
                      <Text style={styles.analyticsLabel}>Total Drinks</Text>
                    </View>
                  </View>

                  <View style={styles.analyticsGrid}>
                    <View style={[styles.analyticsCard, styles.analyticsCardHighlight]}>
                      <Text style={styles.analyticsValueHighlight}>
                        ${analytics.totalAmount.toFixed(2)}
                      </Text>
                      <Text style={styles.analyticsLabelHighlight}>Total Revenue</Text>
                    </View>
                  </View>

                  <View style={styles.analyticsGrid}>
                    <View style={styles.analyticsCard}>
                      <Text style={styles.analyticsValueSmall}>
                        ${analytics.avgRevenuePerEvent.toFixed(2)}
                      </Text>
                      <Text style={styles.analyticsLabel}>Avg Revenue/Event</Text>
                    </View>
                    <View style={styles.analyticsCard}>
                      <Text style={styles.analyticsValueSmall}>
                        {analytics.avgItemsPerEvent.toFixed(1)}
                      </Text>
                      <Text style={styles.analyticsLabel}>Avg Drinks/Event</Text>
                    </View>
                  </View>

                  {/* Monthly Breakdown */}
                  {analytics.monthlyData.length > 0 && (
                    <>
                      <Text style={styles.analyticsSectionTitle}>Monthly Breakdown</Text>
                      {analytics.monthlyData.map((month, index) => (
                        <View key={`${month.year}-${month.monthNum}`} style={styles.monthlyRow}>
                          <View style={styles.monthlyInfo}>
                            <Text style={styles.monthlyMonth}>
                              {month.month} {month.year}
                            </Text>
                            <Text style={styles.monthlyEvents}>
                              {month.eventCount} event{month.eventCount !== 1 ? 's' : ''}
                            </Text>
                          </View>
                          <View style={styles.monthlyStats}>
                            <Text style={styles.monthlyItems}>{month.totalItems} drinks</Text>
                            <Text style={styles.monthlyAmount}>
                              ${month.totalAmount.toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  )}

                  {/* Events List with Revenue */}
                  {analytics.eventsWithData.length > 0 && (
                    <>
                      <Text style={styles.analyticsSectionTitle}>Events by Revenue</Text>
                      {[...analytics.eventsWithData]
                        .sort((a, b) => (b.total_amount || 0) - (a.total_amount || 0))
                        .map((event, index) => (
                          <View key={event.id} style={styles.eventRevenueRow}>
                            <View style={styles.eventRevenueRank}>
                              <Text style={styles.eventRevenueRankText}>#{index + 1}</Text>
                            </View>
                            <View style={styles.eventRevenueInfo}>
                              <Text style={styles.eventRevenueName}>{event.name}</Text>
                              <Text style={styles.eventRevenueDate}>
                                {new Date(event.event_date).toLocaleDateString()} - {event.total_items} drinks
                              </Text>
                            </View>
                            <Text style={styles.eventRevenueAmount}>
                              ${event.total_amount?.toFixed(2) || '0.00'}
                            </Text>
                          </View>
                        ))}
                    </>
                  )}

                  {events.length === 0 && (
                    <View style={styles.emptyState}>
                      <BarChart3 size={48} color={colors.textTertiary} />
                      <Text style={styles.emptyTitle}>No Data Yet</Text>
                      <Text style={styles.emptyText}>
                        Complete events to see analytics and reports.
                      </Text>
                    </View>
                  )}
                </>
              );
            })()}
          </View>
        )}
      </ScrollView>

      {/* Add Category Modal */}
      {renderModal(
        showAddCategory,
        'Add Category',
        () => {
          setShowAddCategory(false);
          setNewCategoryName('');
        },
        addCategory,
        <>
          <Text style={styles.inputLabel}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., VODKA, TEQUILA, WINE..."
            placeholderTextColor={colors.textTertiary}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={addCategory}
          />
        </>
      )}

      {/* Edit Category Modal */}
      {renderModal(
        !!showEditCategory,
        'Edit Category',
        () => {
          setShowEditCategory(null);
          setEditCategoryName('');
        },
        updateCategory,
        <>
          <Text style={styles.inputLabel}>Category Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Category name"
            placeholderTextColor={colors.textTertiary}
            value={editCategoryName}
            onChangeText={setEditCategoryName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={updateCategory}
          />
        </>
      )}

      {/* Add Item Modal */}
      {renderModal(
        !!showAddItem,
        'Add Item',
        () => {
          setShowAddItem(null);
          setNewItemName('');
          setNewItemPrice('');
        },
        () => showAddItem && addItem(showAddItem),
        <>
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Grey Goose, Patron Silver..."
            placeholderTextColor={colors.textTertiary}
            value={newItemName}
            onChangeText={setNewItemName}
            autoFocus
          />
          <Text style={styles.inputLabel}>Price</Text>
          <View style={styles.priceInputContainer}>
            <DollarSign size={18} color={colors.textTertiary} style={styles.priceIcon} />
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={() => showAddItem && addItem(showAddItem)}
            />
          </View>
        </>
      )}

      {/* Edit Item Modal */}
      {renderModal(
        !!showEditItem,
        'Edit Item',
        () => {
          setShowEditItem(null);
          setEditItemName('');
          setEditItemPrice('');
        },
        updateItem,
        <>
          <Text style={styles.inputLabel}>Item Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Item name"
            placeholderTextColor={colors.textTertiary}
            value={editItemName}
            onChangeText={setEditItemName}
            autoFocus
          />
          <Text style={styles.inputLabel}>Price</Text>
          <View style={styles.priceInputContainer}>
            <DollarSign size={18} color={colors.textTertiary} style={styles.priceIcon} />
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor={colors.textTertiary}
              value={editItemPrice}
              onChangeText={setEditItemPrice}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={updateItem}
            />
          </View>
        </>
      )}

      {/* Add Email Modal */}
      {renderModal(
        showAddEmail,
        'Add Email Recipient',
        () => {
          setShowAddEmail(false);
          setNewEmail('');
          setNewEmailName('');
        },
        addEmailRecipient,
        <>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="email@example.com"
            placeholderTextColor={colors.textTertiary}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
          />
          <Text style={styles.inputLabel}>Name (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            placeholderTextColor={colors.textTertiary}
            value={newEmailName}
            onChangeText={setNewEmailName}
            returnKeyType="done"
            onSubmitEditing={addEmailRecipient}
          />
        </>
      )}

      {/* Edit Event Modal */}
      {renderModal(
        !!showEditEvent,
        'Rename Event',
        () => {
          setShowEditEvent(null);
          setEditEventName('');
        },
        updateEvent,
        <>
          <Text style={styles.inputLabel}>Event Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Event name"
            placeholderTextColor={colors.textTertiary}
            value={editEventName}
            onChangeText={setEditEventName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={updateEvent}
          />
        </>
      )}
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
  headerSpacer: {
    width: 40,
  },
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    gap: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  section: {
    gap: spacing.md,
  },
  sectionDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  // Add Button
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.glassBorder,
    borderRadius: radius.base,
  },
  addButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
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
  // Category Card
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  categoryNameActive: {
    color: colors.primary,
  },
  categoryCount: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
  },
  // Items List
  itemsList: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.glassBorder,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  addItemText: {
    fontSize: typography.size.sm,
    color: colors.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  itemName: {
    flex: 1,
    fontSize: typography.size.sm,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  noItemsText: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  // Icon Button
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Email Card
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
    gap: spacing.sm,
  },
  emailIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailIconInactive: {
    backgroundColor: colors.surfaceLight,
  },
  emailInfo: {
    flex: 1,
    minWidth: 0,
  },
  emailAddress: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  emailAddressInactive: {
    color: colors.textTertiary,
  },
  emailName: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusBadgeActive: {
    backgroundColor: colors.primary + '20',
  },
  statusBadgeInactive: {
    backgroundColor: colors.surfaceLight,
  },
  statusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
  },
  statusTextActive: {
    color: colors.primary,
  },
  // Event Card
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: radius.base,
    gap: spacing.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventIconCompleted: {
    backgroundColor: colors.surfaceLight,
  },
  eventInfo: {
    flex: 1,
    minWidth: 0,
  },
  eventName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  eventNameCompleted: {
    color: colors.textSecondary,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  eventDate: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
  },
  eventDot: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
  },
  eventStats: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
  },
  eventAmount: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  eventStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  eventStatusActive: {
    backgroundColor: colors.primary + '20',
  },
  eventStatusCompleted: {
    backgroundColor: colors.surfaceLight,
  },
  eventStatusText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
  },
  eventStatusTextActive: {
    color: colors.primary,
  },
  eventActions: {
    flexDirection: 'row',
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
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.lg,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: spacing.lg,
  },
  priceIcon: {
    marginLeft: spacing.base,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
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
  modalSaveButton: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: radius.base,
  },
  modalSaveGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  modalSaveText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  // Analytics Styles
  analyticsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.base,
    alignItems: 'center',
  },
  analyticsCardHighlight: {
    backgroundColor: colors.primary,
  },
  analyticsValue: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  analyticsValueSmall: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  analyticsValueHighlight: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  analyticsLabel: {
    fontSize: typography.size.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
  analyticsLabelHighlight: {
    fontSize: typography.size.xs,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  analyticsSectionTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  monthlyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  monthlyInfo: {
    flex: 1,
  },
  monthlyMonth: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  monthlyEvents: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  monthlyStats: {
    alignItems: 'flex-end',
  },
  monthlyItems: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  monthlyAmount: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
    marginTop: 2,
  },
  eventRevenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.sm,
  },
  eventRevenueRank: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  eventRevenueRankText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  eventRevenueInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  eventRevenueName: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  eventRevenueDate: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  eventRevenueAmount: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
});

export default ConsumptionSettings;
