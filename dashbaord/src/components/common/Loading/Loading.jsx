/**
 * Loading Component
 * 
 * Displays loading spinner with optional message
 * Can be used as inline loader or full-page overlay
 * 
 * @component
 */

import React from 'react';
import PropTypes from 'prop-types';
import './Loading.module.css';

/**
 * Loading spinner component
 * 
 * @param {Object} props - Component props
 * @param {string} props.size - Spinner size (sm, md, lg)
 * @param {string} props.message - Loading message to display
 * @param {boolean} props.fullScreen - Whether to display as full-screen overlay
 * @param {string} props.className - Additional CSS classes
 */
const Loading = ({
  size = 'md',
  message,
  fullScreen = false,
  className = '',
}) => {
  // Size classes for spinner
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  // Spinner SVG
  const spinner = (
    <div className="flex flex-col items-center justify-center" role="status" aria-live="polite">
      <svg
        className={`animate-spin text-gray-700 ${sizeClasses[size]} ${className}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      
      {/* Loading Message */}
      {message && (
        <p className="mt-4 text-sm text-gray-600 font-medium">
          {message}
        </p>
      )}
      
      {/* Screen reader text */}
      <span className="sr-only">Loading...</span>
    </div>
  );
  
  // Full-screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  
  // Inline spinner
  return spinner;
};

// Prop types for type checking
Loading.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  className: PropTypes.string,
};

export default Loading;

