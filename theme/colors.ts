export const COLORS = {
  // Primary Colors
  primary: '#0E3C67',
  accent: '#FFB84C',

  // Backgrounds
  background: '#0A1E33',
  secondaryBackground: '#102C4A',
  cardBackground: '#133A63',

  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#BFD1E5',
  textMuted: '#9CA3AF',

  // UI Elements
  border: '#1C4A78',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  divider: '#1C4A78',

  // Status Colors
  success: '#22C55E',
  warning: '#FFB84C',
  error: '#EF4444',
  info: '#3B82F6',

  // Gradient Colors
  gradientStart: '#0A1E33',
  gradientEnd: '#102C4A',

  // Input Fields
  inputBackground: '#0A1E33',
  inputBorder: '#1C4A78',
  inputPlaceholder: '#BFD1E5',

  // Shadows
  shadowColor: '#000000',
  glowPrimary: 'rgba(14, 60, 103, 0.5)',
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
