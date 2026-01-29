import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Truck,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Tag,
  TrendingUp,
  Crown,
  ArrowLeft,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, typography, spacing, radius } from '../../constants/theme';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onPress: () => void;
  showBadge?: boolean;
  badgeText?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  description,
  onPress,
  showBadge,
  badgeText,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.menuItemIcon}>{icon}</View>
    <View style={styles.menuItemContent}>
      <Text style={styles.menuItemLabel}>{label}</Text>
      {description && <Text style={styles.menuItemDescription}>{description}</Text>}
    </View>
    {showBadge && (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badgeText}</Text>
      </View>
    )}
    <ChevronRight size={20} color={colors.textTertiary} />
  </TouchableOpacity>
);

export const InventoryMore: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userProfile, signOut } = useAuth();

  // Role-based access control
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canManage = isOwner || isManager;

  const handleNavigate = useCallback((screen: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(screen);
  }, [navigation]);

  const handleSignOut = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  }, [signOut]);

  const handleBackToApps = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('AppPicker');
  }, [navigation]);

  const handleComingSoon = useCallback((feature: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Coming Soon', `${feature} will be available soon!`);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToApps}>
            <ArrowLeft size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>More</Text>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {userProfile?.full_name?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userProfile?.full_name || 'User'}</Text>
            <Text style={styles.userOrg}>Your Organization</Text>
          </View>
        </View>

        {/* Inventory Section - Only for Owner/Manager */}
        {canManage && (
          <>
            <Text style={styles.sectionTitle}>Inventory</Text>
            <View style={styles.menuSection}>
              <MenuItem
                icon={<Building2 size={22} color={colors.primary} />}
                label="Rooms"
                description="Manage storage locations"
                onPress={() => handleNavigate('RoomsManagement')}
              />
              <MenuItem
                icon={<Tag size={22} color={colors.primary} />}
                label="Categories"
                description="Organize your items"
                onPress={() => handleNavigate('CategoriesManagement')}
              />
              <MenuItem
                icon={<Truck size={22} color={colors.primary} />}
                label="Suppliers"
                description="Manage vendors"
                onPress={() => handleNavigate('SuppliersManagement')}
              />
              <MenuItem
                icon={<ShoppingCart size={22} color={colors.primary} />}
                label="Orders"
                description="Track purchase orders"
                onPress={() => handleComingSoon('Orders')}
              />
            </View>
          </>
        )}

        {/* Reports Section - Only for Owner/Manager */}
        {canManage && (
          <>
            <Text style={styles.sectionTitle}>Reports & Analytics</Text>
            <View style={styles.menuSection}>
              <MenuItem
                icon={<BarChart3 size={22} color={colors.primary} />}
                label="Reports"
                description="View inventory reports"
                onPress={() => handleNavigate('Reports')}
              />
              <MenuItem
                icon={<TrendingUp size={22} color={colors.primary} />}
                label="Analytics"
                description="Stock trends and insights"
                onPress={() => handleComingSoon('Analytics')}
              />
            </View>
          </>
        )}

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuSection}>
          {/* Subscription - Owner only */}
          {isOwner && (
            <MenuItem
              icon={<Crown size={22} color={colors.warning} />}
              label="Subscription"
              description="Manage your plan"
              onPress={() => navigation.navigate('Paywall', { appName: 'InvyEasy', reason: 'upgrade_required' })}
            />
          )}
          <MenuItem
            icon={<Settings size={22} color={colors.primary} />}
            label="Settings"
            description="App preferences"
            onPress={() => handleComingSoon('Settings')}
          />
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.backToAppsButton} onPress={handleBackToApps}>
            <ArrowLeft size={20} color={colors.textSecondary} />
            <Text style={styles.backToAppsText}>Back to Apps</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['3xl'],
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
    marginRight: spacing.md,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    marginBottom: spacing.xl,
    padding: spacing.base,
    borderRadius: radius.lg,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userAvatarText: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  userOrg: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  menuSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.base,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.medium,
    color: colors.textPrimary,
  },
  menuItemDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginRight: spacing.sm,
  },
  badgeText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  actionsSection: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  backToAppsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  backToAppsText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  signOutText: {
    fontSize: typography.size.base,
    color: colors.error,
  },
});

export default InventoryMore;
