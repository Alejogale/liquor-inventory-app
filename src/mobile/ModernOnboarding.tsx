import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop, G } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Robinhood-style Modern Illustrations
const InventoryIllustration = ({ animatedValue }: { animatedValue: Animated.Value }) => {
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
    extrapolate: 'clamp',
  });

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ transform: [{ scale }], opacity }}>
      <Svg width={320} height={240} viewBox="0 0 320 240">
        <Defs>
          <SvgLinearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF6B35" stopOpacity="1" />
            <Stop offset="1" stopColor="#F7931E" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#4ECDC4" stopOpacity="1" />
            <Stop offset="1" stopColor="#44A08D" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Modern phone mockup */}
        <Rect x="80" y="30" width="160" height="180" rx="20" fill="#1A1A1A" />
        <Rect x="90" y="45" width="140" height="150" rx="10" fill="#FFFFFF" />

        {/* App content */}
        <Rect x="100" y="60" width="120" height="8" rx="4" fill="#E8E8E8" />
        <Rect x="100" y="75" width="80" height="6" rx="3" fill="#F5F5F5" />

        {/* Inventory cards */}
        <G opacity="0.9">
          <Rect x="100" y="90" width="120" height="30" rx="8" fill="url(#grad1)" />
          <Rect x="100" y="128" width="120" height="30" rx="8" fill="url(#grad2)" />
          <Rect x="100" y="166" width="120" height="20" rx="6" fill="#6C63FF" opacity="0.8" />
        </G>

        {/* Floating elements */}
        <Circle cx="50" cy="80" r="8" fill="#FF6B35" opacity="0.3" />
        <Circle cx="270" cy="100" r="12" fill="#4ECDC4" opacity="0.3" />
        <Circle cx="60" cy="160" r="6" fill="#6C63FF" opacity="0.3" />
        <Circle cx="260" cy="180" r="10" fill="#F7931E" opacity="0.3" />
      </Svg>
    </Animated.View>
  );
};

const CountingIllustration = ({ animatedValue }: { animatedValue: Animated.Value }) => {
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
    extrapolate: 'clamp',
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.05, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
      <Svg width={320} height={240} viewBox="0 0 320 240">
        <Defs>
          <SvgLinearGradient id="grad3" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#667EEA" stopOpacity="1" />
            <Stop offset="1" stopColor="#764BA2" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="grad4" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#00F260" stopOpacity="1" />
            <Stop offset="1" stopColor="#0575E6" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Phone */}
        <Rect x="80" y="20" width="160" height="200" rx="24" fill="#1A1A1A" />
        <Rect x="90" y="35" width="140" height="170" rx="16" fill="#FAFAFA" />

        {/* Counter interface */}
        <Circle cx="160" cy="120" r="45" fill="url(#grad3)" opacity="0.9" />
        <Path
          d="M 160 95 L 160 145 M 135 120 L 185 120"
          stroke="#FFFFFF"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Number display */}
        <Rect x="130" y="60" width="60" height="35" rx="8" fill="#F5F5F5" />
        <Rect x="135" y="67" width="50" height="20" rx="4" fill="url(#grad4)" opacity="0.8" />

        {/* Action buttons */}
        <Circle cx="110" cy="180" r="15" fill="#FF6B35" opacity="0.85" />
        <Circle cx="210" cy="180" r="15" fill="#4ECDC4" opacity="0.85" />

        {/* Animated dots */}
        <Circle cx="40" cy="60" r="5" fill="#667EEA" opacity="0.4" />
        <Circle cx="280" cy="90" r="7" fill="#FF6B35" opacity="0.4" />
        <Circle cx="50" cy="200" r="6" fill="#4ECDC4" opacity="0.4" />
        <Circle cx="270" cy="170" r="8" fill="#764BA2" opacity="0.4" />
      </Svg>
    </Animated.View>
  );
};

const AnalyticsIllustration = ({ animatedValue }: { animatedValue: Animated.Value }) => {
  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
    extrapolate: 'clamp',
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.85, 1.08, 1],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ transform: [{ rotate }, { scale }] }}>
      <Svg width={320} height={240} viewBox="0 0 320 240">
        <Defs>
          <SvgLinearGradient id="grad5" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FA709A" stopOpacity="1" />
            <Stop offset="1" stopColor="#FEE140" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="grad6" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#30CFD0" stopOpacity="1" />
            <Stop offset="1" stopColor="#330867" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Phone mockup */}
        <Rect x="80" y="20" width="160" height="200" rx="24" fill="#1A1A1A" />
        <Rect x="90" y="35" width="140" height="170" rx="16" fill="#FFFFFF" />

        {/* Chart bars */}
        <Rect x="100" y="120" width="18" height="60" rx="4" fill="url(#grad5)" opacity="0.85" />
        <Rect x="125" y="100" width="18" height="80" rx="4" fill="url(#grad6)" opacity="0.85" />
        <Rect x="150" y="90" width="18" height="90" rx="4" fill="#6C63FF" opacity="0.85" />
        <Rect x="175" y="110" width="18" height="70" rx="4" fill="#FF6B35" opacity="0.85" />
        <Rect x="200" y="130" width="18" height="50" rx="4" fill="#4ECDC4" opacity="0.85" />

        {/* Trend line */}
        <Path
          d="M 100 140 Q 130 120 150 100 Q 170 115 190 125 Q 205 135 220 145"
          stroke="#667EEA"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Data points */}
        <Circle cx="100" cy="140" r="4" fill="#667EEA" />
        <Circle cx="130" cy="120" r="4" fill="#667EEA" />
        <Circle cx="150" cy="100" r="4" fill="#667EEA" />
        <Circle cx="170" cy="115" r="4" fill="#667EEA" />
        <Circle cx="190" cy="125" r="4" fill="#667EEA" />
        <Circle cx="210" cy="135" r="4" fill="#667EEA" />

        {/* Stats cards */}
        <Rect x="100" y="55" width="50" height="25" rx="6" fill="#F5F5F5" />
        <Rect x="160" y="55" width="50" height="25" rx="6" fill="#F5F5F5" />

        {/* Floating elements */}
        <Circle cx="50" cy="70" r="6" fill="#FA709A" opacity="0.3" />
        <Circle cx="270" cy="100" r="8" fill="#30CFD0" opacity="0.3" />
        <Circle cx="60" cy="180" r="5" fill="#6C63FF" opacity="0.3" />
        <Circle cx="260" cy="200" r="7" fill="#FEE140" opacity="0.3" />
      </Svg>
    </Animated.View>
  );
};

const ModernOnboarding = ({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const pages = [
    {
      title: "InvyEasy",
      subtitle: "Manage smarter, not harder",
      description: "Track, count, and organize your entire inventory with an app designed for simplicity and speed.",
      illustration: InventoryIllustration,
      gradient: ['#3B82F6', '#2563EB'] as const,
      color: '#3B82F6'
    },
    {
      title: "Count with Ease",
      subtitle: "Fast, accurate counting",
      description: "Tap to count, save instantly. The fastest way to keep your inventory up to date.",
      illustration: CountingIllustration,
      gradient: ['#10B981', '#059669'] as const,
      color: '#10B981'
    },
    {
      title: "Powerful Insights",
      subtitle: "Data that drives decisions",
      description: "Real-time analytics and reports help you make smarter business decisions.",
      illustration: AnalyticsIllustration,
      gradient: ['#8B5CF6', '#7C3AED'] as const,
      color: '#8B5CF6'
    }
  ];

  useEffect(() => {
    // Animate current page
    Animated.spring(animatedValues[currentPage], {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: false,
    }).start();

    // Reset other pages
    animatedValues.forEach((value, index) => {
      if (index !== currentPage) {
        Animated.timing(value, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [currentPage]);

  const handleScroll = (event: any) => {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentPage(pageIndex);
  };

  const scrollToPage = (pageIndex: number) => {
    scrollViewRef.current?.scrollTo({ x: pageIndex * width, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* Subtle dark gradient background */}
      <LinearGradient
        colors={['#0B0B0C', '#1A1A1C', '#0B0B0C']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Modern Branded Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoIconWrapper}>
          <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
            <Path
              d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
              stroke="#F97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"
              stroke="#F97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.logoText}>InvyEasy</Text>
      </View>

      {/* Scrollable Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {pages.map((page, index) => {
          const Illustration = page.illustration;
          return (
            <View key={index} style={styles.page}>
              <View style={styles.content}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                  <Illustration animatedValue={animatedValues[index]} />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{page.title}</Text>
                  <Text style={styles.subtitle}>{page.subtitle}</Text>
                  <Text style={styles.description}>{page.description}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.indicators}>
        {pages.map((page, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.indicator,
              currentPage === index && styles.indicatorActive
            ]}
            onPress={() => scrollToPage(index)}
          />
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={onGetStarted}
          activeOpacity={0.85}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={onLogin} activeOpacity={0.7}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginTextBold}>Sign in</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0C',  // Deep black base for premium feel
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,  // Very subtle gradient (black to dark gray)
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 30,
    paddingBottom: 10,
    gap: 12,
  },
  logoIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',  // Translucent glass panel
    alignItems: 'center',
    justifyContent: 'center',
    // Premium shadow system
    shadowColor: '#F97316',  // Orange glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
    // Glass border
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',  // Pure white text
    letterSpacing: -0.8,
    // Subtle orange inner glow via text shadow
    textShadowColor: 'rgba(249, 115, 22, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
  },
  illustrationContainer: {
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',  // Semibold for clean corporate look
    color: '#FFFFFF',  // Pure white
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.8,
    // Subtle white text shadow for depth
    textShadowColor: 'rgba(255, 255, 255, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',  // Semibold
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
    color: '#FFFFFF',  // Pure white for subtitle
  },
  description: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white for subtext
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
    fontWeight: '400',
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 25,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',  // Frosted glass inactive
    marginHorizontal: 4,
    // Subtle depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 1,
  },
  indicatorActive: {
    width: 28,
    // Orange accent glow for active indicator
    backgroundColor: '#F97316',  // Orange micro-accent
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  actions: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  getStartedButton: {
    paddingVertical: 18,
    borderRadius: 20,  // Larger radius for premium feel
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',  // Frosted glass default
    // Orange-tinted glow shadow
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    // Orange accent border with glow
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.5)',
  },
  getStartedText: {
    color: '#FFFFFF',  // Pure white text
    fontSize: 18,
    fontWeight: '600',  // Semibold
    letterSpacing: 0.2,
  },
  loginButton: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',  // Very subtle glass
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // Subtle glass border
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',  // Translucent white
    fontSize: 16,
    fontWeight: '400',
  },
  loginTextBold: {
    fontWeight: '600',
    color: '#FFFFFF',  // Pure white for emphasis
  },
});

export default ModernOnboarding;
