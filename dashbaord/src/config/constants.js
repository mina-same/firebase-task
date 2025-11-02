/**
 * Application Constants
 * 
 * This module contains all constant values used throughout the application.
 * Centralizing constants makes them easier to maintain and update.
 * 
 * @module constants
 */

/**
 * Firestore Collection Names
 * These match the database schema defined in the requirements
 * 
 * @constant {Object} COLLECTIONS
 */
export const COLLECTIONS = {
  FEEDBACK: 'feedback',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages', // Subcollection under conversations
};

/**
 * Application Routes
 * Define all route paths for easy reference and maintenance
 * 
 * @constant {Object} ROUTES
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CHAT: '/chat',
  NOT_FOUND: '*',
};

/**
 * HR User Information
 * Default HR personnel identifier for the chat system
 * 
 * @constant {Object} HR_USER
 */
export const HR_USER = {
  ID: 'hr_sconnor',
  NAME: 'Sarah Connor (HR)',
  ROLE: 'HR Personnel',
};

/**
 * Feedback Score Configuration
 * Valid score range and related constants
 * 
 * @constant {Object} SCORE_CONFIG
 */
export const SCORE_CONFIG = {
  MIN: 1,
  MAX: 5,
  LABELS: {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Average',
    4: 'Good',
    5: 'Excellent',
  },
  COLORS: {
    1: '#EF4444', // Red
    2: '#F59E0B', // Orange
    3: '#EAB308', // Yellow
    4: '#84CC16', // Lime
    5: '#10B981', // Green
  },
};

/**
 * Pagination Configuration
 * Default values for data pagination
 * 
 * @constant {Object} PAGINATION
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

/**
 * Date Format Patterns
 * Standardized date formats for the application
 * Used with date-fns library
 * 
 * @constant {Object} DATE_FORMATS
 */
export const DATE_FORMATS = {
  FULL: 'PPpp', // Oct 24, 2025 at 10:05 PM
  DATE_ONLY: 'PP', // Oct 24, 2025
  TIME_ONLY: 'p', // 10:05 PM
  SHORT_DATE: 'MMM d, yyyy', // Oct 24, 2025
  SHORT_TIME: 'h:mm a', // 10:05 PM
  CHAT_TIME: 'h:mm a', // For chat messages
  CHAT_DATE: 'MMM d', // For chat date separators
};

/**
 * Local Storage Keys
 * Keys for storing data in browser's local storage
 * 
 * @constant {Object} STORAGE_KEYS
 */
export const STORAGE_KEYS = {
  THEME: 'hr_dashboard_theme',
  SELECTED_EMPLOYEE: 'hr_dashboard_selected_employee',
  FILTERS: 'hr_dashboard_filters',
};

/**
 * Message Types for Chat
 * Distinguish between different message types
 * 
 * @constant {Object} MESSAGE_TYPES
 */
export const MESSAGE_TYPES = {
  SENT: 'sent',
  RECEIVED: 'received',
  SYSTEM: 'system',
};

/**
 * Error Messages
 * Standardized error messages for the application
 * 
 * @constant {Object} ERROR_MESSAGES
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  FIREBASE_ERROR: 'Database error. Please try again later.',
  NO_DATA: 'No data available.',
  LOAD_FAILED: 'Failed to load data. Please refresh the page.',
  SEND_MESSAGE_FAILED: 'Failed to send message. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Loading States
 * Standard loading state identifiers
 * 
 * @constant {Object} LOADING_STATES
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Chart Configuration
 * Settings for data visualization charts
 * 
 * @constant {Object} CHART_CONFIG
 */
export const CHART_CONFIG = {
  PIE_CHART: {
    INNER_RADIUS: 60,
    OUTER_RADIUS: 100,
    PADDING_ANGLE: 2,
  },
  ANIMATION_DURATION: 300,
};

/**
 * UI Configuration
 * General UI-related constants
 * 
 * @constant {Object} UI_CONFIG
 */
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 200,
  HEADER_HEIGHT: 64,
  DEBOUNCE_DELAY: 300, // milliseconds for search input
  TOAST_DURATION: 3000, // milliseconds for toast notifications
};

