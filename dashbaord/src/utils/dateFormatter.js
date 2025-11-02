/**
 * Date Formatting Utilities
 * 
 * Provides consistent date and time formatting throughout the application
 * using the date-fns library.
 * 
 * @module utils/dateFormatter
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { DATE_FORMATS } from '../config/constants';

/**
 * Converts a Firebase Timestamp to a JavaScript Date object
 * 
 * @param {Object} timestamp - Firebase Timestamp object
 * @returns {Date} JavaScript Date object
 */
export const timestampToDate = (timestamp) => {
  if (!timestamp) return null;
  
  // Handle Firebase Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Handle JavaScript Date
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Handle ISO string
  if (typeof timestamp === 'string') {
    return parseISO(timestamp);
  }
  
  // Handle Unix timestamp (milliseconds)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  return null;
};

/**
 * Formats a date using the specified format pattern
 * 
 * @param {Date|Object|string|number} date - Date to format
 * @param {string} formatPattern - Format pattern (from DATE_FORMATS constant)
 * @returns {string} Formatted date string
 * 
 * @example
 * formatDate(new Date(), DATE_FORMATS.SHORT_DATE) // "Oct 24, 2025"
 */
export const formatDate = (date, formatPattern = DATE_FORMATS.FULL) => {
  const dateObj = timestampToDate(date);
  if (!dateObj) return 'N/A';
  
  try {
    return format(dateObj, formatPattern);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats a date for display in the feedback table
 * Shows full date and time
 * 
 * @param {Date|Object} date - Date to format
 * @returns {string} Formatted date string
 * 
 * @example
 * formatFeedbackDate(timestamp) // "Oct 24, 2025 at 10:05 PM"
 */
export const formatFeedbackDate = (date) => {
  return formatDate(date, DATE_FORMATS.FULL);
};

/**
 * Formats a date for display in chat messages
 * Shows relative time for recent messages, full date for older ones
 * 
 * @param {Date|Object} date - Date to format
 * @returns {string} Formatted date string
 * 
 * @example
 * formatChatDate(recentDate) // "2 minutes ago"
 * formatChatDate(oldDate) // "Oct 24, 2025"
 */
export const formatChatDate = (date) => {
  const dateObj = timestampToDate(date);
  if (!dateObj) return 'N/A';
  
  try {
    // Show relative time if within the last 24 hours
    const now = new Date();
    const diffInHours = (now - dateObj) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    
    // Show date for older messages
    return format(dateObj, DATE_FORMATS.SHORT_DATE);
  } catch (error) {
    console.error('Error formatting chat date:', error);
    return 'Invalid Date';
  }
};

/**
 * Formats time for chat message timestamps
 * 
 * @param {Date|Object} date - Date to format
 * @returns {string} Formatted time string
 * 
 * @example
 * formatChatTime(timestamp) // "10:05 PM"
 */
export const formatChatTime = (date) => {
  return formatDate(date, DATE_FORMATS.CHAT_TIME);
};

/**
 * Returns a human-readable label for the message date
 * Returns "Today", "Yesterday", or the formatted date
 * 
 * @param {Date|Object} date - Date to check
 * @returns {string} Date label
 * 
 * @example
 * getChatDateLabel(todayDate) // "Today"
 * getChatDateLabel(yesterdayDate) // "Yesterday"
 * getChatDateLabel(oldDate) // "Oct 24"
 */
export const getChatDateLabel = (date) => {
  const dateObj = timestampToDate(date);
  if (!dateObj) return '';
  
  try {
    if (isToday(dateObj)) {
      return 'Today';
    }
    
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
    
    return format(dateObj, DATE_FORMATS.CHAT_DATE);
  } catch (error) {
    console.error('Error getting chat date label:', error);
    return '';
  }
};

/**
 * Sorts dates in descending order (newest first)
 * 
 * @param {Date|Object} dateA - First date
 * @param {Date|Object} dateB - Second date
 * @returns {number} Comparison result for sorting
 */
export const sortDatesDescending = (dateA, dateB) => {
  const dateObjA = timestampToDate(dateA);
  const dateObjB = timestampToDate(dateB);
  
  if (!dateObjA || !dateObjB) return 0;
  
  return dateObjB - dateObjA; // Newest first
};

/**
 * Sorts dates in ascending order (oldest first)
 * 
 * @param {Date|Object} dateA - First date
 * @param {Date|Object} dateB - Second date
 * @returns {number} Comparison result for sorting
 */
export const sortDatesAscending = (dateA, dateB) => {
  const dateObjA = timestampToDate(dateA);
  const dateObjB = timestampToDate(dateB);
  
  if (!dateObjA || !dateObjB) return 0;
  
  return dateObjA - dateObjB; // Oldest first
};

