/**
 * Application Constants
 * 
 * This file contains all constant values used throughout the mobile app.
 * Centralizing constants makes the app easier to maintain and update.
 * 
 * @module config/constants
 */

/**
 * Firestore Collection Names
 * These must match the collections used in the web dashboard
 * 
 * @constant {Object} COLLECTIONS
 */
export const COLLECTIONS = {
  // Main conversations collection
  CONVERSATIONS: 'conversations',
  
  // Messages subcollection (nested under each conversation)
  MESSAGES: 'messages',
};

/**
 * Navigation Route Names
 * Define all navigation routes for type safety and easy reference
 * 
 * @constant {Object} ROUTES
 */
export const ROUTES = {
  // Initial screen - shows list of conversations
  CONVERSATIONS_LIST: 'ConversationsList',
  
  // Chat screen - individual conversation view
  CHAT: 'Chat',
};

/**
 * HR User Information
 * Default HR personnel identifier used in the chat system
 * This matches the web dashboard configuration
 * 
 * @constant {Object} HR_USER
 */
export const HR_USER = {
  // HR user ID used in Firestore messages
  ID: 'hr_sconnor',
  
  // Display name for HR
  NAME: 'Sarah Connor (HR)',
  
  // Role description
  ROLE: 'HR Personnel',
};

/**
 * Storage Keys
 * Keys used for AsyncStorage to persist data locally
 * 
 * @constant {Object} STORAGE_KEYS
 */
export const STORAGE_KEYS = {
  // Stores the current employee's ID
  // This tells us which employee is using the app
  EMPLOYEE_ID: 'employee_id',
  
  // Stores employee name for display
  EMPLOYEE_NAME: 'employee_name',
};

/**
 * Message Types
 * Used to distinguish between sent and received messages
 * 
 * @constant {Object} MESSAGE_TYPES
 */
export const MESSAGE_TYPES = {
  // Message sent by the employee (current user)
  SENT: 'sent',
  
  // Message received from HR
  RECEIVED: 'received',
};

/**
 * Loading States
 * Standard loading state identifiers for consistent UI states
 * 
 * @constant {Object} LOADING_STATES
 */
export const LOADING_STATES = {
  IDLE: 'idle',        // No loading, ready
  LOADING: 'loading',  // Currently fetching data
  SUCCESS: 'success',  // Data loaded successfully
  ERROR: 'error',      // Error occurred while loading
};

/**
 * Error Messages
 * Standardized error messages displayed to users
 * 
 * @constant {Object} ERROR_MESSAGES
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  FIREBASE_ERROR: 'Database error. Please try again later.',
  NO_CONVERSATIONS: 'No conversations found.',
  LOAD_FAILED: 'Failed to load data. Please refresh.',
  SEND_MESSAGE_FAILED: 'Failed to send message. Please try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
};

/**
 * Date Format Patterns
 * Used with date-fns library for consistent date formatting
 * 
 * @constant {Object} DATE_FORMATS
 */
export const DATE_FORMATS = {
  // Time only: "10:30 AM"
  TIME_ONLY: 'h:mm a',
  
  // Date and time: "Jan 15, 2024 at 10:30 AM"
  FULL: 'PPpp',
  
  // Short date: "Jan 15"
  SHORT_DATE: 'MMM d',
  
  // Relative time: "2 hours ago"
  RELATIVE: 'relative',
};

/**
 * UI Configuration
 * General UI-related constants for consistent design
 * 
 * @constant {Object} UI_CONFIG
 */
export const UI_CONFIG = {
  // Debounce delay for search input (milliseconds)
  // Prevents too many API calls while user is typing
  SEARCH_DEBOUNCE_DELAY: 300,
  
  // Number of messages to load initially
  INITIAL_MESSAGE_COUNT: 50,
  
  // Maximum message length (characters)
  MAX_MESSAGE_LENGTH: 1000,
};

