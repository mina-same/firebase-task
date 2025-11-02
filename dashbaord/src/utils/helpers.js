/**
 * General Helper Utilities
 * 
 * Provides miscellaneous helper functions used throughout the application
 * 
 * @module utils/helpers
 */

import { timestampToDate as convertTimestampToDate } from './dateFormatter';

/**
 * Debounces a function call
 * Delays execution until after a specified time has elapsed since the last call
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce(searchFunction, 300);
 * input.addEventListener('input', debouncedSearch);
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * Truncates a string to a specified length and adds ellipsis
 * 
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated string
 * 
 * @example
 * truncateString("This is a long text", 10) // "This is a..."
 */
export const truncateString = (str, maxLength) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Generates a unique employee ID from an employee name
 * Converts to lowercase, replaces spaces with underscores, and removes special characters
 * 
 * @param {string} employeeName - Employee name
 * @returns {string} Employee ID
 * 
 * @example
 * generateEmployeeId("Jane Doe") // "emp_jane_doe"
 */
export const generateEmployeeId = (employeeName) => {
  if (!employeeName) return '';
  
  return 'emp_' + employeeName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
};

/**
 * Extracts unique employee names from feedback data
 * 
 * @param {Array} feedbackList - Array of feedback objects
 * @returns {Array} Array of unique employee names
 */
export const getUniqueEmployeeNames = (feedbackList) => {
  if (!Array.isArray(feedbackList)) return [];
  
  const names = feedbackList
    .map((feedback) => feedback.employeeName)
    .filter((name) => name && name.trim().length > 0);
  
  return [...new Set(names)].sort();
};

/**
 * Groups feedback data by score
 * Returns an object with scores as keys and count as values
 * 
 * @param {Array} feedbackList - Array of feedback objects
 * @returns {Object} Score distribution object
 * 
 * @example
 * groupFeedbackByScore(feedback) // { 1: 5, 2: 10, 3: 15, 4: 20, 5: 25 }
 */
export const groupFeedbackByScore = (feedbackList) => {
  if (!Array.isArray(feedbackList)) return {};
  
  const scoreGroups = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  feedbackList.forEach((feedback) => {
    const score = feedback.score;
    if (score >= 1 && score <= 5) {
      scoreGroups[score]++;
    }
  });
  
  return scoreGroups;
};

/**
 * Calculates the average score from feedback data
 * 
 * @param {Array} feedbackList - Array of feedback objects
 * @returns {number} Average score (rounded to 2 decimal places)
 */
export const calculateAverageScore = (feedbackList) => {
  if (!Array.isArray(feedbackList) || feedbackList.length === 0) return 0;
  
  const sum = feedbackList.reduce((acc, feedback) => acc + (feedback.score || 0), 0);
  return Math.round((sum / feedbackList.length) * 100) / 100;
};

/**
 * Filters feedback data based on search query
 * Searches in employee name and notes fields
 * 
 * @param {Array} feedbackList - Array of feedback objects
 * @param {string} query - Search query
 * @returns {Array} Filtered feedback array
 */
export const filterFeedback = (feedbackList, query) => {
  if (!Array.isArray(feedbackList) || !query || query.trim().length === 0) {
    return feedbackList;
  }
  
  const searchQuery = query.toLowerCase().trim();
  
  return feedbackList.filter((feedback) => {
    const employeeName = (feedback.employeeName || '').toLowerCase();
    const notes = (feedback.notes || '').toLowerCase();
    
    return employeeName.includes(searchQuery) || notes.includes(searchQuery);
  });
};

/**
 * Sorts an array of objects by a specified field
 * Handles Firestore Timestamps and dates properly
 * 
 * @param {Array} array - Array to sort
 * @param {string} field - Field to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortByField = (array, field, order = 'asc') => {
  if (!Array.isArray(array)) return [];
  
  return [...array].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle Firestore Timestamps and dates for date field
    if (field === 'date') {
      const dateA = convertTimestampToDate(valueA);
      const dateB = convertTimestampToDate(valueB);
      
      if (!dateA || !dateB) {
        if (!dateA && !dateB) return 0;
        return dateA ? -1 : 1;
      }
      
      // Compare dates
      const timeA = dateA.getTime();
      const timeB = dateB.getTime();
      
      if (timeA === timeB) return 0;
      
      if (order === 'asc') {
        return timeA > timeB ? 1 : -1;
      } else {
        return timeA < timeB ? 1 : -1;
      }
    }
    
    // Handle other field types
    if (valueA === valueB) return 0;
    
    // Handle null/undefined values
    if (valueA == null) return 1;
    if (valueB == null) return -1;
    
    if (order === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
};

/**
 * Creates a deep copy of an object or array
 * 
 * @param {Object|Array} obj - Object or array to clone
 * @returns {Object|Array} Deep copy of the input
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Checks if two objects are deeply equal
 * 
 * @param {*} obj1 - First object
 * @param {*} obj2 - Second object
 * @returns {boolean} True if objects are deeply equal
 */
export const deepEqual = (obj1, obj2) => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

/**
 * Formats a number with thousand separators
 * 
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 * 
 * @example
 * formatNumber(1234567) // "1,234,567"
 */
export const formatNumber = (num) => {
  return num.toLocaleString();
};

/**
 * Gets initials from a name
 * 
 * @param {string} name - Full name
 * @returns {string} Initials
 * 
 * @example
 * getInitials("Jane Doe") // "JD"
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Generates a random color for avatars
 * 
 * @param {string} seed - Seed string for consistent color generation
 * @returns {string} Hex color code
 */
export const generateColorFromString = (seed) => {
  if (!seed) return '#3B82F6'; // Default blue
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B',
    '#10B981', '#06B6D4', '#6366F1', '#EF4444',
  ];
  
  return colors[Math.abs(hash) % colors.length];
};

