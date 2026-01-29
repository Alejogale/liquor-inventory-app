import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, ExternalLink, Sparkles, Shield, Clock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackScreenProps } from '../../navigation/types';
import { Button } from '../../components/common';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';

type SignUpScreenProps = AuthStackScreenProps<'SignUp'>;

const FeatureItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>{icon}</View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenProps['navigation']>();

  const handleSignUpOnWebsite = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const url = 'https://invyeasy.com/signup';
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    }
  }, []);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  }, [navigation]);

  const handleSignIn = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Sparkles size={32} color={colors.textPrimary} />
          </LinearGradient>

          <Text style={styles.title}>Start Your Free Trial</Text>
          <Text style={styles.subtitle}>
            Create your account on our secure website to get started with a 30-day free trial.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <FeatureItem
            icon={<Clock size={20} color={colors.primary} />}
            text="30-day free trial"
          />
          <FeatureItem
            icon={<Shield size={20} color={colors.primary} />}
            text="Secure payment via Stripe"
          />
          <FeatureItem
            icon={<Check size={20} color={colors.primary} />}
            text="Cancel anytime"
          />
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <Button
            title="Sign Up on Website"
            onPress={handleSignUpOnWebsite}
            size="lg"
            fullWidth
            icon={<ExternalLink size={20} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />}
          />
          <Text style={styles.ctaNote}>
            You'll be redirected to invyeasy.com
          </Text>
        </View>

        {/* Sign In Link */}
        <View style={styles.signInSection}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleSignIn}>
            <Text style={styles.signInLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.glow,
  },
  title: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.size.base * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.md,
  },
  featuresSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.base,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.size.base,
    color: colors.textPrimary,
    fontWeight: typography.weight.medium,
  },
  ctaSection: {
    marginBottom: spacing.xl,
  },
  ctaNote: {
    fontSize: typography.size.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  signInSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signInText: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
  },
  signInLink: {
    fontSize: typography.size.base,
    color: colors.primary,
    fontWeight: typography.weight.semibold,
  },
});

export default SignUpScreen;
