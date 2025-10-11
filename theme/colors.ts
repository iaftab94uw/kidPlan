export const COLORS = {
  // Primary Colors - Based on #0e3c67
  primary: '#0e3c67',           // Deep ocean blue (main brand)
  primaryLight: '#1a5a9e',      // Lighter ocean blue
  primaryDark: '#0a2847',       // Darker ocean blue
  primarySoft: '#e6f0f9',       // Very light blue for backgrounds

  accent: '#3b82f6',            // Bright sky blue
  accentLight: '#60a5fa',       // Light sky blue
  accentDark: '#2563eb',        // Deep sky blue

  secondary: '#f59e0b',         // Warm amber for highlights
  secondaryLight: '#fbbf24',    // Light amber
  secondaryDark: '#d97706',     // Deep amber

  // Backgrounds - Gradients and layers
  background: '#f8fafc',        // Very light blue-gray
  backgroundLight: '#ffffff',   // Pure white
  backgroundDark: '#f1f5f9',    // Light gray-blue

  cardBackground: 'rgba(255, 255, 255, 0.95)',  // Frosted white
  cardBackgroundDark: 'rgba(255, 255, 255, 0.85)', // More transparent
  overlayBackground: 'rgba(14, 60, 103, 0.95)', // Primary overlay
  syncedButton: '#22C55E',

  // Text Colors - Excellent readability
  textPrimary: '#0f172a',       // Almost black
  textSecondary: '#475569',     // Medium gray
  textMuted: '#94a3b8',         // Light gray
  textLight: '#ffffff',         // Pure white
  textOnPrimary: '#ffffff',     // White on primary color

  // UI Elements - Modern, clean
  border: 'rgba(14, 60, 103, 0.12)',  // Light primary border
  borderLight: 'rgba(14, 60, 103, 0.08)',
  divider: 'rgba(14, 60, 103, 0.1)',

  // Input Fields - Clean, modern
  inputBackground: 'rgba(255, 255, 255, 0.9)',
  inputBackgroundFocus: 'rgba(255, 255, 255, 1)',
  inputBorder: 'rgba(14, 60, 103, 0.15)',
  inputBorderFocus: 'rgba(14, 60, 103, 0.4)',
  inputPlaceholder: '#94a3b8',

  // Status Colors - Professional
  success: '#10b981',           // Green
  successLight: '#34d399',
  successBg: '#d1fae5',
  warning: '#f59e0b',           // Amber
  warningLight: '#fbbf24',
  warningBg: '#fef3c7',
  error: '#ef4444',             // Red
  errorLight: '#f87171',
  errorBg: '#fee2e2',
  info: '#3b82f6',              // Blue
  infoLight: '#60a5fa',
  infoBg: '#dbeafe',

  // Gradient Combinations
  gradientPrimary: ['#1a5a9e', '#0e3c67'],              // Light to dark primary
  gradientPrimaryReverse: ['#0e3c67', '#1a5a9e'],       // Dark to light primary
  gradientAccent: ['#60a5fa', '#3b82f6'],               // Light to dark accent
  gradientWarm: ['#fbbf24', '#f59e0b'],                 // Warm gradient
  gradientBackground: ['#f8fafc', '#e6f0f9', '#ffffff'], // Soft background
  gradientHero: ['#0e3c67', '#1a5a9e', '#3b82f6'],     // Hero sections
  gradientCard: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)'],

  // Shadows - Soft, modern
  shadowColor: '#000000',
  shadowPrimary: 'rgba(14, 60, 103, 0.15)',
  shadowAccent: 'rgba(59, 130, 246, 0.2)',
  glowPrimary: 'rgba(14, 60, 103, 0.25)',
  glowAccent: 'rgba(59, 130, 246, 0.3)',

  // Special Effects
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassHighlight: 'rgba(255, 255, 255, 0.6)',
  shimmer: 'rgba(255, 255, 255, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const SHADOWS = {
  // Soft, elevated shadows
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: (color: string = COLORS.glowPrimary) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  }),
  inner: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  round: 999,
  pill: 50,
};

export const TYPOGRAPHY = {
  // Font sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,

  // Font weights
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// Glassmorphism helper
export const GLASS = {
  card: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.md,
  },
  cardLight: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.sm,
  },
  cardDark: {
    backgroundColor: COLORS.cardBackgroundDark,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.md,
  },
  overlay: {
    backgroundColor: COLORS.overlayBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
};
