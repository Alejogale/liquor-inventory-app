/**
 * InvyEasy Design System
 * Fintech-inspired theme with modern dark mode aesthetics
 */

// Brand Colors
export const colors = {
  // Primary - Orange accent
  primary: '#F97316',
  primaryLight: '#FB923C',
  primaryDark: '#EA580C',

  // Background - Deep blacks
  background: '#0B0B0C',
  backgroundSecondary: '#111112',
  backgroundTertiary: '#1A1A1C',

  // Surface - Cards and elevated elements
  surface: '#1A1A1C',
  surfaceLight: '#222224',
  surfaceHover: '#2A2A2C',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textMuted: '#52525B',

  // Semantic Colors
  success: '#22C55E',
  successLight: '#4ADE80',
  warning: '#EAB308',
  warningLight: '#FACC15',
  error: '#EF4444',
  errorLight: '#F87171',
  info: '#3B82F6',
  infoLight: '#60A5FA',

  // Glass effect
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // Gradients (as arrays for LinearGradient)
  gradientPrimary: ['#F97316', '#EA580C'],
  gradientPremium: ['#F97316', '#DC2626'],
  gradientDark: ['#1A1A1C', '#0B0B0C'],
  gradientCard: ['rgba(26, 26, 28, 0.8)', 'rgba(26, 26, 28, 0.4)'],

  // Shadows (for glows)
  glowPrimary: 'rgba(249, 115, 22, 0.3)',
  glowPrimaryStrong: 'rgba(249, 115, 22, 0.5)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.8)',
} as const;

// Typography
export const typography = {
  // Font families (system fonts for native feel)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    '5xl': 48,
  },

  // Line heights
  lineHeight: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Font weights (iOS system font weights)
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// Spacing (8px base grid)
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
} as const;

// Border radius
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  glow: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  glowStrong: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

// Animation durations (ms)
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  splash: 2000,
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
} as const;

// Hit slop for touch targets (Apple HIG recommends 44pt minimum)
export const hitSlop = {
  sm: { top: 8, bottom: 8, left: 8, right: 8 },
  md: { top: 12, bottom: 12, left: 12, right: 12 },
  lg: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

// Safe area insets defaults
export const safeArea = {
  top: 47, // Notch devices
  bottom: 34, // Home indicator
} as const;

// Screen dimensions helpers
export const layout = {
  tabBarHeight: 84,
  headerHeight: 96,
  inputHeight: 52,
  buttonHeight: 52,
  iconSize: {
    sm: 16,
    md: 20,
    base: 24,
    lg: 28,
    xl: 32,
  },
} as const;

// Export theme object for convenience
export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  animation,
  zIndex,
  hitSlop,
  safeArea,
  layout,
} as const;

export default theme;
