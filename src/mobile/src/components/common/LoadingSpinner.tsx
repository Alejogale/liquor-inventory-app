import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package } from 'lucide-react-native';
import { colors, typography, spacing, radius } from '../../constants/theme';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerVariant = 'default' | 'branded' | 'overlay';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  variant = 'default',
  message,
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (variant === 'branded') {
      const scaleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            useNativeDriver: true,
          }),
        ])
      );

      const opacityAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      scaleAnimation.start();
      opacityAnimation.start();

      return () => {
        scaleAnimation.stop();
        opacityAnimation.stop();
      };
    }
  }, [variant, scale, opacity]);

  const sizeValue = getSizeValue(size);

  if (variant === 'branded') {
    return (
      <View style={styles.brandedContainer}>
        <Animated.View style={{ transform: [{ scale }], opacity }}>
          <LinearGradient
            colors={colors.gradientPrimary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.brandedSpinner, { width: sizeValue * 2, height: sizeValue * 2 }]}
          >
            <Package size={sizeValue} color={colors.textPrimary} />
          </LinearGradient>
        </Animated.View>
        {message && (
          <Text style={styles.message}>{message}</Text>
        )}
      </View>
    );
  }

  if (variant === 'overlay') {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          {message && (
            <Text style={styles.overlayMessage}>{message}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={size === 'lg' ? 'large' : 'small'}
        color={colors.primary}
      />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
};

const getSizeValue = (size: SpinnerSize): number => {
  switch (size) {
    case 'sm': return 20;
    case 'lg': return 40;
    default: return 28;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
  },
  brandedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  brandedSpinner: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayHeavy,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  overlayContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  overlayMessage: {
    marginTop: spacing.md,
    fontSize: typography.size.base,
    color: colors.textPrimary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
