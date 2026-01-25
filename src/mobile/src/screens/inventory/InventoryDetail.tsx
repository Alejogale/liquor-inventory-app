import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Package,
  Edit3,
  Trash2,
  X,
  DollarSign,
  AlertTriangle,
  Tag,
  Building2,
  Save,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface InventoryItem {
  id: string;
  brand: string;
  size?: string;
  barcode?: string;
  category_id?: string;
  category_name?: string;
  current_stock: number;
  price_per_item: number;
  threshold: number;
}

interface Category {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
}

interface RoomCount {
  room_id: string;
  room_name: string;
  count: number;
  updated_at?: string;
}

export const InventoryDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userProfile } = useAuth();
  const itemId = route.params?.itemId;

  const [isLoading, setIsLoading] = useState(true);
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [roomCounts, setRoomCounts] = useState<RoomCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editBrand, setEditBrand] = useState('');
  const [editSize, setEditSize] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editThreshold, setEditThreshold] = useState('');
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userProfile?.organization_id || !itemId) return;

    try {
      // Fetch item details
      const { data: itemData, error: itemError } = await supabase
        .from('inventory_items')
        .select(`
          id,
          brand,
          size,
          barcode,
          category_id,
          current_stock,
          price_per_item,
          threshold,
          categories(name)
        `)
        .eq('id', itemId)
        .single();

      if (itemError) throw itemError;

      const formattedItem = {
        ...itemData,
        category_name: (itemData.categories as any)?.name || 'Uncategorized',
      };
      setItem(formattedItem);

      // Initialize edit form
      setEditBrand(itemData.brand || '');
      setEditSize(itemData.size || '');
      setEditBarcode(itemData.barcode || '');
      setEditPrice(String(itemData.price_per_item || 0));
      setEditThreshold(String(itemData.threshold || 0));
      setEditCategoryId(itemData.category_id);

      // Fetch room counts for this item
      const { data: countsData, error: countsError } = await supabase
        .from('room_counts')
        .select(`
          room_id,
          count,
          updated_at,
          rooms(name)
        `)
        .eq('inventory_item_id', itemId);

      if (!countsError && countsData) {
        const formattedCounts = countsData.map(c => ({
          room_id: c.room_id,
          room_name: (c.rooms as any)?.name || 'Unknown Room',
          count: c.count,
          updated_at: c.updated_at,
        }));
        setRoomCounts(formattedCounts);
      }

      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (catData) {
        setCategories(catData);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
      Alert.alert('Error', 'Failed to load item details.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [userProfile?.organization_id, itemId, navigation]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsEditing(true);
  }, []);

  const handleCancelEdit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Reset form to original values
    if (item) {
      setEditBrand(item.brand || '');
      setEditSize(item.size || '');
      setEditBarcode(item.barcode || '');
      setEditPrice(String(item.price_per_item || 0));
      setEditThreshold(String(item.threshold || 0));
      setEditCategoryId(item.category_id || null);
    }
    setIsEditing(false);
  }, [item]);

  const handleSave = useCallback(async () => {
    if (!editBrand.trim()) {
      Alert.alert('Error', 'Brand name is required.');
      return;
    }

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          brand: editBrand.trim(),
          size: editSize.trim() || null,
          barcode: editBarcode.trim() || null,
          price_per_item: parseFloat(editPrice) || 0,
          threshold: parseInt(editThreshold) || 0,
          category_id: editCategoryId,
        })
        .eq('id', itemId);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Item updated successfully!');
      setIsEditing(false);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item.');
    } finally {
      setIsSaving(false);
    }
  }, [itemId, editBrand, editSize, editBarcode, editPrice, editThreshold, editCategoryId, fetchData]);

  const handleDelete = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item?.brand}"? This will also delete all count records for this item.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete room counts first
              await supabase
                .from('room_counts')
                .delete()
                .eq('inventory_item_id', itemId);

              // Delete the item
              const { error } = await supabase
                .from('inventory_items')
                .delete()
                .eq('id', itemId);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Deleted', 'Item has been deleted.');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item.');
            }
          },
        },
      ]
    );
  }, [item, itemId, navigation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTimeAgo = (dateString: string | null | undefined) => {
    if (!dateString) return 'Never counted';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatNumber = (value: number) => {
    // Round to 1 decimal, remove trailing .0
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
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

  if (!item) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isLowStock = (item.current_stock || 0) <= (item.threshold || 0);
  const totalValue = (item.current_stock || 0) * (item.price_per_item || 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Item Details</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleEdit}>
            <Edit3 size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleDelete}>
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Header Card */}
        <View style={styles.itemCard}>
          <View style={[styles.itemIcon, isLowStock && styles.itemIconWarning]}>
            <Package size={32} color={isLowStock ? colors.warning : colors.primary} />
          </View>
          <Text style={styles.itemName}>{item.brand}</Text>
          {item.size && <Text style={styles.itemSize}>{item.size}</Text>}
          <View style={styles.categoryBadge}>
            <Tag size={14} color={colors.textSecondary} />
            <Text style={styles.categoryText}>{item.category_name}</Text>
          </View>
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <AlertTriangle size={14} color={colors.warning} />
              <Text style={styles.lowStockText}>Low Stock</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Current Stock</Text>
            <Text style={[styles.statValue, isLowStock && styles.statValueWarning]}>
              {formatNumber(item.current_stock || 0)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Unit Price</Text>
            <Text style={styles.statValue}>{formatCurrency(item.price_per_item || 0)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Value</Text>
            <Text style={styles.statValue}>{formatCurrency(totalValue)}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Threshold</Text>
            <Text style={styles.statValue}>{formatNumber(item.threshold || 0)}</Text>
          </View>
        </View>

        {/* Room Counts */}
        <Text style={styles.sectionTitle}>Stock by Room</Text>
        {roomCounts.length > 0 ? (
          <View style={styles.roomCountsList}>
            {roomCounts.map((rc) => (
              <View key={rc.room_id} style={styles.roomCountItem}>
                <View style={styles.roomCountIcon}>
                  <Building2 size={18} color={colors.primary} />
                </View>
                <View style={styles.roomCountInfo}>
                  <Text style={styles.roomCountName}>{rc.room_name}</Text>
                  <Text style={styles.roomCountLastCounted}>
                    {formatTimeAgo(rc.updated_at)}
                  </Text>
                </View>
                <Text style={styles.roomCountValue}>{formatNumber(rc.count)}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyRooms}>
            <Text style={styles.emptyRoomsText}>No counts recorded for this item</Text>
          </View>
        )}

        {/* Barcode */}
        {item.barcode && (
          <>
            <Text style={styles.sectionTitle}>Barcode</Text>
            <View style={styles.barcodeCard}>
              <Text style={styles.barcodeText}>{item.barcode}</Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCancelEdit}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCancelEdit}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Item</Text>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              >
                <Save size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Brand */}
              <Text style={styles.inputLabel}>Brand Name *</Text>
              <TextInput
                style={styles.input}
                value={editBrand}
                onChangeText={setEditBrand}
                placeholder="Enter brand name"
                placeholderTextColor={colors.textTertiary}
              />

              {/* Size */}
              <Text style={styles.inputLabel}>Size</Text>
              <TextInput
                style={styles.input}
                value={editSize}
                onChangeText={setEditSize}
                placeholder="e.g., 750ml, 1L"
                placeholderTextColor={colors.textTertiary}
              />

              {/* Barcode */}
              <Text style={styles.inputLabel}>Barcode</Text>
              <TextInput
                style={styles.input}
                value={editBarcode}
                onChangeText={setEditBarcode}
                placeholder="Enter barcode"
                placeholderTextColor={colors.textTertiary}
              />

              {/* Price */}
              <Text style={styles.inputLabel}>Price per Item</Text>
              <TextInput
                style={styles.input}
                value={editPrice}
                onChangeText={setEditPrice}
                placeholder="0.00"
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
              />

              {/* Threshold */}
              <Text style={styles.inputLabel}>Low Stock Threshold</Text>
              <TextInput
                style={styles.input}
                value={editThreshold}
                onChangeText={setEditThreshold}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="number-pad"
              />

              {/* Category */}
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryPicker}>
                <TouchableOpacity
                  style={[
                    styles.categoryOption,
                    !editCategoryId && styles.categoryOptionActive,
                  ]}
                  onPress={() => setEditCategoryId(null)}
                >
                  <Text style={[
                    styles.categoryOptionText,
                    !editCategoryId && styles.categoryOptionTextActive,
                  ]}>None</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryOption,
                      editCategoryId === cat.id && styles.categoryOptionActive,
                    ]}
                    onPress={() => setEditCategoryId(cat.id)}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      editCategoryId === cat.id && styles.categoryOptionTextActive,
                    ]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
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
  errorText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  itemIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  itemIconWarning: {
    backgroundColor: colors.warning + '20',
  },
  itemName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  itemSize: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.full,
  },
  categoryText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.warning + '20',
    borderRadius: radius.full,
  },
  lowStockText: {
    fontSize: typography.size.sm,
    color: colors.warning,
    fontWeight: typography.weight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
  },
  statLabel: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statValueWarning: {
    color: colors.warning,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  roomCountsList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  roomCountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  roomCountIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomCountInfo: {
    flex: 1,
  },
  roomCountName: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  roomCountLastCounted: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  roomCountValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.primary,
  },
  emptyRooms: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyRoomsText: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
  },
  barcodeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
  },
  barcodeText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  modalTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  modalScroll: {
    flex: 1,
    padding: spacing.base,
  },
  inputLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
  },
  categoryOptionActive: {
    backgroundColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  categoryOptionTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
});

export default InventoryDetail;
