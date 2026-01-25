import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X,
  Crown,
  Check,
  ExternalLink,
  Package,
  BarChart3,
  Users,
  Shield,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RootStackScreenProps } from '../../navigation/types';
import { Button, Card } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

type PaywallScreenProps = RootStackScreenProps<'Paywall'>;

interface PlanCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  popular?: boolean;
  onPress: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  period,
  features,
  popular,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    style={[styles.planCard, popular && styles.planCardPopular]}
  >
    {popular && (
      <LinearGradient
        colors={colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.popularBadge}
      >
        <Crown size={12} color={colors.textPrimary} />
        <Text style={styles.popularText}>Most Popular</Text>
      </LinearGradient>
    )}
    <Text style={styles.planName}>{name}</Text>
    <View style={styles.priceRow}>
      <Text style={styles.planPrice}>${price}</Text>
      <Text style={styles.planPeriod}>/{period}</Text>
    </View>
    <View style={styles.planFeatures}>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureRow}>
          <Check size={16} color={colors.success} />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  </TouchableOpacity>
);

const FeatureHighlight: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <View style={styles.featureHighlight}>
    <View style={styles.featureIcon}>{icon}</View>
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation<PaywallScreenProps['navigation']>();
  const route = useRoute<PaywallScreenProps['route']>();
  const { appName, reason } = route.params;

  // Crown glow animation
  const glowOpacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [glowOpacity]);

  const handleSubscribe = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Open Safari to the pricing page
    const url = 'https://invyeasy.com/#pricing';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const getReasonMessage = () => {
    switch (reason) {
      case 'trial_expired':
        return 'Your free trial has ended. Upgrade to continue using all features.';
      case 'feature_limit':
        return 'You\'ve reached the limit of your current plan. Upgrade for unlimited access.';
      default:
        return `Unlock ${appName} and take your business to the next level.`;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <TouchableOpacity
          onPress={handleClose}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.crownContainer}>
            <Animated.View style={[styles.crownGlow, { opacity: glowOpacity }]} />
            <LinearGradient
              colors={colors.gradientPremium}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.crownBackground}
            >
              <Crown size={40} color={colors.textPrimary} />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Upgrade to Pro</Text>
          <Text style={styles.heroSubtitle}>{getReasonMessage()}</Text>
        </View>

        {/* Feature Highlights */}
        <View style={styles.highlightsSection}>
          <FeatureHighlight
            icon={<Package size={24} color={colors.primary} />}
            title="Unlimited Inventory"
            description="Track as many items as you need"
          />
          <FeatureHighlight
            icon={<BarChart3 size={24} color={colors.primary} />}
            title="Advanced Reports"
            description="Detailed analytics and insights"
          />
          <FeatureHighlight
            icon={<Users size={24} color={colors.primary} />}
            title="Team Access"
            description="Collaborate with your team"
          />
          <FeatureHighlight
            icon={<Shield size={24} color={colors.primary} />}
            title="Priority Support"
            description="Get help when you need it"
          />
        </View>

        {/* Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>Choose Your Plan</Text>

          <PlanCard
            name="Personal"
            price="19"
            period="month"
            features={['1 location', '500 items', 'Basic reports']}
            onPress={handleSubscribe}
          />

          <PlanCard
            name="Starter"
            price="89"
            period="month"
            features={['3 locations', 'Unlimited items', 'Advanced reports', 'Email support']}
            popular
            onPress={handleSubscribe}
          />

          <PlanCard
            name="Pro"
            price="229"
            period="month"
            features={['Unlimited locations', 'Unlimited items', 'All features', 'Priority support', 'API access']}
            onPress={handleSubscribe}
          />
        </View>

        {/* Subscribe Button */}
        <View style={styles.ctaSection}>
          <Button
            title="Subscribe on Website"
            onPress={handleSubscribe}
            size="lg"
            fullWidth
            icon={<ExternalLink size={20} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />}
          />
          <Text style={styles.ctaNote}>
            Subscription managed through our secure website
          </Text>
        </View>

        {/* Maybe Later */}
        <TouchableOpacity
          onPress={handleClose}
          style={styles.maybeLaterButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.maybeLaterText}>Maybe Later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  headerSpacer: {
    width: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  crownContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  crownGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
  },
  crownBackground: {
    width: 80,
    height: 80,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glowStrong,
  },
  heroTitle: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.md,
  },
  highlightsSection: {
    marginBottom: spacing['2xl'],
  },
  featureHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: spacing.base,
  },
  featureTitle: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  featureDescription: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  plansSection: {
    marginBottom: spacing.xl,
  },
  plansTitle: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.base,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  planCardPopular: {
    borderColor: colors.primary,
    ...shadows.glow,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomLeftRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  popularText: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  planName: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  planPrice: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
  },
  planPeriod: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  planFeatures: {
    gap: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  ctaSection: {
    marginBottom: spacing.xl,
  },
  ctaNote: {
    fontSize: typography.size.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  maybeLaterButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  maybeLaterText: {
    fontSize: typography.size.base,
    color: colors.textTertiary,
  },
});

export default PaywallScreen;
