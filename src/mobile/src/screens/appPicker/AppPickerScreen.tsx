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
import { LinearGradient } from 'expo-linear-gradient';
import {
  Package,
  Wine,
  Sparkles,
  ChevronRight,
  Settings,
  LogOut,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

type AppPickerScreenProps = RootStackScreenProps<'AppPicker'>;

interface AppCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  comingSoon?: boolean;
}

const AppCard: React.FC<AppCardProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  disabled,
  comingSoon,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.7}
    disabled={disabled && !comingSoon}
    style={[styles.appCard, disabled && styles.appCardDisabled]}
  >
    <View style={styles.appCardIcon}>
      {icon}
    </View>
    <View style={styles.appCardContent}>
      <View style={styles.appCardTitleRow}>
        <Text style={[styles.appCardTitle, disabled && styles.appCardTitleDisabled]}>
          {title}
        </Text>
        {comingSoon && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        )}
      </View>
      <Text style={[styles.appCardSubtitle, disabled && styles.appCardSubtitleDisabled]}>
        {subtitle}
      </Text>
    </View>
    {!disabled && (
      <ChevronRight size={20} color={colors.textTertiary} />
    )}
  </TouchableOpacity>
);

export const AppPickerScreen: React.FC = () => {
  const navigation = useNavigation<AppPickerScreenProps['navigation']>();
  const { userProfile, signOut } = useAuth();

  // Extract user info from profile
  const firstName = userProfile?.full_name?.split(' ')[0] || 'User';
  const organizationName = 'Your Organization'; // TODO: Fetch from organization table

  // Role-based access control
  const isOwner = userProfile?.role === 'owner';
  const isManager = userProfile?.role === 'manager';
  const canManageTeam = isOwner || isManager;

  // TODO: Get actual subscription status from backend
  const hasInventoryAccess = true;
  const hasConsumptionAccess = true; // Enabled for testing

  const handleInventoryPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasInventoryAccess) {
      navigation.navigate('InventoryApp');
    } else {
      navigation.navigate('Paywall', {
        appName: 'InvyEasy',
        reason: 'upgrade_required',
      });
    }
  }, [hasInventoryAccess, navigation]);

  const handleConsumptionPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (hasConsumptionAccess) {
      navigation.navigate('ConsumptionDashboard');
    } else {
      navigation.navigate('Paywall', {
        appName: 'Consumption Tracker',
        reason: 'upgrade_required',
      });
    }
  }, [hasConsumptionAccess, navigation]);

  const handleComingSoonPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'Coming Soon',
      'We\'re working on exciting new features. Stay tuned!',
      [{ text: 'OK' }]
    );
  }, []);

  const handleTeamMembers = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TeamManagement');
  }, [navigation]);

  const handleSettings = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Settings', 'Settings will be available soon.');
  }, []);

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
            // Navigation will happen automatically via auth state change
          },
        },
      ]
    );
  }, [signOut]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome, {firstName}</Text>
          <Text style={styles.organization}>{organizationName}</Text>
        </View>

        {/* Apps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Apps</Text>

          <AppCard
            icon={<Package size={28} color={colors.primary} />}
            title="InvyEasy"
            subtitle="Liquor inventory management"
            onPress={handleInventoryPress}
          />

          <AppCard
            icon={<Wine size={28} color={colors.primary} />}
            title="Consumption Tracker"
            subtitle="Track drink sales at events"
            onPress={handleConsumptionPress}
          />

          <AppCard
            icon={<Sparkles size={28} color={colors.textTertiary} />}
            title="More coming soon"
            subtitle="Stay tuned for new features..."
            onPress={handleComingSoonPress}
            disabled
            comingSoon
          />
        </View>

        {/* Organization Section - Only for Owners/Managers */}
        {canManageTeam && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organization</Text>

            <AppCard
              icon={<Users size={28} color={colors.primary} />}
              title="Team Members"
              subtitle="Manage team access & roles"
              onPress={handleTeamMembers}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSettings}
          >
            <Settings size={20} color={colors.textSecondary} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSignOut}
          >
            <LogOut size={20} color={colors.error} />
            <Text style={[styles.actionText, styles.signOutText]}>Sign Out</Text>
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
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginTop: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  greeting: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  organization: {
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
  },
  appCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
  },
  appCardDisabled: {
    opacity: 0.6,
  },
  appCardIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appCardContent: {
    flex: 1,
    marginLeft: spacing.base,
  },
  appCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appCardTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  appCardTitleDisabled: {
    color: colors.textSecondary,
  },
  appCardSubtitle: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  appCardSubtitleDisabled: {
    color: colors.textTertiary,
  },
  comingSoonBadge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.primary + '20',
    borderRadius: radius.sm,
  },
  comingSoonText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.semibold,
    color: colors.primary,
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  actionText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  signOutText: {
    color: colors.error,
  },
  actionDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.glassBorder,
    marginHorizontal: spacing.md,
  },
});

export default AppPickerScreen;
