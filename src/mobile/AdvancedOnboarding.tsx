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
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Advanced Vector Illustrations with Gradients
const InventoryIllustration = ({ animatedValue }: { animatedValue: Animated.Value }) => {
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '5deg'],
    extrapolate: 'clamp',
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ 
      transform: [{ scale }, { rotate }, { translateY }],
      opacity: animatedValue
    }}>
      <Svg width={300} height={220} viewBox="0 0 300 220">
        <Defs>
          <SvgLinearGradient id="warehouseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <Stop offset="100%" stopColor="#ea580c" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="boxGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="boxGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Modern warehouse building with gradient */}
        <Rect x="30" y="70" width="240" height="140" fill="url(#warehouseGradient)" rx="12" />
        <Rect x="40" y="80" width="220" height="120" fill="#ffffff" rx="8" />
        
        {/* Glass effect */}
        <Rect x="50" y="90" width="200" height="100" fill="#f8fafc" rx="6" opacity="0.8" />
        
        {/* Shelves with depth */}
        <Rect x="60" y="100" width="180" height="6" fill="#e5e7eb" rx="3" />
        <Rect x="60" y="125" width="180" height="6" fill="#e5e7eb" rx="3" />
        <Rect x="60" y="150" width="180" height="6" fill="#e5e7eb" rx="3" />
        
        {/* Inventory boxes with gradients */}
        <Rect x="70" y="110" width="25" height="18" fill="url(#boxGradient1)" rx="3" />
        <Rect x="105" y="110" width="25" height="18" fill="url(#boxGradient2)" rx="3" />
        <Rect x="140" y="110" width="25" height="18" fill="#f59e0b" rx="3" />
        <Rect x="175" y="110" width="25" height="18" fill="#ef4444" rx="3" />
        
        <Rect x="70" y="135" width="25" height="18" fill="#8b5cf6" rx="3" />
        <Rect x="105" y="135" width="25" height="18" fill="#06b6d4" rx="3" />
        <Rect x="140" y="135" width="25" height="18" fill="#84cc16" rx="3" />
        <Rect x="175" y="135" width="25" height="18" fill="#f97316" rx="3" />
        
        {/* Barcode scanner with glow effect */}
        <Circle cx="220" cy="50" r="25" fill="#1f2937" opacity="0.8" />
        <Rect x="210" y="40" width="20" height="20" fill="#ffffff" rx="4" />
        <Rect x="213" y="43" width="14" height="2" fill="#1f2937" />
        <Rect x="213" y="46" width="14" height="2" fill="#1f2937" />
        <Rect x="213" y="49" width="14" height="2" fill="#1f2937" />
        
        {/* Floating particles with animation */}
        <Circle cx="50" cy="40" r="4" fill="#f97316" opacity="0.7">
          <animate attributeName="cy" values="40;35;40" dur="2s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="250" cy="30" r="3" fill="#3b82f6" opacity="0.7">
          <animate attributeName="cy" values="30;25;30" dur="2.5s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="30" cy="180" r="3" fill="#10b981" opacity="0.7">
          <animate attributeName="cy" values="180;175;180" dur="3s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="270" cy="190" r="4" fill="#f59e0b" opacity="0.7">
          <animate attributeName="cy" values="190;185;190" dur="2.2s" repeatCount="indefinite" />
        </Circle>
      </Svg>
    </Animated.View>
  );
};

const CountingIllustration = ({ animatedValue }: { animatedValue: Animated.Value }) => {
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
    extrapolate: 'clamp',
  });

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.5, 0.8, 1],
    extrapolate: 'clamp',
  });

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['-5deg', '0deg'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ 
      transform: [{ translateY }, { scale }, { rotate }],
      opacity: animatedValue
    }}>
      <Svg width={300} height={220} viewBox="0 0 300 220">
        <Defs>
          <SvgLinearGradient id="phoneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#1f2937" stopOpacity="1" />
            <Stop offset="100%" stopColor="#111827" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="buttonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#10b981" stopOpacity="1" />
            <Stop offset="100%" stopColor="#059669" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Modern phone with gradient */}
        <Rect x="70" y="30" width="160" height="220" fill="url(#phoneGradient)" rx="25" />
        <Rect x="80" y="50" width="140" height="180" fill="#ffffff" rx="15" />
        
        {/* App interface */}
        <Rect x="90" y="70" width="120" height="140" fill="#f8fafc" rx="10" />
        
        {/* Header */}
        <Rect x="100" y="80" width="100" height="20" fill="#1f2937" rx="5" />
        <Text x="150" y="93" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Inventory Count</Text>
        
        {/* Room list with modern cards */}
        <Rect x="110" y="110" width="90" height="12" fill="#e5e7eb" rx="6" />
        <Rect x="110" y="130" width="90" height="12" fill="#e5e7eb" rx="6" />
        <Rect x="110" y="150" width="90" height="12" fill="#e5e7eb" rx="6" />
        
        {/* Count buttons with gradients */}
        <Circle cx="130" cy="180" r="15" fill="url(#buttonGradient)" />
        <Text x="130" y="185" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">+</Text>
        
        <Circle cx="170" cy="180" r="15" fill="#ef4444" />
        <Text x="170" y="185" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">-</Text>
        
        {/* Progress indicator with gradient */}
        <Rect x="110" y="200" width="90" height="6" fill="#e5e7eb" rx="3" />
        <Rect x="110" y="200" width="60" height="6" fill="url(#buttonGradient)" rx="3" />
        
        {/* Floating count numbers */}
        <Text x="50" y="100" fontSize="18" fill="#10b981" fontWeight="bold" opacity="0.8">47</Text>
        <Text x="250" y="120" fontSize="18" fill="#3b82f6" fontWeight="bold" opacity="0.8">23</Text>
        <Text x="50" y="180" fontSize="18" fill="#f59e0b" fontWeight="bold" opacity="0.8">12</Text>
        
        {/* Pulse animation on numbers */}
        <Circle cx="50" cy="100" r="15" fill="#10b981" opacity="0.2">
          <animate attributeName="r" values="15;25;15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0;0.2" dur="2s" repeatCount="indefinite" />
        </Circle>
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
    outputRange: [0.8, 1.1, 1],
    extrapolate: 'clamp',
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ 
      transform: [{ rotate }, { scale }, { translateY }],
      opacity: animatedValue
    }}>
      <Svg width={300} height={220} viewBox="0 0 300 220">
        <Defs>
          <SvgLinearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
          </SvgLinearGradient>
          <SvgLinearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#f97316" stopOpacity="1" />
            <Stop offset="100%" stopColor="#ea580c" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        
        {/* Chart background with glass effect */}
        <Rect x="30" y="50" width="240" height="140" fill="#f8fafc" rx="15" />
        <Rect x="40" y="60" width="220" height="120" fill="#ffffff" rx="10" />
        
        {/* Chart bars with gradients */}
        <Rect x="60" y="150" width="25" height="30" fill="url(#chartGradient)" rx="4" />
        <Rect x="95" y="130" width="25" height="50" fill="#10b981" rx="4" />
        <Rect x="130" y="110" width="25" height="70" fill="#f59e0b" rx="4" />
        <Rect x="165" y="90" width="25" height="90" fill="#ef4444" rx="4" />
        <Rect x="200" y="120" width="25" height="60" fill="#8b5cf6" rx="4" />
        
        {/* Chart line with gradient */}
        <Path
          d="M 60 170 Q 95 150 130 130 Q 165 110 200 140"
          stroke="url(#lineGradient)"
          strokeWidth="4"
          fill="none"
        />
        
        {/* Data points with glow */}
        <Circle cx="60" cy="170" r="6" fill="#3b82f6">
          <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="95" cy="150" r="6" fill="#10b981">
          <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
        </Circle>
        <Circle cx="130" cy="130" r="6" fill="#f59e0b">
          <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" begin="0.4s" />
        </Circle>
        <Circle cx="165" cy="110" r="6" fill="#ef4444">
          <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
        </Circle>
        <Circle cx="200" cy="140" r="6" fill="#8b5cf6">
          <animate attributeName="r" values="6;8;6" dur="1.5s" repeatCount="indefinite" begin="0.8s" />
        </Circle>
        
        {/* Floating metrics with animations */}
        <Text x="50" y="40" fontSize="16" fill="#1f2937" fontWeight="bold">$12,450</Text>
        <Text x="220" y="40" fontSize="16" fill="#10b981" fontWeight="bold">+23%</Text>
        <Text x="50" y="200" fontSize="14" fill="#6b7280">Total Value</Text>
        <Text x="220" y="200" fontSize="14" fill="#6b7280">Growth</Text>
        
        {/* Animated background elements */}
        <Circle cx="50" cy="50" r="20" fill="#f97316" opacity="0.1">
          <animate attributeName="r" values="20;30;20" dur="3s" repeatCount="indefinite" />
        </Circle>
        <Circle cx="250" cy="60" r="15" fill="#3b82f6" opacity="0.1">
          <animate attributeName="r" values="15;25;15" dur="2.5s" repeatCount="indefinite" />
        </Circle>
      </Svg>
    </Animated.View>
  );
};

const AdvancedOnboarding = ({ onGetStarted, onLogin }: { onGetStarted: () => void; onLogin: () => void }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const animatedValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const pages = [
    {
      title: "Smart Inventory",
      subtitle: "Track every item with precision",
      description: "Never lose track of your inventory again. Our smart system keeps everything organized and accessible.",
      illustration: InventoryIllustration,
      gradient: ['#f97316', '#ea580c'],
      color: '#f97316'
    },
    {
      title: "Touch & Count",
      subtitle: "Count with your fingertips",
      description: "Simply tap to count. Our intuitive interface makes inventory counting fast and accurate.",
      illustration: CountingIllustration,
      gradient: ['#10b981', '#059669'],
      color: '#10b981'
    },
    {
      title: "Insights & Growth",
      subtitle: "Data-driven decisions",
      description: "Get powerful insights into your inventory patterns and optimize your business growth.",
      illustration: AnalyticsIllustration,
      gradient: ['#3b82f6', '#2563eb'],
      color: '#3b82f6'
    }
  ];

  useEffect(() => {
    // Animate current page with spring effect
    Animated.spring(animatedValues[currentPage], {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();

    // Reset other pages
    animatedValues.forEach((value, index) => {
      if (index !== currentPage) {
        Animated.timing(value, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
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
      {/* Dynamic Background Gradient */}
      <LinearGradient
        colors={pages[currentPage].gradient}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

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
        {pages.map((_, index) => (
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
          style={[styles.getStartedButton, { backgroundColor: pages[currentPage].color }]}
          onPress={onGetStarted}
        >
          <Text style={styles.getStartedText}>Get Started Free</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.15,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationContainer: {
    marginBottom: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 17,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 300,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#d1d5db',
    marginHorizontal: 6,
  },
  indicatorActive: {
    width: 30,
    backgroundColor: '#f97316',
  },
  actions: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  getStartedButton: {
    backgroundColor: '#f97316',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  getStartedText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default AdvancedOnboarding;
