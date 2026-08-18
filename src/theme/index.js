export const colors = {
  // Core
  background: '#0B1120',
  surface: '#131C2E',
  surfaceLight: '#1C2740',
  surfaceBorder: '#26334D',

  // Primary gradient
  primaryStart: '#2563EB', // blue
  primaryEnd: '#06B6D4',   // cyan
  primary: '#2563EB',

  // Accent
  accent: '#06D6A0',       // green for success/going
  accentDim: '#05A07A',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B1120',

  // Status
  success: '#06D6A0',
  warning: '#FBBF24',
  error: '#EF4444',
  info: '#3B82F6',

  // Match score bands
  matchStrong: '#06D6A0',
  matchPartial: '#FBBF24',
  matchWeak: '#64748B',
  going: '#06D6A0',
  maybe: '#FBBF24',
  friendBadge: '#2563EB',

  // Listing states
  promoted: '#F59E0B',
  closingSoon: '#F97316',

  // Misc
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1C2740',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const gradients = {
  primary: [colors.primaryStart, colors.primaryEnd],
  dark: ['rgba(11,17,32,0)', 'rgba(11,17,32,0.8)', colors.background],
  card: [colors.surface, colors.surfaceLight],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  badge: {
    fontSize: 12,
    fontWeight: '600',
  },
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  button: {
    shadowColor: colors.primaryStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
};
