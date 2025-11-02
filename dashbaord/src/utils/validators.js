/**
 * Validation Utilities
 * 
 * Provides validation functions for forms and data throughout the application
 * 
 * @module utils/validators
 */

import { SCORE_CONFIG } from '../config/constants';

/**
 * Validates if a string is not empty
 * 
 * @param {string} value - Value to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isNotEmpty = (value) => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Validates if a string meets minimum length requirement
 * 
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum required length
 * @returns {boolean} True if valid, false otherwise
 */
export const hasMinLength = (value, minLength) => {
  return value && value.trim().length >= minLength;
};

/**
 * Validates if a string does not exceed maximum length
 * 
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum allowed length
 * @returns {boolean} True if valid, false otherwise
 */
export const hasMaxLength = (value, maxLength) => {
  return value && value.trim().length <= maxLength;
};

/**
 * Validates if a score is within the valid range (1-5)
 * 
 * @param {number} score - Score to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidScore = (score) => {
  return (
    typeof score === 'number' &&
    score >= SCORE_CONFIG.MIN &&
    score <= SCORE_CONFIG.MAX
  );
};

/**
 * Validates if a message text is valid for sending
 * 
 * @param {string} message - Message text to validate
 * @returns {Object} Validation result with isValid and error message
 * 
 * @example
 * const result = validateMessage("Hello");
 * // { isValid: true, error: null }
 */
export const validateMessage = (message) => {
  if (!isNotEmpty(message)) {
    return {
      isValid: false,
      error: 'Message cannot be empty',
    };
  }

  if (!hasMaxLength(message, 1000)) {
    return {
      isValid: false,
      error: 'Message cannot exceed 1000 characters',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validates if an employee name is valid
 * 
 * @param {string} name - Employee name to validate
 * @returns {Object} Validation result with isValid and error message
 */
export const validateEmployeeName = (name) => {
  if (!isNotEmpty(name)) {
    return {
      isValid: false,
      error: 'Employee name is required',
    };
  }

  if (!hasMinLength(name, 2)) {
    return {
      isValid: false,
      error: 'Employee name must be at least 2 characters',
    };
  }

  if (!hasMaxLength(name, 100)) {
    return {
      isValid: false,
      error: 'Employee name cannot exceed 100 characters',
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validates feedback data before submission
 * 
 * @param {Object} feedback - Feedback object to validate
 * @returns {Object} Validation result with isValid and errors object
 */
export const validateFeedback = (feedback) => {
  const errors = {};

  // Validate employee name
  const nameValidation = validateEmployeeName(feedback.employeeName);
  if (!nameValidation.isValid) {
    errors.employeeName = nameValidation.error;
  }

  // Validate score
  if (!isValidScore(feedback.score)) {
    errors.score = `Score must be between ${SCORE_CONFIG.MIN} and ${SCORE_CONFIG.MAX}`;
  }

  // Validate notes
  if (!isNotEmpty(feedback.notes)) {
    errors.notes = 'Feedback notes are required';
  } else if (!hasMaxLength(feedback.notes, 5000)) {
    errors.notes = 'Feedback notes cannot exceed 5000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitizes user input to prevent XSS attacks
 * 
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

