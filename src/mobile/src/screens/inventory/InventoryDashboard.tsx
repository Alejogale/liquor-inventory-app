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
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package,
  ClipboardList,
  Building2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Boxes,
  ArrowLeft,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { supabase, useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  totalRooms: number;
  recentActivity: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, trendValue, onPress }) => (
  <TouchableOpacity
    style={styles.statCard}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={styles.statIconContainer}>{icon}</View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {trend && trendValue && (
      <View style={styles.trendContainer}>
        {trend === 'up' ? (
          <TrendingUp size={12} color={colors.success} />
        ) : trend === 'down' ? (
          <TrendingDown size={12} color={colors.error} />
        ) : null}
        <Text style={[
          styles.trendText,
          trend === 'up' && styles.trendUp,
          trend === 'down' && styles.trendDown,
        ]}>
          {trendValue}
        </Text>
      </View>
    )}
  </TouchableOpacity>
);

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.quickActionIcon}>{icon}</View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

export const InventoryDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    totalRooms: 0,
    recentActivity: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    if (!userProfile?.organization_id) return;

    try {
      // Fetch items count and value
      const { data: items, error: itemsError } = await supabase
        .from('inventory_items')
        .select('id, current_stock, price_per_item, threshold')
        .eq('organization_id', userProfile.organization_id);

      if (itemsError) throw itemsError;

      const totalItems = items?.length || 0;
      const totalValue = items?.reduce((sum, item) => {
        return sum + ((item.current_stock || 0) * (item.price_per_item || 0));
      }, 0) || 0;
      const lowStockItems = items?.filter(item =>
        (item.current_stock || 0) <= (item.threshold || 0)
      ).length || 0;

      // Fetch rooms count
      const { count: roomsCount, error: roomsError } = await supabase
        .from('rooms')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', userProfile.organization_id);

      if (roomsError) throw roomsError;

      setStats({
        totalItems,
        totalValue,
        lowStockItems,
        totalRooms: roomsCount || 0,
        recentActivity: 0, // TODO: Calculate from recent transactions
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userProfile?.organization_id]);

  useEffect(() => {
    if (userProfile?.organization_id) {
      fetchDashboardData();
    }
  }, [userProfile?.organization_id, fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickCount = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Count');
  }, [navigation]);

  const handleViewInventory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Inventory');
  }, [navigation]);

  const handleViewRooms = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('More');
  }, [navigation]);

  const handleViewReports = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('More');
  }, [navigation]);

  const handleBackToApps = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AppPicker');
  }, [navigation]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner variant="branded" message="Loading dashboard..." />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToApps}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>
              Welcome back{userProfile?.full_name ? `, ${userProfile.full_name.split(' ')[0]}` : ''}
            </Text>
            <Text style={styles.subtitle}>Here's your inventory overview</Text>
          </View>
        </View>

        {/* Total Value Card */}
        <LinearGradient
          colors={colors.gradientPrimary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.valueCard}
        >
          <Text style={styles.valueLabel}>Total Inventory Value</Text>
          <Text style={styles.valueAmount}>{formatCurrency(stats.totalValue)}</Text>
          <View style={styles.valueFooter}>
            <Text style={styles.valueSubtext}>{stats.totalItems} items in stock</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Package size={24} color={colors.primary} />}
            label="Total Items"
            value={stats.totalItems}
            onPress={handleViewInventory}
          />
          <StatCard
            icon={<AlertTriangle size={24} color={stats.lowStockItems > 0 ? colors.warning : colors.success} />}
            label="Low Stock"
            value={stats.lowStockItems}
          />
          <StatCard
            icon={<Building2 size={24} color={colors.primary} />}
            label="Rooms"
            value={stats.totalRooms}
            onPress={handleViewRooms}
          />
          <StatCard
            icon={<BarChart3 size={24} color={colors.primary} />}
            label="Reports"
            value="View"
            onPress={handleViewReports}
          />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon={<ClipboardList size={24} color={colors.primary} />}
            label="Start Count"
            onPress={handleQuickCount}
          />
          <QuickAction
            icon={<Package size={24} color={colors.primary} />}
            label="View Items"
            onPress={handleViewInventory}
          />
          <QuickAction
            icon={<Building2 size={24} color={colors.primary} />}
            label="Rooms"
            onPress={handleViewRooms}
          />
          <QuickAction
            icon={<BarChart3 size={24} color={colors.primary} />}
            label="Reports"
            onPress={handleViewReports}
          />
        </View>

        {/* Low Stock Alert */}
        {stats.lowStockItems > 0 && (
          <TouchableOpacity style={styles.alertCard} activeOpacity={0.8}>
            <View style={styles.alertIcon}>
              <AlertTriangle size={24} color={colors.warning} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Low Stock Alert</Text>
              <Text style={styles.alertText}>
                {stats.lowStockItems} item{stats.lowStockItems !== 1 ? 's' : ''} running low
              </Text>
            </View>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  valueCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.glow,
  },
  valueLabel: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueAmount: {
    fontSize: typography.size['4xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  valueFooter: {
    marginTop: spacing.md,
  },
  valueSubtext: {
    fontSize: typography.size.sm,
    color: 'rgba(255,255,255,0.7)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
    gap: 4,
  },
  trendText: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
  },
  trendUp: {
    color: colors.success,
  },
  trendDown: {
    color: colors.error,
  },
  sectionTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    borderRadius: radius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.warning + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.warning,
  },
  alertText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default InventoryDashboard;
