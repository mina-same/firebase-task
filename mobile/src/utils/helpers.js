/**
 * General Helper Utilities
 * Provides: Helper functions for common tasks
 * 
 * @module utils/helpers
 */

/**
 * Generates employee ID from name (e.g., "Alice Johnson" → "emp_alice_johnson")
 * 
 * @param {string} employeeName - Full employee name
 * @returns {string} Employee ID
 */
export const generateEmployeeId = (employeeName) => {
  if (!employeeName) return '';
  
  // Convert to lowercase, remove extra spaces, replace spaces with underscores
  return 'emp_' + employeeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, ''); // Remove special characters
};

/**
 * Truncates string to max length and adds "..."
 * Use for: Conversation previews, message snippets
 * 
 * @param {string} str - String to truncate
 * @param {number} maxLength - Max length
 * @returns {string} Truncated string
 */
export const truncateString = (str, maxLength) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Gets initials from name (e.g., "Alice Johnson" → "AJ")
 * Use for: Avatars, conversation headers
 * 
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 chars)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  return name
    .split(' ') // Split by spaces
    .map((word) => word[0]) // Get first letter of each word
    .join('') // Join them together
    .toUpperCase()
    .substring(0, 2); // Limit to 2 characters
};

/**
 * Validates message text (not empty, not too long)
 * 
 * @param {string} message - Message text
 * @param {number} maxLength - Max length (default: 1000)
 * @returns {Object} { isValid: boolean, error: string|null }
 */
export const validateMessage = (message, maxLength = 1000) => {
  // Check if message is empty or just whitespace
  if (!message || message.trim().length === 0) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }
  
  // Check if message is too long
  if (message.length > maxLength) {
    return {
      isValid: false,
      error: `Message cannot exceed ${maxLength} characters`,
    };
  }
  
  // Message is valid
  return {
    isValid: true,
    error: null,
  };
};

/**
 * Debounces function (delays execution until user stops calling it)
 * Use for: Search inputs to avoid too many API calls
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    // Clear any existing timeout
    clearTimeout(timeoutId);
    
    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Checks if a value is empty (null, undefined, or empty string)
 * 
 * @param {*} value - Value to check
 * @returns {boolean} True if value is empty
 */
export const isEmpty = (value) => {
  return value === null || value === undefined || value === '';
};

/**
 * Safely gets a nested property from an object
 * 
 * Prevents errors when accessing properties that might not exist.
 * Returns a default value if the property doesn't exist.
 * 
 * @param {Object} obj - Object to access
 * @param {string} path - Path to property (e.g., "user.name")
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} Property value or default value
 * 
 * @example
 * const name = safeGet(user, 'profile.name', 'Unknown');
 */
export const safeGet = (obj, path, defaultValue = null) => {
  try {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined) {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

