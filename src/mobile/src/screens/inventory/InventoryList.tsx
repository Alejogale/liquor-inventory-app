import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  X,
  Package,
  Plus,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  ScanBarcode,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner, BarcodeScanner } from '../../components/common';
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

export const InventoryList: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'value'>('name');
  const [showScanner, setShowScanner] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (catError) throw catError;
      setCategories(categoriesData || []);

      // Fetch items with category names
      const { data: itemsData, error: itemsError } = await supabase
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
        .eq('organization_id', userProfile.organization_id)
        .order('brand');

      if (itemsError) throw itemsError;

      const formattedItems = (itemsData || []).map(item => ({
        ...item,
        category_name: (item.categories as any)?.name || 'Uncategorized',
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      Alert.alert('Error', 'Failed to load inventory.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchData();
    }
  }, [userProfile?.organization_id, fetchData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          item.brand.toLowerCase().includes(query) ||
          item.size?.toLowerCase().includes(query) ||
          item.barcode?.toLowerCase().includes(query) ||
          item.category_name?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(item => item.category_id === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'stock':
        result.sort((a, b) => (a.current_stock || 0) - (b.current_stock || 0));
        break;
      case 'value':
        result.sort((a, b) => ((b.current_stock || 0) * (b.price_per_item || 0)) - ((a.current_stock || 0) * (a.price_per_item || 0)));
        break;
      default:
        result.sort((a, b) => a.brand.localeCompare(b.brand));
    }

    return result;
  }, [items, searchQuery, selectedCategory, sortBy]);

  const handleItemPress = useCallback((item: InventoryItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('InventoryDetail', { itemId: item.id });
  }, [navigation]);

  const handleAddItem = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('InventoryAdd');
  }, [navigation]);

  const cycleSortBy = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSortBy(current => {
      switch (current) {
        case 'name': return 'stock';
        case 'stock': return 'value';
        default: return 'name';
      }
    });
  }, []);

  const handleBarcodeScanned = useCallback((barcode: string) => {
    // Find item with matching barcode
    const matchedItem = items.find(item => item.barcode === barcode);

    if (matchedItem) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('InventoryDetail', { itemId: matchedItem.id });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Item Not Found',
        `No item found with barcode: ${barcode}`,
        [{ text: 'OK' }]
      );
    }
  }, [items, navigation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    // Round to 1 decimal, remove trailing .0
    const rounded = Math.round(value * 10) / 10;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
  };

  const renderItem = useCallback(({ item }: { item: InventoryItem }) => {
    const isLowStock = (item.current_stock || 0) <= (item.threshold || 0);
    const totalValue = (item.current_stock || 0) * (item.price_per_item || 0);

    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemIcon}>
          <Package size={24} color={isLowStock ? colors.warning : colors.primary} />
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName} numberOfLines={1}>{item.brand}</Text>
            {isLowStock && (
              <AlertTriangle size={16} color={colors.warning} />
            )}
          </View>
          <Text style={styles.itemCategory}>
            {item.size ? `${item.size} • ` : ''}{item.category_name}
          </Text>
          <View style={styles.itemStats}>
            <View style={styles.itemStat}>
              <Text style={styles.itemStatLabel}>Stock</Text>
              <Text style={[styles.itemStatValue, isLowStock && styles.lowStock]}>
                {formatNumber(item.current_stock || 0)}
              </Text>
            </View>
            <View style={styles.itemStat}>
              <Text style={styles.itemStatLabel}>Value</Text>
              <Text style={styles.itemStatValue}>{formatCurrency(totalValue)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handleItemPress]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading inventory..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
          <Plus size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
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
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowScanner(true);
          }}
        >
          <ScanBarcode size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sortButton} onPress={cycleSortBy}>
          <ArrowUpDown size={20} color={colors.textSecondary} />
          <Text style={styles.sortText}>
            {sortBy === 'name' ? 'A-Z' : sortBy === 'stock' ? 'Stock' : 'Value'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <FlatList
        horizontal
        data={[{ id: null, name: 'All' }, ...categories]}
        keyExtractor={item => item.id || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryFilter}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              (selectedCategory === cat.id || (cat.id === null && selectedCategory === null)) && styles.categoryChipActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedCategory(cat.id);
            }}
          >
            <Text style={[
              styles.categoryChipText,
              (selectedCategory === cat.id || (cat.id === null && selectedCategory === null)) && styles.categoryChipTextActive,
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Items List */}
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={48} color={colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Items Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery || selectedCategory
                ? 'Try adjusting your filters'
                : 'Add your first inventory item'}
            </Text>
          </View>
        }
      />

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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: radius.base,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchBar: {
    flex: 1,
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
  scanButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.xs,
  },
  sortText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  categoryFilter: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  listContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  itemCategory: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  itemStats: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.xl,
  },
  itemStat: {},
  itemStatLabel: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  itemStatValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  lowStock: {
    color: colors.warning,
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
});

export default InventoryList;
