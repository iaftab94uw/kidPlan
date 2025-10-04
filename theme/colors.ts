export const COLORS = {
  // Primary Colors
  primary: '#2E86DE',
  accent: '#FFB84C',

  // Backgrounds
  background: '#0E1726',
  deepNavy: '#0B1C2E',
  secondaryBackground: '#1A2335',
  cardBackground: '#1A2335',

  // Text Colors
  textPrimary: '#F5F7FA',
  textSecondary: '#B0B8C2',
  textMuted: '#6B7280',

  // UI Elements
  border: 'rgba(255, 255, 255, 0.08)',
  borderAccent: 'rgba(46, 134, 222, 0.2)',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Status Colors
  success: '#22C55E',
  warning: '#FFB84C',
  error: '#EF4444',
  info: '#2E86DE',

  // Gradient Colors
  gradientStart: '#0B1C2E',
  gradientEnd: '#132742',

  // Input Fields
  inputBackground: '#0E1726',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  inputPlaceholder: '#9CA3AF',

  // Shadows
  shadowColor: '#000000',
  glowBlue: 'rgba(46, 134, 222, 0.3)',
  glowYellow: 'rgba(255, 184, 76, 0.4)',
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  medium: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 6,
  },
  large: {
    shadowColor: COLORS.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  }),
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};
