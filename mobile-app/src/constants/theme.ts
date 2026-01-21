// Ro-Tech Design System Colors
export const colors = {
  // Primary colors
  primary: '#4F46E5',       // Indigo 600
  primaryDark: '#4338CA',   // Indigo 700
  primaryLight: '#6366F1',  // Indigo 500
  
  // Secondary colors
  secondary: '#7C3AED',     // Violet 600
  secondaryDark: '#6D28D9', // Violet 700
  
  // Accent colors
  accent: '#10B981',        // Emerald 500
  accentDark: '#059669',    // Emerald 600
  warning: '#F59E0B',       // Amber 500
  error: '#EF4444',         // Red 500
  
  // Neutral colors
  background: '#F8FAFC',    // Slate 50
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9', // Slate 100
  border: '#E2E8F0',        // Slate 200
  borderLight: '#F1F5F9',   // Slate 100
  
  // Text colors
  text: '#0F172A',          // Slate 900
  textSecondary: '#475569', // Slate 600
  textMuted: '#94A3B8',     // Slate 400
  textLight: '#FFFFFF',
  
  // Status colors
  statusActive: '#10B981',
  statusPending: '#F59E0B',
  statusInactive: '#94A3B8',
  statusError: '#EF4444',
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Typography
export const typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
};

// Border radius
export const borderRadius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};
