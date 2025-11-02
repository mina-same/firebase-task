/**
 * Modal Component
 * 
 * Professional modal dialog component with backdrop and smooth animations
 * Supports click outside to close and ESC key
 * Premium design with blur effects and animations
 * 
 * @component
 */

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './Modal.module.css';

/**
 * Modal component
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close handler
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size ('sm', 'md', 'lg', 'xl', 'full')
 * @returns {JSX.Element} Modal component
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
}) => {
  const modalRef = useRef(null);

  /**
   * Handle ESC key press to close modal
   */
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus trap - focus the modal when it opens
      if (modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-2 sm:mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 modal-overlay"
      onClick={handleBackdropClick}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Animated Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900 transition-opacity duration-300"
        style={{ opacity: isOpen ? 0.5 : 0 }}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`
          relative bg-white rounded-xl sm:rounded-xl shadow-2xl w-full ${sizeClasses[size]}
          transform transition-all duration-300 modal-content
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className="relative bg-white px-4 sm:px-6 py-2.5 sm:py-4 rounded-t-xl sm:rounded-t-xl border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 id="modal-title" className="text-base sm:text-xl font-semibold text-gray-900">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 active:scale-95 touch-manipulation"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Body with smooth scrolling */}
        <div className="px-4 sm:px-6 py-3 sm:py-6 max-h-[85vh] overflow-y-auto modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Prop types for type checking
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
};

export default Modal;
