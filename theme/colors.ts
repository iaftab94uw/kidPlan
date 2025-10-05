export const COLORS = {
  // Primary Colors - Soft, Natural Palette
  primary: '#6B9080',           // Sage green (main accent)
  primaryLight: '#A4C3B2',      // Light sage
  primaryDark: '#5A7A6A',       // Dark sage

  accent: '#E8B86D',            // Warm gold/amber
  accentLight: '#F4D19B',       // Light gold
  accentDark: '#D4A055',        // Deep gold

  secondary: '#EAE7DC',         // Warm cream/beige

  // Backgrounds - Soft Gradients
  background: '#F8F6F0',        // Very light warm beige
  backgroundGradientStart: '#EAF4F4',  // Light mint
  backgroundGradientEnd: '#E8EDE7',    // Light sage

  cardBackground: 'rgba(255, 255, 255, 0.85)',  // Frosted white
  cardBackgroundDark: 'rgba(255, 255, 255, 0.75)', // More transparent
  overlayBackground: 'rgba(234, 231, 220, 0.95)', // Warm overlay

  // Text Colors - Natural, readable
  textPrimary: '#2C3531',       // Dark charcoal green
  textSecondary: '#5E6572',     // Medium gray
  textMuted: '#8B9A8F',         // Soft gray-green
  textLight: '#FFFFFF',         // Pure white for dark backgrounds

  // UI Elements - Soft, organic
  border: 'rgba(107, 144, 128, 0.15)',  // Very light sage border
  borderLight: 'rgba(107, 144, 128, 0.08)',
  divider: 'rgba(107, 144, 128, 0.12)',

  // Input Fields - Glassmorphic
  inputBackground: 'rgba(255, 255, 255, 0.7)',
  inputBackgroundFocus: 'rgba(255, 255, 255, 0.9)',
  inputBorder: 'rgba(107, 144, 128, 0.2)',
  inputBorderFocus: 'rgba(107, 144, 128, 0.4)',
  inputPlaceholder: '#A4B8B0',

  // Status Colors - Muted, Natural
  success: '#6B9080',           // Sage green
  successLight: '#A4C3B2',
  warning: '#E8B86D',           // Warm amber
  warningLight: '#F4D19B',
  error: '#D4A373',             // Soft terracotta
  errorLight: '#E8C4A5',
  info: '#88BDBC',              // Soft teal
  infoLight: '#B8D8D8',

  // Gradient Colors
  gradientPrimary: ['#A4C3B2', '#6B9080'],
  gradientWarm: ['#F4D19B', '#E8B86D'],
  gradientBackground: ['#EAF4F4', '#E8EDE7', '#F8F6F0'],

  // Shadows - Soft, natural shadows
  shadowColor: '#000000',
  shadowLight: 'rgba(107, 144, 128, 0.1)',
  shadowMedium: 'rgba(107, 144, 128, 0.15)',
  glowGreen: 'rgba(107, 144, 128, 0.2)',
  glowGold: 'rgba(232, 184, 109, 0.25)',

  // Special Effects
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',
  shimmer: 'rgba(255, 255, 255, 0.6)',
};

export const SHADOWS = {
  // Soft, elevated shadows
  small: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  }),
  // Soft inner glow for glassmorphic effect
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
};

export const BORDER_RADIUS = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  round: 999,
  pill: 50,  // For pill-shaped buttons
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

  // Font weights (as strings for React Native)
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
    ...SHADOWS.medium,
  },
  cardDark: {
    backgroundColor: COLORS.cardBackgroundDark,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.medium,
  },
  overlay: {
    backgroundColor: COLORS.overlayBackground,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
};
