import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  BarChart3,
  Package,
  DollarSign,
  AlertTriangle,
  Building2,
  Tag,
  TrendingDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface SummaryStats {
  totalItems: number;
  totalValue: number;
  totalStock: number;
  lowStockCount: number;
}

interface LowStockItem {
  id: string;
  brand: string;
  current_stock: number;
  threshold: number;
}

interface RoomStock {
  id: string;
  name: string;
  itemCount: number;
  totalCount: number;
}

interface CategoryStock {
  id: string;
  name: string;
  itemCount: number;
  totalValue: number;
}

export const Reports: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile } = useAuth();

  // Role-based access control - Only Owner/Manager can view reports
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canViewReports = isOwner || isManager;

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [summary, setSummary] = useState<SummaryStats>({
    totalItems: 0,
    totalValue: 0,
    totalStock: 0,
    lowStockCount: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [roomStock, setRoomStock] = useState<RoomStock[]>([]);
  const [categoryStock, setCategoryStock] = useState<CategoryStock[]>([]);

  const fetchReportData = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch all inventory items
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, brand, current_stock, price_per_item, threshold, category_id')
        .eq('organization_id', userProfile.organization_id);

      if (itemsError) throw itemsError;

      // Calculate summary stats
      const totalItems = items?.length || 0;
      const totalStock = items?.reduce((sum, item) => sum + (item.current_stock || 0), 0) || 0;
      const totalValue = items?.reduce((sum, item) =>
        sum + ((item.current_stock || 0) * (item.price_per_item || 0)), 0) || 0;

      // Find low stock items
      const lowStock = (items || []).filter(item =>
        (item.current_stock || 0) <= (item.threshold || 0) && (item.threshold || 0) > 0
      );

      setSummary({
        totalItems,
        totalValue,
        totalStock,
        lowStockCount: lowStock.length,
      });

      setLowStockItems(lowStock.slice(0, 10)); // Show top 10

      // Fetch rooms with stock counts
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (rooms) {
        const roomsWithStock = await Promise.all(
          rooms.map(async (room) => {
            const { data: counts } = await supabase
              .from('room_counts')
              .select('count')
              .eq('room_id', room.id);

            const totalCount = counts?.reduce((sum, c) => sum + (c.count || 0), 0) || 0;
            const itemCount = counts?.filter(c => (c.count || 0) > 0).length || 0;

            return {
              id: room.id,
              name: room.name,
              itemCount,
              totalCount,
            };
          })
        );
        setRoomStock(roomsWithStock);
      }

      // Fetch categories with stock
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('organization_id', userProfile.organization_id)
        .order('name');

      if (categories && items) {
        const categoriesWithStock = categories.map(category => {
          const categoryItems = items.filter(item => item.category_id === category.id);
          const itemCount = categoryItems.length;
          const totalValue = categoryItems.reduce((sum, item) =>
            sum + ((item.current_stock || 0) * (item.price_per_item || 0)), 0);

          return {
            id: category.id,
            name: category.name,
            itemCount,
            totalValue,
          };
        });
        setCategoryStock(categoriesWithStock);
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReportData();
  }, [fetchReportData]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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
          <LoadingSpinner variant="branded" message="Loading reports..." />
        </View>
      </SafeAreaView>
    );
  }

  // Staff and Viewers cannot view reports
  if (!canViewReports) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Reports</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 }}>
            You don't have permission to view reports. Contact your manager for access.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Summary Cards */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.primary + '20' }]}>
              <Package size={20} color={colors.primary} />
            </View>
            <Text style={styles.summaryValue}>{summary.totalItems}</Text>
            <Text style={styles.summaryLabel}>Total Items</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.success + '20' }]}>
              <DollarSign size={20} color={colors.success} />
            </View>
            <Text style={styles.summaryValue}>{formatCurrency(summary.totalValue)}</Text>
            <Text style={styles.summaryLabel}>Total Value</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.info + '20' }]}>
              <BarChart3 size={20} color={colors.info} />
            </View>
            <Text style={styles.summaryValue}>{formatNumber(summary.totalStock)}</Text>
            <Text style={styles.summaryLabel}>Total Stock</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.warning + '20' }]}>
              <AlertTriangle size={20} color={colors.warning} />
            </View>
            <Text style={[styles.summaryValue, summary.lowStockCount > 0 && styles.warningText]}>
              {summary.lowStockCount}
            </Text>
            <Text style={styles.summaryLabel}>Low Stock</Text>
          </View>
        </View>

        {/* Low Stock Items */}
        {lowStockItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Low Stock Items</Text>
            <View style={styles.listCard}>
              {lowStockItems.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.listItem,
                    index === lowStockItems.length - 1 && styles.listItemLast
                  ]}
                >
                  <TrendingDown size={16} color={colors.warning} />
                  <Text style={styles.listItemName} numberOfLines={1}>{item.brand}</Text>
                  <Text style={styles.listItemValue}>
                    {formatNumber(item.current_stock)} / {formatNumber(item.threshold)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Stock by Room */}
        {roomStock.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Stock by Room</Text>
            <View style={styles.listCard}>
              {roomStock.map((room, index) => (
                <View
                  key={room.id}
                  style={[
                    styles.listItem,
                    index === roomStock.length - 1 && styles.listItemLast
                  ]}
                >
                  <Building2 size={16} color={colors.primary} />
                  <Text style={styles.listItemName}>{room.name}</Text>
                  <View style={styles.listItemStats}>
                    <Text style={styles.listItemValue}>{formatNumber(room.totalCount)} units</Text>
                    <Text style={styles.listItemSubvalue}>{room.itemCount} items</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Stock by Category */}
        {categoryStock.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Stock by Category</Text>
            <View style={styles.listCard}>
              {categoryStock.map((category, index) => (
                <View
                  key={category.id}
                  style={[
                    styles.listItem,
                    index === categoryStock.length - 1 && styles.listItemLast
                  ]}
                >
                  <Tag size={16} color={colors.primary} />
                  <Text style={styles.listItemName}>{category.name}</Text>
                  <View style={styles.listItemStats}>
                    <Text style={styles.listItemValue}>{formatCurrency(category.totalValue)}</Text>
                    <Text style={styles.listItemSubvalue}>{category.itemCount} items</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
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
  title: {
    flex: 1,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing['3xl'],
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  summaryValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
  warningText: {
    color: colors.warning,
  },
  listCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
    gap: spacing.sm,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemName: {
    flex: 1,
    fontSize: typography.size.base,
    color: colors.textPrimary,
  },
  listItemStats: {
    alignItems: 'flex-end',
  },
  listItemValue: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  listItemSubvalue: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
  },
});

export default Reports;
