// src/lib/design-system.ts
// ============================================================================
// PHPHIRE DESIGN SYSTEM - All CSS and Colors
// ============================================================================

export const colors = {
  // Primary Colors
  primary: '#7C3AED',        // Purple - Main brand color
  primaryLight: '#EDE9FE',   // Light purple background
  primaryLighter: '#F3E8FF', // Even lighter purple
  
  // Secondary Colors
  success: '#059669',        // Green - Success/Action
  error: '#DC2626',          // Red - Error/Danger
  warning: '#F59E0B',        // Orange - Warning
  
  // Background Colors
  bgDark: '#0F0A1E',         // Dark navy - Hero section
  bgDarkAlt: '#1a0f3f',      // Alternative dark (gradient)
  bgLight: '#F4F3F7',        // Light gray background
  bgLighter: '#F3E8FF',      // Light purple tint
  bgLightestPurple: '#f8f7ff', // Very light purple
  bgWhite: '#fff',           // Pure white
  
  // Text Colors
  textPrimary: '#0F0A1E',    // Dark text
  textSecondary: '#3D3558',  // Medium text
  textTertiary: '#7B7494',   // Light text
  textWhite: '#fff',         // White text
  
  // Border Colors
  borderLight: '#E8E4F0',    // Light purple border
  
  // Specialty Colors (for cards)
  specialties: {
    purple: { bg: '#EDE9FE', text: '#5B21B6' },
    blue: { bg: '#DBEAFE', text: '#1E40AF' },
    green: { bg: '#D1FAE5', text: '#065F46' },
    yellow: { bg: '#FEF3C7', text: '#92400E' },
    pink: { bg: '#FCE7F3', text: '#9D174D' },
    teal: { bg: '#ECFDF5', text: '#064E3B' },
    orange: { bg: '#FFF7ED', text: '#92400E' },
  }
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  section: '40px',
  heroTop: '100px',
  heroBottom: '120px',
}

export const typography = {
  // Font Sizes
  h1: { fontSize: '60px', fontWeight: 900, lineHeight: 1.15 },
  h2: { fontSize: '32px', fontWeight: 900, lineHeight: 1.2 },
  h3: { fontSize: '28px', fontWeight: 800, lineHeight: 1.3 },
  h4: { fontSize: '20px', fontWeight: 700, lineHeight: 1.4 },
  h5: { fontSize: '16px', fontWeight: 800, lineHeight: 1.4 },
  h6: { fontSize: '14px', fontWeight: 700, lineHeight: 1.4 },
  
  // Body Text
  bodyLarge: { fontSize: '15px', fontWeight: 400, lineHeight: 1.6 },
  body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.6 },
  bodySmall: { fontSize: '12px', fontWeight: 400, lineHeight: 1.5 },
  
  // Labels & Tags
  label: { fontSize: '13px', fontWeight: 600, lineHeight: 1.4 },
  labelSmall: { fontSize: '12px', fontWeight: 600, lineHeight: 1.4 },
  labelTiny: { fontSize: '10px', fontWeight: 600, lineHeight: 1.3 },
  
  // Badge
  badge: { fontSize: '12px', fontWeight: 600, lineHeight: 1.3 },
}

export const borderRadius = {
  none: '0',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '999px',
}

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
  md: '0 4px 8px rgba(0, 0, 0, 0.08)',
  lg: '0 8px 16px rgba(0, 0, 0, 0.1)',
  hover: '0 4px 12px rgba(124, 58, 237, 0.1)',
  hoverStrong: '0 8px 20px rgba(124, 58, 237, 0.15)',
}

export const transitions = {
  fast: '0.15s ease-in-out',
  normal: '0.2s ease-in-out',
  slow: '0.3s ease-in-out',
}

// ============================================================================
// INLINE STYLES HELPER FUNCTIONS
// ============================================================================

export const styles = {
  // Card Styles
  card: {
    base: {
      padding: spacing.lg,
      background: colors.bgWhite,
      border: `1.5px solid ${colors.borderLight}`,
      borderRadius: borderRadius.lg,
      transition: `all ${transitions.normal}`,
    },
    hover: {
      borderColor: colors.primary,
      boxShadow: shadows.hover,
    },
  },
  
  // Button Styles
  button: {
    primary: {
      padding: `${spacing.md} ${spacing.lg}`,
      background: colors.primary,
      color: colors.textWhite,
      border: 'none',
      borderRadius: borderRadius.md,
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      cursor: 'pointer',
      transition: `all ${transitions.normal}`,
    },
    secondary: {
      padding: `${spacing.md} ${spacing.lg}`,
      background: colors.bgLight,
      color: colors.primary,
      border: `1.5px solid ${colors.primary}`,
      borderRadius: borderRadius.md,
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      cursor: 'pointer',
      transition: `all ${transitions.normal}`,
    },
    ghost: {
      padding: `${spacing.md} ${spacing.lg}`,
      background: 'transparent',
      color: colors.primary,
      border: `1.5px solid ${colors.borderLight}`,
      borderRadius: borderRadius.md,
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      cursor: 'pointer',
      transition: `all ${transitions.normal}`,
    },
  },
  
  // Input Styles
  input: {
    padding: `${spacing.md} ${spacing.lg}`,
    background: colors.bgWhite,
    border: `1px solid ${colors.borderLight}`,
    borderRadius: borderRadius.md,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    transition: `all ${transitions.normal}`,
  },
  
  // Badge/Tag Styles
  badge: {
    padding: '4px 10px',
    background: colors.primaryLighter,
    color: colors.primary,
    borderRadius: borderRadius.md,
    fontSize: typography.labelTiny.fontSize,
    fontWeight: typography.labelTiny.fontWeight,
  },
  
  // Section Padding
  sectionPadding: {
    padding: `${spacing.section} ${spacing.lg}`,
  },
  
  // Hero Padding
  heroPadding: {
    padding: `${spacing.heroTop} ${spacing.lg} ${spacing.heroBottom}`,
  },
}

// ============================================================================
// RESPONSIVE BREAKPOINTS
// ============================================================================

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1200px',
  ultraWide: '1440px',
}

export const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (min-width: ${breakpoints.desktop})`,
  wide: `@media (min-width: ${breakpoints.wide})`,
}