/**
 * ErrorBoundary Component
 * 
 * React Error Boundary to catch and handle errors gracefully
 * Displays a fallback UI when errors occur in child components
 * 
 * @component
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.module.css';

/**
 * Error Boundary class component
 * Catches JavaScript errors in child component tree
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }
  
  /**
   * Update state when an error is caught
   * 
   * @param {Error} error - The error that was thrown
   * @returns {Object} Updated state
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }
  
  /**
   * Log error details when an error is caught
   * 
   * @param {Error} error - The error that was thrown
   * @param {Object} errorInfo - Information about the error
   */
  componentDidCatch(error, errorInfo) {
    // Log error details to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error information
    this.setState({
      error,
      errorInfo,
    });
    
    // You can also log the error to an error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }
  
  /**
   * Resets the error boundary state
   * Allows users to try again
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };
  
  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;
    
    // If there's an error, render fallback UI
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback(error, this.handleReset)
          : fallback;
      }
      
      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <svg
                  className="w-12 h-12 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            
            {/* Error Title */}
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Oops! Something went wrong
            </h2>
            
            {/* Error Message */}
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </p>
            
            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Error Details:
                </p>
                <p className="text-xs text-red-700 font-mono whitespace-pre-wrap break-words">
                  {error.toString()}
                </p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-700 cursor-pointer hover:text-red-800">
                      Component Stack
                    </summary>
                    <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap break-words">
                      {errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300 transition-colors duration-200 font-medium"
              >
                Go Home
              </button>
            </div>
            
            {/* Support Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help?{' '}
                <a
                  href="mailto:support@example.com"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // No error, render children normally
    return children;
  }
}

// Prop types for type checking
ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default ErrorBoundary;

