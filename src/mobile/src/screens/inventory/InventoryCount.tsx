import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ClipboardList,
  Building2,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  Search,
  Package,
  ScanBarcode,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner, BarcodeScanner } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

interface Room {
  id: string;
  name: string;
  display_order?: number;
  lastCounted?: string | null;
}

interface InventoryItem {
  id: string;
  brand: string;
  size?: string;
  barcode?: string;
  current_stock: number;
  category_name?: string;
}

interface CountEntry {
  item_id: string;
  quantity: number;
}

export const InventoryCount: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  // Role-based access control - Viewers cannot save counts
  const isViewer = userProfile?.role === 'viewer';

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [itemLastCounted, setItemLastCounted] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, display_order')
        .eq('organization_id', userProfile.organization_id)
        .order('display_order');

      if (roomsError) throw roomsError;

      // For each room, get the most recent count timestamp
      const roomsWithLastCounted = await Promise.all(
        (roomsData || []).map(async (room) => {
          const { data: countData } = await supabase
            .from('room_counts')
            .select('updated_at')
            .eq('room_id', room.id)
            .order('updated_at', { ascending: false })
            .limit(1);

          return {
            ...room,
            lastCounted: countData?.[0]?.updated_at || null,
          };
        })
      );

      setRooms(roomsWithLastCounted);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to load rooms.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  const fetchItems = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          brand,
          size,
          barcode,
          current_stock,
          categories(name)
        `)
        .eq('organization_id', userProfile.organization_id)
        .order('brand');

      if (error) throw error;

      const formattedItems = (data || []).map(item => ({
        ...item,
        category_name: (item.categories as any)?.name || 'Uncategorized',
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [userProfile?.organization_id]);

  const fetchRoomCounts = useCallback(async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('room_counts')
        .select('inventory_item_id, count, updated_at')
        .eq('room_id', roomId);

      if (error) throw error;

      const countsMap: Record<string, number> = {};
      const inputValuesMap: Record<string, string> = {};
      const lastCountedMap: Record<string, string> = {};
      (data || []).forEach(entry => {
        countsMap[entry.inventory_item_id] = entry.count;
        inputValuesMap[entry.inventory_item_id] = String(entry.count);
        if (entry.updated_at) {
          lastCountedMap[entry.inventory_item_id] = entry.updated_at;
        }
      });
      setCounts(countsMap);
      setInputValues(inputValuesMap);
      setItemLastCounted(lastCountedMap);
    } catch (error) {
      console.error('Error fetching room counts:', error);
    }
  }, []);

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchRooms();
      fetchItems();
    }
  }, [userProfile?.organization_id, fetchRooms, fetchItems]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchRooms();
  }, [fetchRooms]);

  const handleRoomSelect = useCallback((room: Room) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedRoom(room);
    fetchRoomCounts(room.id);
  }, [fetchRoomCounts]);

  const updateCount = useCallback((itemId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCounts(prev => {
      const current = prev[itemId] || 0;
      // Round to 1 decimal place to avoid floating point issues
      const newValue = Math.max(0, Math.round((current + delta) * 10) / 10);
      // Also update inputValues to keep them in sync
      setInputValues(prevInputs => ({ ...prevInputs, [itemId]: String(newValue) }));
      return { ...prev, [itemId]: newValue };
    });
  }, []);

  const setCount = useCallback((itemId: string, value: string) => {
    // Always update the raw input value so user sees what they type (including "1.")
    setInputValues(prev => ({ ...prev, [itemId]: value }));

    // Parse and update the numeric count
    if (value === '' || value === '.') {
      setCounts(prev => ({ ...prev, [itemId]: 0 }));
      return;
    }
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setCounts(prev => ({ ...prev, [itemId]: Math.max(0, numValue) }));
    }
  }, []);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    // Find item with matching barcode
    const matchedItem = items.find(item => item.barcode === barcode);

    if (matchedItem) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Set search to item's brand name to filter and show just this item
      setSearchQuery(matchedItem.brand);
      setHighlightedItemId(matchedItem.id);

      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedItemId(null);
      }, 3000);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Item Not Found',
        `No item found with barcode: ${barcode}`,
        [{ text: 'OK' }]
      );
    }
  }, [items]);

  const handleSaveCounts = useCallback(async () => {
    if (!selectedRoom || !userProfile?.organization_id) return;

    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Delete existing counts for this room
      await supabase
        .from('room_counts')
        .delete()
        .eq('room_id', selectedRoom.id);

      // Insert new counts
      const entries = Object.entries(counts)
        .filter(([_, qty]) => qty > 0)
        .map(([itemId, countValue]) => ({
          room_id: selectedRoom.id,
          inventory_item_id: itemId,
          count: countValue,
          organization_id: userProfile.organization_id,
        }));

      if (entries.length > 0) {
        const { error } = await supabase
          .from('room_counts')
          .insert(entries);

        if (error) throw error;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Count saved successfully!');

      // Refresh the last counted timestamps for this room
      fetchRoomCounts(selectedRoom.id);
    } catch (error) {
      console.error('Error saving counts:', error);
      Alert.alert('Error', 'Failed to save count.');
    } finally {
      setIsSaving(false);
    }
  }, [selectedRoom, counts, userProfile, fetchRoomCounts]);

  const filteredItems = items.filter(item =>
    item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.size?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalCount = () => {
    const total = Object.values(counts).reduce((sum, qty) => sum + qty, 0);
    // Round to 1 decimal place to avoid floating point display issues
    return Math.round(total * 10) / 10;
  };

  const formatNumber = (value: number) => {
    // Round to 1 decimal, remove trailing .0
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading..." />
        </View>
      </SafeAreaView>
    );
  }

  // Room Selection View
  if (!selectedRoom) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Count Inventory</Text>
        </View>

        <Text style={styles.subtitle}>Select a room to start counting</Text>

        <FlatList
          data={rooms}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.roomsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item: room }) => (
            <TouchableOpacity
              style={styles.roomCard}
              onPress={() => handleRoomSelect(room)}
              activeOpacity={0.7}
            >
              <View style={styles.roomIcon}>
                <Building2 size={24} color={colors.primary} />
              </View>
              <View style={styles.roomContent}>
                <Text style={styles.roomName}>{room.name}</Text>
                <Text style={styles.roomLastCounted}>
                  Last counted: {formatTimeAgo(room.lastCounted)}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Building2 size={48} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No Rooms</Text>
              <Text style={styles.emptyText}>
                Add rooms from the More menu to start counting.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  // Counting View
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedRoom(null);
            setCounts({});
          }}
        >
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.roomTitle}>{selectedRoom.name}</Text>
          <Text style={styles.itemCount}>{getTotalCount()} items counted</Text>
        </View>
        {!isViewer ? (
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveCounts}
            disabled={isSaving}
          >
            <Check size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {/* Scan Barcode Button */}
      <View style={styles.scanContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowScanner(true);
          }}
          activeOpacity={0.7}
        >
          <ScanBarcode size={20} color={colors.primary} />
          <Text style={styles.scanButtonText}>Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.itemsList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[
            styles.countItem,
            highlightedItemId === item.id && styles.countItemHighlighted
          ]}>
            <View style={styles.countItemInfo}>
              <View style={styles.countItemHeader}>
                <Text style={styles.countItemName} numberOfLines={1}>{item.brand}</Text>
                {itemLastCounted[item.id] && (
                  <Text style={styles.countItemLastCounted}>
                    {formatTimeAgo(itemLastCounted[item.id])}
                  </Text>
                )}
              </View>
              <Text style={styles.countItemCategory}>
                {item.size ? `${item.size} • ` : ''}{item.category_name}
              </Text>
            </View>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => updateCount(item.id, -1)}
              >
                <Minus size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TextInput
                style={styles.counterInput}
                value={inputValues[item.id] ?? String(counts[item.id] || 0)}
                onChangeText={(val) => setCount(item.id, val)}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={[styles.counterButton, styles.counterButtonPlus]}
                onPress={() => updateCount(item.id, 1)}
              >
                <Plus size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Items</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No items match your search' : 'Add inventory items first'}
            </Text>
          </View>
        }
      />

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalInfo}>
          <Text style={styles.totalLabel}>Total Items</Text>
          <Text style={styles.totalValue}>{getTotalCount()}</Text>
        </View>
        {isViewer ? (
          <View style={styles.viewOnlyBadge}>
            <Text style={styles.viewOnlyText}>View Only</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.saveButtonLarge, isSaving && styles.saveButtonDisabled]}
            onPress={handleSaveCounts}
            disabled={isSaving}
          >
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Check size={20} color={colors.textPrimary} />
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save Count'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Barcode Scanner Modal */}
      <BarcodeScanner
        visible={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScanned}
      />
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
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  itemCount: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: radius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  roomsList: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  roomContent: {
    flex: 1,
  },
  roomName: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  roomLastCounted: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  roomDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scanContainer: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    height: 44,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  scanButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  itemsList: {
    paddingHorizontal: spacing.base,
    paddingBottom: 120,
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  countItemHighlighted: {
    backgroundColor: colors.primary + '30',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  countItemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  countItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countItemName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  countItemLastCounted: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  countItemCategory: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonPlus: {
    backgroundColor: colors.primary,
  },
  counterInput: {
    width: 50,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
    textAlign: 'center',
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  totalInfo: {},
  totalLabel: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  saveButtonLarge: {
    overflow: 'hidden',
    borderRadius: radius.base,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  saveButtonText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
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
    marginTop: spacing.sm,
    textAlign: 'center',
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
});

export default InventoryCount;
