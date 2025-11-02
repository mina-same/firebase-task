/**
 * Application Theme
 * 
 * Defines colors, spacing, typography, and styling constants
 * for consistent design throughout the mobile app.
 * 
 * This theme matches the web dashboard design for brand consistency.
 * 
 * @module config/theme
 */

/**
 * Color Palette
 * Primary colors used throughout the app
 * 
 * @constant {Object} COLORS
 */
export const COLORS = {
  // Primary Brand Color - Dark Navy Blue
  // Used for buttons, active states, sent messages
  primary: '#01002C',
  primaryLight: '#3B82F6',
  primaryDark: '#000020',
  
  // Secondary Color - Purple
  // Used for accents (optional)
  secondary: '#8B5CF6',
  
  // Status Colors
  success: '#10B981',   // Green - for success states
  warning: '#F59E0B',   // Orange - for warnings
  error: '#EF4444',     // Red - for errors
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Grays - for backgrounds, borders, text
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Message Bubble Colors
  messageSent: '#01002C',       // Primary dark navy - for sent messages (right side)
  messageSentText: '#FFFFFF',   // White text on dark background
  
  messageReceived: '#E5E7EB',   // Light gray - for received messages (left side)
  messageReceivedText: '#111827', // Dark text on gray background
  
  // Background Colors
  background: '#F9FAFB',        // Main app background
  cardBackground: '#FFFFFF',     // Card/container background
  headerBackground: '#FFFFFF',   // Header background
};

/**
 * Spacing Scale
 * Consistent spacing values (in pixels)
 * Follows 4px/8px grid system for clean alignment
 * 
 * @constant {Object} SPACING
 */
export const SPACING = {
  xs: 4,    // 4px - Very small gaps
  sm: 8,    // 8px - Small gaps
  md: 16,   // 16px - Medium gaps (default)
  lg: 24,   // 24px - Large gaps
  xl: 32,   // 32px - Extra large gaps
  xxl: 48,  // 48px - Huge gaps
};

/**
 * Typography
 * Font sizes and weights for consistent text styling
 * 
 * @constant {Object} TYPOGRAPHY
 */
export const TYPOGRAPHY = {
  // Font Sizes
  fontSize: {
    xs: 12,      // Extra small - captions, labels
    sm: 14,      // Small - secondary text
    base: 16,    // Base - body text (default)
    lg: 18,      // Large - subheadings
    xl: 20,      // Extra large - headings
    '2xl': 24,   // 2XL - large headings
    '3xl': 30,   // 3XL - page titles
  },
  
  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,   // For headings
    normal: 1.5,  // For body text
    relaxed: 1.75, // For long paragraphs
  },
};

/**
 * Border Radius
 * Rounded corners for consistent UI elements
 * 
 * @constant {Object} BORDER_RADIUS
 */
export const BORDER_RADIUS = {
  sm: 4,    // 4px - Small buttons, inputs
  md: 8,    // 8px - Cards, containers (default)
  lg: 12,   // 12px - Large cards
  xl: 16,   // 16px - Extra large elements
  full: 9999, // Full circle - avatars, badges
};

/**
 * Shadows
 * Elevation effects for depth (iOS and Android compatible)
 * 
 * @constant {Object} SHADOWS
 */
export const SHADOWS = {
  // Small shadow - for subtle elevation
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android shadow
  },
  
  // Medium shadow - for cards
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  
  // Large shadow - for modals, elevated elements
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8, // Android shadow
  },
};

/**
 * Layout Constants
 * Common layout values for consistent spacing
 * 
 * @constant {Object} LAYOUT
 */
export const LAYOUT = {
  // Standard padding for screens
  screenPadding: SPACING.md, // 16px
  
  // Standard padding for cards/containers
  cardPadding: SPACING.lg, // 24px
  
  // Header height
  headerHeight: 56,
  
  // Input field height
  inputHeight: 48,
  
  // Button heights
  buttonHeight: {
    sm: 32,
    md: 44,
    lg: 52,
  },
};

