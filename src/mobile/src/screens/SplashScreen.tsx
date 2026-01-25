import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Package } from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows, animation } from '../constants/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo fade in and scale up
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Glow pulse
    Animated.sequence([
      Animated.delay(300),
      Animated.timing(glowOpacity, {
        toValue: 0.6,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Text fade in
    Animated.sequence([
      Animated.delay(500),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade out and finish
    Animated.sequence([
      Animated.delay(animation.splash - 400),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish();
    });
  }, [logoScale, logoOpacity, textOpacity, glowOpacity, containerOpacity, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      <View style={styles.content}>
        {/* Logo with glow */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />
          <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity }}>
            <LinearGradient
              colors={colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBackground}
            >
              <Package size={48} color={colors.textPrimary} />
            </LinearGradient>
          </Animated.View>
        </View>

        {/* App name */}
        <Animated.Text style={[styles.appName, { opacity: textOpacity }]}>
          InvyEasy
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
          Inventory made simple
        </Animated.Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
  },
  logoBackground: {
    width: 88,
    height: 88,
    borderRadius: radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  appName: {
    marginTop: spacing.xl,
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  tagline: {
    marginTop: spacing.sm,
    fontSize: typography.size.md,
    color: colors.textSecondary,
  },
});

export default SplashScreen;
