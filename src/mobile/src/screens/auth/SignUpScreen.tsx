import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, User, Building2, Mail, Lock, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { AuthStackScreenProps } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/common';
import { colors, typography, spacing, radius } from '../../constants/theme';

type SignUpScreenProps = AuthStackScreenProps<'SignUp'>;

type Step = 1 | 2 | 3;

interface FormData {
  firstName: string;
  lastName: string;
  organizationName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<SignUpScreenProps['navigation']>();
  const { signUp } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    organizationName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Refs for focusing
  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Progress animation
  const progressWidth = useRef(new Animated.Value(33.33)).current;

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: step * 33.33,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false, // width animation can't use native driver
    }).start();
  }, [step, progressWidth]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = useCallback((currentStep: Step): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
    } else if (currentStep === 2) {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
    } else if (currentStep === 3) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = useCallback(() => {
    if (!validateStep(step)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 3) {
      setStep((prev) => (prev + 1) as Step);
    } else {
      handleSignUp();
    }
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step > 1) {
      setStep((prev) => (prev - 1) as Step);
    } else {
      navigation.goBack();
    }
  }, [step, navigation]);

  const handleSignUp = useCallback(async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
        email: formData.email,
        password: formData.password,
      });

      Alert.alert(
        'Account Created!',
        'Your account has been created successfully. Please sign in to continue.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Sign Up Failed', error.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [signUp, formData, navigation]);

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              s <= step && styles.stepCircleActive,
              s < step && styles.stepCircleCompleted,
            ]}
          >
            {s < step ? (
              <Check size={14} color={colors.textPrimary} />
            ) : (
              <Text
                style={[
                  styles.stepNumber,
                  s <= step && styles.stepNumberActive,
                ]}
              >
                {s}
              </Text>
            )}
          </View>
          {s < 3 && (
            <View
              style={[
                styles.stepLine,
                s < step && styles.stepLineActive,
              ]}
            />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>What's your name?</Text>
      <Text style={styles.stepSubtitle}>
        Let's start with the basics
      </Text>

      <View style={styles.formGroup}>
        <Input
          label="First Name"
          placeholder="John"
          autoCapitalize="words"
          autoComplete="given-name"
          value={formData.firstName}
          onChangeText={(text) => updateField('firstName', text)}
          error={errors.firstName}
          icon={<User size={20} color={colors.textTertiary} />}
          returnKeyType="next"
          onSubmitEditing={() => lastNameRef.current?.focus()}
        />

        <Input
          ref={lastNameRef}
          label="Last Name"
          placeholder="Doe"
          autoCapitalize="words"
          autoComplete="family-name"
          value={formData.lastName}
          onChangeText={(text) => updateField('lastName', text)}
          error={errors.lastName}
          icon={<User size={20} color={colors.textTertiary} />}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Your organization</Text>
      <Text style={styles.stepSubtitle}>
        Where do you work?
      </Text>

      <View style={styles.formGroup}>
        <Input
          label="Organization Name"
          placeholder="Acme Bar & Grill"
          autoCapitalize="words"
          autoComplete="organization"
          value={formData.organizationName}
          onChangeText={(text) => updateField('organizationName', text)}
          error={errors.organizationName}
          icon={<Building2 size={20} color={colors.textTertiary} />}
          returnKeyType="next"
          onSubmitEditing={handleNext}
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Account details</Text>
      <Text style={styles.stepSubtitle}>
        Secure your account
      </Text>

      <View style={styles.formGroup}>
        <Input
          ref={emailRef}
          label="Email"
          placeholder="john@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          error={errors.email}
          icon={<Mail size={20} color={colors.textTertiary} />}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />

        <Input
          ref={passwordRef}
          label="Password"
          placeholder="At least 8 characters"
          secureTextEntry
          autoComplete="new-password"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          error={errors.password}
          icon={<Lock size={20} color={colors.textTertiary} />}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
        />

        <Input
          ref={confirmPasswordRef}
          label="Confirm Password"
          placeholder="Re-enter your password"
          secureTextEntry
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          error={errors.confirmPassword}
          icon={<Lock size={20} color={colors.textTertiary} />}
          returnKeyType="go"
          onSubmitEditing={handleNext}
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
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

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressFill, {
              width: progressWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              })
            }]}>
              <LinearGradient
                colors={colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        </View>

        {/* Step Indicator */}
        {renderStepIndicator()}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Bottom Button */}
        <View style={styles.bottomSection}>
          <Button
            title={step === 3 ? 'Create Account' : 'Continue'}
            onPress={handleNext}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
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
  progressContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  stepCircleActive: {
    borderColor: colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.textTertiary,
  },
  stepNumberActive: {
    color: colors.primary,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.xs,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.size['2xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  stepSubtitle: {
    fontSize: typography.size.base,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  formGroup: {
    gap: spacing.sm,
  },
  bottomSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

export default SignUpScreen;
