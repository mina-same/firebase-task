/**
 * Date Formatting Utilities
 * Formats: Message times, relative times, dates
 * Uses: date-fns library
 * 
 * @module utils/dateFormatter
 */

import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Converts Firebase Timestamp to JavaScript Date
 * Handles: Firebase Timestamp, Date, ISO string, Unix timestamp
 * 
 * param {Object|Date|string|number} timestamp - Any date format
 * returns {Date|null} Date object or null
 */
export const timestampToDate = (timestamp) => {
  // If timestamp is null or undefined, return null
  if (!timestamp) return null;
  
  // Handle Firebase Timestamp objects
  // Firebase Timestamps have a toDate() method
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // Handle JavaScript Date objects
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // Handle ISO string format (e.g., "2024-01-15T10:30:00Z")
  if (typeof timestamp === 'string') {
    return parseISO(timestamp);
  }
  
  // Handle Unix timestamp (milliseconds since epoch)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // If we can't convert it, return null
  return null;
};

/**
 * Formats date to time only (e.g., "10:30 AM")
 * Use for: Chat message timestamps
 * 
 * param {Object|Date|string|number} date - Date to format
 * returns {string} Formatted time (e.g., "10:30 AM")
 */
export const formatMessageTime = (date) => {
  const dateObj = timestampToDate(date);
  if (!dateObj) return '';
  
  try {
    // Check if date is valid (not invalid Date)
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Format as "h:mm a" -> "10:30 AM"
    return format(dateObj, 'h:mm a');
  } catch (error) {
    console.error('Error formatting message time:', error);
    return '';
  }
};

/**
 * Formats date to relative time (e.g., "2 hours ago", "Yesterday")
 * Shows: Relative time for recent, date for older
 * 
 * param {Object|Date|string|number} date - Date to format
 * returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  const dateObj = timestampToDate(date);
  if (!dateObj) return 'N/A';
  
  try {
    const now = new Date();
    const diffInHours = (now - dateObj) / (1000 * 60 * 60);
    
    // If message is from today, show relative time (e.g., "2 hours ago")
    if (isToday(dateObj)) {
      return formatDistanceToNow(dateObj, { addSuffix: true });
    }
    
    // If message is from yesterday, show "Yesterday"
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
    
    // If message is older, show date (e.g., "Jan 15")
    return format(dateObj, 'MMM d');
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'N/A';
  }
};

/**
 * Formats conversation last message timestamp
 * 
 * Shows when the last message was sent in a conversation.
 * Uses relative time for recent messages.
 * 
 * param {Object|Date|string|number} date - Last message timestamp
 * returns {string} Formatted time string
 * 
 */
export const formatConversationTime = (date) => {
  return formatRelativeTime(date);
};

/**
 * Formats a date for display in message list
 * 
 * Shows date separators between messages from different days.
 * Returns "Today", "Yesterday", or the date.
 * 
 * @param {Object|Date|string|number} date - Date to format
 * @returns {string} Date label
 * 
 */
export const getMessageDateLabel = (date) => {
  const dateObj = timestampToDate(date);
  if (!dateObj) return '';
  
  try {
    if (isToday(dateObj)) {
      return 'Today';
    }
    
    if (isYesterday(dateObj)) {
      return 'Yesterday';
    }
    
    // Format as "Jan 15"
    return format(dateObj, 'MMM d');
  } catch (error) {
    console.error('Error getting message date label:', error);
    return '';
  }
};

/**
 * Sorts dates in descending order (newest first)
 * 
 * Used to sort conversations by last message time,
 * with most recent conversations at the top.
 * 
 * @param {Object|Date} dateA - First date
 * @param {Object|Date} dateB - Second date
 * @returns {number} Comparison result for sorting
 */
export const sortDatesDescending = (dateA, dateB) => {
  const dateObjA = timestampToDate(dateA);
  const dateObjB = timestampToDate(dateB);
  
  if (!dateObjA || !dateObjB) return 0;
  
  // Return negative if B is newer (B goes first)
  // Return positive if A is newer (A goes first)
  return dateObjB - dateObjA;
};

/**
 * Sorts dates in ascending order (oldest first)
 * 
 * Used to sort messages chronologically,
 * with oldest messages first in the chat.
 * 
 * @param {Object|Date} dateA - First date
 * @param {Object|Date} dateB - Second date
 * @returns {number} Comparison result for sorting
 */
export const sortDatesAscending = (dateA, dateB) => {
  const dateObjA = timestampToDate(dateA);
  const dateObjB = timestampToDate(dateB);
  
  if (!dateObjA || !dateObjB) return 0;
  
  // Return negative if A is older (A goes first)
  // Return positive if B is older (B goes first)
  return dateObjA - dateObjB;
};

