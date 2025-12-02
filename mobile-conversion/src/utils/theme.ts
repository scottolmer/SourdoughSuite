/**
 * Theme configuration for Sourdough Suite app
 * This file provides consistent colors, typography, and spacing
 * for use across the application
 */

// Color palette
export const colors = {
  // Primary colors
  primary: {
    50: '#FEF3C7', // amber-50
    100: '#FDE68A', // amber-100
    200: '#FCD34D', // amber-200
    300: '#FBBF24', // amber-300
    400: '#F59E0B', // amber-400
    500: '#D97706', // amber-500
    600: '#B45309', // amber-600
    700: '#92400E', // amber-700
    800: '#78350F', // amber-800
    900: '#451A03', // amber-900
  },
  
  // Grayscale
  gray: {
    50: '#F9FAFB', // gray-50
    100: '#F3F4F6', // gray-100
    200: '#E5E7EB', // gray-200
    300: '#D1D5DB', // gray-300
    400: '#9CA3AF', // gray-400
    500: '#6B7280', // gray-500
    600: '#4B5563', // gray-600
    700: '#374151', // gray-700
    800: '#1F2937', // gray-800
    900: '#111827', // gray-900
  },
  
  // Utility colors
  success: {
    light: '#D1FAE5', // emerald-100
    default: '#10B981', // emerald-500
    dark: '#065F46', // emerald-800
  },
  
  warning: {
    light: '#FEF3C7', // amber-100
    default: '#F59E0B', // amber-500
    dark: '#92400E', // amber-800
  },
  
  danger: {
    light: '#FEE2E2', // red-100
    default: '#EF4444', // red-500
    dark: '#991B1B', // red-800
  },
  
  info: {
    light: '#DBEAFE', // blue-100
    default: '#3B82F6', // blue-500
    dark: '#1E40AF', // blue-800
  },
};

// Typography
export const typography = {
  // Font family
  fontFamily: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Courier',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

// Spacing
export const spacing = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 2,
  default: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Component specific themes
export const componentTheme = {
  // Button
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      pressedColor: colors.primary[600],
      textColor: '#FFFFFF',
    },
    secondary: {
      backgroundColor: colors.gray[500],
      pressedColor: colors.gray[600],
      textColor: '#FFFFFF',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: colors.primary[500],
      textColor: colors.primary[500],
      pressedColor: colors.primary[50],
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: colors.primary[500],
      pressedColor: colors.primary[50],
    },
  },
  
  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.gray[200],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  
  // Input
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.gray[300],
    focusBorderColor: colors.primary[500],
    textColor: colors.gray[800],
    placeholderColor: colors.gray[400],
    errorColor: colors.danger.default,
    padding: spacing[3],
    borderRadius: borderRadius.md,
  },
};

// Screen sizes for responsive design
export const screenSizes = {
  xs: 320,
  sm: 375, // iPhone SE
  md: 414, // iPhone Plus/Max
  lg: 768, // iPad
  xl: 1024, // iPad Pro
};

// Default theme export
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentTheme,
  screenSizes,
};